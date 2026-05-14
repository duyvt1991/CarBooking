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
            case "buildings":
                $object["address"] = $options["address"] ?? "";
                break;
            case "equipments":
                $object["quantity"] = $options["quantity"] ?? "";
                $object["note"] = $options["note"] ?? "";
                break;
            case "roomTypes":
                $object["approvers"] = $options["approvers"] ?? [];
                $object["equipments"] = $options["equipments"] ?? [];
                $object["size"] = $options["size"] ?? 0;
                $object["persons"] = $options["persons"] ?? 0;
                $object["color"] = $options["color"] ?? "";
                $object["hasAutoApprove"] = $options["hasAutoApprove"] ?? "0";
                break;
            case "rooms":
                $object["roomType"] = $options["roomType"] ?? "";
                $object["building"] = $options["building"] ?? "";
                $object["approvers"] = $options["approvers"] ?? [];
                $object["priorityApprovers"] = $options["priorityApprovers"] ?? [];
                $object["note"] = $options["note"] ?? "";
                $object["equipments"] = $options["equipments"] ?? [];
                $object["size"] = $options["size"] ?? 0;
                $object["persons"] = $options["persons"] ?? 0;
                $object["color"] = $options["color"] ?? "";
                break;
        }

        return $object;
    }
}
?>
