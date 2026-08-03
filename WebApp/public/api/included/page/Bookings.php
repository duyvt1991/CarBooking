<?php
namespace Booking\Page;

use Bitrix\Main\Application;
use Bitrix\Main\Entity\Query;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Context;

class Bookings {
    public static function getAvailableRooms() {
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $fromDate = $fromDate ?? '';
        $toDate = $toDate ?? '';
        $roomType = $roomType ?? '';


        if (!$fromDate || !$toDate) {
            return [];
        }

        $reqStart = strtotime($fromDate);
        $reqEnd = strtotime($toDate);

        $queryBookingFilter = [];
        $queryBookingFilter = array_merge($queryBookingFilter, ['isCancelled' => 0]);
        $queryBookingFilter = array_merge($queryBookingFilter, ['@isApproved' => [ 2, 3]]);
        if ($roomType != "") {
            $queryBookingFilter = array_merge($queryBookingFilter, ['%room' => '"roomType":"'.$roomType.'"']);
        }

        $queryBooking = \Booking\Query::getInstance("car_booking_requests");
        $queryBooking->setSelect(['room', 'startDate', 'endDate', 'startTime', 'endTime']);
        $queryBooking->setFilter($queryBookingFilter);
        $allBookings = $queryBooking->exec()->fetchAll();

        $bookedRoomKeys = [];
        foreach ($allBookings as $item) {
            $bStartStr = is_object($item['startDate']) ? $item['startDate']->format('Y-m-d') : explode(' ', $item['startDate'] ?? '')[0];
            $bEndStr = !empty($item['endDate']) ? (is_object($item['endDate']) ? $item['endDate']->format('Y-m-d') : explode(' ', $item['endDate'])[0]) : $bStartStr;
            $bStartTimeStr = is_object($item['startTime']) ? $item['startTime']->format('H:i:s') : $item['startTime'];
            $bEndTimeStr = is_object($item['endTime']) ? $item['endTime']->format('H:i:s') : $item['endTime'];

            $bStart = strtotime($bStartStr . " " . $bStartTimeStr);
            $bEnd = strtotime($bEndStr . " " . $bEndTimeStr);

            if ($reqStart < $bEnd && $reqEnd > $bStart) {
                $room = [];
                if (!empty($item['room'])) {
                    try {
                        $room = is_string($item['room']) ? Json::decode($item['room']) : (array)$item['room'];
                    } catch (\Throwable $th) {}
                }
                if (!empty($room['mkey'])) {
                    $bookedRoomKeys[] = $room['mkey'];
                }
            }
        }

        // Query all rooms from masterdata
        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata");
        $queryMasterData->setSelect(['mkey']);
        // $queryMasterData->setFilter([ 'mtype' => 'rooms', '%options' => '"building":"'.$building.'"' ]);
        // $queryMasterData->setFilter([ 'mtype' => 'rooms' ]);
        $masterDataFilter = [ 'mtype' => 'rooms', 'isDeleted' => 0, 'isActive' => 1 ];
        if ($roomType != "") {
            $masterDataFilter['mParentKey'] = $roomType;
        }
        $queryMasterData->setFilter($masterDataFilter);
        $allRooms = $queryMasterData->exec()->fetchAll();

        // Filter out duplicated (booked) rooms
        // $availableRooms = array_filter($allRooms, function($room) use ($allDuplicatedBookings) {
        //     return !in_array($room['mkey'], $allDuplicatedBookings);
        // });
        $availableRooms = array_filter($allRooms, function($room) use ($bookedRoomKeys) {
            return !in_array($room['mkey'], $bookedRoomKeys);
        });

        
        return array_values(array_map(function($item) {
            return $item['mkey'];
        }, $availableRooms));
    }

    public static function getBookings() {
        global $USER;
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $myCalendar = $myCalendar ?? false;
        $fromDate = $fromDate ?? '';
        $endDate = $endDate ?? '';
        // $building = $building ?? '';
        $roomType = $roomType ?? '';
        $room = $room ?? '';
        $statusApproved = $statusApproved ?? null;
        $userId = $USER->GetID();

        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['*']);
        $queryFilters = [];
        $queryFilters = array_merge($queryFilters, ['@isApproved' => [0, 1, 2, 3, 4]]);
        $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);
        $startDateTime = new \Bitrix\Main\Type\DateTime(explode(' ', $fromDate)[0], "Y-m-d");
        $endDateTime = new \Bitrix\Main\Type\DateTime(explode(' ', $endDate)[0], "Y-m-d");
        $queryFilters[] = [
            '<=startDate' => $endDateTime,
            [
                'LOGIC' => 'OR',
                ['>=endDate' => $startDateTime],
                [
                    'endDate' => null,
                    '>=startDate' => $startDateTime
                ]
            ]
        ];

        if ($roomType != "") {
            $queryFilters = array_merge($queryFilters, ['%room' => '"roomType":"'.$roomType.'"']);
        }

        if ($room != "") {
            $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
        }

        if ($myCalendar) {
            $queryFilters[] =  [
                'LOGIC' => 'OR',
                [
                    '%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'
                ],
                [
                    '%mainUser' => '"mkey":"BitrixID-'.$userId.'"'
                ]
            ];
        }

        if($statusApproved !== null) {
            if($statusApproved == 1) {
                $queryFilters = array_merge($queryFilters, ['@isApproved' => [ 3, 4]]); // Chỉ load những booking đã được xác nhận hoặc hoàn thành
            } 
        }

        $query->setFilter($queryFilters);

        $results = $query->exec()->fetchAll();
        $reqStart = strtotime($fromDate);
        $reqEnd = strtotime($endDate);

        $results = array_filter($results, function($b) use ($reqStart, $reqEnd) {
            $bStartStr = is_object($b['startDate']) ? $b['startDate']->format('Y-m-d') : explode(' ', $b['startDate'] ?? '')[0];
            $bEndStr = !empty($b['endDate']) ? (is_object($b['endDate']) ? $b['endDate']->format('Y-m-d') : explode(' ', $b['endDate'])[0]) : $bStartStr;
            $bStartTimeStr = is_object($b['startTime']) ? $b['startTime']->format('H:i:s') : $b['startTime'];
            $bEndTimeStr = is_object($b['endTime']) ? $b['endTime']->format('H:i:s') : $b['endTime'];

            $bStart = strtotime($bStartStr . " " . $bStartTimeStr);
            $bEnd = strtotime($bEndStr . " " . $bEndTimeStr);

            return ($bStart <= $reqEnd && $bEnd >= $reqStart);
        });

        return array_values($results);
        // foreach ($results as &$result) {
            // if ($component == "week" || $component == "day") {
                // $result['canPriorityBooking'] = 1;
                // if ($result['isPriority']) {
                //     $result['canPriorityBooking'] = 0; // Cannot book priority on a priority booking
                //     continue;
                // }
                // if ($result['room'] && (!is_array($result['room']['priorityApprovers']) || count($result['room']['priorityApprovers']) == 0)) {
                //     $result['canPriorityBooking'] = 0; // Cannot book priority on a room without priority approvers
                //     continue;
                // }
                // $roomKey = '';
                // if ($result['room']) {
                //     $roomKey = $result['room']['mkey'] ?? '';
                // }
                // $startDate = $result['startDate'] ?? '';
                // $startTime = $result['startTime'] ?? '';
                // $endTime = $result['endTime'] ?? '';
                // $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
                // $startTimeCondition = $startDateCondition->format('H:i:s');
                // $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
                // $endTimeCondition = $endDateCondition->format('H:i:s');
                // $overlappingBookings = \Booking\Page\Item::getDuplicatedBooking($result['id'], $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 1);
                // $result['waitForPriority'] = 0;
                // foreach($overlappingBookings as $booking) {
                //     if ($booking['isPriority'] == 1 && $booking['isCancelled'] == 0 && $booking['isApproved'] != -1) {
                //         // Has any priority booking pending or approved
                //         $result['canPriorityBooking'] = 0;
                //         $result['waitForPriority'] = 1;
                //         break;
                //     }
                //     if ($booking['isPriority'] == 1 && $booking['isApproved'] == -1 && $booking['bookingUser'] && $booking['bookingUser']['mkey'] == 'BitrixID-'.$userId) {
                //         // Has previous priority booking by the same user but not approved
                //         $result['canPriorityBooking'] = 0;
                //         break;
                //     }
                // }
            // }
        // }

        return $results;
    }
}