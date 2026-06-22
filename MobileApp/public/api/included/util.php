<?php
namespace Booking;

use Bitrix\Main\Context;
use Bitrix\Main\Web\Json;

class Util {
    public static function sendJsonResponse($data) {
        $response = Context::getCurrent()->getResponse();
        $response->addHeader("Content-Type", "application/json");
        $response->flush(Json::encode($data));
    }

    public static function convertMasterDataItemToObject($type, $item) {
        $object = [
            "mParentKey" => $item[0] ?? "",
            "mkey" => $item[1] ?? "",
            "mvalue" => $item[2] ?? "",
            "isActive" => $item[3] ?? 1
        ];

        $options = [];
        try {
            $decodedOptions = json_decode($item[4], true);
            if (is_array($decodedOptions)) {
                $options = $decodedOptions;
            }
        } catch (Exception $e) {
            // Log lỗi nếu cần thiết
        }

        $object = array_merge($object, self::setDefaultValueIfNullMasterDataItem($type, $options));

        return $object;
    }

    public static function setDefaultValueIfNullMasterDataItem($type, $options) {
        $object = [];
        switch ($type) {
            case "roomTypes":
                $object["persons"] = $options["persons"] ?? 0;
                $object["color"] = $options["color"] ?? "";
                break;
            case "rooms":
                $object["roomType"] = $options["roomType"] ?? "";
                $object["note"] = $options["note"] ?? "";
                $object["persons"] = $options["persons"] ?? 0;
                $object["color"] = $options["color"] ?? "";
                $object["licensePlateNumber"] = $options["licensePlateNumber"] ?? "";
                $object["hasServiceCar"] = $options["hasServiceCar"] ?? 0;
                $object["isSync"] = $options["isSync"] ?? 0;
                break;
            case "drivers":
                $object["driverPhoneNumber"] = $options["driverPhoneNumber"] ?? "";
                $object["isSync"] = $options["isSync"] ?? 0;
                break;
        }

        return $object;
    }
}
?>
