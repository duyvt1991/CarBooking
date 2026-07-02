<?php
namespace Booking;

use Bitrix\Main\Entity\Query;


class MailTemplate {
    public static $mailTemplates = [];
    
    public static function initialize() {
        $approversUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/approve-booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và duyệt yêu cầu đặt xe.";
        $approverRemindUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/approve-booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và duyệt yêu cầu đặt xe để tránh ảnh hưởng đến kế hoạch sử dụng xe.";
        $bookingUserUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và đặt lại yêu cầu đặt xe.";
        $driverConfirmUrl = "<br/><br/>Hãy truy cập <a target='_blank' href='".DAT_PHONG_ENDPOINT."/#/driver-confirm-booking-list?id=%ID%'>[tại đây]</a> để xem thông tin chi tiết và xác nhận phân công tài xế cho yêu cầu đặt xe.";

        $noteWhenUsing = "<br/><br/>Lưu ý khi sử dụng:<br/>- Vui lòng đến đúng giờ và giữ vệ sinh chung.<br/>- Không để lại vật dụng cá nhân nếu không có người trực tiếp quản lý.<br/>- Cập nhật thời gian sử dụng nếu xong trước thời gian dự kiến.";
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
            'commonNote' => $commonNote,
            'driverConfirmUrl' => $driverConfirmUrl,
        ];
        
        self::$mailTemplates = [
            'send_to_approvers_when_create_booking' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approversUrl = str_replace('%ID%', $id, $approversUrl);
                    // $userNames = [];
                    // if (!empty($users)) {
                    //     foreach ($users as $user) {
                    //         $userNames[] = $user["mvalue"];
                    //     }
                    // }
                    // $users = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đang cần duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Loại xe đề xuất: ".$roomType["mvalue"]." - Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$approversUrl."".$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_approve_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã được duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của bạn đã được duyệt:<br/><br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."" .$noteWhenUsing ."" .$noteAfterUsing ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_reject_booking' => [
                'subject' => 'Lịch đặt xe của bạn không được duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." của bạn đã không được duyệt:<br/><br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Lý do từ chối: ".$rejectedReason."" .$bookingUserUrl ."" .$commonNote;
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
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." đã thành công trước đây của bạn đã bị hủy do có thay đổi ngoài dự kiến:<br/><br/>- Loại xe đề xuất: ".$roomType["mvalue"]."<br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Người huỷ: ".$rejectedUsers."<br/>- Lý do huỷ: ".$rejectedReason."" .$bookingUserUrl ." " .$sorry ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_cancel_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." của bạn đã bị hủy:<br/><br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Lý do huỷ: ".$cancelledReason."" .$bookingUserUrl ." " .$sorry ."" .$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_1' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới đã qua 1/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$approverRemindUrl."".$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_2' => [
                'subject' => 'Yêu cầu duyệt đặt xe mới đã qua 1/2 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/2 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$approverRemindUrl."".$commonNote;
                }
            ],
            'send_to_approvers_when_booking_meet_condition_loop' => [
                'subject' => '[GẤP] Yêu cầu duyệt đặt xe mới đã qua 3/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $approverRemindUrl = str_replace('%ID%', $id, $approverRemindUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 3/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Loại xe đề xuất: ".$roomType["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$approverRemindUrl."".$commonNote;
                }
            ],
            'send_to_booking_user_approve_when_driver_reject_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã bị tài xế từ chối',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $bookingUserUrl = str_replace('%ID%', $id, $bookingUserUrl);
                    $userNames = [];
                    if (!empty($driverDeclineUser)) {
                        foreach ($driverDeclineUser as $user) {
                            $userNames[] = $user["mvalue"];
                        }
                    }
                    $driverDeclineUser = implode(', ', $userNames);
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe số ".$id." của bạn đã bị tài xế từ chối:<br/><br/>- Xe: ".$room["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Tài xế từ chối: ".$driverDeclineUser."<br/>- Lý do từ chối: ".$driverDeclineReason."" .$bookingUserUrl ." " .$sorry ."" .$commonNote;
                }
            ],
            'send_to_booking_user_main_user_users_when_confirm_booking' => [
                'subject' => 'Lịch đặt xe của bạn đã được tài xế xác nhận',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của bạn đã được xác nhận:<br/><br/>- Xe: ".$room["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."" .$noteWhenUsing ."" .$noteAfterUsing ."" .$commonNote;
                }
            ],
            'send_to_driver_when_assign_booking' => [
                'subject' => 'Yêu cầu đặt xe cần tài xế xác nhận',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $driverConfirmUrl = str_replace('%ID%', $id, $approversUrl);
                  
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đang cần xác nhận:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Xe: ".$room["mvalue"]." - Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$driverConfirmUrl."".$commonNote;
                }
            ],
             'send_to_confirm_when_booking_meet_condition_1' => [
                'subject' => 'Yêu cầu xác nhận đặt xe đã qua 1/4 thời gian từ lúc phân công',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $driverConfirmUrl = str_replace('%ID%', $id, $driverConfirmUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/4 thời gian xác nhận từ lúc phân công, nhưng vẫn chưa được xác nhận:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Xe: ".$room["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$driverConfirmUrl."".$commonNote;
                }
            ],
            'send_to_confirm_when_booking_meet_condition_2' => [
                'subject' => 'Yêu cầu xác nhận đặt xe đã qua 1/2 thời gian từ lúc phân công',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $driverConfirmUrl = str_replace('%ID%', $id, $driverConfirmUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 1/2 thời gian xác nhận từ lúc phân công, nhưng vẫn chưa được xác nhận:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Xe: ".$room["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$driverConfirmUrl."".$commonNote;
                }
            ],
            'send_to_confirm_when_booking_meet_condition_loop' => [
                'subject' => '[GẤP] Yêu cầu xác nhận đặt xe đã qua 3/4 thời gian từ lúc phân công',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    extract($currentItem);
                    $driverConfirmUrl = str_replace('%ID%', $id, $driverConfirmUrl);
                    return "Chào bạn,<br/><br/>Đặt xe số ".$id." của ".$bookingUser["mvalue"].", đã qua 3/4 thời gian xác nhận từ lúc phân công, nhưng vẫn chưa được xác nhận:<br/><br/>- Người đặt: ".$bookingUser["mvalue"]."<br/>- Người phụ trách: ".$mainUser["mvalue"]."<br/>- Xe: ".$room["mvalue"]." <br/>- Thời gian sử dụng: ".preg_replace('/:00$/', '', $startTime)." - ".preg_replace('/:00$/', '', $endTime)." ngày ".implode("/", array_reverse(explode("-", $startDate)))."<br/>- Mục đích chuyến đi: ".$usagePurposeDetail."".$driverConfirmUrl."".$commonNote;
                }
            ],
        ];
    }

    public static function generateMailContent($templateKey, $id, $userIdOverrides = null, $isPriority = null) {
        if (!$id) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => []];
        }
        if (!isset(self::$mailTemplates[$templateKey])) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => []];
        }
        $query = \Booking\Query::getInstance("car_booking_requests", true);
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $currentItem = $query->exec()->fetch();
        if (empty($currentItem)) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => []];
        }
        $approvers = [];
        $priorityApprovers = [];
        $driverUser = [];
        $assignmentUser = [];
        if (!empty($userIdOverrides)) {
            $currentItem['userIds'] = $userIdOverrides;
        } else {
            try {
                $currentItem['userIds'] = [];
                if (!empty($currentItem['bookingUser']['mkey'])) {
                    $currentItem['userIds'][] = str_replace('BitrixID-', '', $currentItem['bookingUser']['mkey']);
                }
                if (!empty($currentItem['mainUser']['mkey'])) {
                    $currentItem['userIds'][] = str_replace('BitrixID-', '', $currentItem['mainUser']['mkey']);
                }
               
                $currentItem['userIds'] = array_unique($currentItem['userIds']);

                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata", true);
                $queryMasterData->setSelect(['mkey']);
                $queryMasterData->setFilter([
                    'mtype' => 'approvers', 
                    'isDeleted' => 0
                ]);
                $masterDataApprovers = $queryMasterData->exec()->fetchAll();
                $approvers = array_column($masterDataApprovers, 'mkey');
                $approvers = array_map(function($approver) {
                    return str_replace('BitrixID-', '', $approver);
                }, $approvers);
                $approvers = array_unique($approvers);

                $dUserField = $currentItem['driverUser'];
                if (is_string($dUserField)) {
                    try { $dUserField = \Bitrix\Main\Web\Json::decode($dUserField); } catch (\Throwable $th) { $dUserField = []; }
                }
                if (!empty($dUserField)) {
                    if (isset($dUserField['mkey'])) {
                        $driverUser[] = str_replace('BitrixID-', '', $dUserField['mkey']);
                    } else if (is_array($dUserField)) {
                        foreach ($dUserField as $dUser) {
                            if (isset($dUser['mkey'])) {
                                $driverUser[] = str_replace('BitrixID-', '', $dUser['mkey']);
                            }
                        }
                    }
                }

                $aUserField = $currentItem['assignmentUser'];
                if (is_string($aUserField)) {
                    try { $aUserField = \Bitrix\Main\Web\Json::decode($aUserField); } catch (\Throwable $th) { $aUserField = []; }
                }
                if (!empty($aUserField)) {
                    if (isset($aUserField['mkey'])) {
                        $assignmentUser[] = str_replace('BitrixID-', '', $aUserField['mkey']);
                    } else if (is_array($aUserField)) {
                        foreach ($aUserField as $aUser) {
                            if (isset($aUser['mkey'])) {
                                $assignmentUser[] = str_replace('BitrixID-', '', $aUser['mkey']);
                            }
                        }
                    }
                }
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
            'driverUser' => $driverUser,
            'assignmentUser' => $assignmentUser, // Là user đã assign
            'subject' => $subject,
            'content' => call_user_func($content, $currentItem)
        ];
    }
}