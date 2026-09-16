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

    /**
     * API lấy dữ liệu báo cáo lịch hoạt động xe (chỉ lấy chuyến đã hoàn thành isApproved = 4)
     * Nhận đầy đủ các tham số lọc từ form báo cáo:
     * - filterType: 'month' | 'date'
     * - selectedMonth / month: 1 - 12
     * - selectedYear / year: năm (vd: 2026)
     * - fromDate: ngày bắt đầu ('Y-m-d' hoặc 'Y-m-d H:i:s')
     * - toDate / endDate: ngày kết thúc ('Y-m-d' hoặc 'Y-m-d H:i:s')
     * - room: xe
     * - roomType: loại xe
     * - driver / driverUser: tài xế
     * - department: phòng ban / BU
     */
    public static function getReportCarActivity() {
        $request = Context::getCurrent()->getRequest();
        $params = $request->getPostList()->toArray();

        $filterType = $params['filterType'] ?? 'month';
        $selectedMonth = $params['selectedMonth'] ?? ($params['month'] ?? '');
        $selectedYear = $params['selectedYear'] ?? ($params['year'] ?? '');
        $fromDate = $params['fromDate'] ?? '';
        $toDate = $params['toDate'] ?? ($params['endDate'] ?? '');
        $roomType = $params['roomType'] ?? '';
        $room = $params['room'] ?? '';
        $driver = $params['driver'] ?? ($params['driverUser'] ?? '');
        $department = $params['department'] ?? '';

        // Xác định khoảng thời gian theo filterType và tham số truyền vào
        if ($filterType === 'month' && !empty($selectedMonth) && !empty($selectedYear)) {
            $monthNum = (int)$selectedMonth;
            $yearNum = (int)$selectedYear;
            $fromStr = sprintf('%04d-%02d-01 00:00:00', $yearNum, $monthNum);
            $lastDay = date('t', strtotime($fromStr));
            $toStr = sprintf('%04d-%02d-%02d 23:59:59', $yearNum, $monthNum, $lastDay);
        } else {
            $fromStr = !empty($fromDate) ? (explode(' ', trim($fromDate))[0] . ' 00:00:00') : '';
            $toStr = !empty($toDate) ? (explode(' ', trim($toDate))[0] . ' 23:59:59') : '';
        }

        $query = \Booking\Query::getInstance("car_booking_requests", true);
        $query->setSelect(['*']);
        $queryFilters = [];

        // Chỉ lấy các chuyến xe có isApproved = 4 (đã hoàn thành) và không bị hủy
        $queryFilters = array_merge($queryFilters, ['@isApproved' => [4]]);
        $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);

        // // Chỉ lấy các booking mà loại dịch vụ là Xe nội bộ (serviceType = ST001)
        // $queryFilters[] = [
        //     'LOGIC' => 'OR',
        //     ['%serviceType' => '"mkey":"ST001"'],
        //     ['%serviceType' => 'ST001'],
        //     ['=serviceType' => 'ST001']
        // ];

        if (!empty($fromStr) && !empty($toStr)) {
            $startDateTime = new \Bitrix\Main\Type\DateTime(explode(' ', $fromStr)[0], "Y-m-d");
            $endDateTime = new \Bitrix\Main\Type\DateTime(explode(' ', $toStr)[0], "Y-m-d");
            $queryFilters[] = [
                '<=startDate' => $endDateTime,
                [
                    'LOGIC' => 'OR',
                    ['>=endDate' => $startDateTime],
                    [
                        'endDate' => null,
                        '>=startDate' => $startDateTime
                    ],
                    [
                        'endDate' => '',
                        '>=startDate' => $startDateTime
                    ]
                ]
            ];
        }

        // if (!empty($roomType)) {
        //     $queryFilters = array_merge($queryFilters, ['%room' => '"roomType":"'.$roomType.'"']);
        // }

        // if (!empty($room)) {
        //     $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
        // }

        // if (!empty($driver)) {
        //     $queryFilters[] = [
        //         'LOGIC' => 'OR',
        //         ['%driverUser' => '"mkey":"'.$driver.'"'],
        //         ['%driver' => '"mkey":"'.$driver.'"']
        //     ];
        // }

        // if (!empty($department)) {
        //     $queryFilters = array_merge($queryFilters, ['%department' => '"mkey":"'.$department.'"']);
        // }

        $query->setFilter($queryFilters);

        $results = $query->exec()->fetchAll();

        if (!empty($fromStr) && !empty($toStr)) {
            $reqStart = strtotime($fromStr);
            $reqEnd = strtotime($toStr);

            $results = array_filter($results, function($b) use ($reqStart, $reqEnd) {
                $bStartStr = is_object($b['startDate']) ? $b['startDate']->format('Y-m-d') : explode(' ', $b['startDate'] ?? '')[0];
                $bEndStr = !empty($b['endDate']) ? (is_object($b['endDate']) ? $b['endDate']->format('Y-m-d') : explode(' ', $b['endDate'])[0]) : $bStartStr;
                $bStartTimeStr = is_object($b['startTime']) ? $b['startTime']->format('H:i:s') : ($b['startTime'] ?? '00:00:00');
                $bEndTimeStr = is_object($b['endTime']) ? $b['endTime']->format('H:i:s') : ($b['endTime'] ?? '23:59:59');

                $bStart = strtotime($bStartStr . " " . $bStartTimeStr);
                $bEnd = strtotime($bEndStr . " " . $bEndTimeStr);

                return ($bStart <= $reqEnd && $bEnd >= $reqStart);
            });
        }

        // $results = array_filter($results, function($b) {
        //     $st = $b['serviceType'] ?? null;
        //     $stKey = '';
        //     if (is_array($st)) {
        //         $stKey = $st['mkey'] ?? ($st['id'] ?? '');
        //     } else if (is_string($st)) {
        //         if (strpos($st, '{') !== false) {
        //             $decoded = json_decode($st, true);
        //             $stKey = $decoded['mkey'] ?? ($decoded['id'] ?? $st);
        //         } else {
        //             $stKey = $st;
        //         }
        //     }
        //     return $stKey === 'ST001';
        // });

        // Sắp xếp tăng dần theo startDate và startTime
        usort($results, function($a, $b) {
            $aStart = (is_object($a['startDate']) ? $a['startDate']->format('Y-m-d') : explode(' ', $a['startDate'] ?? '')[0]) . ' ' . (is_object($a['startTime']) ? $a['startTime']->format('H:i:s') : ($a['startTime'] ?? ''));
            $bStart = (is_object($b['startDate']) ? $b['startDate']->format('Y-m-d') : explode(' ', $b['startDate'] ?? '')[0]) . ' ' . (is_object($b['startTime']) ? $b['startTime']->format('H:i:s') : ($b['startTime'] ?? ''));
            return strcmp($aStart, $bStart);
        });

        return array_values($results);
    }
}