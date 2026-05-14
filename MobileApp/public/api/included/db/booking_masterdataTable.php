<?php 
namespace Booking;

use Bitrix\Main\Entity\DataManager;
use Bitrix\Main\Entity\IntegerField;
use Bitrix\Main\Entity\StringField;
use Bitrix\Main\Entity\TextField;
use Bitrix\Main\Entity\BooleanField;

class booking_masterdataTable extends DataManager {
    public static function getTableName() {
        return 'car_booking_masterdata';
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
            new StringField('mtype', [
                'default_value' => ''
            ]),
            new StringField('mParentKey', [
                'default_value' => ''
            ]),
            new StringField('mkey', [
                'default_value' => ''
            ]),
            new StringField('mvalue', [
                'default_value' => ''
            ]),
            new TextField('options', [
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
            new BooleanField('isActive', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return $value == 1;
                        }
                    ];
                }
            ]),
            new BooleanField('isDeleted', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return $value == 1;
                        }
                    ];
                }
            ])
        ];
    }
}
?>