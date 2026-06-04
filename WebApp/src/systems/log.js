import { routes } from "./constant";

export const logMasterDataTypeMapping = {
    admins: routes.adminList.label,
    approvers: routes.approverList.label,
    managers: routes.managerList.label,
    config: routes.config.label,
    buildings: routes.buildingList.label,
    departments: routes.departmentList.label,
    equipmentTypes: routes.equipmentTypeList.label,
    equipments: routes.equipmentList.label,
    usagePurposes: routes.usagePurposeList.label,
    roomTypes: routes.roomTypeList.label,
    rooms: routes.roomList.label,
    carLines: routes.carLineList.label,
    drivers: routes.driverList.label,
}

export const logMasterDataKeyMapping = (mtype, key) => {
    switch (mtype) {
        case "admins":
            switch (key) {
                case "mkey":
                    return "Esuhai User ID";
                case "mvalue":
                    return "Esuhai User Name";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "approvers":
            switch (key) {
                case "mkey":
                    return "Esuhai User ID";
                case "mvalue":
                    return "Esuhai User Name";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "priorityApprovers":
            switch (key) {
                case "mkey":
                    return "Esuhai User ID";
                case "mvalue":
                    return "Esuhai User Name";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "managers":
            switch (key) {
                case "mkey":
                    return "Esuhai User ID";
                case "mvalue":
                    return "Esuhai User Name";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "config":
            switch (key) {
                case "maxDayToBooking":
                    return "Không được đặt xe quá (ngày)";
                case "maxHourToAutoApprove":
                    return "Tự động duyệt khi dưới (giờ)";
                case "maxDayToReview":
                    return "Thời gian đánh giá không quá (ngày)";
                case "usagePurposeKeyForClient":
                    return "Mã phân loại cho tiếp khách";
                case "buildingDefault":
                    return "Tòa nhà mặc định";
                case "bookingAdminGroupId":
                    return "Workgroup ID của quản trị viên";
                case "bookingApprovalGroupId":
                    return "Workgroup ID của người duyệt";
                case "bookingMonitorGroupId":
                    return "Workgroup ID của người quản lý xe";
                case "isDeleted":
                    return "Đã xoá";
                 case "bookingDriverGroupId":
                    return "Workgroup ID của tài xế";
                default:
                    return key.toUpperCase();
            }
        case "buildings":
            switch (key) {
                case "mkey":
                    return "Mã chi nhánh";
                case "mvalue":
                    return "Tên chi nhánh";
                case "address":
                    return "Địa chỉ";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "departments":
            switch (key) {
                case "mkey":
                    return "Mã phòng ban";
                case "mvalue":
                    return "Tên phòng ban";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "equipmentTypes":
            switch (key) {
                case "mkey":
                    return "Mã loại thiết bị";
                case "mvalue":
                    return "Tên loại thiết bị";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "equipments":
            switch (key) {
                case "mkey":
                    return "Mã thiết bị";
                case "mvalue":
                    return "Tên thiết bị";
                case "mParentKey":
                    return "Loại thiết bị";
                case "quantity":
                    return "Số lượng";
                case "note":
                    return "Trạng thái";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "usagePurposes":
            switch (key) {
                case "mkey":
                    return "Mã phân loại khách";
                case "mvalue":
                    return "Tên phân loại khách";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "roomTypes":
            switch (key) {
                case "mkey":
                    return "Mã loại phòng";
                case "mvalue":
                    return "Tên loại phòng";
                case "approvers":
                    return "Người phê duyệt";
                case "equipments":
                    return "Thiết bị";
                case "size":
                    return "Mẫu xe";
                case "persons":
                    return "Sức chứa";
                case "color":
                    return "Màu đại diện";
                case "hasAutoApprove":
                    return "Tự động duyệt";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "rooms":
            switch (key) {
                case "mkey":
                    return "Mã phòng";
                case "mvalue":
                    return "Tên phòng";
                case "mParentKey":
                case "roomType":
                    return "Mã loại phòng";
                case "building":
                    return "Chi nhánh";
                case "approvers":
                    return "Người phê duyệt";
                case "priorityApprovers":
                    return "Người phê duyệt ưu tiên";
                case "note":
                    return "Ghi chú";
                case "equipments":
                    return "Thiết bị";
                case "size":
                    return "Mẫu xe";
                case "persons":
                    return "Sức chứa";
                case "color":
                    return "Màu đại diện";
                case "hasAutoApprove":
                    return "Tự động duyệt";
                case "isActive":
                    return "Đang mở khoá";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        case "booking":
            switch (key) {
                case "note":
                    return "Ghi chú";
                case "building":
                    return "Chi nhánh";
                case "roomType":
                    return "Loại phòng";
                case "createdDate":
                    return "Ngày tạo";
                case "approvedDate":
                    return "Ngày duyệt";
                case "rejectedDate":
                    return "Ngày từ chối";
                case "cancelledDate":
                    return "Ngày huỷ";
                case "approvedUsers":
                    return "Người duyệt";
                case "rejectedUsers":
                    return "Người từ chối";
                case "size":
                    return "Mẫu xe";
                case "persons":
                    return "Sức chứa";
                case "room":
                    return "Phòng";
                case "department":
                    return "Phòng ban";
                case "mainUser":
                    return "Người sử dụng";
                case "users":
                    return "Tên nhân viên tham gia";
                case "startDate":
                    return "Ngày sử dụng";
                case "startTime":
                    return "Bắt đầu lúc";
                case "endTime":
                    return "Kết thúc lúc";
                case "usagePurpose":
                    return "Phân loại khách";
                case "usagePurposeLocale":
                    return "Quốc gia";
                case "usagePurposeDetail":
                    return "Mục đích chuyến đi";
                case "clients":
                    return "Số lượng khách";
                case "clientNames":
                    return "Tên khách";
                case "externalClients":
                    return "Khách bên ngoài";
                case "externalClientNames":
                    return "Phân loại khách ngoài";
                case "isPriority":
                    return "Ưu tiên";
                case "isCancelled":
                    return "Đã huỷ";
                case "cancelledReason":
                    return "Lý do huỷ";
                case "rejectedReason":
                    return "Lý do từ chối";
                case "isApproved":
                    return "Duyệt & phân công (0: chưa duyệt, 1: đã duyệt , 2: chờ tài xế xác nhận, 3: tài xế đã xác nhận, -1: từ chối, -2: tài xế từ chối)";
                case "equipments":
                    return "Thiết bị";
                default:
                    return key.toUpperCase();
            }
         case "carLines":
            switch (key) {
                case "mkey":
                    return "Mã dòng xe";
                case "mvalue":
                    return "Tên dòng xe";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
         case "drivers":
            switch (key) {
                case "mkey":
                    return "Esuhai User ID";
                case "mvalue":
                    return "Esuhai User Name";
                case "phonenumber":
                    return "Số điện thoại";
                case "isDeleted":
                    return "Đã xoá";
                default:
                    return key.toUpperCase();
            }
        default:
            return key.toUpperCase();
    }
}
