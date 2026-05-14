<?php
namespace Booking;

use Bitrix\Main\Application;

class Query {
    private static $booking_requestsQuery;
    private static $booking_masterdataQuery;
    private static $booking_logQuery;

    public static function initialize() {
        Application::getInstance()->getConnectionPool()->cloneConnection('default', 'car_booking_connection', [
            'host' => DAT_PHONG_DB_HOST,
            'login' => DAT_PHONG_DB_USER,
            'password' => DAT_PHONG_DB_PASSWORD,
            'database' => DAT_PHONG_DB_NAME
        ]);
    }

    public static function getInstance($dto, $createNew = false) {
        if ($dto === "car_booking_requests") {
            if (null === self::$booking_requestsQuery || $createNew) {
                self::$booking_requestsQuery = new \Bitrix\Main\Entity\Query(\Booking\booking_requestsTable::getEntity());
            }
            return self::$booking_requestsQuery;
        } else if ($dto === "car_booking_masterdata") {
            if (null === self::$booking_masterdataQuery || $createNew) {
                self::$booking_masterdataQuery = new \Bitrix\Main\Entity\Query(\Booking\booking_masterdataTable::getEntity());
            }
            return self::$booking_masterdataQuery;
        } else if ($dto === "car_booking_log") {
            if (null === self::$booking_logQuery || $createNew) {
                self::$booking_logQuery = new \Bitrix\Main\Entity\Query(\Booking\booking_logTable::getEntity());
            }
            return self::$booking_logQuery;
        }
        return false;
    }

    public static function updateRecordsWithConditions($tableName, $conditions, $updateFields) {
        $connection = Application::getConnection("car_booking_connection");
        $sqlHelper = $connection->getSqlHelper();
        $updateSql = $sqlHelper->prepareUpdate($tableName, $updateFields);
        $conditionSql = [];
        foreach ($conditions as $field => $values) {
            $fieldConditions = [];
            if (!is_array($values)) {
                $values = [$values];
            }
            foreach ($values as $childField => $value) {
                $conditionField = $field;
                if (is_numeric($field)) {
                    $conditionField = $childField;
                }
                if (strpos($conditionField, '%') === false) {
                    $fieldConditions[] = $sqlHelper->prepareAssignment($tableName, $conditionField, $value);
                } else {
                    $fieldConditions[] = "{$sqlHelper->quote(str_replace("%", "", $conditionField))} LIKE '%{$sqlHelper->forSql($value)}%'";
                }
            }
            $conditionSql[] = '(' . implode(' OR ', $fieldConditions) . ')';
        }
        $conditionSql = implode(' AND ', $conditionSql);

        $sql = "UPDATE {$tableName} SET {$updateSql[0]} WHERE {$conditionSql}";
        $connection->queryExecute($sql, $updateSql[1]);

        return $connection->getAffectedRowsCount();
    }

    public static function insertRecord($tableName, $insertFields) {
        $connection = Application::getConnection("car_booking_connection");
        $sqlHelper = $connection->getSqlHelper();
        $insertSql = $sqlHelper->prepareInsert($tableName, $insertFields);
        $sql = "INSERT INTO {$tableName} ({$insertSql[0]}) VALUES ({$insertSql[1]})";
        $connection->queryExecute($sql, $insertSql[2]);

        return $connection->getInsertedId();
    }

    public static function getUserFullname($userId, $showEmail = false) {
        if ($userId == 0) {
            return 'SYSTEM';
        }
        $user = \CUser::GetByID($userId)->Fetch();
        $userDetail = 'DELETED USER';
        if ($user) {
            $userDetail = (!empty($user['LAST_NAME']) ? trim($user['LAST_NAME']) . ' ' : '') . $user['NAME'] . ($showEmail ? ' (' . ($user['EMAIL'] ?: '-') . ')' : '');
        }
        return $userDetail;
    }
}