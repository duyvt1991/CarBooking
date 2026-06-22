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


        if (!$fromDate || !$toDate || explode(" ", $fromDate)[0] != explode(" ", $toDate)[0]) {
            return [];
        }

        $startDateCondition = new \Bitrix\Main\Type\DateTime($fromDate, "Y-m-d H:i:s");
        $startTimeCondition = $startDateCondition->format('H:i:s');
        $endDateCondition = new \Bitrix\Main\Type\DateTime($toDate, "Y-m-d H:i:s");
        $endTimeCondition = $endDateCondition->format('H:i:s');

        $queryBookingFilter = [];
        // $queryBookingFilter = array_merge($queryBookingFilter, ['isApproved' => 1]);
        // $queryBookingFilter = array_merge($queryBookingFilter, ['%roomType' => '"mkey":"'.$roomType.'"']);
        $queryBookingFilter = array_merge($queryBookingFilter, ['isCancelled' => 0]);
        $queryBookingFilter = array_merge($queryBookingFilter, ['@isApproved' => [ 2, 3]]);
        if ($roomType != "") {
            // $queryBookingFilter = array_merge($queryBookingFilter, ['%roomType' => '"mkey":"'.$roomType.'"']);
            $queryBookingFilter = array_merge($queryBookingFilter, ['%room' => '"roomType":"'.$roomType.'"']);

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

        $queryBooking = \Booking\Query::getInstance("car_booking_requests");
        $queryBooking->setSelect(['room']);
        $queryBooking->setFilter($queryBookingFilter);
        $allDuplicatedBookings = $queryBooking->exec()->fetchAll();

        // $allDuplicatedBookings = array_map(function($item) {
        //     return $item['room']['mkey'];
        // }, $allDuplicatedBookings);
        $bookedRoomKeys = [];
        foreach ($allDuplicatedBookings as $item) {
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
        $userId = $USER->GetID();

        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['*']);
        $queryFilters = [];
        $queryFilters = array_merge($queryFilters, ['@isApproved' => [0, 1, 2, 3, 4]]);
        $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);
        $startDateTime = new \Bitrix\Main\Type\DateTime($fromDate, "Y-m-d H:i:s");
        $startTime = $startDateTime->format('H:i:s');
        $queryFilters[] =  [
            'LOGIC' => 'OR',
            [
                '>startDate' => $startDateTime
            ],
            [
                '=startDate' => $startDateTime,
                '>=startTime' => $startTime
            ]
        ];

        $endDateTime = new \Bitrix\Main\Type\DateTime($endDate, "Y-m-d H:i:s");
        $endTime = $endDateTime->format('H:i:s');
        $queryFilters[] =  [
            'LOGIC' => 'OR',
            [
                '<startDate' => $endDateTime
            ],
            [
                '=startDate' => $endDateTime,
                '<=endTime' => $endTime
            ]
        ];


        if ($roomType != "") {
            // $queryFilters = array_merge($queryFilters, ['%roomType' => '"mkey":"'.$roomType.'"']);
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

        $query->setFilter($queryFilters);

        // Detect overlapping with priority bookings
        $results = $query->exec()->fetchAll();
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