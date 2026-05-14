<?
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

$secret = 'your_secret_key';
$allow_path = ['phapche', 'datphong', 'datxe'];

// Check if a file was uploaded
if (isset($_FILES['file']) && isset($_POST['path']) && in_array($_POST['path'], $allow_path) && isset($_POST['secret']) && $_POST['secret'] === $secret) {
    $uploadDir = $_SERVER["DOCUMENT_ROOT"]."/".$_POST['path']."/";
    $uploadFile = $uploadDir . basename($_FILES['file']['name']);

    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
        // Delete all files and folders in $uploadDir except the uploaded file and current file
        $files = array_diff(scandir($uploadDir), ['.', '..', basename($uploadFile)]);
        foreach ($files as $file) {
            $filePath = $uploadDir . $file;
            if (is_dir($filePath)) {
                // Recursively delete directory
                $it = new RecursiveDirectoryIterator($filePath, RecursiveDirectoryIterator::SKIP_DOTS);
                $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
                foreach($files as $file) {
                    if ($file->isDir()){
                        rmdir($file->getRealPath());
                    } else {
                        unlink($file->getRealPath());
                    }
                }
                rmdir($filePath);
            } else {
                unlink($filePath);
            }
        }

        // Extract the uploaded file into $uploadDir
        $zip = new ZipArchive;
        if ($zip->open($uploadFile) === TRUE) {
            $zip->extractTo($uploadDir);
            $zip->close();
            unlink($uploadFile);
            echo json_encode(['status' => 'success', 'message' => 'File uploaded and extracted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to extract the file']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File upload failed']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Bad request']);
}