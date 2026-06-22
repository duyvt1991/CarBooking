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

// Backup entire request context to bypass Bitrix kernel REST & CSRF checks during prolog
$originalCookie = $_COOKIE;
$originalServer = $_SERVER;
$originalUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Check if request is from BitrixMobile
$isMobileApp = (strpos($originalUserAgent, 'BitrixMobile') !== false);

if ($isMobileApp) {
    // Mask request cookies and user agent to bypass Bitrix mobile-specific login redirects,
    // while keeping $_GET/$_POST intact so that Bitrix Request Context is initialized correctly.
    $_COOKIE = []; // Completely empty cookies to avoid User Agent mismatch checks
    $_SERVER['HTTP_USER_AGENT'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Strip custom HTTP headers (such as X-Requested-With, Origin, Referer)
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            if (!in_array($key, ['HTTP_HOST', 'HTTP_USER_AGENT', 'HTTP_ACCEPT', 'HTTP_ACCEPT_LANGUAGE', 'HTTP_ACCEPT_ENCODING', 'HTTP_CONNECTION', 'HTTP_UPGRADE_INSECURE_REQUESTS'])) {
                unset($_SERVER[$key]);
            }
        }
    }
}

require_once dirname(__FILE__) . '/config.php';

if ($isMobileApp && !defined("NOT_CHECK_PERMISSIONS")) {
    define("NOT_CHECK_PERMISSIONS", true);
}

require_once $_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php";

if ($isMobileApp) {
    // Restore original cookies and server variables
    $_COOKIE = $originalCookie;
    $_SERVER = $originalServer;
}

global $USER;
if (is_object($USER) && !$USER->IsAuthorized()) {
    $authId = $_REQUEST['auth'] ?? $_REQUEST['AUTH_ID'] ?? $_REQUEST['auth_id'] ?? null;
    $domain = $_REQUEST['DOMAIN'] ?? $_REQUEST['domain'] ?? 'bitrix.esuhai.org';
    if ($authId && $domain) {
        $restUrl = "https://" . $domain . "/rest/user.current?auth=" . urlencode($authId);
        $client = new \Bitrix\Main\Web\HttpClient([
            'socketTimeout' => 5,
            'streamTimeout' => 5,
            'disableSslVerification' => true
        ]);
        $res = $client->get($restUrl);
        if ($res) {
            $resData = json_decode($res, true);
            if (isset($resData['result']['ID'])) {
                $USER->Authorize((int)$resData['result']['ID']);
            }
        }
    }
}

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