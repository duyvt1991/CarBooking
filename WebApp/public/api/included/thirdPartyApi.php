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
        
        // Map dữ liệu truyền vào theo đúng chuẩn API
        $postData = [
            "name" => $bookingData['name'] ?? "",
            "phone" => $bookingData['phone'] ?? "",
            "pickup" => $bookingData['pickup'] ?? "",
            "dropoff" => $bookingData['dropoff'] ?? "",
            "travel_time" => $bookingData['travel_time'] ?? "" // VD: 2023-12-30T10:00
        ];

        // Thực hiện POST request (Bitrix sẽ tự động convert mảng JSON nếu body là JSON string)
        $response = $httpClient->post($url, Json::encode($postData));
        
        // Kiểm tra kết quả
        if ($response !== false) {
            $statusCode = $httpClient->getStatus();
            if ($statusCode >= 200 && $statusCode < 300) {
                try {
                    // Trả về mảng dữ liệu đã parse từ response
                    return Json::decode($response);
                } catch (\Throwable $th) {
                    return $response;
                }
            }
            // Ghi log nếu lỗi HTTP Status Code
            // \Bitrix\Main\Diag\Debug::writeToFile($httpClient->getError(), "API_ERROR");
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
        // Đảm bảo hằng số đã được define trong config.php
        if (!defined('DAT_XE_MOBILE_URL') || !defined('DAT_XE_MOBILE_TOKEN')) {
            // Có thể ghi log lỗi thiếu config ở đây
            return false;
        }

        $mtype = $item['mtype'] ?? '';
        if (!in_array($mtype, ['drivers', 'rooms'])) {
            return false;
        }

        // Xác định action cho API dựa vào mtype (giả định)
        $action = 'syncMasterData';

        // Tạo URL với query params
        $url = DAT_XE_MOBILE_URL . '?token=' . urlencode(DAT_XE_MOBILE_TOKEN) . '&action=' . $action;
        
        $httpClient = new HttpClient();
        $httpClient->setHeader('Content-Type', 'application/json');
        
        // "Làm phẳng" dữ liệu, gộp options ra ngoài
        $options = [];
        if (!empty($item['options'])) {
            try {
                $options = is_string($item['options']) ? Json::decode($item['options']) : (array)$item['options'];
            } catch (\Throwable $th) {}
        }
        $itemData = array_merge($item, $options);
        unset($itemData['options']);

        // Map dữ liệu để gửi đi (cần tùy chỉnh theo API của bên thứ 3)
        $postData = [
            "type" => $itemData['mtype'],
            "key" => $itemData['mkey'],
            "value" => $itemData['mvalue'],
            "parentKey" => $itemData['mParentKey'] ?? null,
            "isActive" => (bool)$itemData['isActive'],
            "isDeleted" => (bool)$itemData['isDeleted'],
            "attributes" => [ // Gửi các options dưới dạng attributes
                'phone' => $itemData['driverPhoneNumber'] ?? null,
                'licensePlate' => $itemData['licensePlateNumber'] ?? null,
                'capacity' => (int)($itemData['persons'] ?? 0),
                'color' => $itemData['color'] ?? null,
                'isServiceCar' => (bool)($itemData['hasServiceCar'] ?? false),
            ]
        ];

        $response = $httpClient->post($url, Json::encode($postData));
        
        if ($response !== false) {
            $statusCode = $httpClient->getStatus();
            return ($statusCode >= 200 && $statusCode < 300);
        }
        
        return false;
    }

    /**
     * Insert or Update master data (drivers, rooms)
     * 
     * @param string $mtype 'drivers' hoặc 'rooms'
     * @param string $mkey Mã duy nhất (ví dụ mã tài xế, mã phòng)
     * @param string $mvalue Tên hiển thị (Tên tài xế, tên xe)
     * @param array $newOptions Mảng các options (VD: ['driverPhoneNumber' => '090...'] hoặc ['licensePlateNumber' => '51A...'])
     * @param string $mParentKey Mã cha (dùng cho room để link tới roomType, nếu có)
     * @return int|bool ID của bản ghi hoặc false nếu lỗi
     */
    public static function syncMasterData($mtype, $mkey, $mvalue, $newOptions = [], $mParentKey = "") {
        if (!in_array($mtype, ['drivers', 'rooms'])) {
            return false;
        }

        $query = \Booking\Query::getInstance("car_booking_masterdata", true);
        $query->setSelect(['*']);
        $query->setFilter(['mtype' => $mtype, 'mkey' => $mkey]);
        $existingItem = $query->exec()->fetch();

        $options = $newOptions;
        $options['isSync'] = 1; // Đánh dấu là đã đồng bộ

        if ($existingItem) {
            // Tồn tại -> Update
            $existingOptions = [];
            if (!empty($existingItem['options'])) {
                try {
                    $existingOptions = is_string($existingItem['options']) ? Json::decode($existingItem['options']) : (array)$existingItem['options'];
                } catch (\Throwable $th) {}
            }
            
            // Merge options để không mất dữ liệu cũ
            $mergedOptions = array_merge($existingOptions, $options);
            
            $updateData = ['mvalue' => $mvalue, 'options' => Json::encode($mergedOptions), 'isDeleted' => 0];
            if ($mParentKey !== "") {
                $updateData['mParentKey'] = $mParentKey;
            }

            \Booking\Query::updateRecordsWithConditions('car_booking_masterdata', ['id' => $existingItem['id']], $updateData);
            return $existingItem['id'];
        } else {
            // Không tồn tại -> Insert
            $insertData = ['mtype' => $mtype, 'mkey' => $mkey, 'mvalue' => $mvalue, 'mParentKey' => $mParentKey, 'options' => Json::encode($options), 'isActive' => 1, 'isDeleted' => 0];
            return \Booking\Query::insertRecord('car_booking_masterdata', $insertData);
        }
    }
}
