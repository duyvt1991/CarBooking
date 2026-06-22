<?php
namespace Booking;

use Bitrix\Main\Context;
use Bitrix\Main\Application;

class Cron {
    private static $roomTypesCache = [];

    // Hàm duyệt tự động booking
    // public static function approveBooking($upcomingBooking) {
    //     $roomKey = '';
    //     if ($upcomingBooking['room']) {
    //         $roomKey = $upcomingBooking['room']['mkey'] ?? '';
    //     }
    //     $startDate = $upcomingBooking['startDate'] ?? '';
    //     $startTime = $upcomingBooking['startTime'] ?? '';
    //     $endTime = $upcomingBooking['endTime'] ?? '';
    //     $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
    //     $startTimeCondition = $startDateCondition->format('H:i:s');
    //     $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
    //     $endTimeCondition = $endDateCondition->format('H:i:s');
    //     $overlappingBookings = \Booking\Page\Item::getDuplicatedBooking($upcomingBooking['id'], $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
    //     foreach($overlappingBookings as $booking) {
    //         if ($booking['isCancelled'] == 1) {
    //             continue;
    //         }
    //         \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do trùng lịch với đặt xe có ID: ".$upcomingBooking['id']." đã được duyệt tự động."]);
    //         \Booking\Page\Item::logBooking($booking['id'], $booking, 0);

    //         $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
    //         foreach($mailContent['userIds'] as $userId) {
    //             \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
    //         }
    //     }

    //     \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], ['isApproved' => 1, 'approvedUsers' => '[]', 'approvedDate' => new \Bitrix\Main\Type\DateTime()]);
    //     \Booking\Page\Item::logBooking($upcomingBooking['id'], $upcomingBooking, 0);

    //     $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $upcomingBooking['id']);
    //     foreach($mailContent['userIds'] as $userId) {
    //         \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
    //     }
    // }

    // Hàm kiểm tra và gửi thông báo hoặc duyệt tự động nếu thỏa điều kiện
    // public static function getHasAutoApprove($upcomingBooking) {
    //     if ($upcomingBooking['isPriority']) {
    //         return 0;
    //     }
    //     $room = $upcomingBooking['room'] ?? [];
    //     if (empty($room)) {
    //         return 0;
    //     }
    //     if (!isset(self::$roomTypesCache[$room['roomType']])) {
    //         $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
    //         $queryMasterData->setSelect(['*']);
    //         $queryMasterData->setFilter(['mkey' => $room['roomType'] ?? '', 'mtype' => 'roomTypes']);
    //         $roomType = $queryMasterData->exec()->fetch();
    //         if (!empty($roomType)) {
    //             $roomType = array_merge($roomType, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $roomType['options']));
    //             unset($roomType['options']);
    //         } else {
    //             return 0;
    //         }
    //         self::$roomTypesCache[$room['roomType']] = $roomType;
    //     }
    //     $roomType = self::$roomTypesCache[$room['roomType']];

    //     $hasAutoApprove = $room['hasAutoApprove'] ?: "";
    //     if ($hasAutoApprove == "") {
    //         $hasAutoApprove = $roomType['hasAutoApprove'] ?: 0;
    //     }
    //     return $hasAutoApprove;
    // }

    // Hàm thực thi cron job
    public static function execute($shouldCheckSecret = true) {
        $request = Context::getCurrent()->getRequest();
        if ($request->getQuery("secret") !== DAT_PHONG_KEY_CRON && $shouldCheckSecret) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Lấy tất cả booking thỏa điều kiện có thể đánh giá và đã quá maxDayToReview kể từ startDate
        $connection = Application::getConnection();
        $query = \Booking\Query::getInstance("car_booking_masterdata", true);
        $query->setSelect(['*']);
        $query->setFilter(['mkey' => 'maxDayToReview']);
        $maxDayToReview = $query->exec()->fetch();
        $maxDays = intval($maxDayToReview['mvalue'] ?? 3); // Mặc định 3 ngày nếu không có cấu hình
        
        // Đánh giá tự động (Người sử dụng, Quản lý, Tài xế) gom chung 1 query
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 4, // Đã hoàn thành
            'isCancelled' => 0,
            '<=startDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d', strtotime("-{$maxDays} days")), "Y-m-d"),
            [
                'LOGIC' => 'OR',
                ['userReviewScore' => 0],
                ['managerReviewScore' => 0],
                ['driverReviewScore' => 0]
            ]
        ]);
        
        $expiredBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($expiredBookings as $booking) {
            $updateData = [];
            
            if ($booking['userReviewScore'] == 0) {
                $updateData['userReviewScore'] = 5;
                $updateData['userReviewCommentMost'] = 'Đánh giá tự động';
                $updateData['userReviewCommentBad'] = 'Đánh giá tự động';
            }
            
            if ($booking['managerReviewScore'] == 0) {
                $updateData['managerReviewScore'] = 5;
                $updateData['managerReviewCommentMost'] = 'Đánh giá tự động';
                $updateData['managerReviewCommentBad'] = 'Đánh giá tự động';
                $updateData['managerReviewCommentRequest'] = 'Đánh giá tự động';
            }
            
            if ($booking['driverReviewScore'] == 0) {
                $updateData['driverReviewScore'] = 5;
                $updateData['driverReviewCommentMost'] = 'Đánh giá tự động';
                $updateData['driverReviewCommentBad'] = 'Đánh giá tự động';
                $updateData['driverReviewCommentRequest'] = 'Đánh giá tự động';
            }

            if (!empty($updateData)) {
                // Thực hiện 1 lệnh update duy nhất cho mỗi booking
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                    ['id' => $booking['id']], 
                    $updateData
                );
            }
        }
        // end
        
        // Tìm tất cả booking chưa đến thời điểm sử dụng và đã quá thời gian startTime của ngày sử dụng để huỷ tự động
        $currentDateTime = new \Bitrix\Main\Type\DateTime();
        $currentTime = $currentDateTime->format('H:i:s');
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            '@isApproved' => [0, 2, -2], // Chờ duyệt, Chờ tài xế xác nhận, Tài xế từ chối
            'isCancelled' => 0,
            [
                'LOGIC' => 'OR',
                [
                    '<startDate' => $currentDateTime
                ],
                [
                    '=startDate' => $currentDateTime,
                    '<startTime' => $currentTime
                ]
            ]
        ]);
        
        $expiredBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($expiredBookings as $booking) {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                ['id' => $booking['id']], 
                [
                    'isCancelled' => 1, 
                    'cancelledReason' => "Huỷ tự động bởi hệ thống do quá thời gian sử dụng.",
                    'isApproved' => -1,
                    'rejectedDate' => new \Bitrix\Main\Type\DateTime(),
                    'isSyncedThirdParty' => 2 // set về 2 để biết có update của booking này.
                ]
            );
            \Booking\Page\Item::logBooking($booking['id'], $booking, 0);

            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
            foreach($mailContent['userIds'] as $userId) {
                \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
            }
        }

        // Update booking hoàn thành sau khi đã hết thời gian sử dụng
        $currentDateTime = new \Bitrix\Main\Type\DateTime();
        $currentTime = $currentDateTime->format('H:i:s');
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 3, // Đã được tài xế tiếp nhận
            'isCancelled' => 0,
            [
                'LOGIC' => 'OR',
                [
                    '<startDate' => $currentDateTime
                ],
                [
                    '=startDate' => $currentDateTime,
                    '<endTime' => $currentTime
                ]
            ]
        ]);
        
        $expiredBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($expiredBookings as $booking) {
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                ['id' => $booking['id']], 
                [
                    'isApproved' => 4 // Hoàn thành
                ]
            );
            \Booking\Page\Item::logBooking($booking['id'], $booking, 0);

        }
        //ENd


        // Tìm tất cả booking chưa đến thời điểm sử dụng để gửi thông báo nhắc nhở hoặc duyệt tự động nếu thỏa điều kiện
        $upcomingBookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $upcomingBookingQuery->setSelect(['*']);
        $upcomingBookingQuery->setFilter([
            'isCancelled' => 0,
            [
                'LOGIC' => 'OR',
                [
                    'isApproved' => 2, // Chờ tài xế xác nhận
                    [
                        'LOGIC' => 'OR',
                        ['notificationDriverDate' => NULL],
                        ['<notificationDriverDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d') . ' 00:00:00', "Y-m-d H:i:s")],
                        ['<=notificationDriverCount' => 2]
                    ]
                ],
                [
                    '@isApproved' => [0, 1, -2], // Chờ duyệt, Đã duyệt, Tài xế từ chối
                    [
                        'LOGIC' => 'OR',
                        ['notificationDate' => NULL],
                        ['<notificationDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d') . ' 00:00:00', "Y-m-d H:i:s")],
                        ['<=notificationCount' => 2]
                    ]
                ]
            ],
            [
                'LOGIC' => 'OR',
                [
                    '>startDate' => $currentDateTime
                ],
                [
                    '=startDate' => $currentDateTime,
                    '>startTime' => $currentTime
                ]
            ]
        ]);

        $upcomingBookings = $upcomingBookingQuery->exec()->fetchAll();
        foreach ($upcomingBookings as $upcomingBooking) {
            // Tính toán thời gian từ createdDate đến startDate + startTime
            $createdDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['createdDate'], "Y-m-d H:i:s");
            $currentDateTime = new \Bitrix\Main\Type\DateTime();
            $startDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['startDate'] . ' ' . $upcomingBooking['startTime'], "Y-m-d H:i:s");

            $waitingHoursBetweenCreateAndStart = ($startDateTime->getTimestamp() - $createdDateTime->getTimestamp()) / 3600;
            $waitingHoursBetweenCurrentAndStart = ($startDateTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

                $isDriverConfirm = ($upcomingBooking['isApproved'] == 2);
                $currentNotificationCount = $isDriverConfirm ? (int)$upcomingBooking['notificationDriverCount'] : (int)$upcomingBooking['notificationCount'];
                
                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Gửi thông báo LOOP
                    if ($isDriverConfirm) {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationDriverCount' => $currentNotificationCount + 1,
                            'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                    } else {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationCount' => $currentNotificationCount + 1,
                            'notificationDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                    }
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $targetUsers = $isDriverConfirm ? $mailContent['driverUser'] : ($mailContent['approvers']);
                    foreach($targetUsers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                } else if ($percentRemaining <= 50) { // Gửi thông báo lần 2
                    if ($currentNotificationCount <= 1) {
                        if ($isDriverConfirm) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationDriverCount' => 2,
                                'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        } else {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationCount' => 2,
                                'notificationDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        }
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_2', $upcomingBooking['id']);
                        $targetUsers = $isDriverConfirm ? $mailContent['driverUser'] : ($mailContent['approvers']);
                        foreach($targetUsers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                } else if ($percentRemaining <= 75) { // Gửi thông báo lần 1
                    if ($currentNotificationCount == 0) {
                        if ($isDriverConfirm) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationDriverCount' => 1,
                                'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        } else {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationCount' => 1,
                                'notificationDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        }
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_1', $upcomingBooking['id']);
                        $targetUsers = $isDriverConfirm ? $mailContent['driverUser'] : $mailContent['approvers'];
                        foreach($targetUsers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                }
        }
        // End


        \CEvent::ExecuteEvents();
    
        return ['status' => 'success', 'message' => 'Cron job executed successfully'];
    }
}