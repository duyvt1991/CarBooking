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

        // 1. File Lock chống chạy chồng lấn (chỉ 1 instance chạy tại một thời điểm)
        // $lockFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'car_booking_cron.lock';
        $lockFilePath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'car_booking_cron.lock';
        $lockFile = fopen($lockFilePath, 'c+');
        if (!$lockFile || !flock($lockFile, LOCK_EX | LOCK_NB)) {
            if ($lockFile) {
                fclose($lockFile);
            }
            return ['status' => 'skipped', 'message' => 'Another cron instance is already running'];
        }

        try {
            // 2. Tìm tất cả booking chưa đến thời điểm sử dụng và đã quá thời gian startTime của ngày sử dụng để huỷ tự động
            $currentDateTime = new \Bitrix\Main\Type\DateTime();
            $currentTime = $currentDateTime->format('H:i:s');
            $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
            $bookingQuery->setSelect(['id', 'startDate', 'startTime', 'isApproved', 'isCancelled', 'isPriority']);
            $bookingQuery->setLimit(50);
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

            // 3. Update booking hoàn thành sau khi đã hết thời gian sử dụng (isApproved = 3, isCancelled = 0 và now >= endDate + endTime)
            $currentDateTime = new \Bitrix\Main\Type\DateTime();
            $currentTime = $currentDateTime->format('H:i:s');

            $completeQuery = \Booking\Query::getInstance("car_booking_requests", true);
            $completeQuery->setSelect(['id', 'startDate', 'startTime', 'endDate', 'endTime']);
            $completeQuery->setLimit(50);
            $completeQuery->setFilter([
                'isApproved' => 3, // Đã được tài xế tiếp nhận
                'isCancelled' => 0,
                [
                    'LOGIC' => 'OR',
                    [
                        '<endDate' => $currentDateTime
                    ],
                    [
                        '=endDate' => $currentDateTime,
                        '<=endTime' => $currentTime
                    ],
                    [
                        'endDate' => null,
                        [
                            'LOGIC' => 'OR',
                            ['<startDate' => $currentDateTime],
                            ['=startDate' => $currentDateTime, '<=endTime' => $currentTime]
                        ]
                    ]
                ]
            ]);
            
            $acceptedBookings = $completeQuery->exec()->fetchAll();
            
            foreach ($acceptedBookings as $booking) {
                \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                    ['id' => $booking['id']], 
                    [
                        'isApproved' => 4 // Hoàn thành
                    ]
                );
                \Booking\Page\Item::logBooking($booking['id'], $booking, 0);
            }

            // 4. Nhắc nhở người duyệt (Approvers) xử lý đơn (isApproved = 0, chưa đến giờ đi, notificationCount < 2, còn <= 25% thời gian)
            $currentDateTime = new \Bitrix\Main\Type\DateTime();
            $currentTime = $currentDateTime->format('H:i:s');

            $upcomingBookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
            $upcomingBookingQuery->setSelect(['id', 'createdDate', 'startDate', 'startTime', 'notificationCount']);
            $upcomingBookingQuery->setLimit(50);
            $upcomingBookingQuery->setFilter([
                'isCancelled' => 0,
                'isPriority' => 0,
                'isApproved' => 0, // Chờ duyệt
                [
                    'LOGIC' => 'OR',
                    ['notificationCount' => null],
                    ['<notificationCount' => 2]
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
                $createdDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['createdDate'], "Y-m-d H:i:s");
                $startDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['startDate'] . ' ' . $upcomingBooking['startTime'], "Y-m-d H:i:s");

                $waitingHoursBetweenCreateAndStart = ($startDateTime->getTimestamp() - $createdDateTime->getTimestamp()) / 3600;
                $waitingHoursBetweenCurrentAndStart = ($startDateTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

                if ($waitingHoursBetweenCreateAndStart <= 0) {
                    continue;
                }

                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Còn <= 25% thời gian thì mới gửi mail cảnh báo
                    $currentNotificationCount = (int)$upcomingBooking['notificationCount'];
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                        'notificationCount' => $currentNotificationCount + 1,
                        'notificationDate' => new \Bitrix\Main\Type\DateTime()
                    ]);
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $targetUsers = ($mailContent['approvers']);
                    foreach($targetUsers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
            }

            // 5. Nhắc nhở tài xế xác nhận tiếp nhận chuyến (isApproved = 2, chưa đến giờ đi, notificationDriverCount < 2, còn <= 25% thời gian)
            $driverRemindQuery = \Booking\Query::getInstance("car_booking_requests", true);
            $driverRemindQuery->setSelect(['id', 'assignmentDate', 'startDate', 'startTime', 'notificationDriverCount']);
            $driverRemindQuery->setLimit(50);
            $driverRemindQuery->setFilter([
                'isCancelled' => 0,
                'isPriority' => 0,
                'isApproved' => 2, // Chờ tài xế xác nhận
                [
                    'LOGIC' => 'OR',
                    ['notificationDriverCount' => null],
                    ['<notificationDriverCount' => 2]
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

            $driverUpcomingBookings = $driverRemindQuery->exec()->fetchAll();
            foreach ($driverUpcomingBookings as $upcomingBooking) {
                if (empty($upcomingBooking['assignmentDate'])) {
                    continue;
                }
                $createdDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['assignmentDate'], "Y-m-d H:i:s");
                $startDateTime = new \Bitrix\Main\Type\DateTime($upcomingBooking['startDate'] . ' ' . $upcomingBooking['startTime'], "Y-m-d H:i:s");

                $waitingHoursBetweenCreateAndStart = ($startDateTime->getTimestamp() - $createdDateTime->getTimestamp()) / 3600;
                $waitingHoursBetweenCurrentAndStart = ($startDateTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

                if ($waitingHoursBetweenCreateAndStart <= 0) {
                    continue;
                }

                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Còn <= 25% thời gian thì mới gửi mail cảnh báo
                    $currentNotificationCount = (int)$upcomingBooking['notificationDriverCount'];
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                        'notificationDriverCount' => $currentNotificationCount + 1,
                        'notificationDriverDate' => new \Bitrix\Main\Type\DateTime()
                    ]);
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_confirm_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $targetUsers = $mailContent['driverUser'];
                    foreach($targetUsers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                }
            }

            // 6. Nhắc lịch khởi hành trước 30 phút
            try {
                $today = new \Bitrix\Main\Type\Date();
                $remindQuery = \Booking\Query::getInstance("car_booking_requests", true);
                $remindQuery->setSelect(['id', 'startDate', 'startTime', 'isApproved', 'isCancelled', 'isNotification30MinSent']);
                $remindQuery->setLimit(50);
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
                        $mailContentUser = \Booking\MailTemplate::generateMailContent('send_to_booking_user_departure_remind_30min', $booking['id']);
                        $userRecipients = array_unique(array_merge($mailContentUser['userIds'], $mailContentUser['employeeList'], $mailContentUser['driverUser']));
                        foreach ($userRecipients as $uid) {
                            \Booking\Notification::sendNotificationToUser($uid, $mailContentUser['subject'], $mailContentUser['content']);
                        }
                        
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], [
                            'isNotification30MinSent' => 1
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                // Ghi log lỗi nếu có nhưng không làm gián đoạn cron chính
            }

        } finally {
            // Luôn giải phóng file lock khi kết thúc
            if ($lockFile) {
                flock($lockFile, LOCK_UN);
                fclose($lockFile);
            }
        }
    
        return ['status' => 'success', 'message' => 'Cron job executed successfully'];
    }
}