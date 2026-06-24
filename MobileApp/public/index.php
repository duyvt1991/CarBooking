<?php
// $logFile = $_SERVER["DOCUMENT_ROOT"]."/datxe/api/included/page/debug_mobile.log";
$fallbackLog = dirname(__FILE__) . "/debug_mobile_root.log";

global $scriptCompleted;
$scriptCompleted = false;

// Register shutdown function to catch fatal errors and premature exits
register_shutdown_function(function() use ($fallbackLog) {
    global $scriptCompleted;
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        $logData = "=== FATAL ERROR OCCURRED ===\n";
        $logData .= "Type: " . $error['type'] . "\n";
        $logData .= "Message: " . $error['message'] . "\n";
        $logData .= "File: " . $error['file'] . "\n";
        $logData .= "Line: " . $error['line'] . "\n";
        // @file_put_contents($logFile, $logData, FILE_APPEND);
        @file_put_contents($fallbackLog, $logData, FILE_APPEND);
    } else if (!$scriptCompleted) {
        $logData = "=== SCRIPT EXITED PREMATURELY (exit or die called) ===\n";
        // @file_put_contents($logFile, $logData, FILE_APPEND);
        @file_put_contents($fallbackLog, $logData, FILE_APPEND);
    }
});

// Register exception handler
set_exception_handler(function($exception) use ( $fallbackLog) {
    $logData = "=== UNCAUGHT EXCEPTION ===\n";
    $logData .= "Message: " . $exception->getMessage() . "\n";
    $logData .= "File: " . $exception->getFile() . "\n";
    $logData .= "Line: " . $exception->getLine() . "\n";
    $logData .= "Stack trace:\n" . $exception->getTraceAsString() . "\n";
    // @file_put_contents($logFile, $logData, FILE_APPEND);
    @file_put_contents($fallbackLog, $logData, FILE_APPEND);
});

// Log Request Info
$logData = "=== Request at " . date('Y-m-d H:i:s') . " ===\n";
$logData .= "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
$logData .= "URI: " . $_SERVER['REQUEST_URI'] . "\n";
$logData .= "GET: " . print_r($_GET, true) . "\n";
$logData .= "POST Keys: " . print_r(array_keys($_POST), true) . "\n";
$logData .= "Cookies: " . print_r($_COOKIE, true) . "\n";
$logData .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'N/A') . "\n";
// @file_put_contents($logFile, $logData, FILE_APPEND);
@file_put_contents($fallbackLog, $logData, FILE_APPEND);
// @file_put_contents($logFile, "Trace: 1 (Starting mask)\n", FILE_APPEND);
@file_put_contents($fallbackLog, "Trace: 1 (Starting mask)\n", FILE_APPEND);

// Backup entire request context to bypass Bitrix kernel REST & CSRF checks during prolog
$originalPost = $_POST;
$originalGet = $_GET;
$originalRequest = $_REQUEST;
$originalCookie = $_COOKIE;
$originalServer = $_SERVER;
$originalUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Check if request is from BitrixMobile
$isMobileApp = (strpos($originalUserAgent, 'BitrixMobile') !== false);

if ($isMobileApp) {
    // Mask request as desktop GET request to bypass Bitrix mobile-specific login redirects
    $_POST = [];
    $_GET = [];
    $_REQUEST = [];
    $_COOKIE = []; // Completely empty cookies to avoid User Agent mismatch checks
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['QUERY_STRING'] = '';
    $_SERVER['REQUEST_URI'] = '/datxe/api/index.php';
    $_SERVER['SCRIPT_NAME'] = '/datxe/api/index.php';
    $_SERVER['PHP_SELF'] = '/datxe/api/index.php';
    $_SERVER['DOCUMENT_URI'] = '/datxe/api/index.php';
    $_SERVER['SCRIPT_FILENAME'] = $_SERVER['DOCUMENT_ROOT'] . '/datxe/api/index.php';
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

// @file_put_contents($logFile, "Trace: 2 (Before prolog)\n", FILE_APPEND);
@file_put_contents($fallbackLog, "Trace: 2 (Before prolog)\n", FILE_APPEND);

define("NOT_CHECK_PERMISSIONS", true);
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

// @file_put_contents($logFile, "Trace: 3 (After prolog)\n", FILE_APPEND);
@file_put_contents($fallbackLog, "Trace: 3 (After prolog)\n", FILE_APPEND);

if ($isMobileApp) {
    // Restore entire request context
    $_POST = $originalPost;
    $_GET = $originalGet;
    $_REQUEST = $originalRequest;
    $_COOKIE = $originalCookie;
    $_SERVER = $originalServer;
}

// @file_put_contents($logFile, "Trace: 4 (After restore)\n", FILE_APPEND);
@file_put_contents($fallbackLog, "Trace: 4 (After restore)\n", FILE_APPEND);

global $USER;

$authId = $_REQUEST['AUTH_ID'] ?? $_REQUEST['auth_id'] ?? null;
$domain = $_REQUEST['DOMAIN'] ?? $_REQUEST['domain'] ?? null;

if (is_object($USER) && !$USER->IsAuthorized() && $authId && $domain) {
    $logData .= "User not authorized. Found AUTH_ID: " . substr($authId, 0, 10) . "... and Domain: " . $domain . "\n";
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
            $userId = (int)$resData['result']['ID'];
            $USER->Authorize($userId);
            $logData .= "Successfully authorized User ID: " . $userId . " via REST\n";
        } else {
            $logData .= "REST API Response did not contain User ID. Response: " . $res . "\n";
        }
    } else {
        $logData .= "REST API Verification failed. HTTP Status: " . $client->getStatus() . "\n";
    }
} else if (is_object($USER) && $USER->IsAuthorized()) {
    $logData .= "User already authorized as ID: " . $USER->GetID() . "\n";
} else {
    $logData .= "No AUTH_ID or DOMAIN provided for authorization.\n";
}

// @file_put_contents($logFile, $logData, FILE_APPEND);
@file_put_contents($fallbackLog, $logData, FILE_APPEND);

// @file_put_contents($logFile, "Trace: 5 (Before header)\n", FILE_APPEND);
@file_put_contents($fallbackLog, "Trace: 5 (Before header)\n", FILE_APPEND);

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$logDataAfter = "=== After header.php ===\n";
if (is_object($USER)) {
    $logDataAfter .= "User ID: " . ($USER->GetID() ?: '0 (Not Logged In)') . "\n";
    $logDataAfter .= "Is Authorized: " . ($USER->IsAuthorized() ? 'Yes' : 'No') . "\n";
} else {
    $logDataAfter .= "USER object is not defined\n";
}
// @file_put_contents($logFile, $logDataAfter, FILE_APPEND);
@file_put_contents($fallbackLog, $logDataAfter, FILE_APPEND);

$APPLICATION->SetTitle("Đặt xe");

// Find the CSS and JS files with the hash in their filenames
$cssFiles = glob($_SERVER["DOCUMENT_ROOT"]."/bookcarmobile/static/css/*.css");
$jsFiles = glob($_SERVER["DOCUMENT_ROOT"]."/bookcarmobile/static/js/*.js");
?>
<base href="/bookcarmobile/" />
<script>
window.BX_AUTH = {
    AUTH_ID: <?php echo json_encode($_REQUEST['AUTH_ID'] ?? $_REQUEST['auth_id'] ?? ''); ?>,
    DOMAIN: <?php echo json_encode($_REQUEST['DOMAIN'] ?? $_REQUEST['domain'] ?? ''); ?>
};
window.onerror = function(message, source, lineno, colno, error) {
    var div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.backgroundColor = 'white';
    div.style.color = 'red';
    div.style.zIndex = '999999';
    div.style.padding = '20px';
    div.style.overflow = 'auto';
    div.style.fontFamily = 'monospace';
    div.innerHTML = '<h3>JS Error Detected on Mobile:</h3>' +
        '<p><b>Message:</b> ' + message + '</p>' +
        '<p><b>Source:</b> ' + source + '</p>' +
        '<p><b>Line:</b> ' + lineno + ', <b>Col:</b> ' + colno + '</p>' +
        '<p><b>Stack:</b> ' + (error && error.stack ? error.stack.replace(/\n/g, '<br>') : 'N/A') + '</p>';
    document.body.appendChild(div);
    return false;
};
</script>
<!-- Include the CSS file -->
<?php foreach ($cssFiles as $cssFile): ?>
  <link rel="stylesheet" href="<?php echo str_replace($_SERVER["DOCUMENT_ROOT"], '', $cssFile); ?>" />
<?php endforeach; ?>
<div id="root"></div>
<!-- Include the JS file -->
<?php foreach ($jsFiles as $jsFile): ?>
  <script src="<?php echo str_replace($_SERVER["DOCUMENT_ROOT"], '', $jsFile); ?>"></script>
<?php endforeach; ?>
<?php
global $scriptCompleted;
$scriptCompleted = true;
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
?>