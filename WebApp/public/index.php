<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Đặt xe");

// Find the CSS and JS files with the hash in their filenames
$cssFiles = glob($_SERVER["DOCUMENT_ROOT"]."/datxe/static/css/*.css");
$jsFiles = glob($_SERVER["DOCUMENT_ROOT"]."/datxe/static/js/*.js");
?>
<base href="/datxe/" />
<!-- Include the CSS file -->
<?php foreach ($cssFiles as $cssFile): ?>
  <link rel="stylesheet" href="<?php echo str_replace($_SERVER["DOCUMENT_ROOT"], '', $cssFile); ?>" />
<?php endforeach; ?>
<div id="root"></div>
<!-- Include the JS file -->
<?php foreach ($jsFiles as $jsFile): ?>
  <script src="<?php echo str_replace($_SERVER["DOCUMENT_ROOT"], '', $jsFile); ?>"></script>
<?php endforeach; ?>
<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
?>