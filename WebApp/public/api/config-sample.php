<?php
require_once $_SERVER["DOCUMENT_ROOT"]."/bitrix/php_interface/dbconn.php";
define('DAT_PHONG_ENDPOINT', "https://bitrix.esuhai.org/datphong");
define('DAT_PHONG_AZURE_TENANT_ID', '');
define('DAT_PHONG_AZURE_CLIENT_ID', '');
define('DAT_PHONG_AZURE_SECRET_KEY', '');
define('DAT_PHONG_KEY_CRON', '');
define('DAT_PHONG_KEY_INSTALL', '');
define('DAT_PHONG_DB_NAME', 's2config');
define('DAT_PHONG_DB_USER', $DBLogin);
define('DAT_PHONG_DB_PASSWORD', $DBPassword);
define('DAT_PHONG_DB_HOST', $DBHost);
define('DAT_PHONG_DB_TYPE', $DBType);
define('DAT_XE_MOBILE_URL', "");

