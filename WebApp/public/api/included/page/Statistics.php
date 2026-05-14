<?php
namespace Booking\Page;

use Bitrix\Main\Application;
use Bitrix\Main\Entity\Query;
use Bitrix\Main\Context;

class Statistics {
    public static function getStatistics() {
        global $USER;
        $request = Context::getCurrent()->getRequest();
        extract($request->getPostList()->toArray());
        $component = $component ?? '';
        $query = \Booking\Query::getInstance("car_booking_requests");
        $query->setSelect(['*']);
        $bookings = $query->exec()->fetchAll();

        switch ($component) {
            case 'reportGuestCount':
                $usagePurposeCounts = [];
                $localeCounts = ['vn' => 0, 'jp' => 0];
                
                foreach ($bookings as $booking) {
                    $purposeKey = $booking['usagePurpose']['mkey'];
                    $locale = $booking['usagePurposeLocale'];
                    $clients = $booking['clients'];
                    
                    if (!isset($usagePurposeCounts[$purposeKey])) {
                        $usagePurposeCounts[$purposeKey] = ['vn' => 0, 'jp' => 0];
                    }
                    
                    $usagePurposeCounts[$purposeKey][$locale] += $clients;
                    $localeCounts[$locale] += $clients;
                }
                
                return ['usagePurposeCounts' => $usagePurposeCounts, 'localeCounts' => $localeCounts];
                break;
            case 'reportUsedCount':
                $usagePurposeCounts = [];
                $localeCounts = ['vn' => 0, 'jp' => 0];
                
                foreach ($bookings as $booking) {
                    $purposeKey = $booking['usagePurpose']['mkey'];
                    $locale = $booking['usagePurposeLocale'];
                    
                    if (!isset($usagePurposeCounts[$purposeKey])) {
                        $usagePurposeCounts[$purposeKey] = ['vn' => 0, 'jp' => 0];
                    }
                    
                    $usagePurposeCounts[$purposeKey][$locale]++;
                    $localeCounts[$locale]++;
                }
                
                return ['usagePurposeCounts' => $usagePurposeCounts, 'localeCounts' => $localeCounts];
                break;
            case 'reportCapacity':
                $queryMasterData = \Booking\Query::getInstance("car_booking_masterdata");
                $queryMasterData->setSelect(['*']);
                $queryMasterData->setFilter(['mtype' => 'rooms']);
                $rooms = $queryMasterData->exec()->fetchAll();
                foreach ($rooms as &$room) {
                    if (isset($room['options'])) {
                        $room = array_merge($room, $room['options']);
                        unset($room['options']);
                    }
                }
                $buildingCapacities = [];
                $totalCapacities = [];
                
                foreach ($rooms as $room) {
                    $buildingKey = $room['building'];
                    $roomTypeKey = $room['roomType'];
                    $persons = $room['persons'] ?: 0;
                    
                    if (!isset($buildingCapacities[$buildingKey])) {
                        $buildingCapacities[$buildingKey] = [];
                    }
                    
                    if (!isset($buildingCapacities[$buildingKey][$roomTypeKey])) {
                        $buildingCapacities[$buildingKey][$roomTypeKey] = 0;
                    }
                    
                    if (!isset($totalCapacities[$roomTypeKey])) {
                        $totalCapacities[$roomTypeKey] = 0;
                    }
                    
                    $buildingCapacities[$buildingKey][$roomTypeKey] += $persons;
                    $totalCapacities[$roomTypeKey] += $persons;
                }
                
                return ['buildingCapacities' => $buildingCapacities, 'totalCapacities' => $totalCapacities];
                break;
            case 'reportUsageDemand':
                $usageDemand = [];
                
                foreach ($bookings as $booking) {
                    $departmentKey = $booking['department']['mkey'];
                    
                    if (!isset($usageDemand[$departmentKey])) {
                        $usageDemand[$departmentKey] = 0;
                    }
                    
                    $usageDemand[$departmentKey]++;
                }
                
                return $usageDemand;
                break;
            case 'reportUserReview':
                $cleanScore = ['score1' => 0, 'score2' => 0, 'score3' => 0, 'score4' => 0, 'score5' => 0];
                $equipmentScore = ['score1' => 0, 'score2' => 0, 'score3' => 0, 'score4' => 0, 'score5' => 0];
                $facilityScore = ['score1' => 0, 'score2' => 0, 'score3' => 0, 'score4' => 0, 'score5' => 0];
                
                foreach ($bookings as $booking) {
                    $userReviewCleanScore = $booking['userReviewCleanScore'];
                    $userReviewEquipmentScore = $booking['userReviewEquipmentScore'];
                    $userReviewFacilityScore = $booking['userReviewFacilityScore'];
                    
                    if ($userReviewCleanScore >= 1 && $userReviewCleanScore <= 5) {
                        $cleanScore['score'.$userReviewCleanScore]++;
                    }
                    
                    if ($userReviewEquipmentScore >= 1 && $userReviewEquipmentScore <= 5) {
                        $equipmentScore['score'.$userReviewEquipmentScore]++;
                    }

                    if ($userReviewFacilityScore >= 1 && $userReviewFacilityScore <= 5) {
                        $facilityScore['score'.$userReviewFacilityScore]++;
                    }
                }

                return ['cleanScore' => $cleanScore, 'equipmentScore' => $equipmentScore, 'facilityScore' => $facilityScore];
                break;
            case 'reportManagerReview':
                $managerReviewScores = ['score1' => 0, 'score2' => 0, 'score3' => 0, 'score4' => 0, 'score5' => 0];
                
                foreach ($bookings as $booking) {
                    $managerReviewScore = $booking['managerReviewScore'];
                    
                    if ($managerReviewScore >= 1 && $managerReviewScore <= 5) {
                        $managerReviewScores['score'.$managerReviewScore]++;
                    }
                }
                
                return $managerReviewScores;
                break;
        }

        return $query->exec()->fetchAll();
    }
}