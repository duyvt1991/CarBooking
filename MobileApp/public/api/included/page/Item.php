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
            'carLineList' => ['Permission [Car_Booking_Admin]'],
            'driverList' => ['Permission [Car_Booking_Admin]'],
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
            'managerReviewForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]', 'Permission [Car_Booking_Monitor]'],
            'carLineForm' => ['Permission [Car_Booking_Admin]'],
            'driverForm' => ['Permission [Car_Booking_Admin]'],
            'approveAssignBookingForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Approval]', 'Permission [Car_Booking_Priority_Approval]'],
            'driverConfirmBookingList' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Driver_Confirm]'],
            'driverRejectBookingForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Driver_Confirm]'],
            'driverReviewForm' => ['Permission [Car_Booking_Admin]', 'Permission [Car_Booking_Driver_Confirm]']

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
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm"
        , "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"
        , "driverRejectBookingForm", "driverReviewForm",
          "approveAssignBookingForm", "driverConfirmBookingList"])) {
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['id' => $id]);
            $currentItem = $queryMasterData->exec()->fetch();
            // if ($currentItem && $component == "buildingList") {
            //     $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            //     $queryMasterData->setSelect(['*']);
            //     $queryMasterData->setFilter([
            //         'mtype' => 'rooms',
            //         '%options' => '"building":"'.$currentItem['mkey'].'"',
            //         'isDeleted' => 0
            //     ]);
            //     $existRooms = $queryMasterData->exec()->fetchAll();
            //     if ($existRooms) {
            //         return ['status' => 'error', 'message' => 'Không thể xóa chi nhánh này vì có xe đang sử dụng'];
            //     }
            // }

            if ($component == "approverList" && $currentItem) {
                // $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                // $queryMasterData->setSelect(['*']);
                // $queryMasterData->setFilter(['mtype' => 'roomTypes', 'isDeleted' => 0, '%options' => '"'.$currentItem['mkey'].'"']);
                // $existRoomTypes = $queryMasterData->exec()->fetchAll();
                // if (!empty($existRoomTypes)) {
                //     return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt này vì có loại xe đang sử dụng'];
                // }

                $connection = Application::getConnection("car_booking_connection");
                $existRooms = $connection->query("
                    SELECT * FROM car_booking_masterdata WHERE mtype = 'rooms' AND isDeleted = 0 AND JSON_CONTAINS(options->'$.approvers', '[\"".$currentItem['mkey']."\"]')
                    ")->fetchAll();
                if (!empty($existRooms)) {
                    return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt này vì có xe đang sử dụng'];
                }
            }

            // if ($component == "priorityApproverList" && $currentItem) {
            //     $connection = Application::getConnection("car_booking_connection");
            //     $existRooms = $connection->query("
            //         SELECT * FROM car_booking_masterdata WHERE mtype = 'rooms' AND isDeleted = 0 AND JSON_CONTAINS(options->'$.priorityApprovers', '[\"".$currentItem['mkey']."\"]')
            //         ")->fetchAll();
            //     if (!empty($existRooms)) {
            //         return ['status' => 'error', 'message' => 'Không thể xóa người phê duyệt ưu tiên này vì có xe đang sử dụng'];
            //     }
            // }

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
                // if ($component == "priorityApproverList") {
                //     $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                //     $queryMasterData->setSelect(['*']);
                //     $queryMasterData->setFilter(['mkey' => 'bookingPriorityApprovalGroupId']);
                //     $bookingPriorityApprovalGroupId = $queryMasterData->exec()->fetch();
                //     $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                //     $groupId = $bookingPriorityApprovalGroupId['mvalue'] ?? 48;
                //     $connection = Application::getConnection();
                //     $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                // }
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
                 if ($component == "driverList") {
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => 'bookingDriverGroupId']);
                    $bookingDriverGroupId = $queryMasterData->exec()->fetch();
                    $bitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $groupId = $bookingDriverGroupId['mvalue'] ?? 28;
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
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm", "userReviewForm",
         "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList",
          "driverRejectBookingForm", "driverReviewForm",
          "approveAssignBookingForm", "driverConfirmBookingList"])) {
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
        if (!in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm",
         "approveBookingForm", "userReviewForm", "managerReviewForm", "bookingList",
          "approveBookingList", "userReviewList", "managerReviewList",
          "driverRejectBookingForm", "driverReviewForm",
          "approveAssignBookingForm", "driverConfirmBookingList"])) {
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
                // if ($currentItem['isPriority'] && is_array($hasPermission) && !in_array("Permission [Car_Booking_Priority_Approval]", $hasPermission)) {
                //     return ['status' => 'error', 'message' => 'Bạn không có quyền duyệt đặt xe ưu tiên'];
                // }
                // $currentApprovedUsers = [];
                // if (!empty($currentItem['approvedUsers'])) {
                //     $currentApprovedUsers = is_string($currentItem['approvedUsers']) ? Json::decode($currentItem['approvedUsers']) : (array)$currentItem['approvedUsers'];
                // }
                // $approvedUsers = array_merge($currentApprovedUsers, [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]]);
                $approvedUsers =  [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]];
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['isApproved' => 1, 'approvedUsers' => Json::encode($approvedUsers), 'approvedDate' => new \Bitrix\Main\Type\DateTime()]);
                self::logBooking($id, $currentItem, $userId);

                // $roomKey = '';
                // if ($currentItem['room']) {
                //     $roomKey = $currentItem['room']['mkey'] ?? '';
                // }
                // $startDate = $currentItem['startDate'] ?? '';
                // $startTime = $currentItem['startTime'] ?? '';
                // $endTime = $currentItem['endTime'] ?? '';
                // $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
                // $startTimeCondition = $startDateCondition->format('H:i:s');
                // $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
                // $endTimeCondition = $endDateCondition->format('H:i:s');
                // $overlappingBookings = self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
                // if ($currentItem['isPriority']) {
                //     $overlappingBookings = array_merge($overlappingBookings, self::getDuplicatedBooking($id, $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 1, 0));
                // }
                // foreach($overlappingBookings as $booking) {
                //     if ($booking['isCancelled'] == 1) {
                //         continue;
                //     }
                //     \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do trùng lịch với đặt xe số ".$id." đã được duyệt bởi ".\Booking\Query::getUserFullname($userId, true)."."]);
                //     self::logBooking($booking['id'], $booking, $userId);

                //     $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
                //     foreach($mailContent['userIds'] as $userId) {
                //         \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                //     }
                // }

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
        if (in_array($component, ["bookingForm", "cancelBookingForm", "rejectBookingForm", "approveBookingForm"
        , "userReviewForm", "managerReviewForm", "bookingList", "approveBookingList", "userReviewList", "managerReviewList"
        , "driverRejectBookingForm", "driverReviewForm", "driverConfirmBookingList", "approveAssignBookingForm"])) {
            $query = \Booking\Query::getInstance("car_booking_requests");
        } else {
            if (((!$mkey || !$mvalue || !$component) && $component != "config") || 
                ($component == "config" && (!$maxDayToBooking 
                // || !$maxHourToAutoApprove 
                || !$maxDayToReview || !$usagePurposeKeyForClient || !$bookingAdminGroupId || !$bookingApprovalGroupId 
                // || !$bookingPriorityApprovalGroupId 
                || !$bookingMonitorGroupId || !$bookingDriverGroupId))) {
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
                // \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'maxHourToAutoApprove'], ['mvalue' => $maxHourToAutoApprove ?? "4"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'maxDayToReview'], ['mvalue' => $maxDayToReview ?? "3"]);
                // \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'buildingDefault'], ['mvalue' => $buildingDefault ?? ""]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingAdminGroupId'], ['mvalue' => $bookingAdminGroupId ?? "25"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingApprovalGroupId'], ['mvalue' => $bookingApprovalGroupId ?? "26"]);
                // \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingPriorityApprovalGroupId'], ['mvalue' => $bookingPriorityApprovalGroupId ?? "48"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingMonitorGroupId'], ['mvalue' => $bookingMonitorGroupId ?? "27"]);
                \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['mkey' => 'bookingDriverGroupId'], ['mvalue' => $bookingDriverGroupId ?? "28"]);
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
            case 'driverForm':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'bookingDriverGroupId']);
                $bookingDriverGroupId = $queryMasterData->exec()->fetch();
                $groupId = $bookingDriverGroupId['mvalue'] ?? 28;
                $bitrixId = str_replace( "BitrixID-", "", $mkey ?? "");
                $options = ['driverPhoneNumber' => $driverPhoneNumber ?? ""];
                $connection = Application::getConnection();
                if ($id != "") {
                    $currentBitrixId = str_replace( "BitrixID-", "", $currentItem['mkey'] ?? "");
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$currentBitrixId}' AND GROUP_ID = '{$groupId}'");
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else { // Lỗi copy-paste: mtype phải là 'drivers'
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'drivers', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                if ($bitrixId != "") {
                    $connection->queryExecute("DELETE FROM b_sonet_user2group WHERE USER_ID = '{$bitrixId}' AND GROUP_ID = '{$groupId}'");
                    $connection->queryExecute("INSERT INTO b_sonet_user2group (USER_ID, GROUP_ID, ROLE, AUTO_MEMBER, DATE_CREATE, DATE_UPDATE, INITIATED_BY_TYPE, INITIATED_BY_USER_ID) VALUES ('{$bitrixId}', '{$groupId}', 'K', 'N', NOW(), NOW(), 'U', '{$userId}')");
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
            
            case 'carLineForm':
                $options = [];
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $id], ['mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                } else {
                    $id = \Booking\Query::insertRecord('car_booking_masterdata', ['mtype' => 'carLines', 'mvalue' => $mvalue ?? "", 'mkey' => $mkey ?? "", 'options' => Json::encode($options)]);
                }
                self::logMasterDataSubmit($id, $currentItem, $userId);
                break;
            case 'roomTypeForm':
                try {
                    $options = [
                        'persons' => $persons ?? 0
                        , 'color' => $color ?? ""
                        ];
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
                            'persons' => $newItem['persons'] ?? 0
                        ]);
                    }
                }
                break;

            case 'roomForm':
                try {
                    $options = [
                        'roomType' => $roomType ?? ""
                        , 'persons' => $persons ?? ""
                        , 'color' => $color ?? ""
                        , 'note' => $note ?? ""
                        , 'licensePlateNumber' => $licensePlateNumber ?? ""
                        , 'hasServiceCar' => $hasServiceCar ?? 0
                    ];
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
                        $persons = $newItem['persons'] ?: ($roomType['persons'] ?: 0);
                      
                        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                        $queryMasterData->setSelect(['*']);
                        // $queryMasterData->setFilter(['mkey' => $equipmentKeys, 'mtype' => 'equipments']);
                        $equipments = $queryMasterData->exec()->fetchAll();
                        foreach($haveToUpdateBookings as $booking) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                                'room' => Json::encode($newItem),
                                'persons' => $persons ?? 0,
                                'licensePlateNumber' => $licensePlateNumber ?? "",
                                'hasServiceCar' => $hasServiceCar ?? 0
                            ]);
                        }
                    } catch (\Throwable $th) {
                        //throw $th;
                    }
                }
                break;

            case 'managerReviewForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['managerReviewScore' => $managerReviewScore ?? "5", 'managerReviewCommentMost' => $managerReviewCommentMost ?? "", 'managerReviewCommentBad' => $managerReviewCommentBad ?? "", 'managerReviewCommentRequest' => $managerReviewCommentRequest ?? ""]);
                }
                break;

            case 'userReviewForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, '%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'], ['userReviewScore' => $userReviewScore ?? "5", 'userReviewCommentMost' => $userReviewCommentMost ?? "", 'userReviewCommentBad' => $userReviewCommentBad ?? ""]);
                }
                break;

            case 'bookingForm':
                if (!$departureLocation 
                || !$roomType  
                || !$startDate || !$startTime || !$endTime 
                || !$usagePurposeDetail 
                || !$mainUser 
                || !$department
                || !$usagePurpose 
                || !$detailedSchedule
                
                ) {
                    return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ thông tin'];
                }
                // try {
                //     $roomType = Json::decode($roomType) ?: [];
                // } catch (\Throwable $th) {
                //     return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                // }

                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => 'maxDayToBooking']);
                $maxDayToBooking = $queryMasterData->exec()->fetch();

                // $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                // $queryMasterData->setSelect(['*']);
                // $queryMasterData->setFilter(['mkey' => $roomType['mkey'] ?? '', 'mtype' => 'roomTypes']);
                // $roomType = $queryMasterData->exec()->fetch();

                // if (!empty($roomType)) {
                //     $roomType = array_merge($roomType, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $roomType['options']));
                //     unset($roomType['options']);
                // }

                // $roomKey = $room['mkey'] ?? '';
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

                    try {
                        $data = [
                            "createdDate" => new \Bitrix\Main\Type\DateTime(),
                            'notificationCount' => 0,
                            "bookingUser" => Json::encode(["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]),	
                            "departureLocation" => Json::encode(Json::decode($departureLocation)),
                            // "roomType" => Json::encode($roomType),	
                             "roomType" => Json::encode(Json::decode($roomType)),
                            "startDate" => new \Bitrix\Main\Type\DateTime($startDate, "Y-m-d"),
                            "startTime" => new \Bitrix\Main\Type\DateTime($startTime, "H:i:s"),
                            "endTime" => new \Bitrix\Main\Type\DateTime($endTime, "H:i:s"),
                            "employees" => $employees ?? "",
                            "flightNumber" => $flightNumber ?? "",
                            "usagePurposeDetail" => $usagePurposeDetail ?? "",	
                            "carLine" => $carLine ? Json::encode(Json::decode($carLine)) : Json::encode([]),	
                            "driver" => $driver ? Json::encode(Json::decode($driver)) : Json::encode([]),	
                            "mainUser" => Json::encode(Json::decode($mainUser)),	
                            "department" => Json::encode(Json::decode($department)),	
                            "usagePurpose" => Json::encode(Json::decode($usagePurpose)),	
                            "clients" => $clients ?? 0,
                            "clientNames" => Json::encode(Json::decode($clientNames)),	
                            "detailedSchedule" => $detailedSchedule ?? "",
                            "note" => $note ?? "",
                            "isPriority" => 0,
                            
                            "isApproved" => 0,
                            "approvedUsers" => "[]",
                            "approvedDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "rejectedUsers" => "[]",	
                            "rejectedDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "isCancelled" => 0,
                            "cancelledReason" => "",
                            "driverConfirmationUser" => "[]",
                            "driverConfirmationDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "driverDeclineUser" => "[]",
                            "driverDeclineDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "driverDeclineReason" => "",
                            "userReviewScore" => 0,
                            "userReviewCommentMost" => "",	
                            "userReviewCommentBad" => "",	
                            "userReviewDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "driverReviewScore" => 0,
                            "driverReviewCommentMost" => "",	
                            "driverReviewCommentBad" => "",	
                            "driverReviewCommentRequest" => "",
                            "driverReviewDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "managerReviewScore" => 0,
                            "managerReviewComment" => "",
                            "managerReviewCommentMost" => "",	
                            "managerReviewCommentBad" => "",
                            "managerReviewCommentRequest" => "",
                            "managerReviewDate" => new \Bitrix\Main\Type\DateTime("0000-00-00 00:00:00", "Y-m-d H:i:s"),
                            "notificationDriverCount" => 0,
                            "isSyncedThirdParty" => 0
                        ];
                    } catch (\Throwable $th) {
                        return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                    }

                    if ($id != "" && $id != "*") {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, 
                            ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'
                            // , '%room' => '"BitrixID-'.$userId.'"'
                            // , '%roomType' => '"BitrixID-'.$userId.'"'
                            ]
                        ], $data);
                        self::logBooking($id, $currentItem, $userId);
                    } else {
                        $id = \Booking\Query::insertRecord('car_booking_requests', $data);
                    }
                    // if ($isApproved == 0) {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_create_booking', $id, null, $isPriority);
                        // $approversOrPriorityApprovers = $isPriority ? $mailContent['priorityApprovers'] : $mailContent['approvers'];
                        $approversOrPriorityApprovers = $mailContent['approvers'];
                        foreach($approversOrPriorityApprovers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    // } else {
                    //     $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $id, null, $isPriority);
                    //     foreach($mailContent['userIds'] as $userId) {
                    //         \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    //     }
                    // }
                } else {
                    try {
                        $data = [
                            // "mainUser" => Json::encode(Json::decode($mainUser)),	
                            // "users" => Json::encode(Json::decode($users)),	
                            // "department" => Json::encode(Json::decode($department)),	
                            "endTime" => new \Bitrix\Main\Type\DateTime($endTime, "H:i:s"),
                            // "usagePurpose" => Json::encode(Json::decode($usagePurpose)),	
                            // "usagePurposeDetail" => $usagePurposeDetail ?? "",	
                            // "usagePurposeLocale" => $usagePurposeLocale ?? "",
                            // "note" => $note ?? "",
                            // "clients" => $clients ?? 0,
                            // "clientNames" => Json::encode(Json::decode($clientNames)),	
                            // "externalClients" => $externalClients ?? 0,
                            // "externalClientNames" => Json::encode(Json::decode($externalClientNames))
                        ];
                    } catch (\Throwable $th) {
                        return ['status' => 'error', 'message' => 'Có lỗi xảy ra, vui lòng thử lại sau'];
                    }
                    if ($id != "" && $id != "*") {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, 
                            ['%bookingUser' => '"mkey":"BitrixID-'.$userId.'"'
                            // , '%room' => '"BitrixID-'.$userId.'"', '%roomType' => '"BitrixID-'.$userId.'"'
                            ]
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
                    // if ($currentItem['isPriority'] && is_array($hasPermission) && !in_array("Permission [Car_Booking_Priority_Approval]", $hasPermission)) {
                    //     return ['status' => 'error', 'message' => 'Bạn không có quyền từ chối đặt xe ưu tiên'];
                    // }
                    // $currentRejectedUsers = [];
                    // if (!empty($currentItem['rejectedUsers'])) {
                    //     $currentRejectedUsers = is_string($currentItem['rejectedUsers']) ? Json::decode($currentItem['rejectedUsers']) : (array)$currentItem['rejectedUsers'];
                    // }
                    // $rejectedUsers = array_merge($currentRejectedUsers, [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]]);
                    $rejectedUsers =  [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]];
                    
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], [
                        'isApproved' => -1
                        , 'rejectedReason' => $rejectedReason ?? ""
                        , 'rejectedUsers' => Json::encode($rejectedUsers)
                        , 'rejectedDate' => new \Bitrix\Main\Type\DateTime()
                        , 'serviceType' => null, 'licensePlateNumber' => null, 'driverUser' => null, 'driverPhoneNumber' => null, 'room' => null
                        ]);
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
            
            case 'driverReviewForm':
                if ($id != "") {
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id, '%driverUser' => '"mkey":"BitrixID-'.$userId.'"'], ['driverReviewScore' => $driverReviewScore ?? "5", 'driverReviewCommentMost' => $driverReviewCommentMost ?? "", 'driverReviewCommentBad' => $driverReviewCommentBad ?? "", 'driverReviewCommentRequest' => $driverReviewCommentRequest ?? ""]);
                }
                break;
            
            // KHi tài xế từ chối: -2 là từ chối bởi tài xế, -1 là từ chối bởi quản lý
            // TRường hợp tài xế từ chối thì sẽ gửi lại thông tin cho quản lý để biết lý do từ chối của tài xế
            // Nếu tài xế từ chối thì sẽ reset về null các giá trị: serviceType, licensePlateNumber, driverUser, driverPhoneNumber, room 
            // để quản lý dễ dàng sắp xếp lại tài xế khác mà không bị ràng buộc bởi các thông tin đã có của tài xế trước đó
            case 'driverRejectBookingForm':
                if ($id != "") {
                    $query = \Booking\Query::getInstance("car_booking_requests");
                    $query->setSelect(['*']);
                    $query->setFilter(['id' => $id, '%driverUser' => '"mkey":"BitrixID-'.$userId.'"']);
                     // Chỉ cho phép tài xế từ chối khi họ là người được phân công lái xe, tránh trường hợp người dùng khác cố tình từ chối
                    $currentItem = $query->exec()->fetch();
                    if (!$currentItem) {
                        return ['status' => 'error', 'message' => 'Chuyến xe không tồn tại hoặc bạn không phải là tài xế được phân công.'];
                    }
                }
                if ($currentItem) {
                    $driverDeclineUser = [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]];
                    
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['isApproved' => -2,
                     'serviceType' => null, 'licensePlateNumber' => null, 'driverUser' => null, 'driverPhoneNumber' => null, 'room' => null,
                     'driverDeclineReason' => $driverDeclineReason ?? ""
                     , 'driverDeclineUser' => Json::encode($driverDeclineUser),
                      'driverDeclineDate' => new \Bitrix\Main\Type\DateTime()
                      ]);
                    self::logBooking($id, $currentItem, $userId);
                    // Gửi thông báo cho quản lý và những người liên quan về việc tài xế từ chối đặt xe
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_approve_when_driver_reject_booking', $id);
                    // Gửi cho user
                    // foreach($mailContent['userIds'] as $userId) {
                    //     \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    // }
                    // Gửi cho quản lý
                    foreach($mailContent['assignmentUser'] as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
                break;

            // Duyệt và phân công này sẽ có 3 tình huống xảy ra:
            // 1. Dịch vụ Xe nội bộ: Bắt buộc có dự liệu Xe và Tài xế, có đi kèm số điện thoại tài xế(theo tài xế) và biển số xe(theo xe)
            // 2. Dịch vụ Xe dịch vụ: Chọn xe dịch vụ và điền thông tin tài xế, số điện thoại tài xế, 
            // biển số xe tương ứng với xe dịch vụ được chọn. 
            // Trạng thái isApproved = 3: Tức là tài xế đã xác nhận vì đây là xe thêu bên ngoài, cron sẽ tự update isApproved = 4 sau khi hoàn thành chuyến.
            // 3. Dịch vụ Xe Grab: Chỉ cần chọn dịch vụ xe Grab, người dùng tự book xe đi, nếu admin book thì admin sẽ điền thông tin tài xế, số điện thoại tài xế,
            //  biển số xe tương ứng với xe Grab được book. Trạng thái isApproved = 3: Tức là tài xế đã xác nhận vì đây là xe thêu bên ngoài, cron sẽ tự update isApproved = 4 sau khi hoàn thành chuyến.
            // Check duplicate sẽ chỉ áp dụng cho Xe nội bộ 
            case 'approveAssignBookingForm':
                if ($id != "") {
                    $query = \Booking\Query::getInstance("car_booking_requests");
                    $query->setSelect(['*']);
                    $query->setFilter(['id' => $id]);
                    $currentItem = $query->exec()->fetch();
                }
                if ($currentItem) {
                    $decodeJsonItem = function ($value) {
                        if (is_array($value)) {
                            return $value;
                        }

                        if (!is_string($value) || trim($value) === '') {
                            return [];
                        }

                        try {
                            $decoded = Json::decode($value);
                            return is_array($decoded) ? $decoded : [];
                        } catch (\Throwable $th) {
                            return [];
                        }
                    };

                    $getKey = function ($value) use ($decodeJsonItem) {
                        if (is_string($value) && trim($value) !== '' && !str_starts_with(trim($value), '{') && !str_starts_with(trim($value), '[')) {
                            return trim($value);
                        }
                        $decoded = $decodeJsonItem($value);
                        return $decoded['mkey'] ?? '';
                    };

                    $roomKey = $getKey($room ?? '');
                    $serviceTypeValue = $getKey($serviceType ?? '');
                    $driverUserKey = $getKey($driverUser ?? '');

                    if (!$serviceTypeValue) {
                        return ['status' => 'error', 'message' => 'Vui lòng chọn loại dịch vụ'];
                    }

                    $decodeOptions = function($item, $mtype) {
                        $options = [];
                        if (!empty($item['options'])) {
                            try {
                                $options = is_string($item['options']) ? Json::decode($item['options']) : (array)$item['options'];
                            } catch (\Throwable $th) {}
                        }
                        $item = array_merge($item, $options, \Booking\Util::setDefaultValueIfNullMasterDataItem($mtype, $options));
                        unset($item['options']);
                        return $item;
                    };

                    // Lấy toàn bộ thông tin serviceType từ master data
                    $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                    $queryMasterData->setSelect(['*']);
                    $queryMasterData->setFilter(['mkey' => $serviceTypeValue, 'mtype' => 'serviceTypes']);
                    $serviceTypeItem = $queryMasterData->exec()->fetch();
                    $serviceTypeItem = $serviceTypeItem ? $decodeOptions($serviceTypeItem, 'serviceTypes') : ['mkey' => $serviceTypeValue, 'mvalue' => $serviceTypeValue];

                    $isInternalServiceType = ($serviceTypeValue === 'ST001'); // Xe nội bộ
                    $isRoomRequired = in_array($serviceTypeValue, ['ST001', 'ST002'], true);

                    $roomItem = [];
                    if ($isRoomRequired) {
                        if (!$roomKey) {
                            return ['status' => 'error', 'message' => 'Vui lòng chọn xe'];
                        }
                        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                        $queryMasterData->setSelect(['*']);
                        $queryMasterData->setFilter(['mkey' => $roomKey, 'mtype' => 'rooms']);
                        $roomItem = $queryMasterData->exec()->fetch();

                        if (!$roomItem) {
                            return ['status' => 'error', 'message' => 'Vui lòng chọn xe'];
                        }

                        $roomItem = $decodeOptions($roomItem, 'rooms');
                    }

                    $driverItem = [];
                    if ($isInternalServiceType) {
                        if (!$driverUserKey) {
                            return ['status' => 'error', 'message' => 'Vui lòng chọn tài xế'];
                        }

                        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                        $queryMasterData->setSelect(['*']);
                        $queryMasterData->setFilter(['mkey' => $driverUserKey, 'mtype' => 'drivers']);
                        $driverItem = $queryMasterData->exec()->fetch();
                        if ($driverItem) {
                            $driverItem = $decodeOptions($driverItem, 'drivers');
                        }
                        else {
                            return ['status' => 'error', 'message' => 'Tài xế không hợp lệ'];
                        }
                    } 
                    else if ($isRoomRequired) {
                        if (!$driverPhoneNumber || !$licensePlateNumber) {
                            return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ thông tin tài xế và biển số'];
                        }
                    }

                    $assignedUser = [["mkey" => "BitrixID-".$userId, "mvalue" => \Booking\Query::getUserFullname($userId, true)]];
                    
                    // Nếu là Xe nội bộ  thì chuyển tới trạng thái chờ tài xế xác nhận (isApproved = 2), 
                    // nếu là Xe dịch vụ hoặc Xe Grab thì chuyển tới trạng thái đã duyệt (isApproved = 3) 
                    // luôn vì bên ngoài nên không cần chờ tài xế xác nhận nữa, 
                    // cron sẽ tự update isApproved = 4 sau khi hoàn thành chuyến.
                    $isApproved = $isInternalServiceType ? 2 : 3;

                    if ($isInternalServiceType) {
                        // Check trùng booking với cùng tài xế hoặc cùng xe trong khung giờ: Check xem Xe hoặc tài xế có bị trùng lịch với booking khác hay không, 
                        // chỉ áp dụng cho các booking đã được phần công (isApproved = 2) hoặc đã được tài xế xác nhận (isApproved = 3) và chưa bị huỷ (isCancelled = 0)
                        $startDateStr = is_object($currentItem['startDate']) ? $currentItem['startDate']->format('Y-m-d') : explode(' ', $currentItem['startDate'] ?? '')[0];
                        $startTimeStr = is_object($currentItem['startTime']) ? $currentItem['startTime']->format('H:i:s') : $currentItem['startTime'];
                        $endTimeStr = is_object($currentItem['endTime']) ? $currentItem['endTime']->format('H:i:s') : $currentItem['endTime'];

                        $startDateCondition = new \Bitrix\Main\Type\DateTime($startDateStr . " " . $startTimeStr, "Y-m-d H:i:s");
                        $startTimeCondition = $startDateCondition->format('H:i:s');
                        $endDateCondition = new \Bitrix\Main\Type\DateTime($startDateStr . " " . $endTimeStr, "Y-m-d H:i:s");
                        $endTimeCondition = $endDateCondition->format('H:i:s');
                        $overlappingBookings = self::getDuplicatedBookingWithDriverAndCar($id, $roomKey, $driverUserKey, $startDateCondition, $startTimeCondition, $endTimeCondition);
                        if (!empty($overlappingBookings)) {
                            return ['status' => 'error', 'message' => 'Tài xế hoặc xe đã được phân công vào khung giờ này'];
                        }
                    }

                    $updateData = [
                        'serviceType' => Json::encode($serviceTypeItem),
                        'room' => Json::encode($roomItem),
                        'driverUser' => Json::encode($driverItem),
                        'driverPhoneNumber' => $driverPhoneNumber ?? '',
                        'licensePlateNumber' => $licensePlateNumber ?? '',
                        'assignmentDate' => new \Bitrix\Main\Type\DateTime(),
                        'assignmentUser' => Json::encode($assignedUser),
                        'isApproved' => $isApproved,
                        'driverDeclineReason' => '',
                        'driverDeclineUser' => '[]',
                        'driverDeclineDate' => null
                    ];

                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], $updateData);
                    self::logBooking($id, $currentItem, $userId);

                      // Gửi email cho tài xế được phân công
                    if ($isInternalServiceType) {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_driver_when_assign_booking', $id);
                        foreach($mailContent['driverUser'] as $uid) {
                            \Booking\Notification::sendNotificationToUser($uid, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                }
                break;

            

        }
        return ['status' => 'success', 'message' => $id ? 'Chỉnh sửa thành công' : 'Thêm mới thành công'];
    }

    public static function confirmItem() {
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
        if ($component === "driverConfirmBookingList") {
            if ($id != "") {
                $query = \Booking\Query::getInstance("car_booking_requests");
                $query->setSelect(['*']);
                $query->setFilter(['id' => $id]);
                $currentItem = $query->exec()->fetch();
            }
            if ($currentItem) {
                $driverConfirmationUser =  [["mkey" => "BitrixID-".$userId, "mvalue" =>  \Booking\Query::getUserFullname($userId, true)]];
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], ['isApproved' => 3, 'driverConfirmationUser' => Json::encode($driverConfirmationUser), 'driverConfirmationDate' => new \Bitrix\Main\Type\DateTime()]);
                self::logBooking($id, $currentItem, $userId);
                
                $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_confirm_booking', $id);
                foreach($mailContent['userIds'] as $userId) {
                    \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                }
            }
        }
        return ['status' => 'success', 'message' => 'Xác nhận thành công'];
    }

    // Check trùng booking với cùng tài xế hoặc cùng xe trong khung giờ: Check xem Xe hoặc tài xế có bị trùng lịch với booking khác hay không, 
    // chỉ áp dụng cho các booking đã được phần công (isApproved = 2) hoặc đã được tài xế xác nhận (isApproved = 3) và chưa bị huỷ (isCancelled = 0)
    public static function getDuplicatedBookingWithDriverAndCar($id, $roomKey, $driverKey, $startDateCondition, $startTimeCondition, $endTimeCondition) {
        $queryBookingFilter = [];
        $queryBookingFilter = array_merge($queryBookingFilter, ['!id' => $id]);
        // $queryBookingFilter = array_merge($queryBookingFilter, ['%room' => '"mkey":"'.$roomKey.'"']);
        // $queryBookingFilter = array_merge($queryBookingFilter, ['%driverUser' => '"mkey":"'.$driverKey.'"']);
        $queryBookingFilter = array_merge($queryBookingFilter, ['isCancelled' => 0]);
        $queryBookingFilter = array_merge($queryBookingFilter, ['@isApproved' => [2, 3, 4]]);
        
        $orConditions = ['LOGIC' => 'OR'];
        if (!empty($roomKey)) {
            $orConditions[] = ['%room' => '"mkey":"'.$roomKey.'"'];
        }
        if (!empty($driverKey)) {
            $orConditions[] = ['%driverUser' => '"mkey":"'.$driverKey.'"'];
        }
        if (count($orConditions) > 1) {
            $queryBookingFilter[] = $orConditions;
        } else {
            return []; // Không có cả xe và tài xế thì không cần check trùng
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


    public static function APIApproveAssignBookingForm() {
        $request = Context::getCurrent()->getRequest();
        
        // Lấy secret từ header
        $secret = $request->getHeader("X-Secret") ?: $request->getHeader("Secret");
        if ($secret !== DAT_PHONG_KEY_INSTALL) { // Có thể điều chỉnh lại constant chứa key nếu muốn
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Lấy dữ liệu từ body của request
        $input = $request->getInput();
        $data = [];
        if (!empty($input)) {
            try {
                $data = Json::decode($input);
            } catch (\Throwable $th) {
                return ['status' => 'error', 'message' => 'Invalid JSON data in body'];
            }
        } else {
            $data = $request->getPostList()->toArray();
        }

        extract($data);
        $id = $idBooking ?? '';
        $emailUser = $userEmail ?? '';

        if ($id == "" || $emailUser == "" ) {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp đầy đủ id, userEmail'];
        }

        if ($id != "") {
            $query = \Booking\Query::getInstance("car_booking_requests");
            $query->setSelect(['*']);
            $query->setFilter(['id' => $id]);
            $currentItem = $query->exec()->fetch();
        } else {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp ID chuyến xe'];
        }

        if ($currentItem) {
            
            // Thêm check: nếu chuyến xe đã quá thời gian sử dụng thì không cho phân công
            $startDateStr = is_object($currentItem['startDate']) ? $currentItem['startDate']->format('Y-m-d') : explode(' ', $currentItem['startDate'] ?? '')[0];
            $startTimeStr = is_object($currentItem['startTime']) ? $currentItem['startTime']->format('H:i:s') : $currentItem['startTime'];
            $startDateTime = new \Bitrix\Main\Type\DateTime($startDateStr . " " . $startTimeStr, "Y-m-d H:i:s");
            $currentDateTime = new \Bitrix\Main\Type\DateTime();

            if ($startDateTime < $currentDateTime) {
                return ['status' => 'error', 'message' => 'Chuyến xe đã quá thời gian sử dụng, không thể phân công.'];
            }

            if ($currentItem['isCancelled'] != 0 || !in_array($currentItem['isApproved'], [0, 1, -2])) {
                return ['status' => 'error', 'message' => 'Chuyến xe không ở trạng thái có thể phân công.'];
            }
        
            $roomKey = ($carCode ?? '');
            $serviceTypeValue = ($serviceType ?? '');
            $driverUserKey = ($driverCode ?? '');


            if (!$serviceTypeValue) {
                return ['status' => 'error', 'message' => 'Vui lòng chọn loại dịch vụ'];
            }

            $decodeOptions = function($item, $mtype) {
                $options = [];
                if (!empty($item['options'])) {
                    try {
                        $options = is_string($item['options']) ? Json::decode($item['options']) : (array)$item['options'];
                    } catch (\Throwable $th) {}
                }
                $item = array_merge($item, $options, \Booking\Util::setDefaultValueIfNullMasterDataItem($mtype, $options));
                unset($item['options']);
                return $item;
            };

            // Lấy toàn bộ thông tin serviceType từ master data
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['mkey' => $serviceTypeValue, 'mtype' => 'serviceTypes']);
            $serviceTypeItem = $queryMasterData->exec()->fetch();
            $serviceTypeItem = $serviceTypeItem ? $decodeOptions($serviceTypeItem, 'serviceTypes') : ['mkey' => $serviceTypeValue, 'mvalue' => $serviceTypeValue];

            $isInternalServiceType = ($serviceTypeValue === 'ST001'); // Xe nội bộ
            $isRoomRequired = in_array($serviceTypeValue, ['ST001', 'ST002'], true);

            $roomItem = [];
            if ($isRoomRequired) {
                if (!$roomKey) {
                    return ['status' => 'error', 'message' => 'Vui lòng chọn xe'];
                }
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => $roomKey, 'mtype' => 'rooms']);
                $roomItem = $queryMasterData->exec()->fetch();

                if (!$roomItem) {
                    return ['status' => 'error', 'message' => 'Xe không tồn tại'];
                }

                $roomItem = $decodeOptions($roomItem, 'rooms');
            }

            $driverItem = [];
            if ($isInternalServiceType) {
                if (!$driverUserKey) {
                    return ['status' => 'error', 'message' => 'Vui lòng chọn tài xế'];
                }

                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mkey' => $driverUserKey, 'mtype' => 'drivers']);
                $driverItem = $queryMasterData->exec()->fetch();
                if ($driverItem) {
                    $driverItem = $decodeOptions($driverItem, 'drivers');
                }
                else {
                    return ['status' => 'error', 'message' => 'Tài xế không hợp lệ'];
                }
            } 
            else if ($isRoomRequired) {
                if (!isset($driverPhoneNumber) || !isset($licensePlateNumber) || $driverPhoneNumber === '' || $licensePlateNumber === '') {
                    return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ thông tin tài xế và biển số'];
                }
            }

            $apiUserId = 0; // Mặc định là user hệ thống
            $assignedUser = [["mkey" => "BitrixID-".$apiUserId, "mvalue" => "Hệ thống (API)"]];

            if ($emailUser != "") {
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter([
                    'mtype' => 'approvers',
                    'isDeleted' => 0,
                    '%mvalue' => '(' . trim($emailUser) . ')'
                ]);
                $executorItem = $queryMasterData->exec()->fetch();
                if ($executorItem) {
                    $apiUserId = (int)str_replace('BitrixID-', '', $executorItem['mkey']);
                    $assignedUser = [["mkey" => $executorItem['mkey'], "mvalue" => $executorItem['mvalue']]];
                } else {
                    return ['status' => 'error', 'message' => 'emailUser không tồn tại trong danh sách người duyệt'];
                }
            }
            
            $isApproved = $isInternalServiceType ? 2 : 3;

            if ($isInternalServiceType) {
                $startDateStr = is_object($currentItem['startDate']) ? $currentItem['startDate']->format('Y-m-d') : explode(' ', $currentItem['startDate'] ?? '')[0];
                $startTimeStr = is_object($currentItem['startTime']) ? $currentItem['startTime']->format('H:i:s') : $currentItem['startTime'];
                $endTimeStr = is_object($currentItem['endTime']) ? $currentItem['endTime']->format('H:i:s') : $currentItem['endTime'];

                $startDateCondition = new \Bitrix\Main\Type\DateTime($startDateStr . " " . $startTimeStr, "Y-m-d H:i:s");
                $startTimeCondition = $startDateCondition->format('H:i:s');
                $endDateCondition = new \Bitrix\Main\Type\DateTime($startDateStr . " " . $endTimeStr, "Y-m-d H:i:s");
                $endTimeCondition = $endDateCondition->format('H:i:s');
                $overlappingBookings = self::getDuplicatedBookingWithDriverAndCar($id, $roomKey, $driverUserKey, $startDateCondition, $startTimeCondition, $endTimeCondition);
                if (!empty($overlappingBookings)) {
                    return ['status' => 'error', 'message' => 'Tài xế hoặc xe đã được phân công vào khung giờ này'];
                }
            }

            $updateData = [
                'serviceType' => Json::encode($serviceTypeItem),
                'room' => Json::encode($roomItem),
                'driverUser' => Json::encode($driverItem),
                'driverPhoneNumber' => $driverPhoneNumber ?? '',
                'licensePlateNumber' => $licensePlateNumber ?? '',
                'assignmentDate' => new \Bitrix\Main\Type\DateTime(),
                'assignmentUser' => Json::encode($assignedUser),
                'isApproved' => $isApproved,
                'driverDeclineReason' => '',
                'driverDeclineUser' => '[]',
                'driverDeclineDate' => null
            ];

            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], $updateData);
            self::logBooking($id, $currentItem, $apiUserId);

             // Gửi email cho tài xế được phân công
                    if ($isInternalServiceType) {
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_driver_when_assign_booking', $id);
                        foreach($mailContent['driverUser'] as $uid) {
                            \Booking\Notification::sendNotificationToUser($uid, $mailContent['subject'], $mailContent['content']);
                        }
                    }

        } else {
            return ['status' => 'error', 'message' => 'Chuyến xe không tồn tại'];
        }

        return ['status' => 'success', 'message' => 'Phân công thành công'];
    }
    
    public static function APIDriverConfirmRejectBooking() {
        $request = Context::getCurrent()->getRequest();
        
        // Xác thực Secret từ header
        $secret = $request->getHeader("X-Secret") ?: $request->getHeader("Secret");
        if ($secret !== DAT_PHONG_KEY_INSTALL) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Lấy dữ liệu body
        $input = $request->getInput();
        $data = [];
        if (!empty($input)) {
            try {
                $data = Json::decode($input);
            } catch (\Throwable $th) {
                return ['status' => 'error', 'message' => 'Invalid JSON data in body'];
            }
        } else {
            $data = $request->getPostList()->toArray();
        }

        $id = $data['idBooking'] ?? '';
        $emailUser = $data['userEmail'] ?? '';
        $confirm = isset($data['confirm']) ? (string)$data['confirm'] : '';
        $reason = $data['reason'] ?? '';

        if ($id == "" || $emailUser == "" || !in_array($confirm, ['0', '1'], true)) {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp đầy đủ id, userEmail và confirm (1: Xác nhận, 0: Từ chối)'];
        }

        if ($confirm === '0' && trim($reason) === '') {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp lý do từ chối'];
        }

        // 1. Tìm tài xế trong MasterData thông qua chuỗi email (Email thường được lưu trong mvalue)
        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
        $queryMasterData->setSelect(['*']);
        $queryMasterData->setFilter([
            'mtype' => 'drivers',
            'isDeleted' => 0,
            '%mvalue' => '(' . trim($emailUser) . ')'

        ]);
        $driverItem = $queryMasterData->exec()->fetch();

        if (!$driverItem) {
            return ['status' => 'error', 'message' => 'Không tìm thấy tài xế nào có email này'];
        }

        // 2. Tìm chuyến xe
        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $currentItem = $query->exec()->fetch();

        if (!$currentItem) {
            return ['status' => 'error', 'message' => 'Chuyến xe không tồn tại'];
        }

        // Kiểm tra xem chuyến xe có đang chờ xác nhận không (isApproved = 2)
        if ($currentItem['isApproved'] != 2) {
            if ($currentItem['isApproved'] == 3 && $confirm === '1') {
                return ['status' => 'success', 'message' => 'Chuyến xe này đã được xác nhận trước đó'];
            }
            return ['status' => 'error', 'message' => 'Chuyến xe không ở trạng thái chờ tài xế xác nhận'];
        }

        // Xác minh xem tài xế truyền lên có đúng là tài xế đang được phân công hay không
        $currentDriverUser = [];
        try {
            $currentDriverUser = is_string($currentItem['driverUser']) ? Json::decode($currentItem['driverUser']) : (array)$currentItem['driverUser'];
        } catch (\Throwable $th) {}

        if (empty($currentDriverUser['mkey']) || $currentDriverUser['mkey'] !== $driverItem['mkey']) {
            return ['status' => 'error', 'message' => 'Tài xế này không phải là người được phân công cho chuyến xe này'];
        }

        $apiUserId = 0; // Mặc định là user hệ thống
        $apiUserId = (int)str_replace('BitrixID-', '', $driverItem['mkey']);
            
        $driverUserAction = [["mkey" => $driverItem['mkey'], "mvalue" => $driverItem['mvalue']]];

        // 3. Xử lý Logic Confirm hoặc Reject
        if ($confirm === '1') {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], [
                'isApproved' => 3, 
                'driverConfirmationUser' => Json::encode($driverUserAction), 
                'driverConfirmationDate' => new \Bitrix\Main\Type\DateTime()
            ]);
            self::logBooking($id, $currentItem, $apiUserId);
            
            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_confirm_booking', $id);
            foreach($mailContent['userIds'] as $uid) {
                \Booking\Notification::sendNotificationToUser($uid, $mailContent['subject'], $mailContent['content']);
            }

            return ['status' => 'success', 'message' => 'Xác nhận chuyến xe thành công'];

        } else if ($confirm === '0') {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], [
                'isApproved' => -2,
                'serviceType' => null, 
                'licensePlateNumber' => null, 
                'driverUser' => null, 
                'driverPhoneNumber' => null, 
                'room' => null,
                'driverDeclineReason' => $reason,
                'driverDeclineUser' => Json::encode($driverUserAction),
                'driverDeclineDate' => new \Bitrix\Main\Type\DateTime()
            ]);
            self::logBooking($id, $currentItem, $apiUserId);

            // Gửi thông báo lại cho người phân công/quản lý để họ biết tài xế từ chối
            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_approve_when_driver_reject_booking', $id);
            foreach($mailContent['assignmentUser'] as $uid) {
                \Booking\Notification::sendNotificationToUser($uid, $mailContent['subject'], $mailContent['content']);
            }

            return ['status' => 'success', 'message' => 'Từ chối chuyến xe thành công'];
        }

        return ['status' => 'error', 'message' => 'Hành động không hợp lệ'];
    }

    public static function APIManagerApproveRejectBooking() {
        $request = Context::getCurrent()->getRequest();
        // Xác thực Secret từ header
        $secret = $request->getHeader("X-Secret") ?: $request->getHeader("Secret");
        if ($secret !== DAT_PHONG_KEY_INSTALL) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Lấy dữ liệu body
        $input = $request->getInput();
        $data = [];
        if (!empty($input)) {
            try {
                $data = Json::decode($input);
            } catch (\Throwable $th) {
                return ['status' => 'error', 'message' => 'Invalid JSON data in body'];
            }
        } else {
            $data = $request->getPostList()->toArray();
        }

        $id = $data['idBooking'] ?? '';
        $emailUser = $data['userEmail'] ?? '';
        $approve = isset($data['approve']) ? (string)$data['approve'] : '';
        $reason = $data['reason'] ?? '';

        if ($id == "" || $emailUser == "" || !in_array($confirm, ['0', '1'], true)) {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp đầy đủ id, userEmail và approve (1: Duyệt, 0: Từ chối)'];
        }

        if ($confirm === '0' && trim($reason) === '') {
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp lý do từ chối'];
        }

        // 1. Tìm tài xế trong MasterData thông qua chuỗi email (Email thường được lưu trong mvalue)
        $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
        $queryMasterData->setSelect(['*']);
        $queryMasterData->setFilter([
            'mtype' => 'approvers',
            'isDeleted' => 0,
            '%mvalue' => '(' . trim($emailUser) . ')'

        ]);
        $approverItem = $queryMasterData->exec()->fetch();

        if (!$approverItem) {
            return ['status' => 'error', 'message' => 'Không tìm thấy user nào có email này'];
        }

        // 2. Tìm chuyến xe
        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $currentItem = $query->exec()->fetch();

        if (!$currentItem) {
            return ['status' => 'error', 'message' => 'Chuyến xe không tồn tại'];
        }

        // Kiểm tra xem chuyến xe có đang chờ xác nhận không (isApproved = 2)
        if ($currentItem['isApproved'] != 0) {
            return ['status' => 'error', 'message' => 'Chuyến xe không ở trạng thái chờ duyệt'];
        }

        $apiUserId = 0; // Mặc định là user hệ thống
        $apiUserId = (int)str_replace('BitrixID-', '', $approverItem['mkey']);
            
        $approverUserAction = [["mkey" => $approverItem['mkey'], "mvalue" => $approverItem['mvalue']]];

        // 3. Xử lý Logic Confirm hoặc Reject
        if ($confirm === '1') {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], [
                'isApproved' => 1, 
                'approvedUsers' => Json::encode($approverUserAction), 
                'approvedDate' => new \Bitrix\Main\Type\DateTime()
            ]);
            self::logBooking($id, $currentItem, $apiUserId);

            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $id);
                foreach($mailContent['userIds'] as $userId) {
                    \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                }

            return ['status' => 'success', 'message' => 'Duyệt thành công'];

        } else if ($confirm === '0') {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $id], [
                'isApproved' => -1,
                'rejectedReason' => $reason,
                'rejectedUsers' => Json::encode($approverUserAction),
                'rejectedDate' => new \Bitrix\Main\Type\DateTime()
            ]);
            self::logBooking($id, $currentItem, $apiUserId);

            // Gửi thông báo lại cho người phân công/quản lý để họ biết tài xế từ chối
            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_reject_booking', $id);
            foreach($mailContent['userIds'] as $uid) {
                \Booking\Notification::sendNotificationToUser($uid, $mailContent['subject'], $mailContent['content']);
            }

            return ['status' => 'success', 'message' => 'Từ chối chuyến xe thành công'];
        }

        return ['status' => 'error', 'message' => 'Hành động không hợp lệ'];
    }

    public static function CallMobile() {
        $querySyncData = \Booking\Query::getInstance("car_booking_masterdata", true);
        $querySyncData->setSelect(['*']);
        $querySyncData->setFilter([
            '@mtype' => ['drivers', 'rooms'],
            // 'isDeleted' => 0
        ]);
        $unsyncedItems = $querySyncData->exec()->fetchAll();

        foreach ($unsyncedItems as $item) {
            try {
                $options = [];
                if (!empty($item['options'])) {
                    try {
                        $options = is_string($item['options']) ? \Bitrix\Main\Web\Json::decode($item['options']) : (array)$item['options'];
                    } catch (\Throwable $th) {}
                }

                $isSync = isset($options['isSync']) ? (int)$options['isSync'] : 0;

                if ($isSync === 0) {
                    // TODO: Gọi API đồng bộ sang hệ thống thứ 3 ở đây
                    // Ví dụ: $syncSuccess = \Booking\ThirdPartyApi::syncData($item['mtype'], $item);
                    // Gọi API đồng bộ sang hệ thống thứ 3 ở đây
                    $syncSuccess = \Booking\ThirdPartyApi::syncMasterDataItem($item);

                    if ($syncSuccess) {
                        $options['isSync'] = 1;
                        \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $item['id']], ['options' => \Bitrix\Main\Web\Json::encode($options)]);
                    }
                }
            } catch (\Throwable $e) {
                // Bỏ qua lỗi và tiếp tục vòng lặp để không ảnh hưởng đến toàn bộ cron job
            }
        }
    }
    public static function CallMobileBooking() {
        $logFile = dirname(__FILE__) . '/debug_sync.log';
        @file_put_contents($logFile, "=== Start Sync CallMobileBooking at " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
        
        $querySyncData = \Booking\Query::getInstance("car_booking_requests", true);
        $querySyncData->setSelect(['*']);
        $querySyncData->setFilter([
            '@isSyncedThirdParty' => [0, 2]
        ]);
        $unsyncedBookings = $querySyncData->exec()->fetchAll();

        @file_put_contents($logFile, "Found " . count($unsyncedBookings) . " unsynced bookings.\n", FILE_APPEND);

        foreach ($unsyncedBookings as $booking) {
            try {
                @file_put_contents($logFile, "Syncing booking ID: " . $booking['id'] . "\n", FILE_APPEND);
                $syncResponse = \Booking\ThirdPartyApi::createBooking($booking);
                @file_put_contents($logFile, "Response: " . print_r($syncResponse, true) . "\n", FILE_APPEND);

                if (is_array($syncResponse) && ($syncResponse['status'] ?? '') === 'success') {
                    $affectedRows = \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                        'isSyncedThirdParty' => 1,
                        'thirdPartySyncDate' => new \Bitrix\Main\Type\DateTime()
                    ]);
                    @file_put_contents($logFile, "Updated DB. Affected rows: " . $affectedRows . "\n", FILE_APPEND);
                } else {
                    @file_put_contents($logFile, "Sync did not return success status.\n", FILE_APPEND);
                }
            } catch (\Throwable $e) {
                @file_put_contents($logFile, "Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
            }
        }
    }
}