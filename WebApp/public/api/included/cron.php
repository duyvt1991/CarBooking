<?php
namespace Booking;

use Bitrix\Main\Context;
use Bitrix\Main\Application;

class Cron {
    private static $roomTypesCache = [];

    // Hàm thực thi cron job
    public static function execute($shouldCheckSecret = true) {
        $request = Context::getCurrent()->getRequest();
        if ($request->getQuery("secret") !== DAT_PHONG_KEY_CRON && $shouldCheckSecret) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Tìm tất cả booking chưa đến thời điểm sử dụng và đã quá thời gian startTime của ngày sử dụng để huỷ tự động
        $currentDateTime = new \Bitrix\Main\Type\DateTime();
        $currentTime = $currentDateTime->format('H:i:s');
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            '@isApproved' => [0, 1, 2, -1, -2], // Chờ duyệt, Chờ tài xế xác nhận, Tài xế từ chối
            'isCancelled' => 0,
            'isPriority' => 0,
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
                    'rejectedDate' => new \Bitrix\Main\Type\DateTime()
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
        $nowTimestamp = time();

        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 3, // Đã được tài xế tiếp nhận
            'isCancelled' => 0,
            [
                'LOGIC' => 'OR',
                [
                    '<endDate' => $currentDateTime
                ],
                [
                    '=endDate' => $currentDateTime,
                    '<endTime' => $currentTime
                ],
                [
                    'endDate' => null,
                    [
                        'LOGIC' => 'OR',
                        ['<startDate' => $currentDateTime],
                        ['=startDate' => $currentDateTime, '<endTime' => $currentTime]
                    ]
                ]
            ]
        ]);
        
        $acceptedBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($acceptedBookings as $booking) {
            $bStartDateStr = is_object($booking['startDate']) ? $booking['startDate']->format('Y-m-d') : explode(' ', $booking['startDate'] ?? '')[0];
            $bEndDateStr = !empty($booking['endDate']) ? (is_object($booking['endDate']) ? $booking['endDate']->format('Y-m-d') : explode(' ', $booking['endDate'])[0]) : $bStartDateStr;
            $bEndTimeStr = is_object($booking['endTime']) ? $booking['endTime']->format('H:i:s') : $booking['endTime'];

            $bEndTimestamp = strtotime($bEndDateStr . " " . $bEndTimeStr);
            if ($nowTimestamp >= $bEndTimestamp) {
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                    ['id' => $booking['id']], 
                    [
                        'isApproved' => 4 // Hoàn thành
                    ]
                );
                \Booking\Page\Item::logBooking($booking['id'], $booking, 0);
            }
        }
        //ENd

        // Tìm tất cả booking chưa đến thời điểm sử dụng để gửi thông báo nhắc nhở hoặc duyệt tự động nếu thỏa điều kiện
        $upcomingBookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $upcomingBookingQuery->setSelect(['*']);
        $upcomingBookingQuery->setFilter([
            'isCancelled' => 0,
            'isPriority' => 0,
            [
                [
                    '@isApproved' => [0], // Chờ duyệt, Đã duyệt, Tài xế từ chối
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

                $currentNotificationCount = (int)$upcomingBooking['notificationCount'];
                
                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Gửi thông báo LOOP
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationCount' => $currentNotificationCount + 1,
                            'notificationDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $targetUsers = ($mailContent['approvers']);
                    foreach($targetUsers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                } else if ($percentRemaining <= 50) { // Gửi thông báo lần 2
                    if ($currentNotificationCount <= 1) {
                      
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationCount' => 2,
                                'notificationDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_2', $upcomingBooking['id']);
                        $targetUsers =  ($mailContent['approvers']);
                        foreach($targetUsers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                } else if ($percentRemaining <= 75) { // Gửi thông báo lần 1
                    // if ($currentNotificationCount == 0) {
                       
                    //         \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                    //             'notificationCount' => 1,
                    //             'notificationDate' => new \Bitrix\Main\Type\DateTime()
                    //         ]);
                    //     $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_1', $upcomingBooking['id']);
                    //     $targetUsers =  $mailContent['approvers'];
                    //     foreach($targetUsers as $userId) {
                    //         \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    //     }
                    // }
                }
        }
        // End

        // Phần gửi noti cho tài xế
        $upcomingBookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $upcomingBookingQuery->setSelect(['*']);
        $upcomingBookingQuery->setFilter([
            'isCancelled' => 0,
            'isPriority' => 0,
            [
                [
                    'isApproved' => 2, // Chờ tài xế xác nhận
                    [
                        'LOGIC' => 'OR',
                        ['notificationDriverDate' => NULL],
                        ['<notificationDriverDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d') . ' 00:00:00', "Y-m-d H:i:s")],
                        ['<=notificationDriverCount' => 2]
                    ]
                ],
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
            // Tính toán thời gian từ assignmentDate đến startDate + startTime
            $createdDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['assignmentDate'], "Y-m-d H:i:s");
            $currentDateTime = new \Bitrix\Main\Type\DateTime();
            $startDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['startDate'] . ' ' . $upcomingBooking['startTime'], "Y-m-d H:i:s");

            $waitingHoursBetweenCreateAndStart = ($startDateTime->getTimestamp() - $createdDateTime->getTimestamp()) / 3600;
            $waitingHoursBetweenCurrentAndStart = ($startDateTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

                $currentNotificationCount = (int)$upcomingBooking['notificationDriverCount'] ;
                
                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Gửi thông báo LOOP
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationDriverCount' => $currentNotificationCount + 1,
                            'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                   
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_confirm_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $targetUsers = $mailContent['driverUser'];
                    foreach($targetUsers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                } else if ($percentRemaining <= 50) { // Gửi thông báo lần 2
                    if ($currentNotificationCount <= 1) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationDriverCount' => 2,
                                'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                        
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_confirm_when_booking_meet_condition_2', $upcomingBooking['id']);
                        $targetUsers = $mailContent['driverUser'];
                        foreach($targetUsers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                } else if ($percentRemaining <= 75) { // Gửi thông báo lần 1
                    // if ($currentNotificationCount == 0) {
                    //         \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                    //             'notificationDriverCount' => 1,
                    //             'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                    //         ]);
                       
                    //     $mailContent = \Booking\MailTemplate::generateMailContent('send_to_confirm_when_booking_meet_condition_1', $upcomingBooking['id']);
                    //     $targetUsers = $mailContent['driverUser'];
                    //     foreach($targetUsers as $userId) {
                    //         \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    //     }
                    // }
                }
        }
        // End

        // --- NHẮC LỊCH KHỞI HÀNH TRƯỚC 30 PHÚT (Dòng 24, 25) ---
        try {
            $today = new \Bitrix\Main\Type\Date();
            $remindQuery = \Booking\Query::getInstance("car_booking_requests", true);
            $remindQuery->setSelect(['*']);
            $remindQuery->setFilter([
                'isApproved' => 3,
                'isPriority' => 0,
                'isCancelled' => 0,
                'isNotification30MinSent' => 0,
                '=startDate' => $today
            ]);
            $remindBookings = $remindQuery->exec()->fetchAll();

            $nowTimestamp = time();
            foreach ($remindBookings as $booking) {
                $startDateTimeStr = $booking['startDate'] . ' ' . $booking['startTime'];
                $startDateTime = new \Bitrix\Main\Type\DateTime($startDateTimeStr, "Y-m-d H:i:s");
                $startTimestamp = $startDateTime->getTimestamp();
                
                $diffSeconds = $startTimestamp - $nowTimestamp;
                $diffMinutes = $diffSeconds / 60;
                
                // Nếu còn <= 30 phút và chưa quá giờ khởi hành (hoặc quá giờ không quá 5 phút để tránh lỡ)
                if ($diffMinutes > -5 && $diffMinutes <= 30) {
                    // 1. Gửi cho người đặt xe và người đi cùng (Dòng 24)
                    $mailContentUser = \Booking\MailTemplate::generateMailContent('send_to_booking_user_departure_remind_30min', $booking['id']);
                    $userRecipients = array_unique(array_merge($mailContentUser['userIds'], $mailContentUser['employeeList'], $mailContentUser['driverUser']));
                    foreach ($userRecipients as $uid) {
                        \Booking\Notification::sendNotificationToUser($uid, $mailContentUser['subject'], $mailContentUser['content']);
                    }
                    
                    // 3. Đánh dấu đã gửi thông báo để tránh trùng lặp
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                        'isNotification30MinSent' => 1
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // Ghi log lỗi nếu có nhưng không làm gián đoạn cron chính
        }

        \CEvent::ExecuteEvents();
    
        return ['status' => 'success', 'message' => 'Cron job executed successfully'];
    }
}