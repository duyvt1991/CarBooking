<?php
namespace Booking;

use Bitrix\Main\Entity\Query;


class MailTemplate {
    public static $mailTemplates = [];
    
    public static function initialize() {
        $approversUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/approve-booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và duyệt yêu cầu đặt xe.";
        $approverRemindUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/approve-booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và duyệt yêu cầu đặt xe để tránh ảnh hưởng đến kế hoạch sử dụng xe.";
        $bookingUserUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và đặt lại xe mới (nếu có).";

        $noteWhenUsing = "<br/><br/>Lưu ý khi sử dụng:<br/>- Vui lòng đến đúng giờ và giữ vệ sinh chung, kiểm tra toàn bộ Trang thiết bị/ dụng cụ của xe và trả về vị trí cũ sau khi sử dụng xong.<br/>- Không để lại vật dụng cá nhân nếu không có người trực tiếp quản lý.<br/>- Cập nhật thời gian sử dụng nếu xong trước thời gian dự kiến.";
        $noteAfterUsing = "<br/><br/>Vui lòng đánh giá chất lượng xe sau khi sử dụng để hỗ trợ team quản lý & cải tiến nhé. Cám ơn bạn.";
        $sorry = "Thành thật xin lỗi & mong bạn thông cảm về sự bất tiện này.";

        $commonNote = "<br/><br/>Lưu ý: Đây là thư tự động, không hồi âm (reply) về địa chỉ thư điện tử này. Trường hợp không xem được link chi tiết, vui lòng liên hệ DCC để được xác nhận phân quyền.<br/>DCC team.";
        
        $additionalMessages = [
            'approversUrl' => $approversUrl, 
            'approverRemindUrl' => $approverRemindUrl,
            'bookingUserUrl' => $bookingUserUrl,
            'noteWhenUsing' => $noteWhenUsing,
            'noteAfterUsing' => $noteAfterUsing,
            'sorry' => $sorry,
            'commonNote' => $commonNote
        ];
        
        self::$mailTemplates = [
            'send_to_approvers_when_create_booking' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approversUrl = str_replace('%ID%', $id, $approversUrl);
                    $userNames = [];
                    if (!empty($users)) {
                        foreach ($users as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $users = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đang cần duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người chủ trì: ".$mainUser["mvalue"]."<br/>- Người dùng: ".$users."<br/>- xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích: ".$usagePurpose["mvalue"]."".$approversUrl."".$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_approve_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã được duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của bạn đã được duyệt:<br/><br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích: ".$usagePurpose["mvalue"]."" .$noteWhenUsing ."" .$noteAfterUsing ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_reject_booking' => [
                'subject' => 'Lịch đặt xe của bạn không được duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." của bạn đã không được duyệt:<br/><br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Lý do từ chối: ".$rejectedReason."" .$bookingUserUrl ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_reject_booking_after_approved' => [
                'subject' => 'Lịch đặt xe của bạn đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    $userNames = [];
                    if (!empty($rejectedUsers)) {
                        foreach ($rejectedUsers as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $rejectedUsers = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." đã thành công trước đây của bạn đã bị hủy do có thay đổi ngoài dự kiến:<br/><br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Người huỷ: ".$rejectedUsers."<br/>- Lý do huỷ: ".$rejectedReason."" .$bookingUserUrl ." " .$sorry ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_cancel_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." của bạn đã bị hủy:<br/><br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Lý do huỷ: ".$cancelledReason."" .$bookingUserUrl ." " .$sorry ."" .$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_1' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới đã qua 1/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    $userNames = [];
                    if (!empty($users)) {
                        foreach ($users as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $users = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người chủ trì: ".$mainUser["mvalue"]."<br/>- Người dùng: ".$users."<br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích: ".$usagePurpose["mvalue"]."".$approverRemindUrl."".$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_2' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới đã qua 1/2 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    $userNames = [];
                    if (!empty($users)) {
                        foreach ($users as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $users = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/2 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người chủ trì: ".$mainUser["mvalue"]."<br/>- Người dùng: ".$users."<br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích: ".$usagePurpose["mvalue"]."".$approverRemindUrl."".$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_loop' => [
                'subject' => '[GẤP] Yêu cầu duyệt đặt xe mới đã qua 3/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    $userNames = [];
                    if (!empty($users)) {
                        foreach ($users as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $users = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 3/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người chủ trì: ".$mainUser["mvalue"]."<br/>- Người dùng: ".$users."<br/>- Xe: ".$room["mvalue"]." - Chi nhánh: ".$building["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích: ".$usagePurpose["mvalue"]."".$approverRemindUrl."".$commonNote;
                }
            ],
        ];
    }

    public static function generateMailContent($templateKey, $id, $userIdOverrides = null, $isPriority = null) {
        if (!$id) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => []];
        }
        if (!isset(self::$mailTemplates[$templateKey])) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => []];
        }
        $query = \Booking\Query::getInstance("car_booking_requests", true);
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $currentItem = $query->exec()->fetch();
        if (empty($currentItem)) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => []];
        }
        $approvers = [];
        $priorityApprovers = [];
        if (!empty($userIdOverrides)) {
            $currentItem['userIds'] = $userIdOverrides;
        } else {
            try {
                $currentItem['userIds'] = [
                    str_replace('BitrixID-', '', $currentItem['bookingUser']['mkey']),
                    str_replace('BitrixID-', '', $currentItem['mainUser']['mkey'])
                ];
                foreach ($currentItem['users'] as $user) {
                    $currentItem['userIds'][] = str_replace('BitrixID-', '', $user['mkey']);
                }
                $currentItem['userIds'] = array_unique($currentItem['userIds']);

                $roomTypeApprovers = $currentItem['roomType']['approvers'] ?? [];
                $roomApprovers = $currentItem['room']['approvers'] ?? [];
                $approvers = empty($roomApprovers) ? $roomTypeApprovers : $roomApprovers;
                $approvers = array_map(function($approver) {
                    return str_replace('BitrixID-', '', $approver);
                }, $approvers);
                $approvers = array_unique($approvers);

                $priorityApprovers = $currentItem['room']['priorityApprovers'] ?? [];
                $priorityApprovers = array_map(function($approver) {
                    return str_replace('BitrixID-', '', $approver);
                }, $priorityApprovers);
                $priorityApprovers = array_unique($priorityApprovers);
            } catch (\Throwable $th) {
                //throw $th;
            }
        }
        $template = self::$mailTemplates[$templateKey];
        $prefixTitle = "";
        if ($isPriority !== null) {
            $prefixTitle = $isPriority ? "[Ưu tiên] " : "";
        } else {
            $prefixTitle = !empty($currentItem['isPriority']) ? "[Ưu tiên] " : "";
        }
        $subject = $prefixTitle . $template['subject'];
        $content = $template['content'];
        return [
            'userIds' => $currentItem['userIds'],
            'approvers' => $approvers,
            'priorityApprovers' => $priorityApprovers,
            'subject' => $subject,
            'content' => call_user_func($content, $currentItem)
        ];
    }
}