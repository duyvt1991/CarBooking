<?php 
namespace Booking;

use Bitrix\Main\Application;
use Bitrix\Main\Context;
use Bitrix\Main\Web\Json;

class Install {
    public static function execute() {
        $request = Context::getCurrent()->getRequest();
        if ($request->getPost("secret") !== DAT_PHONG_KEY_INSTALL) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }
        $connection = Application::getConnection("car_booking_connection");

        $RESET_DATA = false;
        if ($request->getPost("dropTable") && $RESET_DATA) { // TODO: Add false to prevent accidental deletion
            $connection->queryExecute("DROP TABLE IF EXISTS car_booking_masterdata");
            $connection->queryExecute("DROP TABLE IF EXISTS car_booking_requests");
            $connection->queryExecute("DROP TABLE IF EXISTS car_booking_log");
        }

        $sql = "
            CREATE TABLE IF NOT EXISTS car_booking_log (
                id INT PRIMARY KEY AUTO_INCREMENT,
                logType VARCHAR(50) DEFAULT '',
                logDate DATETIME,
                logUser TEXT NULL,
                logOldValue TEXT NULL,
                logNewValue TEXT NULL
            )
        ";
        $connection->queryExecute($sql);

        $sql = "
            CREATE TABLE IF NOT EXISTS car_booking_masterdata (
                id INT PRIMARY KEY AUTO_INCREMENT,
                mtype VARCHAR(50) DEFAULT '',
                mParentKey VARCHAR(50) DEFAULT '',
                mkey VARCHAR(50) DEFAULT '',
                mvalue VARCHAR(200) DEFAULT '',
                options TEXT NULL,
                isActive BOOLEAN DEFAULT 1,
                isDeleted BOOLEAN DEFAULT 0
            )
        ";
        $connection->queryExecute($sql);

        $sql = "
            CREATE TABLE IF NOT EXISTS car_booking_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                notificationCount INT DEFAULT 0,
                notificationDate DATETIME,
                bookingUser TEXT NULL,
                mainUser TEXT NULL,
                users TEXT NULL,
                department TEXT NULL,
                building TEXT NULL,
                room TEXT NULL,
                roomType TEXT NULL,
                createdDate DATETIME,
                startDate DATE,
                startTime TIME,
                endTime TIME,
                equipments TEXT NULL,
                size INT DEFAULT 0,
                persons INT DEFAULT 0,
                usagePurpose TEXT NULL,
                usagePurposeDetail TEXT NULL,
                usagePurposeLocale VARCHAR(10) DEFAULT '',
                clients INT DEFAULT 0,
                clientNames TEXT NULL,
                externalClients INT DEFAULT 0,
                externalClientNames TEXT NULL,
                isApproved INT DEFAULT 0,
                rejectedUsers TEXT NULL,
                rejectedReason TEXT NULL,
                rejectedDate DATETIME,
                isCancelled BOOLEAN DEFAULT 0,
                cancelledReason TEXT NULL,
                cancelledDate DATETIME,
                userReviewCleanScore INT DEFAULT 0,
                userReviewCleanComment TEXT NULL,
                userReviewEquipmentScore INT DEFAULT 0,
                userReviewEquipmentComment TEXT NULL,
                userReviewFacilityScore INT DEFAULT 0,
                userReviewFacilityComment TEXT NULL,
                managerReviewScore INT DEFAULT 0,
                managerReviewComment TEXT NULL,
                log TEXT NULL,
                isPriority INT DEFAULT 0,
                note TEXT NULL,
                departureLocation TEXT NULL,
                carLine TEXT NULL,
                driver TEXT NULL,
                employees TEXT NULL,
                flightNumber TEXT NULL,
                detailedSchedule TEXT NULL,
                serviceType TEXT NULL,
                licensePlateNumber TEXT NULL,
                driverUser TEXT NULL,
                driverPhoneNumber TEXT NULL,
                approvedUsers TEXT NULL,
                approvedDate DATETIME,
                assignmentDate DATETIME,
                assignmentUser TEXT NULL,
                driverConfirmationDate DATETIME,
                driverConfirmationUser TEXT NULL,
                driverDeclineUser TEXT NULL,
                driverDeclineReason TEXT NULL,
                driverDeclineDate DATETIME,
                userReviewScore INT DEFAULT 0,
                userReviewCommentMost TEXT NULL,
                userReviewCommentBad TEXT NULL,
                userReviewDate DATETIME,
                userReviewUser TEXT NULL,
                driverReviewScore INT DEFAULT 0,
                driverReviewCommentMost TEXT NULL,
                driverReviewCommentBad TEXT NULL,
                driverReviewCommentRequest TEXT NULL,
                driverReviewDate DATETIME,
                driverReviewUser TEXT NULL,
                managerReviewCommentMost TEXT NULL,
                managerReviewCommentBad TEXT NULL,
                managerReviewCommentRequest TEXT NULL,
                managerReviewDate DATETIME,
                managerReviewUser TEXT NULL,                
                isSyncedThirdParty INT DEFAULT 0,
                thirdPartySyncDate DATETIME


            )
        ";
        $connection->queryExecute($sql);

        $columns = $connection->query("SHOW COLUMNS FROM car_booking_requests")->fetchAll();
        $existingColumns = array_column($columns, 'Field');

        // Add column
        $newColumns = [];
        foreach ($newColumns as $column => $type) {
            if (!in_array($column, $existingColumns)) {
                $connection->queryExecute("ALTER TABLE car_booking_requests ADD COLUMN $column $type AFTER clientNames");
            }
        }

        // Modify columns
        $modifyColumns = [];
        foreach ($modifyColumns as $column => $type) {
            if (in_array($column, $existingColumns)) {
                $connection->queryExecute("ALTER TABLE car_booking_requests MODIFY COLUMN $column $type");
            }
        }

        if ($request->getPost("dropTable") && $RESET_DATA) { // TODO: Add false to prevent accidental insertion dummy data
            $masterData = [
                "version" => [ ["", "version", "1", true, Json::encode([])] ],
                "config" => [
                    ["", "maxDayToBooking", "7", true, Json::encode([])],
                    ["", "maxHourToAutoApprove", "4", true, Json::encode([])],
                    ["", "maxDayToReview", "3", true, Json::encode([])],
                    ["", "usagePurposeKeyForClient", Json::encode(["UP001", "UP002"]), true, Json::encode([])],
                    ["", "bookingAdminGroupId", "25", true, Json::encode([])],
                    ["", "bookingApprovalGroupId", "26", true, Json::encode([])],
                    ["", "bookingMonitorGroupId", "27", true, Json::encode([])],
                    ["", "bookingPriorityApprovalGroupId", "48", true, Json::encode([])],
                    ["", "bookingDriverGroupId", "28", true, Json::encode([])],
                    // ["", "buildingDefault", "", true, Json::encode([])],

                ],
                "admins" => [
                    ["", "BitrixID-468", "Võ Thanh Duy (duyvt@esuhai.com)", true, Json::encode([])],
                    ["", "BitrixID-490", "Bùi Lê Minh Anh (anhblm@esuhai.com)", true, Json::encode([])]
                ],
                "approvers" => [
                    ["", "BitrixID-468", "Võ Thanh Duy (duyvt@esuhai.com)", true, Json::encode([])],
                    ["", "BitrixID-490", "Bùi Lê Minh Anh (anhblm@esuhai.com)", true, Json::encode([])]
                ],
                "managers" => [
                    ["", "BitrixID-468", "Võ Thanh Duy (duyvt@esuhai.com)", true, Json::encode([])],
                    ["", "BitrixID-490", "Bùi Lê Minh Anh (anhblm@esuhai.com)", true, Json::encode([])]
                ],
                // "buildings" => [
                //     ["", "B001", "Building 1", true, Json::encode(["address" => "123 Lê Lợi"])],
                //     ["", "B002", "Building 2", true, Json::encode(["address" => "345 Lê Lợi"])],
                //     ["", "B003", "Building 3", true, Json::encode(["address" => "678 Lê Lợi"])]
                // ],
                "departments" => [
                    ["", "D001", "Department 1", true, Json::encode([])],
                    ["", "D002", "Department 2", true, Json::encode([])],
                    ["", "D003", "Department 3", true, Json::encode([])]
                ],
                // "equipmentTypes" => [
                //     // ["", "ET001", "Equipment Type 1", true, Json::encode([])],
                //     // ["", "ET002", "Equipment Type 2", true, Json::encode([])],
                //     // ["", "ET003", "Equipment Type 3", true, Json::encode([])]
                // ],
                // "equipments" => [
                //     // ["ET001", "E001", "Equipment 1", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET001", "E002", "Equipment 2", true, Json::encode(["quantity" => "", "note" => ""])],
                //     // ["ET001", "E003", "Equipment 3", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET002", "E004", "Equipment 4", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET002", "E005", "Equipment 5", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET002", "E006", "Equipment 6", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET001", "E007", "Equipment 7", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET001", "E008", "Equipment 8", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])],
                //     // ["ET003", "E009", "Equipment 9", true, Json::encode(["quantity" => "5", "note" => "Đang sửa 2 cái"])]
                // ],
                "usagePurposes" => [
                    ["", "UP001", "Usage Purpose 1", true, Json::encode([])],
                    ["", "UP002", "Usage Purpose 2", true, Json::encode([])],
                    ["", "UP003", "Usage Purpose 3", true, Json::encode([])]
                ],
                // "roomTypes" => [
                //     // ["", "RT001", "Room Type 1", true, Json::encode(["approvers" => ["BitrixID-54", "BitrixID-491"], "equipments" => ["E001", "E002", "E004"], "size" => 10, "persons" => 12, "color" => "#ff00e0", "hasAutoApprove" => "1"])],
                //     // ["", "RT002", "Room Type 2", true, Json::encode(["approvers" => ["BitrixID-491", "BitrixID-54"], "equipments" => ["E003", "E005", "E006"], "size" => 20, "persons" => 24, "color" => "#00fffc", "hasAutoApprove" => "0"])],
                //     // ["", "RT003", "Room Type 3", true, Json::encode(["approvers" => ["BitrixID-54", "BitrixID-491"], "equipments" => ["E007", "E008", "E009"], "size" => 30, "persons" => 36, "color" => "#ff9500", "hasAutoApprove" => "0"])]
                // ],
                // "rooms" => [
                //     // ["RT001", "R001", "Room 1", true, Json::encode(["roomType" => "RT001", "building" => 'B001',  "approvers" => ["BitrixID-471", "BitrixID-54"], "equipments" => ["E007", "E008", "E009"], "size" => 30, "persons" => 36, "color" => "#0000FF"])],
                //     // ["RT002", "R002", "Room 2", true, Json::encode(["roomType" => "RT002", "building" => 'B002', "approvers" => ["BitrixID-491", "BitrixID-471"], "equipments" => ["E003", "E005", "E006"], "size" => 20, "persons" => 24, "color" => "#00FF00"])],
                //     // ["RT003", "R003", "Room 3", false, Json::encode(["roomType" => "RT003", "building" => 'B003', "approvers" => ["BitrixID-551", "BitrixID-471"], "equipments" => ["E001", "E002", "E004"], "size" => 10, "persons" => 12, "color" => "#FF0000"])],
                //     // ["RT001", "R004", "Room 4", true, Json::encode(["roomType" => "RT001", "building" => 'B001', "approvers" => [], "equipments" => ["E001", "E002", "E004"], "size" => 10, "persons" => "", "color" => ""])],
                //     // ["RT002", "R005", "Room 5", true, Json::encode(["roomType" => "RT002", "building" => 'B002', "approvers" => ["BitrixID-551", "BitrixID-471"], "equipments" => [], "size" => "", "persons" => 20, "color" => ""])],
                //     // ["RT003", "R006", "Room 6", false, Json::encode(["roomType" => "RT003", "building" => 'B003', "approvers" => ["BitrixID-491", "BitrixID-551"], "equipments" => ["E001", "E002", "E004"], "size" => "", "persons" => "", "color" => "#FF0000"])],
                //     // ["RT002", "R007", "Room 7", true, Json::encode(["roomType" => "RT002", "building" => 'B001', "approvers" => ["BitrixID-471", "BitrixID-491"], "equipments" => ["E003", "E005", "E006"], "size" => 20, "persons" => 24, "color" => "#00FF00"])]
                // ],
                "drivers" => [
                    ["", "BitrixID-468", "Võ Thanh Duy (duyvt@esuhai.com)", true, Json::encode(["driverPhoneNumber" => "0909090909"])],
                    ["", "BitrixID-490", "Bùi Lê Minh Anh (anhblm@esuhai.com)", true, Json::encode(["driverPhoneNumber" => "0909090901"])]
                ],
                "serviceTypes" => [
                    ["", "ST001", "Xe nội bộ", true, Json::encode([])],
                    ["", "ST002", "Xe ngoài", true, Json::encode([])]
                ]
            ];
            
            foreach ($masterData as $type => $data) {
                foreach ($data as $item) {
                    $parentKey = isset($item[0]) ? $item[0] : "";
                    $key = isset($item[1]) ? $item[1] : "";
                    $value = isset($item[2]) ? $item[2] : "";
                    $isActive = isset($item[3]) ? ($item[3] ? 1 : 0) : 1;
                    $options = isset($item[4]) ? $item[4] : Json::encode([]);

                    $sql = "
                        INSERT INTO car_booking_masterdata (mtype, mParentKey, mkey, mvalue, options, isActive)
                        VALUES ('$type', '$parentKey', '$key', '$value', '$options', $isActive)
                    ";
                    $connection->queryExecute($sql);
                }
            }
           
        }

        return ['status' => 'success', 'message' => 'Table created and mock data inserted successfully'];
    }


    // public static function setupDeployFB20250812() {
    //     $request = Context::getCurrent()->getRequest();
    //     if ($request->getPost("secret") !== DAT_PHONG_KEY_INSTALL) {
    //         return ['status' => 'error', 'message' => 'Unauthorized'];
    //     }
    //     $connection = Application::getConnection("car_booking_connection");
    //     // Insert new record buildingDefault in booking_master_data
    //     $sql = "SELECT COUNT(*) AS count FROM car_booking_masterdata WHERE mkey = 'buildingDefault'";
    //     $result = $connection->query($sql);
    //     $row = $result->fetch();
    //     if ($row['count'] == 0) {
    //         // If the record does not exist, insert it
    //         $sql = "INSERT INTO car_booking_masterdata (mtype, mParentKey, mkey, mvalue, options, isActive)
    //                 VALUES ('config', '', 'buildingDefault', '', '[]', 1)";
    //         $connection->queryExecute($sql);
    //     }

    //     return ['status' => 'success', 'message' => 'Deploy FB20250812 data setup successfully'];
    // }

    // public static function setupDeployFB20260520() {
    //     $request = Context::getCurrent()->getRequest();
    //     if ($request->getPost("secret") !== DAT_PHONG_KEY_INSTALL) {
    //         return ['status' => 'error', 'message' => 'Unauthorized'];
    //     }
    //     $connection = Application::getConnection("car_booking_connection");

    //      // Insert new record bookingDriverGroupId in booking_master_data
    //     $sql = "SELECT COUNT(*) AS count FROM car_booking_masterdata WHERE mkey = 'bookingDriverGroupId'";
    //     $result = $connection->query($sql);
    //     $row = $result->fetch();
    //     if ($row['count'] == 0) {
    //         // If the record does not exist, insert it
    //         $sql = "INSERT INTO car_booking_masterdata (mtype, mParentKey, mkey, mvalue, options, isActive)
    //                 VALUES ('config', '', 'bookingDriverGroupId', '28', '[]', 1)";
    //         $connection->queryExecute($sql);
    //     }


    //     $columns = $connection->query("SHOW COLUMNS FROM car_booking_requests")->fetchAll();
    //     $existingColumns = array_column($columns, 'Field');

    //     // Add column
    //     $newColumns = [
    //         'isPriority' => 'INT DEFAULT 0',
    //         'note' => "TEXT NULL"
    //     ];
    //     foreach ($newColumns as $column => $type) {
    //         if (!in_array($column, $existingColumns)) {
    //             $connection->queryExecute("ALTER TABLE car_booking_requests ADD COLUMN $column $type AFTER id");
    //         }
    //     }

    //     return ['status' => 'success', 'message' => 'Priority approval data setup successfully'];
    // }
}