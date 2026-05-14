<?php 
namespace Booking;

use Bitrix\Main\Entity\DataManager;
use Bitrix\Main\Entity\IntegerField;
use Bitrix\Main\Entity\TextField;
use Bitrix\Main\Entity\StringField;
use Bitrix\Main\Entity\DateTimeField;
use Bitrix\Main\Entity\DateField;
use Bitrix\Main\Entity\BooleanField;
use Bitrix\Main\Type\DateTime;
use Bitrix\Main\Type\Date;

class booking_requestsTable extends DataManager {
    public static function getTableName() {
        return 'car_booking_requests';
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
            new TextField('note', [
                'default_value' => ''
            ]),
            new IntegerField('isPriority', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ], [
                'default_value' => 0
            ]),
            new IntegerField('notificationCount', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new DateTimeField('notificationDate', [
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
            new TextField('bookingUser', [
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
            new TextField('mainUser', [
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
            new TextField('users', [
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
            new TextField('department', [
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
            new TextField('building', [
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
            new TextField('room', [
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
            new TextField('roomType', [
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
            new DateTimeField('createdDate', [
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
            new DateField('startDate', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            if ($value instanceof Date) {
                                return $value->format('Y-m-d');
                            }
                            return $value;
                        }
                    ];
                }
            ]),
            new StringField('startTime'),
            new StringField('endTime'),
            new TextField('equipments', [
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
            new IntegerField('size', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new IntegerField('persons', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('usagePurpose', [
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
            new TextField('usagePurposeDetail', [
                'default_value' => ''
            ]),
            new StringField('usagePurposeLocale', [
                'default_value' => ''
            ]),
            new IntegerField('clients', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('clientNames', [
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
            new IntegerField('externalClients', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('externalClientNames', [
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
            new IntegerField('isApproved', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ], [
                'default_value' => 0
            ]),
            new TextField('approvedUsers', [
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
            new DateTimeField('approvedDate', [
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
            new TextField('rejectedUsers', [
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
            new TextField('rejectedReason', [
                'default_value' => ''
            ]),
            new DateTimeField('rejectedDate', [
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
            new BooleanField('isCancelled', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return $value ? 1 : 0;
                        }
                    ];
                }
            ]),
            new TextField('cancelledReason', [
                'default_value' => ''
            ]),
            new DateTimeField('cancelledDate', [
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
            new IntegerField('userReviewCleanScore', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('userReviewCleanComment', [
                'default_value' => ''
            ]),
            new IntegerField('userReviewEquipmentScore', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('userReviewEquipmentComment', [
                'default_value' => ''
            ]),
            new TextField('userReviewCleanComment', [
                'default_value' => ''
            ]),
            new IntegerField('userReviewFacilityScore', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('userReviewFacilityComment', [
                'default_value' => ''
            ]),
            new IntegerField('managerReviewScore', [
                'fetch_data_modification' => function() {
                    return [
                        function ($value) {
                            return is_numeric($value) ? $value * 1 : $value;
                        }
                    ];
                }
            ]),
            new TextField('managerReviewComment', [
                'default_value' => ''
            ]),
            new TextField('log', [
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