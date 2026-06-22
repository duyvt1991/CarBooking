<?php
namespace Booking;

use Bitrix\Main\EventManager;
use Bitrix\Main\Loader;
use Bitrix\Main\Mail\Event;


class Notification {
    public static function initialize() {
        Loader::includeModule('im');
        EventManager::getInstance()->addEventHandler('main', 'OnDatxeEvent', function($event) {
            $parameters = $event->getParameters();
            $userId = $parameters['USER_ID'];
            $message = $parameters['MESSAGE'];
            $subject = $parameters['SUBJECT'];
            $onlyMail = $parameters['ONLY_MAIL'];
        
            self::send($userId, $subject, $message, $onlyMail);
        });
    }

    private static function send($userId, $subject, $message, $onlyMail = false) {
        if (!$onlyMail) {
            $shortMessage = $message;
            try {
                $shortMessage = explode("<br/><br/>Lưu ý: Đây là thư tự động", $message)[0];
            } catch (\Exception $e) {}
            $shortMessage = strip_tags(str_replace('<br/>', "\n", $shortMessage), '<a>');
            $notifyFields = [
                "MESSAGE_TYPE" => IM_MESSAGE_SYSTEM,
                "TO_USER_ID" => $userId,
                "NOTIFY_TYPE" => IM_NOTIFY_SYSTEM,
                "NOTIFY_MODULE" => "main",
                "NOTIFY_EVENT" => "datxe_event",
                "NOTIFY_TAG" => "datxe_event|" . $userId . "|" . rand(1, 1000000),
                "NOTIFY_TITLE" => $subject,
                "NOTIFY_MESSAGE" => $shortMessage,
                "NOTIFY_MESSAGE_OUT" => $shortMessage
            ];
        
            \CIMNotify::Add($notifyFields);
        }

        $user = \CUser::GetByID($userId)->Fetch();
        if ($user && $user['EMAIL']) {
            $emailFields = [
                "EMAIL_TO" => $user['EMAIL'],
                "SUBJECT" => $subject,
                "MESSAGE" => $message
            ];
            Event::Send([
                "EVENT_NAME" => "DATXE_EVENT",
                "LID" => "s1",
                "C_FIELDS" => $emailFields,
            ]);
        }
    }
    
    public static function sendNotificationToUser($userId, $subject, $message, $onlyMail = false) {
        $event = new \Bitrix\Main\Event('main', 'OnDatxeEvent', [
            'USER_ID' => $userId,
            'SUBJECT' => $subject,
            'MESSAGE' => $message,
            'ONLY_MAIL' => $onlyMail,
        ]);
        $event->send();
    }
}