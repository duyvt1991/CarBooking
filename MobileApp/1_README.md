## Build ứng dụng

- Chạy câu lệnh sau trước khi build ứng dụng:
```sh
export NODE_OPTIONS=--openssl-legacy-provider
```
- Tạo file `.env` như sau:
```code
REACT_APP_URL=[BITRIX_URL]/datphong
REACT_APP_DEPLOY_URL=[BITRIX_URL]/ci-cd/php-react.php
DAT_PHONG_KEY_DEPLOY=[SECRET_DEPLOY_KEY]
REACT_APP_AUTHORIZATION_TOKEN=[AUTH_TOKEN_FOR_LOCALHOST]
```

- Chạy câu lện sau để build CI/CD:
```sh
npm run build
```

## Khởi tạo ứng dụng
- Truy cập vào link: `[BITRIX_URL]/workgroups/` để tạo 4 nhóm User sau:
    - **ESUHAI: Đặt phòng (Quản trị viên)** với name: `Permission [Car_Booking_Admin]`
    - **ESUHAI: Đặt phòng (Duyệt phòng)** với name: `Permission [Car_Booking_Approval]`
    - **ESUHAI: Đặt phòng (Quản lý phòng)** với name: `Permission [Car_Booking_Monitor]`
- Gán các User cần thiết vào các nhóm ở trên.
- Gọi API POST `[BITRIX_URL]/datxe/api/?action=install` với body `secret=[SECRET_INSTALL_KEY]` để khởi tạo database liên quan. Nếu thành công sẽ trả về `{"status": "success"}`. Nếu hiện màn hình đăng nhập thì cần Basic Auth với username và password là account quản trị viên Bitrix.
- Truy cập vào link: `[BITRIX_URL]/bitrix/admin/message_admin.php?lang=en` để tạo email template với:
    - Event type: `DATXE_EVENT`
    - From: `#DEFAULT_EMAIL_FROM#`
    - To: `#EMAIL_TO#`
    - Subject: `#SUBJECT#`
    - Message body: `#MESSAGE#`

## Cấu hình Cronjob
- URL: `airflow.esuhai.local`
- Cấu hình:
    - HTTP Connection = `[BITRIX_URL]/datxe/api/?action=cron&secret=[SECRET_CRON_KEY]`
    - dag_id = `'dat_xe_cron'`,
    - retry_delay = `pendulum.duration(minutes=5)`,
    - description = `"Trigger a GET request to the datxe task every 4 hours"`,
    - schedule_interval = `"0 */4 * * *"`,  # mỗi 4 tiếng
    - start_date = `pendulum.datetime(2024, 12, 11, tz="Asia/Bangkok")`,
    - catchup = `False`,
    - tags = `["bitrix", "api", "datxe"]`

## Cấu hình Build CI/CD
- URL: `https://dev.azure.com/s2adhoc/form-dat-phong/_library?itemType=SecureFiles`
- Upload secure files:
    - `.env-dev` (DEV env) và `.env-main` (PRD env) với format trong file `.env.sample`
    - `config-dev.php` (DEV env) và `config-main.php` (PRD env) với format trong file `public/api/config-sample.php`
    - Lưu ý: `[SECRET_DEPLOY_KEY]` phải đồng bộ giữa `.env-dev`, `.env-main` và `php-react.php` trong API `[BITRIX_URL]/ci-cd/php-react.php`