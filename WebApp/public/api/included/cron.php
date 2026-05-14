<?php
namespace Booking;

use Bitrix\Main\Context;
use Bitrix\Main\Application;

class Cron {
    private static $roomTypesCache = [];
    public static function approveBooking($upcomingBooking) {
        $roomKey = '';
        if ($upcomingBooking['room']) {
            $roomKey = $upcomingBooking['room']['mkey'] ?? '';
        }
        $startDate = $upcomingBooking['startDate'] ?? '';
        $startTime = $upcomingBooking['startTime'] ?? '';
        $endTime = $upcomingBooking['endTime'] ?? '';
        $startDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $startTime, "Y-m-d H:i:s");
        $startTimeCondition = $startDateCondition->format('H:i:s');
        $endDateCondition = new \Bitrix\Main\Type\DateTime($startDate . " " . $endTime, "Y-m-d H:i:s");
        $endTimeCondition = $endDateCondition->format('H:i:s');
        $overlappingBookings = \Booking\Page\Item::getDuplicatedBooking($upcomingBooking['id'], $roomKey, $startDateCondition, $startTimeCondition, $endTimeCondition, 0, 0);
        foreach($overlappingBookings as $booking) {
            if ($booking['isCancelled'] == 1) {
                continue;
            }
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $booking['id']], ['isCancelled' => 1, 'cancelledReason' => "Huỷ tự động bởi hệ thống do trùng lịch với đặt xe có ID: ".$upcomingBooking['id']." đã được duyệt tự động."]);
            \Booking\Page\Item::logBooking($booking['id'], $booking, 0);

            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_cancel_booking', $booking['id']);
            foreach($mailContent['userIds'] as $userId) {
                \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
            }
        }

        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], ['isApproved' => 1, 'approvedUsers' => '[]', 'approvedDate' => new \Bitrix\Main\Type\DateTime()]);
        \Booking\Page\Item::logBooking($upcomingBooking['id'], $upcomingBooking, 0);

        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_booking_user_main_user_users_when_approve_booking', $upcomingBooking['id']);
        foreach($mailContent['userIds'] as $userId) {
            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
        }
    }

    public static function getHasAutoApprove($upcomingBooking) {
        if ($upcomingBooking['isPriority']) {
            return 0;
        }
        $room = $upcomingBooking['room'] ?? [];
        if (empty($room)) {
            return 0;
        }
        if (!isset(self::$roomTypesCache[$room['roomType']])) {
            $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
            $queryMasterData->setSelect(['*']);
            $queryMasterData->setFilter(['mkey' => $room['roomType'] ?? '', 'mtype' => 'roomTypes']);
            $roomType = $queryMasterData->exec()->fetch();
            if (!empty($roomType)) {
                $roomType = array_merge($roomType, \Booking\Util::setDefaultValueIfNullMasterDataItem('roomTypes', $roomType['options']));
                unset($roomType['options']);
            } else {
                return 0;
            }
            self::$roomTypesCache[$room['roomType']] = $roomType;
        }
        $roomType = self::$roomTypesCache[$room['roomType']];

        $hasAutoApprove = $room['hasAutoApprove'] ?: "";
        if ($hasAutoApprove == "") {
            $hasAutoApprove = $roomType['hasAutoApprove'] ?: 0;
        }
        return $hasAutoApprove;
    }

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
        
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 1,
            'isCancelled' => 0,
            '<=startDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d', strtotime("-{$maxDays} days")), "Y-m-d"),
            'userReviewCleanScore' => 0,
            'userReviewEquipmentScore' => 0,
            'userReviewFacilityScore' => 0
        ]);
        
        $expiredBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($expiredBookings as $booking) {
            // Đánh dấu booking đã quá hạn đánh giá hoặc thực hiện hành động khác
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                ['id' => $booking['id']], 
                [
                    'userReviewCleanScore' => 5, 
                    'userReviewEquipmentScore' => 5, 
                    'userReviewFacilityScore' => 5,
                    'userReviewCleanComment' => 'Đánh giá tự động', 
                    'userReviewEquipmentComment' => 'Đánh giá tự động',
                    'userReviewFacilityComment' => 'Đánh giá tự động'
                ]
            );
        }
        
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 1,
            'isCancelled' => 0,
            '<=startDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d', strtotime("-{$maxDays} days")), "Y-m-d"),
            'managerReviewScore' => 0
        ]);
        
        $expiredBookings = $bookingQuery->exec()->fetchAll();
        
        foreach ($expiredBookings as $booking) {
            // Đánh dấu booking đã quá hạn đánh giá hoặc thực hiện hành động khác
            \Booking\Query::updateRecordsWithConditions('car_booking_requests', 
                ['id' => $booking['id']], 
                ['managerReviewScore' => 5, 'managerReviewComment' => 'Đánh giá tự động']
            );
        }
        
        $currentDateTime = new \Bitrix\Main\Type\DateTime();
        $currentTime = $currentDateTime->format('H:i:s');
        $bookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $bookingQuery->setSelect(['*']);
        $bookingQuery->setFilter([
            'isApproved' => 0,
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
            // Đánh dấu booking đã quá hạn đánh giá hoặc thực hiện hành động khác
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

        // Tìm tất cả booking chưa đến thời điểm sử dụng
        $upcomingBookingQuery = \Booking\Query::getInstance("car_booking_requests", true);
        $upcomingBookingQuery->setSelect(['*']);
        $upcomingBookingQuery->setFilter([
            'isApproved' => 0,
            'isCancelled' => 0,
            [
                'LOGIC' => 'OR',
                [
                    'notificationDate' => NULL
                ],
                [
                    '<notificationDate' => new \Bitrix\Main\Type\DateTime(date('Y-m-d') . ' 00:00:00', "Y-m-d H:i:s"),
                ],
                [
                    '<=notificationCount' => 2
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

            $hasAutoApprove = self::getHasAutoApprove($upcomingBooking);
            if ($hasAutoApprove) { // Duyệt tự động
                if ($waitingHoursBetweenCreateAndStart <= 12) {
                    $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                    if ($percentRemaining <= 25) { // Duyệt tự động
                        self::approveBooking($upcomingBooking);
                    } else if ($percentRemaining <= 50) { // Gửi thông báo lần 2
                        if ($upcomingBooking['notificationCount'] <= 1) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationCount' => 2,
                                'notificationDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_2', $upcomingBooking['id']);
                            foreach($mailContent['approvers'] as $userId) {
                                \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                            }
                        }
                    } else if ($percentRemaining <= 75) { // Gửi thông báo lần 1
                        if ($upcomingBooking['notificationCount'] == 0) {
                            \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                                'notificationCount' => 1,
                                'notificationDate' => new \Bitrix\Main\Type\DateTime()
                            ]);
                            $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_1', $upcomingBooking['id']);
                            foreach($mailContent['approvers'] as $userId) {
                                \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                            }
                        }
                    }
                } else {
                    if ($waitingHoursBetweenCreateAndStart - $waitingHoursBetweenCurrentAndStart >= 12) { // Duyệt tự động
                        self::approveBooking($upcomingBooking);
                    }
                }
            } else {
                $percentRemaining = ($waitingHoursBetweenCurrentAndStart / $waitingHoursBetweenCreateAndStart) * 100;
                if ($percentRemaining <= 25) { // Gửi thông báo LOOP
                    \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                        'notificationCount' => $upcomingBooking['notificationCount'] + 1,
                        'notificationDate' => new \Bitrix\Main\Type\DateTime()
                    ]);
                    $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_loop', $upcomingBooking['id']);
                    $approversOrPriorityApprovers = $upcomingBooking['isPriority'] ? $mailContent['priorityApprovers'] : $mailContent['approvers'];
                    foreach($approversOrPriorityApprovers as $userId) {
                        \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                    }
                } else if ($percentRemaining <= 50) { // Gửi thông báo lần 2
                    if ($upcomingBooking['notificationCount'] <= 1) {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationCount' => 2,
                            'notificationDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_2', $upcomingBooking['id']);
                        $approversOrPriorityApprovers = $upcomingBooking['isPriority'] ? $mailContent['priorityApprovers'] : $mailContent['approvers'];
                        foreach($approversOrPriorityApprovers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                } else if ($percentRemaining <= 75) { // Gửi thông báo lần 1
                    if ($upcomingBooking['notificationCount'] == 0) {
                        \Booking\Query::updateRecordsWithConditions('car_booking_requests', ['id' => $upcomingBooking['id']], [
                            'notificationCount' => 1,
                            'notificationDate' => new \Bitrix\Main\Type\DateTime()
                        ]);
                        $mailContent = \Booking\MailTemplate::generateMailContent('send_to_approvers_when_booking_meet_condition_1', $upcomingBooking['id']);
                        $approversOrPriorityApprovers = $upcomingBooking['isPriority'] ? $mailContent['priorityApprovers'] : $mailContent['approvers'];
                        foreach($approversOrPriorityApprovers as $userId) {
                            \Booking\Notification::sendNotificationToUser($userId, $mailContent['subject'], $mailContent['content']);
                        }
                    }
                }
            }
        }
        \CEvent::ExecuteEvents();
    
        return ['status' => 'success', 'message' => 'Cron job executed successfully'];
    }
}