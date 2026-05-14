<?php
namespace Booking\Page;

use Bitrix\Main\Application;
use Bitrix\Main\Entity\Query;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Context;

class Item {
    public static function checkPermission($userId, $component) {
        $userRoles = \Booking\Page\MasterData::getUserRoles($userId);

        $permissionsMap = [
            'config' => ['Permission [Car_Booking_Admin]'],
            'adminList' => ['Permission [Car_Booking_Admin]'],
            'approverList' => ['Permission [Car_Booking_Admin]'],
            'priorityApproverList' => ['Permission [Car_Booking_Admin]'],
            'managerList' => ['Permission [Car_Booking_Admin]'],
            'buildingList' => ['Permission [Car_Booking_Admin]'],
            'departmentList' => ['Permission [Car_Booking_Admin]'],
            'equipmentTypeList' => ['Permission [Car_Booking_Admin]'],
            'equipmentList' => ['Permission [Car_Booking_Admin]'],
            'usagePurposeList' => ['Permission [Car_Booking_Admin]'],
            'roomTypeList' => ['Permission [Car_Booking_Admin]'],
            'roomList' => ['Permission [Car_Booking_Admin]'],
            'bookingList' => ['*'],
            'approveBookingList' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]'],
            'userReviewList' => ['*'],
            'managerReviewList' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]', 'Permission [Car_Booking_Monitor]'],
            'adminForm' => ['Permission [Car_Booking_Admin]'],
            'approverForm' => ['Permission [Car_Booking_Admin]'],
            'priorityApproverForm' => ['Permission [Car_Booking_Admin]'],
            'managerForm' => ['Permission [Car_Booking_Admin]'],
            'buildingForm' => ['Permission [Car_Booking_Admin]'],
            'departmentForm' => ['Permission [Car_Booking_Admin]'],
            'equipmentTypeForm' => ['Permission [Car_Booking_Admin]'],
            'equipmentForm' => ['Permission [Car_Booking_Admin]'],
            'usagePurposeForm' => ['Permission [Car_Booking_Admin]'],
            'roomTypeForm' => ['Permission [Car_Booking_Admin]'],
            'roomForm' => ['Permission [Car_Booking_Admin]'],
            'bookingForm' => ['*'],
            'cancelBookingForm' => ['*'],
            'rejectBookingForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]'],
            'approveBookingForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]'],
            'userReviewForm' => ['*'],
            'managerReviewForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]', 'Permission [Car_Booking_Monitor]']
        ];

        if (isset($permissionsMap[$component])) {
            $requiredPermissions = $permissionsMap[$component];

            if (in_array('*', $requiredPermissions)) {
                return $userRoles;
            }

            foreach ($requiredPermissions as $permission) {
                if (in_array($permission, $userRoles)) {
                    return $userRoles;
                }
            }
        }

        return false;
    }

    public static function logBooking($id, $currentItem, $userId) {
        $query = \Booking\Query::getInstance("car_booking_requests", true);
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $newItem = $query->exec()->fetch();
        if (!$newItem || !$currentItem) {
            return;
        }

        $logData = [
            'logDate' => date('Y-m-d H:i:s'),
            'logUser' => ["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]
        ];
        $diffNew = [];
        $diffOld = [];
        // Hàm trích xuất sự khác biệt giữa hai bản ghi
        $extractDifferences = function($source, $target) {
            $diff = [];
            
            foreach ($source as $key => $value) {
                // Bỏ qua các trường nội bộ
                if ($key === 'log') continue;
                
                if (!array_key_exists($key, $target)) {
                    // Trường không tồn tại trong bản ghi mới
                    $diff[$key] = $value;
                } elseif (is_array($value) && isset($value['mkey'])) {
                    // Đối tượng có trường 'mkey'
                    if (!isset($target[$key]['mkey']) || $target[$key]['mkey'] != $value['mkey']) {
                    $diff[$key] = [
                        'mkey' => $value['mkey'],
                        'mvalue' => $value['mvalue'] ?? ''
                    ];
                    }
                } elseif (is_array($value) && !empty($value) && is_array($value[0]) && isset($value[0]['mkey'])) {
                    // Mảng các đối tượng có trường 'mkey'
                    if (!is_array($target[$key]) || empty($target[$key]) || !is_array($target[$key][0]) || !isset($target[$key][0]['mkey'])) {
                        $simplifiedArray = [];
                        foreach ($value as $item) {
                            $simplifiedArray[] = [
                            'mkey' => $item['mkey'],
                            'mvalue' => $item['mvalue'] ?? ''
                            ];
                        }
                        $diff[$key] = $simplifiedArray;
                    } else {
                        $sourceMkeys = array_column($value, 'mkey');
                        $targetMkeys = array_column($target[$key], 'mkey');
                        
                        sort($sourceMkeys);
                        sort($targetMkeys);
                        
                        if ($sourceMkeys != $targetMkeys) {
                            $simplifiedArray = [];
                            foreach ($value as $item) {
                            $simplifiedArray[] = [
                                'mkey' => $item['mkey'],
                                'mvalue' => $item['mvalue'] ?? ''
                            ];
                            }
                            $diff[$key] = $simplifiedArray;
                        }
                    }
                } elseif ($target[$key] != $value) {
                    // Chuỗi hoặc các kiểu dữ liệu khác
                    $diff[$key] = $value;
                }
            }
            
            return $diff;
        };
        
        // Trích xuất sự khác biệt từ bản ghi cũ và mới
        $diffOld = $extractDifferences($currentItem, $newItem);
        $diffNew = $extractDifferences($newItem, $currentItem);
        $logData['logOldValue'] = $diffOld;
        $logData['logNewValue'] = $diffNew;

        $newLog = array_merge([$logData], $newItem['log'] ?? []);
        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['log' => Json::encode($newLog)]);
    }

    public static function getBookingByRoom($roomKey) {
        $startDateTime = new \Bitrix\Main\Type\DateTime(date('Y-m-d H:i:s'), "Y-m-d H:i:s");
        $startTime = $startDateTime->format('H:i:s');
        $queryBooking = \Booking\Query::getInstance("car_booking_requests", true);
        $queryBooking->setSelect(['*']);
        $queryBooking->setFilter([
            '%room' => '"mkey":"'.$roomKey.'"',
            [
                'LOGIC' => 'OR',
                [
                    '>startDate' => $startDateTime
                ],
                [
                    '=startDate' => $startDateTime,
                    '>=startTime' => $startTime
                ]
            ]
        ]);
        return $queryBooking->exec()->fetchAll();
    }

    public static function getBookingByRoomType($roomTypeKey) {
        $startDateTime = new \Bitrix\Main\Type\DateTime(date('Y-m-d H:i:s'), "Y-m-d H:i:s");
        $startTime = $startDateTime->format('H:i:s');
        $queryBooking = \Booking\Query::getInstance("car_booking_requests", true);
        $queryBooking->setSelect(['*']);
        $queryBooking->setFilter([
            '%roomType' => '"mkey":"'.$roomTypeKey.'"',
            [
                'LOGIC' => 'OR',
                [
                    '>startDate' => $startDateTime
                ],
                [
                    '=startDate' => $startDateTime,
                    '>=startTime' => $startTime
                ]
            ]
        ]);
        return $queryBooking->exec()->fetchAll();
    }

    public static function getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, $isApproved, $isPriority) {
        $queryBookingFilter = [];
        $queryBookingFilter = array_merge($queryBookingFilter, ['!id' => $id]);
        $queryBookingFilter = array_merge($queryBookingFilter, ['%room' => '"mkey":"'.$roomKey.'"']);
        if ($isPriority) {
            $queryBookingFilter = array_merge($queryBookingFilter, ['isPriority' => 1]);
        } else {
            $queryBookingFilter = array_merge($queryBookingFilter, ['isPriority' => 0]);
            $queryBookingFilter = array_merge($queryBookingFilter, ['isApproved' => $isApproved]);
            if ($isApproved) {
                $queryBookingFilter = array_merge($queryBookingFilter, ['isCancelled' => 0]);
            }
        }
        $queryBookingFilter[] =  [
            'LOGIC' => 'OR',
            [
                '=startDate' => $startDateCondition,
                '>=startTime' => $startTimeCondition,
                '<startTime' => $endTimeCondition
            ],
            [
                '=startDate' => $startDateCondition,
                '>endTime' => $startTimeCondition,
                '<=endTime' => $endTimeCondition
            ],
            [
                '=startDate' => $startDateCondition,
                '<=startTime' => $startTimeCondition,
                '>=endTime' => $endTimeCondition
            ]
        ];

        $queryBooking = \Booking\Query::getInstance("car_booking_requests", true);
        $queryBooking->setSelect(['*']);
        $queryBooking->setFilter($queryBookingFilter);
        return $queryBooking->exec()->fetchAll();
    }

    public static function log($oldValue, $newValue, $logType, $userId) {
        $logData = [
            'logType' => $logType,
            'logDate' => new \Bitrix\Main\Type\DateTime(),
            'logUser' => Json::encode(["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)])
        ];
        $oldValue['options'] = $oldValue['options'] ?? [];
        $oldValue = array_merge($oldValue, $oldValue['options']);
        unset($oldValue['options']);

        $newValue['options'] = $newValue['options'] ?? [];
        $newValue = array_merge($newValue, $newValue['options']);
        unset($newValue['options']);

        if ($logType === "Add") {
            $logData['logOldValue'] = Json::encode([]);
            $logData['logNewValue'] = Json::encode($newValue);
        } elseif ($logType === "Delete" || $logType === "Active" || $logType === "Deactive") {
            $logData['logOldValue'] = Json::encode($oldValue);
            $logData['logNewValue'] = Json::encode([]);
        } elseif ($logType === "Edit") {
            $diffNew = [];
            foreach ($newValue as $key => $value) {
                if (!isset($oldValue[$key]) || $oldValue[$key] !== $value) {
                    $diffNew[$key] = $value;
                }
            }
            $logData['logOldValue'] = Json::encode($oldValue);
            $logData['logNewValue'] = Json::encode($diffNew);
        }

        \Booking\Query::insertRecord('car_booking_log', $logData);
    }

    public static function logMasterDataSubmit($id, $currentItem, $userId) {
        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
        $queryMasterData->setSelect(['*']);
        $queryMasterData->setFilter(['id' => $id]);
        $newItem = $queryMasterData->exec()->fetch();
        if ($newItem) {
            if ($currentItem) {
                self::log($currentItem, $newItem, "Edit", $userId);
            } else {
                self::log([], $newItem, "Add", $userId);
            }
        }
        return $newItem;
    }
    
    public static function deleteItem() {
        global $USER;
        $userId = $USER->GetID();
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $id = $id ?? '';
        $hasPermission = self::checkPermission($userId, $component);
        if (!$hasPermission) {
            return ['status' => 'error', 'message' => 'Tài khoản của bạn không có quyền thực hiện thao tác này'];
        }
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm", "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"])) {
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['id' => $id]);
            $currentItem = $queryMasterData->exec()->fetch();
            if ($currentItem && $component == "buildingList") {
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter([
                    'mtype' => 'rooms',
                    '%options' => '"building":"'.$currentItem['mkey'].'"',
                    'isDeleted' => 0
                ]);
                $existRooms = $queryMasterData->exec()->fetchAll();
                if ($existRooms) {
                    return ['status' => 'error', 'message' => 'Không thể xóa chi nhánh này vì có xe đang sử dụng'];
                }
            }

            if ($component == "approverList" && $currentItem) {
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mtype' => 'roomTypes', 'isDeleted' => 0, '%options' => '"'.$currentItem['mkey'].'"']);
                $existRoomTypes = $queryMasterData->exec()->fetchAll();
                if (!empty($existRoomTypes)) {
                    return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt này vì có loại xe đang sử dụng'];
                }

                $connection = Application::getConnection("car_booking_connection");
                $existRooms = $connection->query("
                    SELECT * FROM car_booking_masterdata WHERE mtype = 'rooms' AND isDeleted = 0 AND JSON_CONTAINS(options->'$.approvers', '[\"".$currentItem['mkey']."\"]')
                    ")->fetchAll();
                if (!empty($existRooms)) {
                    return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt này vì có xe đang sử dụng'];
                }
            }

            if ($component == "priorityApproverList" && $currentItem) {
                $connection = Application::getConnection("car_booking_connection");
                $existRooms = $connection->query("
                    SELECT * FROM car_booking_masterdata WHERE mtype = 'rooms' AND isDeleted = 0 AND JSON_CONTAINS(options->'$.priorityApprovers', '[\"".$currentItem['mkey']."\"]')
                    ")->fetchAll();
                if (!empty($existRooms)) {
                    return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt ưu tiên này vì có xe đang sử dụng'];
                }
            }

            \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['isDeleted' => 1]);
            if ($currentItem) {
                self::log($currentItem, [], "Delete", $userId);
                if ($component == "adminList") {
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => 'bookingAdminGroupId']);
                    $bookingAdminGroupId = $queryMasterData->exec()->fetch();
                    $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $groupId = $bookingAdminGroupId['mvalue'] ?? 25;
                    $connection = Application::getConnection();
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                }
                if ($component == "approverList") {
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => 'bookingApprovalGroupId']);
                    $bookingApprovalGroupId = $queryMasterData->exec()->fetch();
                    $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $groupId = $bookingApprovalGroupId['mvalue'] ?? 26;
                    $connection = Application::getConnection();
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                }
                if ($component == "priorityApproverList") {
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => 'bookingPriorityApprovalGroupId']);
                    $bookingPriorityApprovalGroupId = $queryMasterData->exec()->fetch();
                    $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $groupId = $bookingPriorityApprovalGroupId['mvalue'] ?? 48;
                    $connection = Application::getConnection();
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                }
                if ($component == "managerList") {
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => 'bookingMonitorGroupId']);
                    $bookingMonitorGroupId = $queryMasterData->exec()->fetch();
                    $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $groupId = $bookingMonitorGroupId['mvalue'] ?? 27;
                    $connection = Application::getConnection();
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                }
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata", true);
            $query->setSelect(['*']);
            $query->setFilter(['mkey' => 'version']);
            $version = $query->exec()->fetch();
            if ($version) {
                $version = $version['mvalue'] * 1 + 1;
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'version'], ['mvalue' => $version]);
            }

            if ($component == "roomList" && $currentItem) {
                $bookingsByRoom = self::getBookingByRoom($currentItem['mkey']);
                foreach($bookingsByRoom as $booking) {
                    if ($booking['isCancelled'] == 1) {
                        continue;
                    }
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do xe không còn được đưa vào sử dụng bởi ".\Booking\Query::getUserFullname($userId, true)."."]);
                    self::logBooking($booking['id'], $booking, $userId);

                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
                    foreach($mailContent['userIds'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
            }
        }
        return ['status' => 'success', 'message' => 'Xóa thành công'];
    }

    public static function deactiveItem() {
        global $USER;
        $userId = $USER->GetID();
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $id = $id ?? '';
        $hasPermission = self::checkPermission($userId, $component);
        if (!$hasPermission) {
            return ['status' => 'error', 'message' => 'Tài khoản của bạn không có quyền thực hiện thao tác này'];
        }
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm", "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"])) {
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['id' => $id]);
            $currentItem = $queryMasterData->exec()->fetch();
            \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['isActive' => 0]);
            if ($currentItem) {
                self::log($currentItem, [], "Deactive", $userId);
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata", true);
            $query->setSelect(['*']);
            $query->setFilter(['mkey' => 'version']);
            $version = $query->exec()->fetch();
            if ($version) {
                $version = $version['mvalue'] * 1 + 1;
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'version'], ['mvalue' => $version]);
            }

            if ($component == "roomList" && $currentItem) {
                $bookingsByRoom = self::getBookingByRoom($currentItem['mkey']);
                foreach($bookingsByRoom as $booking) {
                    if ($booking['isCancelled'] == 1) {
                        continue;
                    }
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do xe tạm thời ngưng sử dụng bởi ".\Booking\Query::getUserFullname($userId, true)."."]);
                    self::logBooking($booking['id'], $booking, $userId);

                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
                    foreach($mailContent['userIds'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
            }
        }
        return ['status' => 'success', 'message' => 'Tạm khoá thành công'];
    }

    public static function activeItem() {
        global $USER;
        $userId = $USER->GetID();
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $id = $id ?? '';
        $hasPermission = self::checkPermission($userId, $component);
        if (!$hasPermission) {
            return ['status' => 'error', 'message' => 'Tài khoản của bạn không có quyền thực hiện thao tác này'];
        }
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm", "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"])) {
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['id' => $id]);
            $currentItem = $queryMasterData->exec()->fetch();
            \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['isActive' => 1]);
            if ($currentItem) {
                self::log($currentItem, [], "Active", $userId);
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata", true);
            $query->setSelect(['*']);
            $query->setFilter(['mkey' => 'version']);
            $version = $query->exec()->fetch();
            if ($version) {
                $version = $version['mvalue'] * 1 + 1;
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'version'], ['mvalue' => $version]);
            }
        }
        return ['status' => 'success', 'message' => 'Mở khoá thành công'];
    }

    public static function approveItem() {
        global $USER;
        $userId = $USER->GetID();
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $id = $id ?? '';
        $hasPermission = self::checkPermission($userId, $component);
        if (!$hasPermission) {
            return ['status' => 'error', 'message' => 'Tài khoản của bạn không có quyền thực hiện thao tác này'];
        }
        if (in_array($component, ["approveBookingList"])) {
            if ($id != "") {
                $query = \Booking\Query::getInstance("car_booking_requests");
                $query->setSelect(['*']);
                $query->setFilter(['id' => $id]);
                $currentItem = $query->exec()->fetch();
            }
            if ($currentItem) {
                if ($currentItem['isPriority'] && is_array($hasPermission) && !in_array("Permission [Car_Booking_Priority_Approval]", $hasPermission)) {
                    return ['status' => 'error', 'message' => 'Bạn không có quyền duyệt đặt xe ưu tiên'];
                }
                $approvedUsers = array_merge($currentItem['approvedUsers'], [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]]);
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['isApproved' => 1, 'approvedUsers' => Json::encode($approvedUsers), 'approvedDate' => new \Bitrix\Main\Type\DateTime()]);
                self::logBooking($id, $currentItem, $userId);

                $roomKey = '';
                if ($currentItem['room']) {
                    $roomKey = $currentItem['room']['mkey'] ?? '';
                }
                $startDate = $currentItem['startDate'] ?? '';
                $startTime = $currentItem['startTime'] ?? '';
                $endTime = $currentItem['endTime'] ?? '';
                $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
                $startTimeCondition = $startDateCondition->format('H:i:s');
                $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
                $endTimeCondition = $endDateCondition->format('H:i:s');
                $overlappingBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
                if ($currentItem['isPriority']) {
                    $overlappingBookings = array_merge($overlappingBookings, self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 1, 0));

                }
                foreach($overlappingBookings as $booking) {
                    if ($booking['isCancelled'] == 1) {
                        continue;
                    }
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do trùng lịch với đặt xe số ".$id." đã được duyệt bởi ".\Booking\Query::getUserFullname($userId, true)."."]);
                    self::logBooking($booking['id'], $booking, $userId);

                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
                    foreach($mailContent['userIds'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }

                $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $id);
                foreach($mailContent['userIds'] as $userId) {
                    \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                }
            }
        }
        return ['status' => 'success', 'message' => 'Duyệt thành công'];
    }

    public static function submitItem() {
        global $USER;
        $userId = $USER->GetID();
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $id = $id ?? '';
        $hasPermission = self::checkPermission($userId, $component);
        if (!$hasPermission) {
            return ['status' => 'error', 'message' => 'Tài khoản của bạn không có quyền thực hiện thao tác này'];
        }
        if (in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm", "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"])) {
            $query = \Booking\Query::getInstance("car_booking_requests");
        } else {
            if (((!$mkey || !$mvalue || !$component) && $component != "config") || 
                ($component == "config" && (!$maxDayToBooking || !$maxHourToAutoApprove || !$maxDayToReview || !$buildingDefault || !$usagePurposeKeyForClient || !$bookingAdminGroupId || !$bookingApprovalGroupId || !$bookingPriorityApprovalGroupId || !$bookingMonitorGroupId))) {
                return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ thông tin'];
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata");
            $query->setSelect(['*']);
            $query->setFilter(['mkey' => 'version']);
            $version = $query->exec()->fetch();
            if ($version) {
                $version = $version['mvalue'] * 1 + 1;
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'version'], ['mvalue' => $version]);
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata", true);
            $query->setSelect(['*']);
            $query->setFilter(['mkey' => $mkey ?? '', 'mtype' => str_replace('Form', 's', $component), '!id' => $id, 'isDeleted' => 0]);
            $duplicateMKey = $query->exec()->fetch();
            if ($duplicateMKey) {
                return ['status' => 'error', 'message' => 'Trùng mã, vui lòng nhập mã khác'];
            }
            $query = \Booking\Query::getInstance("car_booking_masterdata", true);
        }
        $currentItem = null;
        if ($id != "") {
            $query->setSelect(['*']);
            $query->setFilter(['id' => $id]);
            $currentItem = $query->exec()->fetch();
        }

        switch ($component) {
            case 'adminForm':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'bookingAdminGroupId']);
                $bookingAdminGroupId = $queryMasterData->exec()->fetch();
                $groupId = $bookingAdminGroupId['mvalue'] ?? 25;
                $bitrixId = str_replace( "BitrixID-", "", $mkey ?? "");
                $connection = Application::getConnection();
                if ($id != "") {
                    $currentBitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$currentBitrixId}' AND GROUP_ID = '{$groupId}'");
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? ""]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'admins', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => '[]']);
                }
               self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($bitrixId != "") {
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                    $connection->queryExecute("INSERT INTO b_sonet_user2group (USER_ID, GROUP_ID, ROLE, AUTO_MEMBER, DATE_CREATE, DATE_UPDATE, INITIATED_BY_TYPE, INITIATED_BY_USER_ID) VALUES ('{$bitrixId}', '{$groupId}', 'K', 'N', NOW(), NOW(), 'U', '{$userId}')");
                } 
                break;

            case 'approverForm':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'bookingApprovalGroupId']);
                $bookingApprovalGroupId = $queryMasterData->exec()->fetch();
                $bitrixId = str_replace( "BitrixID-", "", $mkey ?? "");
                $connection = Application::getConnection();
                $groupId = $bookingApprovalGroupId['mvalue'] ?? 26;
                if ($id != "") {
                    $currentBitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$currentBitrixId}' AND GROUP_ID = '{$groupId}'");
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? ""]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'approvers', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => '[]']);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($bitrixId != "") {
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                    $connection->queryExecute("INSERT INTO b_sonet_user2group (USER_ID, GROUP_ID, ROLE, AUTO_MEMBER, DATE_CREATE, DATE_UPDATE, INITIATED_BY_TYPE, INITIATED_BY_USER_ID) VALUES ('{$bitrixId}', '{$groupId}', 'K', 'N', NOW(), NOW(), 'U', '{$userId}')");
                } 
                break;

            case 'priorityApproverForm':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'bookingPriorityApprovalGroupId']);
                $bookingPriorityApprovalGroupId = $queryMasterData->exec()->fetch();
                $bitrixId = str_replace( "BitrixID-", "", $mkey ?? "");
                $connection = Application::getConnection();
                $groupId = $bookingPriorityApprovalGroupId['mvalue'] ?? 48;
                if ($id != "") {
                    $currentBitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$currentBitrixId}' AND GROUP_ID = '{$groupId}'");
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? ""]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'priorityApprovers', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => '[]']);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($bitrixId != "") {
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                    $connection->queryExecute("INSERT INTO b_sonet_user2group (USER_ID, GROUP_ID, ROLE, AUTO_MEMBER, DATE_CREATE, DATE_UPDATE, INITIATED_BY_TYPE, INITIATED_BY_USER_ID) VALUES ('{$bitrixId}', '{$groupId}', 'K', 'N', NOW(), NOW(), 'U', '{$userId}')");
                } 
                break;

            case 'managerForm':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'bookingMonitorGroupId']);
                $bookingMonitorGroupId = $queryMasterData->exec()->fetch();
                $groupId = $bookingMonitorGroupId['mvalue'] ?? 27;
                $bitrixId = str_replace( "BitrixID-", "", $mkey ?? "");
                $connection = Application::getConnection();
                if ($id != "") {
                    $currentBitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$currentBitrixId}' AND GROUP_ID = '{$groupId}'");
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? ""]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'managers', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => '[]']);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($bitrixId != "") {
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                    $connection->queryExecute("INSERT INTO b_sonet_user2group (USER_ID, GROUP_ID, ROLE, AUTO_MEMBER, DATE_CREATE, DATE_UPDATE, INITIATED_BY_TYPE, INITIATED_BY_USER_ID) VALUES ('{$bitrixId}', '{$groupId}', 'K', 'N', NOW(), NOW(), 'U', '{$userId}')");
                } 
                break;

            case 'config':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mtype' => 'config']);
                $currentItems = $queryMasterData->exec()->fetchAll();
                $currentItem = ["mtype" => "config"];
                foreach ($currentItems as $value) {
                    $currentItem[$value['mkey']] = $value['mvalue'];
                }
                try {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'usagePurposeKeyForClient'], ['mvalue' => Json::encode(Json::decode($usagePurposeKeyForClient)) ?? "[]"]);
                } catch (\Throwable $th) {
                    return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                }
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'maxDayToBooking'], ['mvalue' => $maxDayToBooking ?? "7"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'maxHourToAutoApprove'], ['mvalue' => $maxHourToAutoApprove ?? "4"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'maxDayToReview'], ['mvalue' => $maxDayToReview ?? "3"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'buildingDefault'], ['mvalue' => $buildingDefault ?? ""]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingAdminGroupId'], ['mvalue' => $bookingAdminGroupId ?? "25"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingApprovalGroupId'], ['mvalue' => $bookingApprovalGroupId ?? "26"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingPriorityApprovalGroupId'], ['mvalue' => $bookingPriorityApprovalGroupId ?? "48"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingMonitorGroupId'], ['mvalue' => $bookingMonitorGroupId ?? "27"]);
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mtype' => 'config']);
                $newItems = $queryMasterData->exec()->fetchAll();
                $newItem = ["mtype" => "config"];
                foreach ($newItems as $value) {
                    $newItem[$value['mkey']] = $value['mvalue'];
                }
                if ($currentItem && $newItem) {
                    self::log($currentItem, $newItem, "Edit", $userId);
                }
                break;

            case 'buildingForm':
                $options = ['address' => $address ?? ""];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'buildings', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;

            case 'departmentForm':
                $options = [];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'departments', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;

            case 'equipmentTypeForm':
                $options = [];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'equipmentTypes', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;

            case 'equipmentForm':
                $options = ['quantity' => $quantity ?? "", 'note' => $note ?? ""];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mParentKey' => $mParentKey ?? "", 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'equipments', 'mParentKey' => $mParentKey ?? "", 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;

            case 'usagePurposeForm':
                $options = [];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'usagePurposes', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;

            case 'roomTypeForm':
                try {
                    $options = ['approvers' => Json::decode($approvers) ?: [], 'equipments' => Json::decode($equipments) ?: [], 'size' => $size ?? 0, 'persons' => $persons ?? 0, 'color' => $color ?? "", 'hasAutoApprove' => $hasAutoApprove ?? 0];
                } catch (\Throwable $th) {
                    return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                }
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'roomTypes', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                $newItem = self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($id != "" && !empty($newItem)) {
                    $haveToUpdateBookings = self::getBookingByRoomType($currentItem['mkey']);
                    if (!empty($newItem['options'])) {
                        $newItem = array_merge($newItem, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $newItem['options']));
                        unset($newItem['options']);
                    }
                    foreach($haveToUpdateBookings as $booking) {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                            'roomType' => Json::encode($newItem),
                            'equipments' => Json::encode($newItem['equipments'] ?? []),
                            'size' => $newItem['size'] ?? 0,
                            'persons' => $newItem['persons'] ?? 0
                        ]);
                    }
                }
                break;

            case 'roomForm':
                try {
                    $options = ['roomType' => $roomType ?? "", 'building' => $building ?? "", 'approvers' => Json::decode($approvers) ?: [], 'priorityApprovers' => Json::decode($priorityApprovers ?: '[]') ?: [], 'equipments' => Json::decode($equipments) ?: [], 'size' => $size ?? "", 'persons' => $persons ?? "", 'color' => $color ?? "", 'note' => $note ?? ""];
                } catch (\Throwable $th) {
                    return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                }
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mParentKey' => $roomType ?? "", 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'rooms', 'mParentKey' => $roomType ?? "", 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                $newItem = self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($id != "" && !empty($newItem)) {
                    $haveToUpdateBookings = self::getBookingByRoom($currentItem['mkey']);
                    if (!empty($newItem['options'])) {
                        $newItem = array_merge($newItem, \Booking\Util::setDefaultValueIfNullMasterDataItem('rooms', $newItem['options']));
                        unset($newItem['options']);
                    }
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mtype' => 'roomTypes', 'mkey' => $newItem['mParentKey']]);
                    $roomType = $queryMasterData->exec()->fetch();
                    if (!empty($roomType)) {
                        $roomType = array_merge($roomType, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $roomType['options']));
                        unset($roomType['options']);
                    }
                    try {
                        $size = $newItem['size'] ?: ($roomType['size'] ?: 0);
                        $persons = $newItem['persons'] ?: ($roomType['persons'] ?: 0);
                        $equipmentKeys = $newItem['equipments'] ?: [];
                        if (empty($equipmentKeys)) {
                            $equipmentKeys = $roomType['equipments'] ?: [];
                        }
                        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                        $queryMasterData->setSelect(['*']);
                        $queryMasterData->setFilter(['mkey' => $equipmentKeys, 'mtype' => 'equipments']);
                        $equipments = $queryMasterData->exec()->fetchAll();
                        foreach($haveToUpdateBookings as $booking) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                                'room' => Json::encode($newItem),
                                'equipments' => Json::encode($equipments ?? []),
                                'size' => $size ?? 0,
                                'persons' => $persons ?? 0
                            ]);
                        }
                    } catch (\Throwable $th) {
                        //throw $th;
                    }
                }
                break;

            case 'managerReviewForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['managerReviewScore' => $managerReviewScore ?? "5", 'managerReviewComment' => $managerReviewComment ?? ""]);
                }
                break;

            case 'userReviewForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, '%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'], ['userReviewCleanScore' => $userReviewCleanScore ?? "5", 'userReviewCleanComment' => $userReviewCleanComment ?? "", 'userReviewEquipmentScore' => $userReviewEquipmentScore ?? "5", 'userReviewEquipmentComment' => $userReviewEquipmentComment ?? "", 'userReviewFacilityScore' => $userReviewFacilityScore ?? "5", 'userReviewFacilityComment' => $userReviewFacilityComment ?? ""]);
                }
                break;

            case 'bookingForm':
                if (!$mainUser || !$users || !$department || !$building || !$room || !$startDate || !$startTime || !$endTime || !$usagePurpose || !$usagePurposeLocale || !$usagePurposeDetail) {
                    return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ thông tin'];
                }
                try {
                    $room = Json::decode($room) ?: [];
                } catch (\Throwable $th) {
                    return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                }
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'maxDayToBooking']);
                $maxDayToBooking = $queryMasterData->exec()->fetch();

                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'maxHourToAutoApprove']);
                $maxHourToAutoApprove = $queryMasterData->exec()->fetch();

                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => $room['roomType'] ?? '', 'mtype' => 'roomTypes']);
                $roomType = $queryMasterData->exec()->fetch();

                if (!empty($roomType)) {
                    $roomType = array_merge($roomType, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $roomType['options']));
                    unset($roomType['options']);
                }

                $roomKey = $room['mkey'] ?? '';
                $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
                $startTimeCondition = $startDateCondition->format('H:i:s');
                $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
                $endTimeCondition = $endDateCondition->format('H:i:s');

                // Check booking date range
                $currentDate = new \Bitrix\Main\Type\DateTime();
                $maxBookingDays = intval($maxDayToBooking['mvalue'] ?? 7);
                $maxAllowedDate = clone $currentDate;
                $maxAllowedDate->add("$maxBookingDays days");

                if (!$isEndBooking) {
                    if ($startDateCondition < $currentDate) {
                        return ['status' => 'error', 'message' => 'Không thể đặt xe trong quá khứ'];
                    }

                    if ($startDateCondition > $maxAllowedDate) {
                        return ['status' => 'error', 'message' => 'Không thể đặt xe quá ' . $maxBookingDays . ' ngày kể từ hôm nay'];
                    }

                    // Check duplicate booking
                    if ($isPriority) {
                        $overlappingBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 1, 1);
                        foreach($overlappingBookings as $booking) {
                            if ($booking['isPriority'] == 1 && $booking['isCancelled'] == 0 && $booking['isApproved'] != -1) {
                                // Has any priority booking pending or approved
                                return ['status' => 'error', 'message' => 'Xe đã có đặt ưu tiên vào khung giờ này'];
                            }
                            if ($booking['isPriority'] == 1 && $booking['isApproved'] == -1 && $booking['bookingUser'] && $booking['bookingUser']['mkey'] == 'BitrixID-'.$userId) {
                                // Has previous priority booking by the same user but not approved
                                return ['status' => 'error', 'message' => 'Bạn đã có đặt xe ưu tiên bị từ chối trong khung giờ này'];
                            }
                        }
                    } else {
                        $overlappingBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 1, 0);
                        $overlappingBookingsWaitingApproval = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
                        // Filter only isCancelled = 0
                        $overlappingBookingsWaitingApproval = array_filter($overlappingBookingsWaitingApproval, function($booking) {
                            return isset($booking['isCancelled']) && $booking['isCancelled'] == 0;
                        });
                        $priorityBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 1, 1);
                        // Filter only isApproved = 1
                        $priorityBookings = array_filter($priorityBookings, function($booking) {
                            return isset($booking['isApproved']) && $booking['isApproved'] == 1;
                        });
                        $overlappingBookings = array_merge($overlappingBookings, $overlappingBookingsWaitingApproval, $priorityBookings);
                        if (!empty($overlappingBookings)) {
                            return ['status' => 'error', 'message' => 'Khung giờ đặt xe bị trùng với một đặt xe khác'];
                        }
                    }

                    if ($isPriority && (!$room['priorityApprovers'] || !is_array($room['priorityApprovers']) || count($room['priorityApprovers']) == 0)) {
                        return ['status' => 'error', 'message' => 'Xe không được cấu hình duyệt ưu tiên'];
                    }
                    try {
                        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                        $equipmentKeys = $room['equipments'] ?: ($roomType['equipments'] ?: []);
                        $queryMasterData->setSelect(['*']);
                        $queryMasterData->setFilter(['mkey' => $equipmentKeys, 'mtype' => 'equipments']);
                        $equipments = $queryMasterData->exec()->fetchAll();
                        $size = $room['size'] ?: ($roomType['size'] ?: 0);
                        $persons = $room['persons'] ?: ($roomType['persons'] ?: 0);
                        $hasAutoApprove = $room['hasAutoApprove'] ?: "";
                        if ($hasAutoApprove == "") {
                            $hasAutoApprove = $roomType['hasAutoApprove'] ?: 0;
                        }
                    } catch (\Throwable $th) {
                        return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                    }
                    

                    // Check if the booking is auto-approved
                    $isApproved = 0;
                    $approvedDate = new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s");
                    if ($maxHourToAutoApprove['mvalue'] > 0) {
                        $maxAutoApproveHours = intval($maxHourToAutoApprove['mvalue'] ?? 4);
                        $deltaTime = $endDateCondition->getTimestamp() - $startDateCondition->getTimestamp();

                        if ($hasAutoApprove && $deltaTime <= $maxAutoApproveHours * 3600 && !$isPriority) {
                            $isApproved = 1;
                            $approvedDate = new \Bitrix\Main\Type\DateTime();
                            $overlappingBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
                            foreach($overlappingBookings as $booking) {
                                if ($booking['isCancelled'] == 1) {
                                    continue;
                                }
                                \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do trùng lịch với đặt xe số ".$id." đã được duyệt tự động."]);
                                self::logBooking($booking['id'], $booking, $userId);

                                $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
                                foreach($mailContent['userIds'] as $userId) {
                                    \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                                }
                            }
                        }
                    }
                    try {
                        $data = [
                            "createdDate" => new \Bitrix\Main\Type\DateTime(),
                            'notificationCount' => 0,
                            "bookingUser" => Json::encode(["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]),	
                            "mainUser" => Json::encode(Json::decode($mainUser)),	
                            "users" => Json::encode(Json::decode($users)),	
                            "department" => Json::encode(Json::decode($department)),	
                            "building" => Json::encode(Json::decode($building)),	
                            "room" => Json::encode($room),	
                            "roomType" => Json::encode($roomType),	
                            "startDate" => new \Bitrix\Main\Type\DateTime($startDate, "Y-m-d"),
                            "startTime" => new \Bitrix\Main\Type\DateTime($startTime, "H:i:s"),
                            "endTime" => new \Bitrix\Main\Type\DateTime($endTime, "H:i:s"),
                            "equipments" => Json::encode($equipments),	
                            "size" => $size ?? 0,
                            "persons" => $persons ?? 0,
                            "usagePurpose" => Json::encode(Json::decode($usagePurpose)),	
                            "usagePurposeDetail" => $usagePurposeDetail ?? "",	
                            "usagePurposeLocale" => $usagePurposeLocale ?? "",
                            "note" => $note ?? "",
                            "clients" => $clients ?? 0,
                            "clientNames" => Json::encode(Json::decode($clientNames)),	
                            "externalClients" => $externalClients ?? 0,
                            "externalClientNames" => Json::encode(Json::decode($externalClientNames)),
                            "isApproved" => $isApproved,
                            "isPriority" => $isPriority ? 1 : 0,
                            "approvedUsers" => "[]",
                            "approvedDate" => $approvedDate,
                            "rejectedUsers" => "[]",	
                            "rejectedDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "isCancelled" => 0,
                            "cancelledReason" => "",	
                            "userReviewCleanScore" => 0,
                            "userReviewCleanComment" => "",	
                            "userReviewEquipmentScore" => 0,
                            "userReviewEquipmentComment" => "",	
                            "userReviewFacilityScore" => 0,
                            "userReviewFacilityComment" => "",
                            "managerReviewScore" => 0,
                            "managerReviewComment" => ""
                        ];
                    } catch (\Throwable $th) {
                        return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                    }

                    if ($id != "" && $id != "*") {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, 
                            ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"', '%room' => '"BitrixID-'.$userId.'"', '%roomType' => '"BitrixID-'.$userId.'"']
                        ], $data);
                        self::logBooking($id, $currentItem, $userId);
                    } else {
                        $id = \Booking\Query::insertRecord('car_booking_requests', $data);
                    }
                    if ($isApproved == 0) {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_create_booking', $id, null, $isPriority);
                        $approversOrPriorityApprovers = $isPriority ? $mailContent['priorityApprovers'] : $mailContent['approvers'];
                        foreach($approversOrPriorityApprovers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    } else {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $id, null, $isPriority);
                        foreach($mailContent['userIds'] as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                } else {
                    try {
                        $data = [
                            "mainUser" => Json::encode(Json::decode($mainUser)),	
                            "users" => Json::encode(Json::decode($users)),	
                            "department" => Json::encode(Json::decode($department)),	
                            "endTime" => new \Bitrix\Main\Type\DateTime($endTime, "H:i:s"),
                            "usagePurpose" => Json::encode(Json::decode($usagePurpose)),	
                            "usagePurposeDetail" => $usagePurposeDetail ?? "",	
                            "usagePurposeLocale" => $usagePurposeLocale ?? "",
                            "note" => $note ?? "",
                            "clients" => $clients ?? 0,
                            "clientNames" => Json::encode(Json::decode($clientNames)),	
                            "externalClients" => $externalClients ?? 0,
                            "externalClientNames" => Json::encode(Json::decode($externalClientNames))
                        ];
                    } catch (\Throwable $th) {
                        return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                    }
                    if ($id != "" && $id != "*") {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, 
                            ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"', '%room' => '"BitrixID-'.$userId.'"', '%roomType' => '"BitrixID-'.$userId.'"']
                        ], $data);
                        self::logBooking($id, $currentItem, $userId);
                    }
                }
                break;

            case 'cancelBookingForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, '%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'], ['isCancelled' => 1, 'cancelledReason' => $cancelledReason ?? ""]);
                    self::logBooking($id, $currentItem, $userId);

                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $id);
                    foreach($mailContent['userIds'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
                break;

            case 'rejectBookingForm':
                if ($id != "") {
                    $query = \Booking\Query::getInstance("car_booking_requests");
                    $query->setSelect(['*']);
                    $query->setFilter(['id' => $id]);
                    $currentItem = $query->exec()->fetch();
                }
                if ($currentItem) {
                    if ($currentItem['isPriority'] && is_array($hasPermission) && !in_array("Permission [Car_Booking_Priority_Approval]", $hasPermission)) {
                        return ['status' => 'error', 'message' => 'Bạn không có quyền từ chối đặt xe ưu tiên'];
                    }
                    $rejectedUsers = array_merge($currentItem['rejectedUsers'], [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]]);
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['isApproved' => -1, 'rejectedReason' => $rejectedReason ?? "", 'rejectedUsers' => Json::encode($rejectedUsers), 'rejectedDate' => new \Bitrix\Main\Type\DateTime()]);
                    self::logBooking($id, $currentItem, $userId);
                    if ($currentItem['isApproved'] == 1) {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_reject_booking_after_approved', $id);
                    } else {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_reject_booking', $id);
                    }
                    foreach($mailContent['userIds'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
                break;
        }
        return ['status' => 'success', 'message' => $id ? 'Chỉnh sửa thành công' : 'Thêm mới thành công'];
    }
}