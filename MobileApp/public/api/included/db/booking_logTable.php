<?php 
namespace Booking;

use Bitrix\Main\Entity\DataManager;
use Bitrix\Main\Entity\IntegerField;
use Bitrix\Main\Entity\StringField;
use Bitrix\Main\Entity\TextField;
use Bitrix\Main\Entity\BooleanField;
use Bitrix\Main\Entity\DateTimeField;
use Bitrix\Main\Type\DateTime;

class booking_logTable extends DataManager {
    public static function getTableName() {
        return 'car_booking_log';
    }

    public static function getConnectionName() {
        return 'car_booking_connection';
    }

    public static function getMap() {
        return [
            new IntegerField('id', [
                'primary' => true,
                'autocomplete' => true
            ]),
            new StringField('logType', [
                'default_value' => ''
            ]),
            new DateTimeField('logDate', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            if ($value instanceof DateTime) {
                                return $value->format('Y-m-d H:i:s');
                            }
                            return $value;
                        }
                    ];
                }
            ]),
            new TextField('logUser', [
                'default_value' => [],
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            if (empty($value)) return [];
                            try {
                                return json_decode($value, true) ?: [];
                            } catch (\Throwable $th) {
                                return [];
                            }
                        }
                    ];
                }
            ]),
            new TextField('logOldValue', [
                'default_value' => [],
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            if (empty($value)) return [];
                            try {
                                return json_decode($value, true) ?: [];
                            } catch (\Throwable $th) {
                                return [];
                            }
                        }
                    ];
                }
            ]),
            new TextField('logNewValue', [
                'default_value' => [],
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            if (empty($value)) return [];
                            try {
                                return json_decode($value, true) ?: [];
                            } catch (\Throwable $th) {
                                return [];
                            }
                        }
                    ];
                }
            ])
        ];
    }
}
?>