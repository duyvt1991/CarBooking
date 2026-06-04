<?php
namespace Booking\Page;

use Bitrix\Main\Application;
use Bitrix\Main\Entity\Query;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Context;

class MasterData {
    public static function getUserRoles($userId) {
        $connection = Application::getConnection();
        $sql = "
            SELECT g.NAME
            FROM b_sonet_user2group ug
            INNER JOIN b_sonet_group g ON ug.GROUP_ID = g.ID
            INNER JOIN b_user u ON ug.USER_ID = u.ID
            WHERE u.ID = $userId
        ";
        $groups = $connection->query($sql)->fetchAll();
        $groups = array_filter($groups, function($group) {
            return !is_null($group['NAME']);
        });
        return array_merge(["*"], array_column($groups, 'NAME'));
    }

    public static function getMasterDataVersion() {
        $query = \Booking\Query::getInstance("car_booking_masterdata");
        $query->setSelect(['mvalue']);
        $query->setFilter(['mtype' => 'version']);
        $result = $query->exec()->fetchAll();
        return  ['version' => !empty($result) ? $result[0]['mvalue'] : 1];
    }

    public static function getMasterData() {
        global $USER;
        $query = \Booking\Query::getInstance("car_booking_masterdata");
        $query->setSelect(['*']);
        $query->setFilter(['isActive' => 1]);
        $query->setOrder(['mvalue' => 'ASC']);
        $result = $query->exec()->fetchAll();

        $masterData = [
            'userId' => "BitrixID-".$USER->GetID(),
            'roles' =>  array_merge(["*"], self::getUserRoles($USER->GetID())),
            'config' => [
                'maxDayToBooking' => 7,
                'maxHourToAutoApprove' => 4,
                'maxDayToReview' => 3,
                'usagePurposeKeyForClient' => [],
                'bookingAdminGroupId' => 25,
                'bookingApprovalGroupId' => 26,
                'bookingMonitorGroupId' => 27,
                'bookingPriorityApprovalGroupId' => 48,
                // 'buildingDefault' => '',
                'bookingDriverGroupId' => 28
            ],
            'admins' => [],
            'approvers' => [],
            'approversDeleted' => [],
            'priorityApprovers' => [],
            'priorityApproversDeleted' => [],
            'managers' => [],
            'buildings' => [],
            'departments' => [],
            'equipmentTypes' => [],
            'equipments' => [],
            'usagePurposes' => [],
            'roomTypes' => [],
            'rooms' => [],
            'carLines' => [],
            'drivers' => [],
            'serviceTypes' => []
        ];

        foreach ($result as $row) {
            if ($row['isDeleted'] == 1 && $row['mtype'] != 'approvers' && $row['mtype'] != 'priorityApprovers') {
                continue;
            }
            $mParentKey = $row['mParentKey'];
            $type = $row['mtype'];
            $key = $row['mkey'];
            $value = $row['mvalue'];
            $options = $row['options'];
            $isActive = $row['isActive'];

            if ($type === 'version') {
                continue;
            }

            if ($type === 'config') {
                if (is_numeric($value)) {
                    $masterData['config'][$key] = $value * 1;
                    continue;
                }
                $decodeValue = [];
                try {
                    $decodeValue = json_decode($value, true);
                } catch (\Exception $e) {
                    // Log error if needed
                }
                $masterData['config'][$key] = $decodeValue;
                continue;
            }

            $item = [
                'id' => $row['id'],
                'mkey' => $key,
                'mvalue' => $value,
                'isActive' => $isActive
            ];

            if (!empty($options)) {
                $item = array_merge($item, \Booking\Util::setDefaultValueIfNullMasterDataItem($type, $options));
            }

            if ($type === 'equipments' || $type === 'rooms') {
                $item['mParentKey'] = $mParentKey;
            }

            if ($type === 'approvers' && $row['isDeleted'] == 1) {
                $masterData['approversDeleted'][] = $item;
            } else if ($type === 'priorityApprovers' && $row['isDeleted'] == 1) {
                $masterData['priorityApproversDeleted'][] = $item;
            } else {
                $masterData[$type][] = $item;
            }
        }

        return $masterData;
    }

    public static function suggestionUsers() {
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $keyword = $keyword ?? '';
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return [];
        }
        $connection = Application::getConnection();
        $keyword = $connection->getSqlHelper()->forSql($keyword);
        $sql = "
            SELECT CONCAT(
                TRIM(COALESCE(u.LAST_NAME, '-')), ' ', 
                COALESCE(u.NAME, '-'), ' (', 
                COALESCE(u.EMAIL, '-'), ')'
            ) as mvalue, 
            CONCAT('BitrixID-', u.ID) as mkey
            FROM b_user u
            WHERE u.ACTIVE = 'Y' AND (
                LOWER(CONCAT(TRIM(u.LAST_NAME), ' ', u.NAME)) LIKE LOWER('%".$keyword."%') OR
                LOWER(u.EMAIL) LIKE LOWER('%".$keyword."%') OR
                LOWER(u.LOGIN) LIKE LOWER('%".$keyword."%') OR
                u.ID = '".$keyword."'
            )
            LIMIT 10
        ";
        $result = $connection->query($sql)->fetchAll();
        return $result;
    }

    public static function suggestionClients() {
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $keyword = $keyword ?? '';
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return [];
        }

        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['clientNames']);
        $query->setFilter(['%clientNames' => $keyword, '!clientNames' => '[]']);
        $query->setLimit(10);
        $query->setOrder(['clientNames' => 'ASC']);
        $result = $query->exec()->fetchAll();
        $clientNames = [];
        foreach ($result as $row) {
            if (empty($row['clientNames'])) {
                continue;
            }
            foreach ($row['clientNames'] as $clientName) {
                if (stripos(iconv('UTF-8', 'ASCII//TRANSLIT', $clientName), iconv('UTF-8', 'ASCII//TRANSLIT', $keyword)) === false) {
                    continue;
                }
                $clientNames[] = [
                    'mvalue' => $clientName,
                    'mkey' => $clientName
                ];
            }
        }
        $clientNames = array_map("unserialize", array_unique(array_map("serialize", $clientNames)));
        return array_values($clientNames);
    }

    public static function suggestionExternalClients() {
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $keyword = $keyword ?? '';
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return [];
        }

        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['externalClientNames']);
        $query->setFilter(['%externalClientNames' => $keyword, '!externalClientNames' => '[]']);
        $query->setLimit(10);
        $query->setOrder(['externalClientNames' => 'ASC']);
        $result = $query->exec()->fetchAll();
        $externalClientNames = [];
        foreach ($result as $row) {
            if (empty($row['externalClientNames'])) {
                continue;
            }
            foreach ($row['externalClientNames'] as $externalClientName) {
                if (stripos(iconv('UTF-8', 'ASCII//TRANSLIT', $externalClientName), iconv('UTF-8', 'ASCII//TRANSLIT', $keyword)) === false) {
                    continue;
                }
                $externalClientNames[] = [
                    'mvalue' => $externalClientName,
                    'mkey' => $externalClientName
                ];
            }
        }
        $externalClientNames = array_map("unserialize", array_unique(array_map("serialize", $externalClientNames)));
        return array_values($externalClientNames);
    }

    public static function suggestionDepartureLocations() {
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $keyword = $keyword ?? '';
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return [];
        }

        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['departureLocation']);
        $query->setFilter(['%departureLocation' => $keyword, '!departureLocation' => '[]']);
        $query->setLimit(10);
        $query->setOrder(['departureLocation' => 'ASC']);
        $result = $query->exec()->fetchAll();
        $departureLocations = [];
        foreach ($result as $row) {
            if (empty($row['departureLocation'])) {
                continue;
            }
            foreach ($row['departureLocation'] as $departureLocation) {
                if (stripos(iconv('UTF-8', 'ASCII//TRANSLIT', $departureLocation), iconv('UTF-8', 'ASCII//TRANSLIT', $keyword)) === false) {
                    continue;
                }
                $departureLocations[] = [
                    'mvalue' => $departureLocation,
                    'mkey' => $departureLocation
                ];
            }
        }
        $departureLocations = array_map("unserialize", array_unique(array_map("serialize", $departureLocations)));
        return array_values($departureLocations);
    }
}