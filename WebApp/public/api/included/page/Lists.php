<?php
namespace Booking\Page;

use Bitrix\Main\Application;
use Bitrix\Main\Entity\Query;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Context;
use Bitrix\Main\Entity\ExpressionField;

class Lists {
    public static function getList() {
        global $USER;
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $filters = $filters ? Json::decode($filters) : [];
        $page = $page ? (int)$page : 1;
        $limit = $limit ? (int)$limit : 20;
        $userId = $USER->GetID();
        $userRoles = \Booking\Page\MasterData::getUserRoles($userId);
    
        if ($component === "log") {
            $query = \Booking\Query::getInstance("car_booking_log");
        } else if (in_array($component, ["bookingList", "approveBookingList", "userReviewList", "managerReviewList", "driverConfirmBookingList"])) {
            $query = \Booking\Query::getInstance("car_booking_requests");
        } else {
            $query = \Booking\Query::getInstance("car_booking_masterdata");
        }
        $query->setSelect(['*']);
        $queryFilters = [];
        if (in_array($component, ['adminList', 'approverList', 'priorityApproverList', 'managerList', 'buildingList', 'departmentList', 'equipmentTypeList', 'equipmentList', 'usagePurposeList', 'roomTypeList', 'roomList', 'bookingList', 'approveBookingList', 'userReviewList', 'managerReviewList', 'carLineList', 'driverList', 'log', 'driverConfirmBookingList'])) {
            $id = $filters['id'] ?? '';
            if ($id != "") {
                $queryFilters = array_merge($queryFilters, ['id' => $id]);
            }
        }
        if (in_array($component, ['adminList', 'approverList', 'priorityApproverList', 'managerList', 'buildingList', 'departmentList', 'equipmentTypeList', 'equipmentList', 'usagePurposeList', 'roomTypeList', 'roomList', 'carLineList', 'driverList'])) {
            $mkey = $filters['mkey'] ?? '';
            if ($mkey != "") {
                $queryFilters = array_merge($queryFilters, ['mkey' => $mkey]);
            }
            $mvalue = $filters['mvalue'] ?? '';
            if ($mvalue != "") {
                $queryFilters = array_merge($queryFilters, ['%mvalue' => $mvalue]);
            }
            $queryFilters = array_merge($queryFilters, ['isDeleted' => 0]);
        }
        switch ($component) {
            case 'adminList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'admins']);
                break;
            case 'approverList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'approvers']);
                break;
            case 'priorityApproverList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'priorityApprovers']);
                break;
            case 'managerList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'managers']);
                break;
            case 'buildingList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'buildings']);
                break;
            case 'departmentList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'departments']);
                break;
            case 'equipmentTypeList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'equipmentTypes']);
                break;
            case 'equipmentList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'equipments']);
                $mParentKey = $filters['mParentKey'] ?? '';
                if ($mParentKey != "") {
                    $queryFilters = array_merge($queryFilters, ['mParentKey' => $mParentKey]);
                }
                break;
            case 'usagePurposeList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'usagePurposes']);
                break;
            case 'roomTypeList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'roomTypes']);
                break;
            case 'roomList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'rooms']);
                $roomType = $filters['roomType'] ?? '';
                if ($roomType != "") {
                    $queryFilters = array_merge($queryFilters, ['%options' => '"roomType":"'.$roomType.'"']);
                }
                $isActive = $filters['isActive'] ?? '';
                if ($isActive != "") {
                    $queryFilters = array_merge($queryFilters, ['isActive' => $isActive]);
                }
                break;
            case 'bookingList':
                $queryFilters = array_merge($queryFilters, ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"']);
                $roomType = $filters['roomType'] ?? '';
                if ($roomType != "") {
                    $queryFilters = array_merge($queryFilters, ['%roomType' => '"mkey":"'.$roomType.'"']);
                }
                $room = $filters['room'] ?? '';
                if ($room != "") {
                    $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
                }
                $tab = $filters['tab'] ?? '';
                if ($tab == "cancelled") {
                    $queryFilters = array_merge($queryFilters, ['isCancelled' => 1]);
                }
                break;
            case 'approveBookingList':
                $startDate = $filters['startDate'] ?? '';
                if ($startDate != "") {
                    $startDateTime = new \Bitrix\Main\Type\DateTime($startDate . " 00:00:00", "Y-m-d H:i:s");
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
    
                    $endDateTime = new \Bitrix\Main\Type\DateTime($startDate . " 23:59:59", "Y-m-d H:i:s");
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
                }
                if ($userRoles && is_array($userRoles)) {
                    // $query->registerRuntimeField(
                    //     new ExpressionField(
                    //         'HAS_PRIORITY_APPROVER',
                    //         'JSON_CONTAINS(%s->\'$.priorityApprovers\', \'["BitrixID-'.$userId.'"]\')',
                    //         ['room']
                    //     )
                    // );
                    // $query->registerRuntimeField(
                    //     new ExpressionField(
                    //         'HAS_APPROVER',
                    //         'JSON_CONTAINS(%s->\'$.approvers\', \'["BitrixID-'.$userId.'"]\')',
                    //         ['room']
                    //     )
                    // );

                    if (!in_array("Permission [Car_Booking_Priority_Approval]", $userRoles) && !in_array("Permission [Car_Booking_Approval]", $userRoles)) {
                        return [ 'currentItems' => [], 'totalPages' => 0, 'totalItems' => 0 ];
                    }
                    if ($tab != "pending" && $tab != "priority") {
                        // if (in_array("Permission [Car_Booking_Priority_Approval]", $userRoles) && !in_array("Permission [Car_Booking_Approval]", $userRoles)) {
                        //     $queryFilters = array_merge($queryFilters, ['=HAS_PRIORITY_APPROVER' => 1]);
                        // } else if (!in_array("Permission [Car_Booking_Priority_Approval]", $userRoles) && in_array("Permission [Car_Booking_Approval]", $userRoles)) {
                        //     $queryFilters[] =  [
                        //         'LOGIC' => 'OR',
                        //         [
                        //             '%room' => '"approvers":[]',
                        //             '%roomType' => '"BitrixID-'.$userId.'"'
                        //         ],
                        //         ['=HAS_APPROVER' => 1]
                        //     ];
                        // } else if (in_array("Permission [Car_Booking_Priority_Approval]", $userRoles) && in_array("Permission [Car_Booking_Approval]", $userRoles)) {
                        //     $queryFilters[] =  [
                        //         'LOGIC' => 'OR',
                        //         [
                        //             '%room' => '"approvers":[]',
                        //             '%roomType' => '"BitrixID-'.$userId.'"'
                        //         ],
                        //         ['=HAS_APPROVER' => 1],
                        //         ['=HAS_PRIORITY_APPROVER' => 1]
                        //     ];
                        // }
                    }
                } else {
                    return [ 'currentItems' => [], 'totalPages' => 0, 'totalItems' => 0 ];
                }
                $roomType = $filters['roomType'] ?? '';
                if ($roomType != "") {
                    $queryFilters = array_merge($queryFilters, ['%roomType' => '"mkey":"'.$roomType.'"']);
                }
                $room = $filters['room'] ?? '';
                if ($room != "") {
                    $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
                }
                $isApproved = $filters['isApproved'] ?? '';
                if ($isApproved != "") {
                    $queryFilters = array_merge($queryFilters, ['isApproved' => $isApproved * 1]);
                }
                $tab = $filters['tab'] ?? '';
                if ($tab == "pending") {
                    $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);
                    // $queryFilters = array_merge($queryFilters, ['isApproved' => 0]);
                    $queryFilters = array_merge($queryFilters, ['@isApproved' => [0, 1, -2]]);

                    // $queryFilters = array_merge($queryFilters, ['isPriority' => 0]);
                    // $queryFilters[] =  [
                    //         'LOGIC' => 'OR',
                    //         [
                    //             '%room' => '"approvers":[]',
                    //             '%roomType' => '"BitrixID-'.$userId.'"'
                    //         ],
                    //         ['=HAS_APPROVER' => 1]
                    //     ];
                }
                //  else if ($tab === 'priority') {
                //     $queryFilters = array_merge($queryFilters, ['=HAS_PRIORITY_APPROVER' => 1]);
                //     $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);
                //     $queryFilters = array_merge($queryFilters, ['isApproved' => 0]);
                //     $queryFilters = array_merge($queryFilters, ['isPriority' => 1]);
                // }
                break;
            case 'driverConfirmBookingList':
                $startDate = $filters['startDate'] ?? '';
                if ($startDate != "") {
                    $startDateTime = new \Bitrix\Main\Type\DateTime($startDate . " 00:00:00", "Y-m-d H:i:s");
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
    
                    $endDateTime = new \Bitrix\Main\Type\DateTime($startDate . " 23:59:59", "Y-m-d H:i:s");
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
                }
                if ($userRoles && is_array($userRoles)) {
                    if (!in_array("Permission [Car_Booking_Driver_Confirm]", $userRoles) && !in_array("Permission [Car_Booking_Approval]", $userRoles) && !in_array("Permission [Car_Booking_Admin]", $userRoles)) {
                        return [ 'currentItems' => [], 'totalPages' => 0, 'totalItems' => 0 ];
                    }

                    if (!in_array("Permission [Car_Booking_Admin]", $userRoles) && !in_array("Permission [Car_Booking_Approval]", $userRoles)) {
                        $queryFilters = array_merge($queryFilters, ['%driverUser' => '"mkey":"BitrixID-'.$userId.'"']);
                    }
                } else {
                    return [ 'currentItems' => [], 'totalPages' => 0, 'totalItems' => 0 ];
                }
                $roomType = $filters['roomType'] ?? '';
                if ($roomType != "") {
                    $queryFilters = array_merge($queryFilters, ['%roomType' => '"mkey":"'.$roomType.'"']);
                }
                $room = $filters['room'] ?? '';
                if ($room != "") {
                    $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
                }
                // $isApproved = $filters['isApproved'] ?? '';
                // if ($isApproved != "") {
                //     $queryFilters = array_merge($queryFilters, ['isApproved' => $isApproved * 1]);
                // }
                $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);

                $tab = $filters['tab'] ?? '';
                if ($tab == "pending") {
                    $queryFilters = array_merge($queryFilters, ['@isApproved' => [2]]);
                }
                else if ($tab == "review") {
                     $queryFilters = array_merge($queryFilters, ['@isApproved' => [3, 4]]);
                }
                else {
                    $queryFilters = array_merge($queryFilters, ['@isApproved' => [2, 3, 4, -2]]);
                }
                break;
            case 'userReviewList':
                $queryFilters = array_merge($queryFilters, ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"']);
                $queryFilters = array_merge($queryFilters, ['@isApproved' => [3, 4]]); // Chỉ lấy: Tài xế đã xác nhận và đã hoàn thành
            case 'managerReviewList':
                $roomType = $filters['roomType'] ?? '';
                if ($roomType != "") {
                    $queryFilters = array_merge($queryFilters, ['%roomType' => '"mkey":"'.$roomType.'"']);
                }
                $room = $filters['room'] ?? '';
                if ($room != "") {
                    $queryFilters = array_merge($queryFilters, ['%room' => '"mkey":"'.$room.'"']);
                }
            
                $managerReviewScore = $filters['managerReviewScore'] ?? '';
                if ($managerReviewScore != "") {
                    $queryFilters = array_merge($queryFilters, ['managerReviewScore' => $managerReviewScore]);
                }
             

                $queryFilters = array_merge($queryFilters, ['isCancelled' => 0]);
                // $queryFilters = array_merge($queryFilters, ['isApproved' => 1]);
                $queryFilters = array_merge($queryFilters, ['@isApproved' => [3, 4]]); // Chỉ lấy: Tài xế đã xác nhận và đã hoàn thành
                $currentDateTime = new \Bitrix\Main\Type\DateTime();
                $currentTime = $currentDateTime->format('H:i:s');
                $queryFilters[] =  [
                    'LOGIC' => 'OR',
                    [
                        '<startDate' => $currentDateTime
                    ],
                    [
                        '=startDate' => $currentDateTime,
                        '<endTime' => $currentTime
                    ]
                ];
                break;
            case 'log':
                $logUser = $filters['logUser'] ?? '';
                if ($logUser != "") {
                    $queryFilters = array_merge($queryFilters, ['%logUser' => $logUser]);
                }
                $logType = $filters['logType'] ?? '';
                if ($logType != "") {
                    $queryFilters = array_merge($queryFilters, ['logType' => $logType]);
                }
                $logPage = $filters['logPage'] ?? '';
                if ($logPage != "") {
                    $queryFilters[] =  [
                        'LOGIC' => 'OR',
                        [
                            '%logOldValue' => '"mtype":"'.$logPage.'"'
                        ],
                        [
                            '%logNewValue' => '"mtype":"'.$logPage.'"'
                        ]
                    ];
                }
                $oldValue = $filters['oldValue'] ?? '';
                if ($oldValue != "") {
                    $queryFilters = array_merge($queryFilters, ['%logOldValue' => $oldValue]);
                }
                $newValue = $filters['newValue'] ?? '';
                if ($newValue != "") {
                    $queryFilters = array_merge($queryFilters, ['%logNewValue' => $newValue]);
                }
                $fromDate = $filters['fromDate'] ?? '';
                if ($fromDate != "") {
                    $startDateTime = new \Bitrix\Main\Type\DateTime(str_replace("T", " ", $fromDate).":00", "Y-m-d H:i:s");
                    $queryFilters = array_merge($queryFilters, ['>=logDate' => $startDateTime]);
                }
                $toDate = $filters['toDate'] ?? '';
                if ($toDate != "") {
                    $endDateTime = new \Bitrix\Main\Type\DateTime(str_replace("T", " ", $toDate).":00", "Y-m-d H:i:s");
                    $queryFilters = array_merge($queryFilters, ['<=logDate' => $endDateTime]);
                }
                break;
                
            case 'carLineList':
                $queryFilters = array_merge($queryFilters, ['mtype' => 'carLines']);
                break;
            case 'driverList':
                 $queryFilters = array_merge($queryFilters, ['mtype' => 'drivers']);
                $driverPhoneNumber = $filters['driverPhoneNumber'] ?? '';
                if ($driverPhoneNumber != "") {
                    // Lọc tìm kiếm số điện thoại tương đối trong options
                    $queryFilters = array_merge($queryFilters, ['%options' => '"driverPhoneNumber":"' . $driverPhoneNumber]);
                }
                break;
        }

        $query->setFilter($queryFilters);
        $query->setOrder(['id' => 'desc']);

        $totalItems = $query->exec()->getSelectedRowsCount();
        $totalPages = ceil($totalItems / $limit);
        $query->setOffset(($page - 1) * $limit);
        $query->setLimit($limit);
        $currentItems = $query->exec()->fetchAll();
        foreach ($currentItems as &$item) {
            if (isset($item['options'])) {
                $item = array_merge($item, $item['options']);
                unset($item['options']);
            }
            // if ($component == 'approveBookingList' && !$item['isPriority']) {
                // $roomKey = '';
                // if ($item['room']) {
                //     $roomKey = $item['room']['mkey'] ?? '';
                // }
                // $startDate = $item['startDate'] ?? '';
                // $startTime = $item['startTime'] ?? '';
                // $endTime = $item['endTime'] ?? '';
                // $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
                // $startTimeCondition = $startDateCondition->format('H:i:s');
                // $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
                // $endTimeCondition = $endDateCondition->format('H:i:s');
                // $overlappingBookings = \Booking\Page\Item::getDuplicatedBooking($item['id'], $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 1);
                // $item['waitForPriority'] = 0;
                // foreach($overlappingBookings as $booking) {
                //     if ($booking['isPriority'] == 1 && $booking['isCancelled'] == 0 && $booking['isApproved'] != -1) {
                //         // Has any priority booking pending or approved
                //         $item['waitForPriority'] = 1;
                //         break;
                //     }
                // }
            // }
        }
    
        return [
            'currentItems' => $currentItems ?? [],
            'totalPages' => $totalPages ?? 0,
            'totalItems' => $totalItems ?? 0
        ];
    
    }
}