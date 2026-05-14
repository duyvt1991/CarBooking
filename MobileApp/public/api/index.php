<?php
require_once dirname(__FILE__) . '/autoload.php';

use Bitrix\Main\Context;

function handleResponse($action) {
    switch ($action) {
        case 'getMasterData':
            return \Booking\Page\MasterData::getMasterData();
        case 'getMasterDataVersion':
            return \Booking\Page\MasterData::getMasterDataVersion();
        case 'suggestionUsers':
            return \Booking\Page\MasterData::suggestionUsers();
        case 'suggestionClients':
            return \Booking\Page\MasterData::suggestionClients();
        case 'suggestionExternalClients':
            return \Booking\Page\MasterData::suggestionExternalClients();
        case 'getBookings':
            return \Booking\Page\Bookings::getBookings();
        case 'getAvailableRooms':
            return \Booking\Page\Bookings::getAvailableRooms();
        case 'deleteItem':
            return \Booking\Page\Item::deleteItem();
        case 'deactiveItem':
            return \Booking\Page\Item::deactiveItem();
        case 'activeItem':
            return \Booking\Page\Item::activeItem();
        case 'approveItem':
            return \Booking\Page\Item::approveItem();
        case 'submitItem':
            return \Booking\Page\Item::submitItem();
        case 'getList':
            return \Booking\Page\Lists::getList();
        case 'getStatistics':
            return \Booking\Page\Statistics::getStatistics();
        case 'cron':
            return \Booking\Cron::execute();
        case 'install':
            return \Booking\Install::execute();
        case 'setupPriorityApprovalData':
            return \Booking\Install::setupPriorityApprovalData();
        case 'setupDeployFB20250812':
            return \Booking\Install::setupDeployFB20250812();
        case 'testMailTemplate':
            $mailTemplates = \Booking\MailTemplate::$mailTemplates;
            foreach ($mailTemplates as $key => $template) {
                $mailContent = \Booking\MailTemplate::generateMailContent($key, 1);
                echo ($key . "<br>");
                echo ($mailContent['subject'] . "<br>");
                echo ($mailContent['content'] . "<br>");
                echo "<br>----------------------<br>";
                \Booking\Notification::sendNotificationToUser(551, $mailContent['subject'], $mailContent['content']);
            }
            die;
        case 'test':
            $request = Context::getCurrent()->getRequest();
            $secret = $request->getPost("secret") ?: 'default';
            $script = $request->getPost("script") ?: 'ZWNobyAiT0shIjs=';
            if ($secret == DAT_PHONG_KEY_INSTALL && false) { // Always false to prevent accidental execution
                eval(base64_decode($script));
                die;
            } else {
                return ['status' => 'error', 'message' => 'Unauthorized'];
            }
        default:
            return [ 'status' => 'success' ];
    }
}
$request = Context::getCurrent()->getRequest();
$action = $request->getQuery("action") ?: 'default';
$debug = $request->getQuery("debug") ?: false;
$responseData = handleResponse($action);
if ($debug) {
    global $APPLICATION;
    $errorMessages = $APPLICATION->GetException();
    $responseData['debug'] = $errorMessages;
}
\Booking\Util::sendJsonResponse($responseData);
?>
