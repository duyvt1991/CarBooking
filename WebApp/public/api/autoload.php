<?php
if($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
    }
    header('Access-Control-Allow-Credentials: true'); 
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("HTTP/1.1 200 OK");
    die();
}
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
} 
header('Access-Control-Allow-Credentials: true'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if (isset($_GET['action']) && $_GET['action'] == "cron") {
    define("NO_KEEP_STATISTIC", true);
    define("NOT_CHECK_PERMISSIONS", true);
    define("BX_CRONTAB", true);
}

require_once dirname(__FILE__) . '/config.php';
require_once $_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php";

function require_all_files($dir) {
    foreach (glob($dir . '/*.php') as $filename) {
        require_once $filename;
    }
    foreach (glob($dir . '/*', GLOB_ONLYDIR) as $subdir) {
        require_all_files($subdir);
    }
}

require_all_files(dirname(__FILE__) . '/included');

\Booking\Query::initialize();
\Booking\Notification::initialize();
\Booking\MailTemplate::initialize();
\Booking\ThirdPartyApi::initialize();