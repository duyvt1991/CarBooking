<?php
namespace Booking;

use Bitrix\Main\Web\HttpClient;
use Bitrix\Main\Web\Json;

class ThirdPartyApi {
    public static function initialize() {
        // This can be used for event handlers or other setup tasks in the future.
    }
    
    public static function createBooking($bookingData) {
        // Đảm bảo hằng số đã được define trong config.php
        if (!defined('DAT_XE_MOBILE_URL') || !defined('DAT_XE_MOBILE_TOKEN')) {
            return false;
        }

        // Tạo URL với query params
        $url = DAT_XE_MOBILE_URL . '?token=' . urlencode(DAT_XE_MOBILE_TOKEN) . '&action=createBooking';
        
        // Khởi tạo Http Client của Bitrix
        $httpClient = new HttpClient();
        $httpClient->setHeader('Content-Type', 'application/json');
        $httpClient->setRedirect(false); // Không tự động chuyển hướng để tránh gửi POST sang Google User Content

        // Helper để decode an array or string safely
        $parseJsonField = function ($field) {
            if (empty($field)) {
                return [];
            }
            if (is_array($field)) {
                return $field;
            }
            if (is_string($field)) {
                try {
                    return json_decode($field, true) ?: [];
                } catch (\Throwable $th) {
                    return [];
                }
            }
            return [];
        };

        // 1. Pickup: Điểm xuất phát
        $pickup = '';
        if (isset($bookingData['departureLocation'])) {
            $depLoc = $parseJsonField($bookingData['departureLocation']);
            if (!empty($depLoc)) {
                $pickup = implode(', ', $depLoc);
            } else if (is_string($bookingData['departureLocation'])) {
                $pickup = $bookingData['departureLocation'];
            }
        }

        // 2. Car Type: Loại xe
        $roomType = $parseJsonField($bookingData['roomType'] ?? []);
        $carType = $roomType['mvalue'] ?? '';

        // 3. Suggested Car: Dòng xe đề xuất
        $carLine = $parseJsonField($bookingData['carLine'] ?? []);
        $suggestedCar = $carLine['mvalue'] ?? '';

        // 4. Suggested Driver: Tài xế đề xuất
        $driver = $parseJsonField($bookingData['driver'] ?? []);
        $suggestedDriver = $driver['mvalue'] ?? '';

        // 5. User: Người sử dụng
        $mainUser = $parseJsonField($bookingData['mainUser'] ?? []);
        $user = $mainUser['mvalue'] ?? '';

        // 6. Department: Phòng ban
        $departmentData = $parseJsonField($bookingData['department'] ?? []);
        $department = $departmentData['mvalue'] ?? '';

        // 7. Classification: Phân loại khách
        $usagePurpose = $parseJsonField($bookingData['usagePurpose'] ?? []);
        $classification = $usagePurpose['mvalue'] ?? '';

        // 8. Customer Name: Tên khách
        $customerName = '';
        if (isset($bookingData['clientNames'])) {
            $clientsArr = $parseJsonField($bookingData['clientNames']);
            if (!empty($clientsArr)) {
                $customerName = implode(', ', $clientsArr);
            } else if (is_string($bookingData['clientNames'])) {
                $customerName = $bookingData['clientNames'];
            }
        }

        // 9. Service Type: Loại dịch vụ
        $serviceType = $parseJsonField($bookingData['serviceType'] ?? []);
        $serviceTypeCode = $serviceType['mkey'] ?? '';

        // 10. Assigned Car: Xe phân công
        $room = $parseJsonField($bookingData['room'] ?? []);
        $assignedCarCode = $room['mkey'] ?? '';
        $assignedPlate = $bookingData['licensePlateNumber'] ?? ($room['licensePlateNumber'] ?? '');

        // 11. Assigned Driver: Tài xế phân công
        $driverUser = $parseJsonField($bookingData['driverUser'] ?? []);
        $assignedDriverCode = $driverUser['mkey'] ?? '';

        // 12. Status String
        $isCancelled = $bookingData['isCancelled'] ?? 0;
        $isApproved = isset($bookingData['isApproved']) ? (int)$bookingData['isApproved'] : 0;
        $statusStr = 'Chờ duyệt';
        if ($isCancelled) {
            $statusStr = 'Đã huỷ';
        } else {
            switch ($isApproved) {
                case -1:
                    $statusStr = 'Từ chối';
                    break;
                case -2:
                    $statusStr = 'Tài xế từ chối';
                    break;
                case 1:
                    $statusStr = 'Đã duyệt';
                    break;
                case 2:
                    $statusStr = 'Đã phân công'; // Chờ tài xế xác nhận
                    break;
                case 3:
                    $statusStr = 'Tài xế đã xác nhận';
                    break;
                case 4:
                    $statusStr = 'Hoàn thành';
                    break;
                case 0:
                default:
                    $statusStr = 'Chờ duyệt';
                    break;
            }
        }

        // Đóng gói payload gửi sang Apps Script
        $postData = [
            "id"                => $bookingData['id'] ?? "",
            "pickup"            => $pickup,
            "carType"           => $carType,
            "suggestedCar"      => $suggestedCar,
            "suggestedDriver"   => $suggestedDriver,
            "date"              => $bookingData['startDate'] ?? "",
            "startTime"         => $bookingData['startTime'] ?? "",
            "endTime"           => $bookingData['endTime'] ?? "",
            "user"              => $user,
            "department"        => $department,
            "classification"    => $classification,
            "customerName"      => $customerName,
            "customerCount"     => $bookingData['clients'] ?? "",
            "staffParticipants" => $bookingData['employees'] ?? "",
            "flightNumber"      => $bookingData['flightNumber'] ?? "",
            "purpose"           => $bookingData['usagePurposeDetail'] ?? "",
            "detailedItinerary" => $bookingData['detailedSchedule'] ?? "",
            "note"              => $bookingData['note'] ?? "",
            "serviceType"       => $serviceTypeCode,
            "assignedCarCode"   => $assignedCarCode,
            "assignedPlate"     => $assignedPlate,
            "assignedDriverCode" => $assignedDriverCode,
            "driverPhone"       => $bookingData['driverPhoneNumber'] ?? "",
            "isDeleted"         => (int)$isCancelled,
            "rejectReason"      => $bookingData['rejectedReason'] ?? $bookingData['cancelledReason'] ?? "",
            "status"            => $statusStr
        ];

        // Thực hiện POST request
        $response = $httpClient->post($url, Json::encode($postData));
        
        $logFile = dirname(__FILE__) . '/page/debug_sync.log';
        if ($response === false) {
            @file_put_contents($logFile, "  HttpClient error: " . print_r($httpClient->getError(), true) . "\n", FILE_APPEND);
        } else {
            $statusCode = $httpClient->getStatus();
            @file_put_contents($logFile, "  HttpClient Initial Status Code: " . $statusCode . "\n", FILE_APPEND);
            
            // Xử lý chuyển hướng thủ công bằng GET nếu trả về 302
            if ($statusCode == 302) {
                $redirectUrl = $httpClient->getHeaders()->get('Location');
                @file_put_contents($logFile, "  Redirect URL found: " . $redirectUrl . "\n", FILE_APPEND);
                if (!empty($redirectUrl)) {
                    $newClient = new HttpClient();
                    $redirectResponse = $newClient->get($redirectUrl);
                    if ($redirectResponse !== false) {
                        $redirectStatusCode = $newClient->getStatus();
                        @file_put_contents($logFile, "  Redirect Response Status Code: " . $redirectStatusCode . "\n", FILE_APPEND);
                        @file_put_contents($logFile, "  Redirect Response: " . substr($redirectResponse, 0, 500) . "\n", FILE_APPEND);
                        if ($redirectStatusCode >= 200 && $redirectStatusCode < 300) {
                            try {
                                return Json::decode($redirectResponse);
                            } catch (\Throwable $th) {
                                return $redirectResponse;
                            }
                        }
                    }
                }
            } else if ($statusCode >= 200 && $statusCode < 300) {
                @file_put_contents($logFile, "  HttpClient Raw Response: " . substr($response, 0, 500) . "\n", FILE_APPEND);
                try {
                    return Json::decode($response);
                } catch (\Throwable $th) {
                    return $response;
                }
            }
        }
        
        return false;
    }

    /**
     * Đồng bộ một item master data (driver hoặc room) sang hệ thống thứ 3.
     * Hàm này sẽ được gọi từ cron job.
     *
     * @param array $item Dữ liệu của master data item (một dòng từ bảng car_booking_masterdata)
     * @return bool True nếu đồng bộ thành công, False nếu thất bại.
     */
    public static function syncMasterDataItem($item) {
        if (!defined('DAT_XE_MOBILE_URL') || !defined('DAT_XE_MOBILE_TOKEN')) {
            return false;
        }
        $mtype = $item['mtype'] ?? '';
        $apiType = '';
        if ($mtype === 'drivers') {
            $apiType = 'driver';
        } elseif ($mtype === 'rooms') {
            $apiType = 'car';
        // } elseif ($mtype === 'serviceTypes') { 
        //     $apiType = 'service';
        } else {
            return false;
        }
        
        $action = 'upsertMasterData';
        $url = DAT_XE_MOBILE_URL . '?token=' . urlencode(DAT_XE_MOBILE_TOKEN) . '&action=' . $action;
        $httpClient = new HttpClient();
        $httpClient->setHeader('Content-Type', 'application/json');
        
        $options = [];
        if (!empty($item['options'])) {
            try {
                $options = is_string($item['options']) ? Json::decode($item['options']) : (array)$item['options'];
            } catch (\Throwable $th) {}
        }
        $itemData = array_merge($item, $options);
        $dataPayload = [];
        
        switch ($apiType) {
            case 'driver':
                $email = $itemData['email'] ?? '';
                $userName = $itemData['mvalue'] ?? '';
                // Tách email từ định dạng "Tên Tài xế (email@domain.com)"
                if (empty($email) && !empty($userName)) {
                    if (preg_match('/^(.*?)\s*\(([^)]+)\)$/', $userName, $matches)) {
                        $potentialEmail = trim($matches[2]);
                        if (filter_var($potentialEmail, FILTER_VALIDATE_EMAIL)) {
                            $email = $potentialEmail;
                            $userName = trim($matches[1]);
                        }
                    }
                }
                $dataPayload = [
                    "userId"    => $itemData['mkey'] ?? '',              
                    "userName"  => $userName,                            
                    "email"     => $email,                               
                    "phone"     => $itemData['driverPhoneNumber'] ?? ''    
                ];
                break;

            case 'car':
                $dataPayload = [
                    "carCode"      => $itemData['mkey'] ?? '',           
                    "carName"      => $itemData['mvalue'] ?? '',         
                    "licensePlate" => $itemData['licensePlateNumber'] ?? '', 
                    "capacity"     => $itemData['persons'] ?? '',        
                    "isExternal"   => (int)($itemData['hasServiceCar'] ?? 0), 
                    // Kết hợp cả Active và Deleted để xác định trạng thái thực tế
                    "status"       => (int)(!($itemData['isDeleted'] ?? false) && ($itemData['isActive'] ?? 1)) 
                ];
                break;

            // case 'service':
            //     $dataPayload = [
            //         "serviceCode" => $itemData['mkey'] ?? '',            
            //         "serviceName" => $itemData['mvalue'] ?? '',          
            //         "status"      => (int)(!($itemData['isDeleted'] ?? false) && ($itemData['isActive'] ?? 1)) 
            //     ];
            //     break;
        }

        $postData = [
            "type" => $apiType,
            "data" => $dataPayload
        ];

        $response = $httpClient->post($url, Json::encode($postData));
        if ($response !== false) {
            $statusCode = $httpClient->getStatus();
            return ($statusCode >= 200 && $statusCode < 300);
        }
        return false;
    }

}
