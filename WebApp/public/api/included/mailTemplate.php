<?php
namespace Booking;

use Bitrix\Main\Entity\Query;


class MailTemplate {
    public static $mailTemplates = [];

    public static function getBookingDetails($currentItem) {
        $id = $currentItem['id'];
        $bookingUser = $currentItem['bookingUser'];
        $mainUser = $currentItem['mainUser'];
        $department = $currentItem['department'];
        $roomType = $currentItem['roomType'];
        $room = $currentItem['room'];
        $driverUser = $currentItem['driverUser'];
        $driver = $currentItem['driver'];
        $driverPhoneNumber = $currentItem['driverPhoneNumber'];
        $licensePlateNumber = $currentItem['licensePlateNumber'];
        $startDate = $currentItem['startDate'];
        $startTime = $currentItem['startTime'];
        $endTime = $currentItem['endTime'];
        $usagePurposeDetail = $currentItem['usagePurposeDetail'];

        $startDateFormatted = implode("/", array_reverse(explode("-", $startDate)));
        $startTimeFormatted = preg_replace('/:00$/', '', $startTime);
        $endTimeFormatted = preg_replace('/:00$/', '', $endTime);

        $details = "<br/><b>Thông tin lịch trình đặt xe:</b><br/>";
        $details .= "- Mã chuyến xe: " . $id . "<br/>";
      
        if (!empty($bookingUser['mvalue'])) {
            $details .= "- Người đặt: " . $bookingUser['mvalue'] . "<br/>";
        }
        if (!empty($mainUser['mvalue'])) {
            $details .= "- Người phụ trách: " . $mainUser['mvalue'] . "<br/>";
        }
        if (!empty($department['mvalue'])) {
            $details .= "- Bộ phận: " . $department['mvalue'] . "<br/>";
        }
        $details .= "- Thời gian sử dụng: " . $startTimeFormatted . " - " . $endTimeFormatted . " ngày " . $startDateFormatted . "<br/>";
        if (!empty($usagePurposeDetail)) {
            $details .= "- Mục đích chuyến đi: " . $usagePurposeDetail . "<br/>";
        }

        if (!empty($usagePurposes) && is_array($usagePurposes)) {
            $details .= "- Phân loại khách: " . $usagePurposes['mvalue']  . "<br/>";
        }

         if (!empty($flightNumber)) {
            $details .= "- Số hiệu chuyến bay: " . $flightNumber . "<br/>";
        }

        if (!empty($employeeNumber) && is_numeric($employeeNumber) && $employeeNumber > 0) {
            $details .= "- Số lượng: " . $employeeNumber . "<br/>";
        }

        if (!empty($employeeList) && is_array($employeeList)) {
            $details .= "- Thành viên tham gia: " . implode(", ", array_column($employeeList, 'mvalue')) . "<br/>";
        }

        if (!empty($detailedSchedule)) {
            $details .= "- Lịch trình chi tiết: " . $detailedSchedule . "<br/>";
        }

        if (!empty($room['mvalue'])) {
            $details .= "- Xe phục vụ: " . $room['mvalue'] . "<br/>";
        }
        if (!empty($licensePlateNumber)) {
            $details .= "- Biển số xe: " . $licensePlateNumber . "<br/>";
        }
        $assignedDriverName = '';
        if (!empty($driverUser)) {
            if (is_array($driverUser) && isset($driverUser['mvalue'])) {
                $assignedDriverName = $driverUser['mvalue'];
            } else if (is_array($driverUser) && isset($driverUser[0]['mvalue'])) {
                $assignedDriverName = $driverUser[0]['mvalue'];
            }
        }
        if ($assignedDriverName) {
            $details .= "- Tài xế: " . $assignedDriverName . "<br/>";
        }

        if (!empty($driverPhoneNumber)) {
            $details .= "- Số điện thoại tài xế: " . $driverPhoneNumber . "<br/>";
        }
        
        return $details;
    }
    
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
            // Dòng 2: Người đặt -> Đặt xe -> Người đặt
            'send_to_booking_user_when_create_booking' => [
                'subject' => '[ĐẶT XE] - Đặt xe thành công',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Xác nhận đã tiếp nhận yêu cầu đặt xe theo thông tin bên dưới:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 3: Người đặt -> [ĐẶT XE] -> Người duyệt
            'send_to_approvers_when_create_booking' => [
                'subject' => '[ĐẶT XE] - Chờ phê duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $approversUrl = str_replace('%ID%', $currentItem['id'], $approversUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Hệ thống vừa tiếp nhận một yêu cầu sử dụng xe mới. Vui lòng xem xét và phân bổ xe phù hợp theo thông tin bên dưới:<br/>" . $details . $approversUrl . $commonNote;
                }
            ],
            // Dòng 4: Người duyệt -> Phân công tài xế -> Tài xế
            'send_to_driver_when_assign_booking' => [
                'subject' => '[ĐẶT XE] - Phân công phục vụ chuyến xe',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $driverConfirmUrl = str_replace('%ID%', $currentItem['id'], $driverConfirmUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Ban Điều Phối phân công anh phục vụ chuyến xe theo thông tin bên dưới. Vui lòng kiểm tra lộ trình và xác nhận để hoàn tất quy trình:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 5: Tài xế -> Nhận chuyến -> Người duyệt
            'send_to_approvers_when_driver_confirm' => [
                'subject' => '[ĐẶT XE] - Tài xế đã nhận chuyến',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Tài xế đã xác nhận nhận chuyến xe theo thông tin bên dưới:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 6: Tài xế -> Nhận chuyến -> Người đặt
            'send_to_booking_user_main_user_users_when_confirm_booking' => [
                'subject' => '[ĐẶT XE] - Đã phân công xe',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Tài xế đã xác nhận chuyến xe theo thông tin bên dưới. Người đặt xe vui lòng liên hệ tài xế để xác nhận chính xác thời gian và địa điểm:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 7: Người duyệt -> Thay đổi tài xế -> Tài xế cũ
            'send_to_old_driver_when_change_driver' => [
                'subject' => '[ĐẶT XE] - Hủy phân công',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã được hủy phân công. Vui lòng kiểm tra và xác nhận lịch mới (nếu có):<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 9: Người duyệt -> Thay đổi tài xế -> Người đặt xe
            'send_to_booking_user_when_change_driver' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã được đổi tài xế',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã được thay đổi tài xế. Vui lòng liên hệ tài xế để xác nhận thời gian và địa điểm:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 10: Người duyệt -> Thay đổi xe -> Người đặt xe
            'send_to_booking_user_when_change_car' => [
                'subject' => '[ĐẶT XE] - Thông tin xe đã thay đổi',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Thông tin xe phục vụ chuyến đi của bạn đã thay đổi:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 11: Người duyệt -> Thay đổi xe -> Tài xế
            'send_to_driver_when_change_car' => [
                'subject' => '[ĐẶT XE] - Thông tin xe đã thay đổi',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Thông tin xe phục vụ chuyến đi được phân công của bạn đã thay đổi:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 12: Người duyệt -> Điều chỉnh lịch -> Người đặt xe
            'send_to_booking_user_when_schedule_updated' => [
                'subject' => '[ĐẶT XE] - Lịch trình đã được cập nhật',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Lịch trình mới của bạn đã được cập nhật. Vui lòng liên hệ tài xế để xác nhận thời gian và địa điểm:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 13: Người duyệt -> Điều chỉnh lịch -> Tài xế
            'send_to_driver_when_schedule_updated' => [
                'subject' => '[ĐẶT XE] - Lịch trình chuyến xe đã thay đổi',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Lịch trình chuyến xe đã thay đổi, vui lòng liên hệ người phục trách để xác nhận thông tin:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 14, 15, 16, 18, 19, 20: Các trường hợp Hủy yêu cầu đặt xe
            'send_to_booking_user_main_user_users_when_cancel_booking' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $bookingUserUrl = str_replace('%ID%', $currentItem['id'], $bookingUserUrl);
                    $details = self::getBookingDetails($currentItem);
                    $reasonText = "";
                    if (!empty($currentItem['cancelledReason'])) {
                        $reasonText = "<br/>- Lý do hủy: " . $currentItem['cancelledReason'];
                    } else if (!empty($currentItem['rejectedReason'])) {
                        $reasonText = "<br/>- Lý do hủy: " . $currentItem['rejectedReason'];
                    }
                    return "Chào bạn,<br/><br/>Rất tiếc đặt xe của bạn đã bị hủy:" . $reasonText . "<br/>" . $details . $bookingUserUrl . " " . $sorry . $commonNote;
                }
            ],
            // Dòng 14: Người đặt -> Hủy yêu cầu (chưa phân xe) -> Người duyệt
            'send_to_approvers_when_user_cancel_unassigned' => [
                'subject' => '[ĐẶT XE] - Yêu cầu đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Yêu cầu đặt xe đã được hủy. Vui lòng kiểm tra:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 15: Người đặt -> Hủy yêu cầu (đã có tài xế) -> Người duyệt
            'send_to_approvers_when_user_cancel_assigned' => [
                'subject' => '[ĐẶT XE] - Người dùng đã hủy chuyến',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Người dùng đã hủy chuyến:<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 16: Người đặt -> Hủy yêu cầu (đã có tài xế) -> Tài xế
            'send_to_driver_when_user_cancel_assigned' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã bị hủy theo yêu cầu của người đặt xe. Vui lòng kiểm tra email để xác nhận chuyến xe mới (nếu có):<br/>" . $details . $commonNote;
                }
            ],
            // Dùng chung cho từ chối duyệt (Dòng 18)
            'send_to_booking_user_main_user_users_when_reject_booking' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $bookingUserUrl = str_replace('%ID%', $currentItem['id'], $bookingUserUrl);
                    $details = self::getBookingDetails($currentItem);
                    $reasonText = "";
                    if (!empty($currentItem['rejectedReason'])) {
                        $reasonText = "<br/>- Lý do từ chối: " . $currentItem['rejectedReason'];
                    }
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã bị hủy với lý do: " . ($currentItem['rejectedReason'] ?? "") . "<br/>" . $details . $bookingUserUrl . " " . $sorry . $commonNote;
                }
            ],
            // Dùng chung cho từ chối duyệt sau khi đã duyệt (Dòng 19)
            'send_to_booking_user_main_user_users_when_reject_booking_after_approved' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $bookingUserUrl = str_replace('%ID%', $currentItem['id'], $bookingUserUrl);
                    $details = self::getBookingDetails($currentItem);
                    $reasonText = "";
                    if (!empty($currentItem['rejectedReason'])) {
                        $reasonText = "<br/>- Lý do hủy: " . $currentItem['rejectedReason'];
                    }
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã bị hủy với lý do: " . ($currentItem['rejectedReason'] ?? "") . "<br/>" . $details . $bookingUserUrl . " " . $sorry . $commonNote;
                }
            ],
            // Dòng 20: Người duyệt -> Hủy yêu cầu (đã có tài xế) -> Tài xế
            'send_to_driver_when_manager_reject_assigned' => [
                'subject' => '[ĐẶT XE] - Chuyến xe đã bị hủy',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn đã bị hủy. Vui lòng kiểm tra email để xác nhận chuyến xe mới (nếu có):<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 23: Người đặt -> Đánh giá chuyến -> Người duyệt
            'send_to_approvers_when_user_review' => [
                'subject' => '[ĐẶT XE] - Có đánh giá mới từ người dùng',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    
                    $exp = $currentItem['userReviewExperience'] ?? [];
                    if (is_string($exp)) {
                        $exp = json_decode($exp, true) ?: [];
                    }
                    $qcd = $currentItem['userReviewQcd'] ?? [];
                    if (is_string($qcd)) {
                        $qcd = json_decode($qcd, true) ?: [];
                    }

                    $expLabels = [
                        'onTime' => 'Tài xế đúng giờ',
                        'polite' => 'Thái độ lễ phép',
                        'clean' => 'Xe sạch sẽ',
                        'safe' => 'Lái xe an toàn, êm',
                        'support' => 'Chủ động hỗ trợ',
                        'privacy' => 'Bảo mật/tế nhị',
                        'response' => 'Phản hồi nhanh',
                        'overall' => 'Trải nghiệm tổng thể'
                    ];

                    $qcdLabels = [
                        'q' => 'Q – Chất lượng phục vụ',
                        'c' => 'C – Hiệu quả & không lãng phí',
                        'd' => 'D – Đúng giờ & đúng yêu cầu'
                    ];

                    // A. Đánh giá trải nghiệm dịch vụ
                    $expRows = "";
                    foreach ($expLabels as $key => $label) {
                        $score = isset($exp[$key]) ? (int)$exp[$key] : 0;
                        $expRows .= "<tr><td style='text-align: left; padding: 8px; border: 1px solid #ddd;'>{$label}</td>";
                        for ($i = 1; $i <= 5; $i++) {
                            $circle = ($score === $i) ? "<span style='color: #4CAF50; font-size: 16px;'>●</span>" : "<span style='color: #ccc; font-size: 16px;'>○</span>";
                            $expRows .= "<td style='text-align: center; padding: 8px; border: 1px solid #ddd;'>{$circle}</td>";
                        }
                        $expRows .= "</tr>";
                    }

                    // B. Đánh giá QCD
                    $qcdRows = "";
                    foreach ($qcdLabels as $key => $label) {
                        $score = isset($qcd[$key]) ? (int)$qcd[$key] : 0;
                        $qcdRows .= "<tr>
                            <td style='text-align: left; padding: 8px; border: 1px solid #ddd;'>{$label}</td>
                            <td style='text-align: center; padding: 8px; border: 1px solid #ddd; font-weight: bold;'>{$score} / 5</td>
                        </tr>";
                    }

                    // C. Nhận xét nhanh
                    $wantsToContinue = "";
                    if (isset($currentItem['userWantsToContinue'])) {
                        $wantsToContinue = ($currentItem['userWantsToContinue'] == 1 || $currentItem['userWantsToContinue'] === true || $currentItem['userWantsToContinue'] === 'true') ? "Có" : "Không";
                    } else {
                        $wantsToContinue = "-";
                    }
                    $commentMost = htmlspecialchars($currentItem['userReviewCommentMost'] ?? '-');
                    $commentBad = htmlspecialchars($currentItem['userReviewCommentBad'] ?? '-');

                    $reviewHtml = "
                    <h3 style='margin-top: 20px; color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 5px;'>CHI TIẾT ĐÁNH GIÁ TỪ NGƯỜI DÙNG</h3>
                    
                    <h4 style='color: #2563EB; margin-bottom: 8px;'>A. ĐÁNH GIÁ TRẢI NGHIỆM DỊCH VỤ</h4>
                    <table style='border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: sans-serif; font-size: 14px;'>
                      <thead>
                        <tr style='background-color: #f2f2f2; font-weight: bold;'>
                          <th style='text-align: left; padding: 8px; border: 1px solid #ddd; width: 50%;'>Nội dung đánh giá</th>
                          <th style='width: 10%; border: 1px solid #ddd; text-align: center;'>1</th>
                          <th style='width: 10%; border: 1px solid #ddd; text-align: center;'>2</th>
                          <th style='width: 10%; border: 1px solid #ddd; text-align: center;'>3</th>
                          <th style='width: 10%; border: 1px solid #ddd; text-align: center;'>4</th>
                          <th style='width: 10%; border: 1px solid #ddd; text-align: center;'>5</th>
                        </tr>
                      </thead>
                      <tbody>
                        {$expRows}
                      </tbody>
                    </table>

                    <h4 style='color: #2563EB; margin-top: 20px; margin-bottom: 8px;'>B. ĐÁNH GIÁ QCD</h4>
                    <table style='border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: sans-serif; font-size: 14px;'>
                      <thead>
                        <tr style='background-color: #f2f2f2; font-weight: bold;'>
                          <th style='text-align: left; padding: 8px; border: 1px solid #ddd;'>Nội dung</th>
                          <th style='width: 20%; border: 1px solid #ddd; text-align: center;'>Điểm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {$qcdRows}
                      </tbody>
                    </table>

                    <h4 style='color: #2563EB; margin-top: 20px; margin-bottom: 8px;'>C. NHẬN XÉT NHANH</h4>
                    <table style='border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: sans-serif; font-size: 14px;'>
                      <tbody>
                        <tr>
                          <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 40%;'>Điều hài lòng nhất</td>
                          <td style='padding: 8px; border: 1px solid #ddd;'>{$commentMost}</td>
                        </tr>
                        <tr>
                          <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Điều cần cải thiện</td>
                          <td style='padding: 8px; border: 1px solid #ddd;'>{$commentBad}</td>
                        </tr>
                        <tr>
                          <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Có muốn tiếp tục sử dụng tài xế này không?</td>
                          <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold; color: " . ($wantsToContinue === 'Có' ? '#4CAF50' : '#F44336') . ";'>{$wantsToContinue}</td>
                        </tr>
                      </tbody>
                    </table>
                    <br/>
                    ";

                    return "Chào bạn,<br/><br/>Chuyến xe mã <b>" . ($currentItem['id'] ?? "") . "</b> đã nhận được đánh giá mới từ người đặt xe. Chi tiết đánh giá bên dưới:<br/>" . $reviewHtml . $commonNote;
                }
            ],
            // Dòng 24: Hệ thống -> Nhắc lịch trước 30 phút -> Người đặt xe
            'send_to_booking_user_departure_remind_30min' => [
                'subject' => '[ĐẶT XE] - Sắp đến giờ khởi hành',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn sẽ khởi hành trong 30 phút nữa. Vui lòng chuẩn bị:<br/>" . $details . $commonNote;
                }
            ],
            // Gửi khi phê duyệt xe nội bộ
            'send_to_booking_user_main_user_users_when_approve_booking' => [
                'subject' => '[ĐẶT XE] - Lịch đặt xe của bạn đã được duyệt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Lịch đặt xe của bạn đã được duyệt và đang chờ tài xế xác nhận chuyến xe:<br/>" . $details . $commonNote;
                }
            ],
            // Cảnh báo người duyệt (1/4 thời gian)
            'send_to_approvers_when_booking_meet_condition_1' => [
                'subject' => '[ĐẶT XE] - Cảnh báo! Yêu cầu duyệt đặt xe mới đã qua 1/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $approverRemindUrl = str_replace('%ID%', $currentItem['id'], $approverRemindUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe đã qua 1/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/>" . $details . $approverRemindUrl . $commonNote;
                }
            ],
            // Cảnh báo người duyệt (1/2 thời gian)
            'send_to_approvers_when_booking_meet_condition_2' => [
                'subject' => '[ĐẶT XE] - Cảnh báo! Yêu cầu duyệt đặt xe mới đã qua 1/2 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $approverRemindUrl = str_replace('%ID%', $currentItem['id'], $approverRemindUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe đã qua 1/2 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/>" . $details . $approverRemindUrl . $commonNote;
                }
            ],
            // Cảnh báo người duyệt [GẤP] (3/4 thời gian)
            'send_to_approvers_when_booking_meet_condition_loop' => [
                'subject' => '[ĐẶT XE] - [GẤP] Yêu cầu duyệt đặt xe mới đã qua 3/4 thời gian từ lúc đặt',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $approverRemindUrl = str_replace('%ID%', $currentItem['id'], $approverRemindUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Đặt xe đã qua 3/4 thời gian duyệt từ lúc đặt, nhưng vẫn chưa được duyệt:<br/>" . $details . $approverRemindUrl . $commonNote;
                }
            ],
            // Dòng 21: Tài xế từ chối chuyến -> gửi người duyệt/quản lý
            'send_to_booking_user_approve_when_driver_reject_booking' => [
                'subject' => '[ĐẶT XE] - Tài xế từ chối chuyến',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    $reasonText = "";
                    if (!empty($currentItem['driverDeclineReason'])) {
                        $reasonText = "<br/>- Lý do từ chối: " . $currentItem['driverDeclineReason'];
                    }
                    return "Chào bạn,<br/><br/>Tài xế đã từ chối nhận chuyến xe được phân công:" . $reasonText . "<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 22: Tài xế từ chối chuyến -> gửi người đặt
            'send_to_booking_user_when_driver_reject_booking' => [
                'subject' => '[ĐẶT XE] - Tài xế từ chối chuyến',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Tài xế đã hủy chuyến xe của bạn. Ban Điều phối đang sắp xếp lại tài xế và sẽ gửi email phân công tài xế mới.<br/>" . $details . $commonNote;
                }
            ],
            // Cảnh báo tài xế (1/4 thời gian)
            'send_to_confirm_when_booking_meet_condition_1' => [
                'subject' => '[ĐẶT XE] - Tài xế chưa xác nhận chuyến',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $driverConfirmUrl = str_replace('%ID%', $currentItem['id'], $driverConfirmUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Cảnh báo! Bạn có chuyến xe chưa xác nhận, vui lòng xác nhận trước khi quá thời gian sử dụng:<br/>" . $details . $driverConfirmUrl . $commonNote;
                }
            ],
            // Cảnh báo tài xế (1/2 thời gian)
            'send_to_confirm_when_booking_meet_condition_2' => [
                'subject' => '[ĐẶT XE] - Cảnh báo! Tài xế chưa xác nhận chuyến (1/2 thời gian)',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $driverConfirmUrl = str_replace('%ID%', $currentItem['id'], $driverConfirmUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Cảnh báo! Bạn có chuyến xe chưa xác nhận đã quá 1/2 thời gian từ lúc phân công, vui lòng kiểm tra và xác nhận:<br/>" . $details . $driverConfirmUrl . $commonNote;
                }
            ],
            // Cảnh báo tài xế [GẤP] (3/4 thời gian)
            'send_to_confirm_when_booking_meet_condition_loop' => [
                'subject' => '[ĐẶT XE] - [GẤP] Tài xế chưa xác nhận chuyến (3/4 thời gian)',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $driverConfirmUrl = str_replace('%ID%', $currentItem['id'], $driverConfirmUrl);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>[GẤP] Bạn có chuyến xe chưa xác nhận đã quá 3/4 thời gian từ lúc phân công, vui lòng vào xác nhận ngay:<br/>" . $details . $driverConfirmUrl . $commonNote;
                }
            ],
            // Xe Grab hoặc xe dịch vụ (ST002) được duyệt/phân công xong
            'send_to_booking_user_main_user_users_when_manager_confirm_booking' => [
                'subject' => '[ĐẶT XE] - Đã phân công xe',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Lịch đặt xe của bạn đã được xác nhận:<br/>" . $details . $noteWhenUsing . $noteAfterUsing . $commonNote;
                }
            ],
          
            // Dòng 24: Hệ thống -> Nhắc lịch trước 30 phút -> Người đặt xe
            'send_to_booking_user_before_departure' => [
                'subject' => '[ĐẶT XE] - Sắp đến giờ khởi hành',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe của bạn sẽ khởi hành trong 30 phút nữa.<br/>" . $details . $commonNote;
                }
            ],
            // Dòng 25: Hệ thống -> Nhắc lịch trước 30 phút -> Tài xế
            'send_to_driver_before_departure' => [
                'subject' => '[ĐẶT XE] - Sắp đến giờ khởi hành',
                'content' => function($currentItem) use ($additionalMessages) {
                    extract($additionalMessages);
                    $details = self::getBookingDetails($currentItem);
                    return "Chào bạn,<br/><br/>Chuyến xe được phân công cho bạn sẽ khởi hành trong 30 phút nữa.<br/>" . $details . $commonNote;
                }
            ],
        ];
    }

    public static function generateMailContent($templateKey, $id, $userIdOverrides = null, $isPriority = null) {
        if (!$id) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => [], 'employeeList' => []];
        }
        if (!isset(self::$mailTemplates[$templateKey])) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => [], 'employeeList' => []];
        }
        $query = \Booking\Query::getInstance("car_booking_requests", true);
        $query->setSelect(['*']);
        $query->setFilter(['id' => $id]);
        $currentItem = $query->exec()->fetch();
        if (empty($currentItem)) {
            return ['subject' => '', 'content' => '', 'userIds' => [], 'approvers' => [], 'priorityApprovers' => [], 'driverUser' => [], 'assignmentUser' => [], 'employeeList' => []];
        }
        $approvers = [];
        $priorityApprovers = [];
        $driverUser = [];
        $assignmentUser = [];
        $employeeList = [];
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

                foreach ($currentItem['employeeList'] as $user) {
                    $employeeList[] = str_replace('BitrixID-', '', $user['mkey']);
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
            'employeeList' => $employeeList,
            'subject' => $subject,
            'content' => call_user_func($content, $currentItem)
        ];
    }
}