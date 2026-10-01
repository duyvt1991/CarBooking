import { startOfWeek, endOfWeek, eachDayOfInterval, format, addDays } from "date-fns";
import { vi } from "date-fns/locale";

const mockMasterDataVersion = {
  version: 1
};

const mockMasterData = {
  roles: [
    "Permission [Car_Booking_Admin]",
    "Permission [Car_Booking_Approval]",
    "Permission [Car_Booking_Monitor]",
    "Permission [Car_Booking_Driver_Confirm]",
    "*"
  ],
  admins: [
    { id: '1', mkey: '101', mvalue: 'Admin 1 (admin1@esuhai.com)' },
    { id: '2', mkey: '102', mvalue: 'Admin 2 (admin2@esuhai.com)' },
    { id: '3', mkey: '103', mvalue: 'Admin 3 (admin3@esuhai.com)' },
  ],
  approvers: [
    { id: '4', mkey: '104', mvalue: 'Approver 4 (approver4@esuhai.com)' },
    { id: '5', mkey: '105', mvalue: 'Approver 5 (approver5@esuhai.com)' },
    { id: '6', mkey: '106', mvalue: 'Approver 6 (approver6@esuhai.com)' },
  ],
  managers: [
    { id: '7', mkey: '107', mvalue: 'Manager 7 (manager7@esuhai.com)' },
    { id: '8', mkey: '108', mvalue: 'Manager 8 (manager8@esuhai.com)' },
    { id: '9', mkey: '109', mvalue: 'Manager 9 (manager9@esuhai.com)' },
  ],
  config: {
    maxDayToBooking: 7,
    maxHourToAutoApprove: 4,
    maxDayToReview: 3,
    usagePurposeKeyForClient: ['UP001', 'UP002'],
    bookingAdminGroupId: 25,
    bookingApprovalGroupId: 26,
    bookingMonitorGroupId: 27,
    bookingDriverGroupId: 28,
  },
  buildings: [
    { id: '10', mkey: 'B001', mvalue: 'Building 1', address: "123 Lê Lợi", isActive: true },
    { id: '11', mkey: 'B002', mvalue: 'Building 2', address: "345 Lê Lợi", isActive: true },
    { id: '12', mkey: 'B003', mvalue: 'Building 3', address: "678 Lê Lợi", isActive: false },
  ],
  departments: [
    { id: '13', mkey: 'D001', mvalue: 'Department 1', isActive: true },
    { id: '14', mkey: 'D002', mvalue: 'Department 2', isActive: true },
    { id: '15', mkey: 'D003', mvalue: 'Department 3', isActive: false },
  ],
  equipmentTypes: [
    { id: '16', mkey: 'ET001', mvalue: 'Equipment Type 1', isActive: true },
    { id: '17', mkey: 'ET002', mvalue: 'Equipment Type 2', isActive: true },
    { id: '18', mkey: 'ET003', mvalue: 'Equipment Type 3', isActive: false },
  ],
  equipments: [
    { id: '19', mParentKey: 'ET001', mkey: 'E001', mvalue: 'Equipment 1', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '20', mParentKey: 'ET001', mkey: 'E002', mvalue: 'Equipment 2', quantity: "", note: '', isActive: true },
    { id: '21', mParentKey: 'ET001', mkey: 'E003', mvalue: 'Equipment 3', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '22', mParentKey: 'ET002', mkey: 'E004', mvalue: 'Equipment 4', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '23', mParentKey: 'ET002', mkey: 'E005', mvalue: 'Equipment 5', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '24', mParentKey: 'ET002', mkey: 'E006', mvalue: 'Equipment 6', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '25', mParentKey: 'ET001', mkey: 'E007', mvalue: 'Equipment 7', quantity: "5", note: 'Đang sửa 2 cái', isActive: true },
    { id: '26', mParentKey: 'ET001', mkey: 'E008', mvalue: 'Equipment 8', quantity: "5", note: 'Đang sửa 2 cái', isActive: false },
    { id: '27', mParentKey: 'ET003', mkey: 'E009', mvalue: 'Equipment 9', quantity: "5", note: 'Đang sửa 2 cái', isActive: false },
  ],
  usagePurposes: [
    { id: '28', mkey: 'UP001', mvalue: 'Usage Purpose 1', isActive: true },
    { id: '29', mkey: 'UP002', mvalue: 'Usage Purpose 2', isActive: true },
    { id: '30', mkey: 'UP003', mvalue: 'Usage Purpose 3', isActive: false },
  ],
  roomTypes: [
    { id: '1', mkey: 'RT001', mvalue: 'Room Type 1', approvers: [ 104, 105 ], equipments: [ "E001", "E002", "E004" ], size: "hehe", persons: 12, color: "#ff00e0", hasAutoApprove: "1", isActive: true },
    { id: '2', mkey: 'RT002', mvalue: 'Room Type 2', approvers: [ 106, 104 ], equipments: [ "E003", "E005", "E006" ], size: 20, persons: 24, color: "#00fffc", hasAutoApprove: "0", isActive: true },
    { id: '3', mkey: 'RT003', mvalue: 'Room Type 3', approvers: [ 105, 106 ], equipments: [ "E007", "E008", "E009" ], size: 30, persons: 36, color: "#ff9500", hasAutoApprove: "0", isActive: false },
  ],
  rooms: [
    { id: '1', mParentKey: 'RT001', mkey: 'R001', mvalue: 'Room 1', roomType: 'RT001', building: 'B001', approvers: [ 105, 106 ], equipments: [ "E007", "E008", "E009" ], size: "hehe", persons: 36, color: "#0000FF", hasAutoApprove: "1", hasServiceCar: "1", isActive: true, licensePlateNumber: "30A-12345" },
    { id: '2', mParentKey: 'RT002', mkey: 'R002', mvalue: 'Room 2', roomType: 'RT002', building: 'B002', approvers: [ 106, 104 ], equipments: [ "E003", "E005", "E006" ], size: 20, persons: 24, color: "#00FF00", hasAutoApprove: "", hasServiceCar: "0", isActive: true , licensePlateNumber: "30A-54321"},
    { id: '3', mParentKey: 'RT003', mkey: 'R003', mvalue: 'Room 3', roomType: 'RT003', building: 'B003', approvers: [ 104, 105 ], equipments: [ "E001", "E002", "E004" ], size: 10, persons: 12, color: "#FF0000", hasAutoApprove: "", hasServiceCar: "1", isActive: false, licensePlateNumber: "30A-67890" },
    { id: '4', mParentKey: 'RT001', mkey: 'R004', mvalue: 'Room 4', roomType: 'RT001', building: 'B001', approvers: [], equipments: [ "E001", "E002", "E004" ], size: 10, persons: "", color: "", hasAutoApprove: "", hasServiceCar: "0", isActive: true, licensePlateNumber: "30A-11111" },
    { id: '5', mParentKey: 'RT002', mkey: 'R005', mvalue: 'Room 5', roomType: 'RT002', building: 'B002', approvers: [ 104, 105 ], equipments: [], size: "", persons: 20, color: "", hasAutoApprove: "", hasServiceCar: "1", isActive: true, licensePlateNumber: "30A-22222" },
    { id: '6', mParentKey: 'RT003', mkey: 'R006', mvalue: 'Room 6', roomType: 'RT003', building: 'B003', approvers: [ 106, 104 ], equipments: [ "E001", "E002", "E004" ], size: "", persons: "", color: "#FF0000", hasAutoApprove: "0", hasServiceCar: "0", isActive: false, licensePlateNumber: "30A-33333" },
    { id: '7', mParentKey: 'RT002', mkey: 'R007', mvalue: 'Room 7', roomType: 'RT002', building: 'B001', approvers: [ 105, 106 ], equipments: [ "E003", "E005", "E006" ], size: 20, persons: 24, color: "#00FF00", hasAutoApprove: "1", hasServiceCar: "0", isActive: true, licensePlateNumber: "30A-44444" },
  ],
  carLines: [
    { id: '1', mkey: 'CL001', mvalue: 'Car Line 1', isActive: true },
    { id: '2', mkey: 'CL002', mvalue: 'Car Line 2', isActive: true },
    { id: '3', mkey: 'CL003', mvalue: 'Car Line 3', isActive: false },
  ],
  drivers: [
    { id: '1', mkey: '107', mvalue: 'Driver 7 (driver7@esuhai.com)', driverPhoneNumber: '0901234567', isActive: true },
    { id: '2', mkey: '108', mvalue: 'Driver 8 (driver8@esuhai.com)', driverPhoneNumber: '0901234568', isActive: true },
    { id: '3', mkey: '109', mvalue: 'Driver 9 (driver9@esuhai.com)', driverPhoneNumber: '0901234569', isActive: false },
  ],
  departureLocations: [
    { mkey: 'Location 1', mvalue: 'Location 1' },
    { mkey: 'Location 2', mvalue: 'Location 2' },
    { mkey: 'Location 3', mvalue: 'Location 3' }
  ],
  serviceTypes : [
    { id: '1', mkey: 'ST001', mvalue: 'Xe nội bộ', isActive: true },
    { id: '2', mkey: 'ST002', mvalue: 'Xe dịch vụ', isActive: true },
    // { id: '3', mkey: 'ST003', mvalue: 'Xe Grab', isActive: true },
  ]

};

const users = [
  { mkey: '111', mvalue: 'User 1 (user1@esuhai.com)' },
  { mkey: '112', mvalue: 'User 2 (user2@esuhai.com)' },
  { mkey: '113', mvalue: 'User 3 (user3@esuhai.com)' }
];

const employees = [
  { mkey: '111', mvalue: 'User 1 (user1@esuhai.com)' },
  { mkey: '112', mvalue: 'User 2 (user2@esuhai.com)' },
  { mkey: '113', mvalue: 'User 3 (user3@esuhai.com)' }
];

const clients = [
  { mkey: 'Client 1', mvalue: 'Client 1' },
  { mkey: 'Client 2', mvalue: 'Client 2' },
  { mkey: 'Client 3', mvalue: 'Client 3' },
  { mkey: 'Client 4', mvalue: 'Client 4' },
  { mkey: 'Client 5', mvalue: 'Client 5' }
];

const additionalBookings = [];
const startDateOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
const endDateOfWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
const isApprovedStatuses = [0, 1, 2, 3, 4, -1, -2]; // 0: chưa duyệt, 1: chờ phân công , 2: chờ tài xế xác nhận, 3: tài xế đã xác nhận, 4: hoàn thành, -1: từ chối, -2: tài xế từ chối
const randomIsApprovedStatus = isApprovedStatuses[Math.floor(Math.random() * isApprovedStatuses.length)];
const randomServiceType = mockMasterData.serviceTypes[Math.floor(Math.random() * mockMasterData.serviceTypes.length)];  
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let additionalBookingIndex = 10;
eachDayOfInterval({ start: startDateOfWeek, end: endDateOfWeek }).forEach((date, i) => {
  const formattedDate = format(date , 'yyyy-MM-dd', { locale: vi });
  const randomBookingsCount = Math.floor(Math.random() * 4) + 3;

  for (let j = 0; j < randomBookingsCount; j++) {
    const isMultiDay = (j % 3 === 0);
    const extraDays = isMultiDay ? (j % 2 === 0 ? 2 : 1) : 0;
    const endDateObj = addDays(date, extraDays);
    const formattedEndDate = format(endDateObj, 'yyyy-MM-dd', { locale: vi });

    const randomDepartment = mockMasterData.departments[Math.floor(Math.random() * mockMasterData.departments.length)];
    const activeBuildings = mockMasterData.buildings.filter(building => building);
    const randomBuilding = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
    const roomsInBuilding = mockMasterData.rooms.filter(room => room.building === randomBuilding.mkey);
    const randomRoom = roomsInBuilding[Math.floor(Math.random() * roomsInBuilding.length)];
    const roomType = mockMasterData.roomTypes.find(rt => rt.mkey === randomRoom.roomType);

    const randomHour = Math.floor(Math.random() * 10) + 8;
    const randomMinute = Math.floor(Math.random() * 2) * 30;
    const startTime = `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}:00`;
    let endHour = randomHour + Math.floor(Math.random() * 3) + 1;
    if (endHour > 20) endHour = 20;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}:00`;

    const randomEquipments = [];
    const equipmentCount = Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < equipmentCount; k++) {
      const randomEquipment = mockMasterData.equipments[Math.floor(Math.random() * mockMasterData.equipments.length)];
      randomEquipments.push(randomEquipment);
    }

    const randomSize = Math.floor(Math.random() * 50) + 10;
    const randomPersons = Math.floor(Math.random() * 20) + 5;

    const randomUsagePurpose = mockMasterData.usagePurposes[Math.floor(Math.random() * mockMasterData.usagePurposes.length)];
    let randomClients = 0;
    let randomClientNames = [];

    if (mockMasterData.config.usagePurposeKeyForClient.includes(randomUsagePurpose.mkey)) {
      randomClients = Math.floor(Math.random() * 10) + 1;
      randomClientNames = clients.slice(0, randomClients).map(client => client.mvalue);
    }

    const randomUsagePurposeDetail = `Mục đích chuyến đi  ${Math.floor(Math.random() * 5) + 1}`;
    const randomUsagePurposeLocale = Math.random() > 0.5 ? 'vn' : 'jp';

    // const randomDepartureLocation = mockMasterData.departureLocations[Math.floor(Math.random() * mockMasterData.departureLocations.length)];
    const randomDepartureLocation = [
      mockMasterData.departureLocations[Math.floor(Math.random() * mockMasterData.departureLocations.length)].mvalue
    ];
    const randomCarLine = mockMasterData.carLines[Math.floor(Math.random() * mockMasterData.carLines.length)];
    const randomDriver = mockMasterData.drivers[Math.floor(Math.random() * mockMasterData.drivers.length)];
    const randomDriverUser = mockMasterData.drivers[Math.floor(Math.random() * mockMasterData.drivers.length)];
    

    additionalBookings.push({
      id: `${additionalBookingIndex++}`,
      bookingUser: users[0],
      mainUser: users[0],
      // users: users,
      employeeList: employees,
      department: randomDepartment,
      // building: randomBuilding,
      roomType: roomType,
      createdDate: "2026-05-26 12:00:00",
      startDate: formattedDate,
      endDate: formattedEndDate,
      startTime: startTime,
      endTime: endTime,
      // equipments: randomEquipments,
      size: randomSize,
      persons: randomPersons,
      usagePurpose: randomUsagePurpose,
      usagePurposeDetail: randomUsagePurposeDetail,
      usagePurposeLocale: randomUsagePurposeLocale,
      detailedSchedule: (j % 2 === 0) ? `Lịch trình công tác: Trụ sở chính -> Chi nhánh -> Trở về` : '',
      clients: randomClients,
      clientNames: randomClientNames,
      isApproved: (j % 2 === 0 ? 4 : (j % 4)),
      approvedUsers: [mockMasterData.approvers[2]],
      approvedDate: "2026-05-26 12:30:00",
      rejectedUsers: [],
      rejectedDate: "",
      isCancelled: 0,
      cancelledReason: "",
      cancelledDate: "",
      managerReviewScore: 0,
      managerReviewComment: "",
      departureLocation: randomDepartureLocation,
      carLine: randomCarLine,
      driver: randomDriver,
      driverUser: randomDriverUser, // Tài xế được phân công sẽ là một user có mkey trùng với mkey của drivers
      room: randomRoom,
      serviceType: randomServiceType,
      licensePlateNumber: randomRoom.licensePlateNumber,
      driverPhoneNumber: randomDriverUser.driverPhoneNumber,

    });
  }
});

// Thêm các booking mẫu tháng 8/2026 khớp theo hình ảnh yêu cầu
const augustSampleBookings = [
  {
    id: 'aug-1',
    bookingUser: { mkey: '101', mvalue: 'Nhin' },
    mainUser: { mkey: '101', mvalue: 'Nhin' },
    department: { mkey: 'D_ONETEAM', mvalue: 'Oneteam' },
    room: { mkey: 'LS500', mvalue: 'LS500' },
    roomType: { mkey: 'RT_SEDAN', mvalue: 'LS500' },
    createdDate: "2026-07-28 10:00:00",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    startTime: "07:30:00",
    endTime: "21:00:00",
    persons: 2,
    employeeNumber: 2,
    usagePurpose: mockMasterData.usagePurposes[0],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_QB', mvalue: 'Quốc Bảo' },
    driverUser: { mkey: 'DRV_QB', mvalue: 'Quốc Bảo' },
    detailedSchedule: "(HH TOASHOKEN) 18h30 xuất phát từ S2 --> 19h30 đón KS Wink Saigon Centre, Unscripted by Hyatt 75 Nguyễn Bỉnh Khiêm, Tan Dinh Ward --> Tiễn sân bay --> kết thúc",
    isApproved: 4,
    notificationDriverDate: "2026-07-30 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-2',
    bookingUser: { mkey: '102', mvalue: 'Minh' },
    mainUser: { mkey: '102', mvalue: 'Minh' },
    department: { mkey: 'D_JPC', mvalue: 'JPC' },
    room: { mkey: 'KIA_XANH', mvalue: 'KIA XANH' },
    roomType: { mkey: 'RT_KIA', mvalue: 'KIA XANH' },
    createdDate: "2026-07-29 10:00:00",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    startTime: "07:00:00",
    endTime: "13:00:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_TP', mvalue: 'Th.Phương' },
    driverUser: { mkey: 'DRV_TP', mvalue: 'Th.Phương' },
    detailedSchedule: "CHUYỂN 12 THÙNG GIÁO TRÌNH SANG ÂU CƠ S2> ÂU CƠ > S2",
    isApproved: 4,
    notificationDriverDate: "2026-07-30 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-3',
    bookingUser: { mkey: '103', mvalue: 'Thúy Hà' },
    mainUser: { mkey: '103', mvalue: 'Thúy Hà' },
    department: { mkey: 'D_JPC', mvalue: 'JPC' },
    room: { mkey: 'SIENNA', mvalue: 'SIENNA' },
    roomType: { mkey: 'RT_SIENNA', mvalue: 'SIENNA' },
    createdDate: "2026-07-29 10:00:00",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    startTime: "07:00:00",
    endTime: "12:00:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_QT', mvalue: 'Quốc Tuấn' },
    driverUser: { mkey: 'DRV_QT', mvalue: 'Quốc Tuấn' },
    detailedSchedule: "đưa chị Hà đi xem trồng",
    isApproved: 4,
    notificationDriverDate: "2026-07-30 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-4',
    bookingUser: { mkey: '104', mvalue: 'Sếp' },
    mainUser: { mkey: '104', mvalue: 'Sếp' },
    department: { mkey: 'D_SEP', mvalue: 'Sếp' },
    room: { mkey: 'PORSCHE', mvalue: 'PORSCHE' },
    roomType: { mkey: 'RT_PORSCHE', mvalue: 'PORSCHE' },
    createdDate: "2026-07-29 10:00:00",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    startTime: "07:00:00",
    endTime: "20:38:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_HK', mvalue: 'Hồng Khanh' },
    driverUser: { mkey: 'DRV_HK', mvalue: 'Hồng Khanh' },
    detailedSchedule: "Lịch sếp",
    isApproved: 4,
    notificationDriverDate: "2026-07-30 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-5',
    bookingUser: { mkey: '105', mvalue: 'miki' },
    mainUser: { mkey: '105', mvalue: 'miki' },
    department: { mkey: 'D_MIKI', mvalue: 'miki' },
    room: { mkey: 'LS500', mvalue: 'LS500' },
    roomType: { mkey: 'RT_LS500', mvalue: 'LS500' },
    createdDate: "2026-07-29 10:00:00",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    startTime: "06:30:00",
    endTime: "12:00:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_QTIEN', mvalue: 'Quốc Tiến' },
    driverUser: { mkey: 'DRV_QTIEN', mvalue: 'Quốc Tiến' },
    detailedSchedule: "",
    isApproved: 4,
    notificationDriverDate: "2026-07-30 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-6',
    bookingUser: { mkey: '106', mvalue: 'Shimizu' },
    mainUser: { mkey: '106', mvalue: 'Shimizu' },
    department: { mkey: 'D_ONETEAM', mvalue: 'Oneteam' },
    room: { mkey: 'KIA_XANH', mvalue: 'KIA XANH' },
    roomType: { mkey: 'RT_KIA', mvalue: 'KIA XANH' },
    createdDate: "2026-07-30 10:00:00",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    startTime: "13:00:00",
    endTime: "21:45:00",
    persons: 2,
    employeeNumber: 2,
    usagePurpose: mockMasterData.usagePurposes[0],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_TP', mvalue: 'Th.Phương' },
    driverUser: { mkey: 'DRV_TP', mvalue: 'Th.Phương' },
    detailedSchedule: "Đón sân bay -> Đưa chị Kubota về khách sạn ở Bình Giã -> Đưa chị Shimizu về nhà Sếp",
    isApproved: 4,
    notificationDriverDate: "2026-07-31 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-7',
    bookingUser: { mkey: '101', mvalue: 'Nhin' },
    mainUser: { mkey: '101', mvalue: 'Nhin' },
    department: { mkey: 'D_ONETEAM', mvalue: 'Oneteam' },
    room: { mkey: 'HIACE', mvalue: 'HIACE' },
    roomType: { mkey: 'RT_HIACE', mvalue: 'HIACE' },
    createdDate: "2026-07-30 10:00:00",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    startTime: "13:10:00",
    endTime: "22:00:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[0],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_QT', mvalue: 'Quốc Tuấn' },
    driverUser: { mkey: 'DRV_QT', mvalue: 'Quốc Tuấn' },
    detailedSchedule: "(CTY FAREN) 13h xuất phát từ S2 --> đón sân bay --> Checkin KS HOTEL CONTINENTAL SAIGON 132 Đồng Khởi, Q1 --> ăn tối --> kết thúc",
    isApproved: 4,
    notificationDriverDate: "2026-07-31 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-8',
    bookingUser: { mkey: '104', mvalue: 'Sếp' },
    mainUser: { mkey: '104', mvalue: 'Sếp' },
    department: { mkey: 'D_SEP', mvalue: 'Sếp' },
    room: { mkey: 'PORSCHE', mvalue: 'PORSCHE' },
    roomType: { mkey: 'RT_PORSCHE', mvalue: 'PORSCHE' },
    createdDate: "2026-07-30 10:00:00",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    startTime: "07:00:00",
    endTime: "22:41:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_HK', mvalue: 'Hồng Khanh' },
    driverUser: { mkey: 'DRV_HK', mvalue: 'Hồng Khanh' },
    detailedSchedule: "Lịch sếp",
    isApproved: 4,
    notificationDriverDate: "2026-07-31 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  },
  {
    id: 'aug-9',
    bookingUser: { mkey: '107', mvalue: 'Nguyên' },
    mainUser: { mkey: '107', mvalue: 'Nguyên' },
    department: { mkey: 'D_JPC', mvalue: 'JPC' },
    room: { mkey: 'XE_NGOAI', mvalue: 'Xe ngoài-Ph.Trang' },
    roomType: { mkey: 'RT_NGOAI', mvalue: 'Xe ngoài-Ph.Trang' },
    createdDate: "2026-07-30 10:00:00",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    startTime: "08:00:00",
    endTime: "17:00:00",
    persons: 1,
    employeeNumber: 1,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeLocale: 'vn',
    serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
    driver: { mkey: 'DRV_HN', mvalue: 'Huỳnh Nguyên' },
    driverUser: { mkey: 'DRV_HN', mvalue: 'Huỳnh Nguyên' },
    detailedSchedule: "Cô Arisa từ 8:00 xuất phát từ trụ sở chính 40/12 Ấp Bắc, P. Tân Bình, HCM đến Số 7 Nguyễn Thiện Thành, phường Hòa Thuận, Vĩnh Long. Sau khi giáo viên người nhật đến TTLK Trà Vinh tài xế sẽ quay lại trụ sở chính HCM.",
    isApproved: 4,
    notificationDriverDate: "2026-07-31 08:00:00",
    notificationCount: 1,
    isCancelled: 0,
  }
];
additionalBookings.push(...augustSampleBookings);

// Booking mẫu tháng 9/2026 (tháng hiện tại) - Sinh ~50 chuyến xe phong phú để test scrollbar
const sampleDriverList = [
  { mkey: 'DRV_QB', mvalue: 'Quốc Bảo', phone: '0908123456' },
  { mkey: 'DRV_TP', mvalue: 'Th.Phương', phone: '0908234567' },
  { mkey: 'DRV_QT', mvalue: 'Quốc Tuấn', phone: '0908345678' },
  { mkey: 'DRV_NH', mvalue: 'Huy (L.Huy)', phone: '0908456789' },
  { mkey: 'DRV_HN', mvalue: 'Huỳnh Nguyên', phone: '0908567890' },
  { mkey: '107', mvalue: 'Driver 7', phone: '0901234567' },
  { mkey: '108', mvalue: 'Driver 8', phone: '0901234568' }
];

const sampleCarList = [
  { mkey: 'LS500', mvalue: 'LS500', licensePlateNumber: '51F-888.88', roomType: { mkey: 'RT_SEDAN', mvalue: 'LS500' } },
  { mkey: 'KIA_XANH', mvalue: 'KIA XANH', licensePlateNumber: '51A-678.90', roomType: { mkey: 'RT_KIA', mvalue: 'KIA XANH' } },
  { mkey: 'SIENNA', mvalue: 'SIENNA', licensePlateNumber: '51K-123.45', roomType: { mkey: 'RT_SIENNA', mvalue: 'SIENNA' } },
  { mkey: 'CARNIVAL', mvalue: 'CARNIVAL', licensePlateNumber: '51H-999.99', roomType: { mkey: 'RT_CARNIVAL', mvalue: 'CARNIVAL' } },
  { mkey: 'R001', mvalue: 'Room 1', licensePlateNumber: '30A-12345', roomType: { mkey: 'RT001', mvalue: 'Room Type 1' } },
  { mkey: 'R002', mvalue: 'Room 2', licensePlateNumber: '30A-54321', roomType: { mkey: 'RT002', mvalue: 'Room Type 2' } }
];

const sampleDeptList = [
  { mkey: 'D_ONETEAM', mvalue: 'Oneteam' },
  { mkey: 'D_JPC', mvalue: 'JPC' },
  { mkey: 'D_SEP', mvalue: 'Sếp' },
  { mkey: 'D_KD', mvalue: 'Kinh Doanh' },
  { mkey: 'D_NS', mvalue: 'Nhân Sự' },
  { mkey: 'D001', mvalue: 'Department 1' },
  { mkey: 'D002', mvalue: 'Department 2' }
];

const sampleUsers = [
  { mkey: '101', mvalue: 'Nhin' },
  { mkey: '102', mvalue: 'Minh' },
  { mkey: '103', mvalue: 'Thúy Hà' },
  { mkey: '104', mvalue: 'Sếp' },
  { mkey: '105', mvalue: 'Trần Văn An' },
  { mkey: '106', mvalue: 'Nguyễn Thị Bình' },
  { mkey: '107', mvalue: 'Nguyên' }
];

const sampleSchedules = [
  "(HH TOASHOKEN) 18h30 xuất phát từ S2 --> 19h30 đón KS Wink Saigon Centre --> Tiễn sân bay",
  "CHUYỂN 12 THÙNG GIÁO TRÌNH SANG ÂU CƠ: S2 > ÂU CƠ > S2",
  "Đưa chị Hà và đoàn đi công tác khảo sát đối tác Nhật Bản tại KCN Long Hậu",
  "Chở Sếp đi họp với Ban Lãnh đạo đối tác tại Q1 và đón khách về văn phòng",
  "Xe rước Thầy cô từ Khách sạn Đệ Nhất sang cơ sở Ấp Bắc dự lễ khai giảng",
  "Cô Arisa từ 8:00 xuất phát từ 40/12 Ấp Bắc, Tân Bình đến Số 7 Nguyễn Thiện Thành, Vĩnh Long",
  "Đón chuyên gia kỹ thuật Nhật Bản tại Ga quốc tế Tân Sơn Nhất về khách sạn Rex",
  "Chở phòng Kinh Doanh đi gặp gỡ các nghiệp đoàn tỉnh Bình Dương",
  "Chở phòng Nhân Sự đi phỏng vấn tuyển dụng thực tập sinh tại Đồng Nai",
  "Đi công tác Cần Thơ làm việc với trường Đại học Cần Thơ",
  "Đưa đoàn thực tập sinh xuất cảnh ra sân bay Tân Sơn Nhất lúc sáng sớm",
  "Chở tài liệu hợp đồng ký kết đối tác tại khu công nghệ cao Quận 9"
];

const timeSlots = [
  { start: '05:30:00', end: '10:00:00' },
  { start: '06:00:00', end: '11:30:00' },
  { start: '07:30:00', end: '12:00:00' },
  { start: '08:00:00', end: '17:00:00' },
  { start: '13:00:00', end: '17:30:00' },
  { start: '14:00:00', end: '18:30:00' },
  { start: '18:00:00', end: '21:30:00' }
];

const septemberSampleBookings = [];
let sepIndex = 1;
for (let day = 1; day <= 25; day++) {
  const tripsPerDay = (day % 3) + 1;
  const dayStr = String(day).padStart(2, '0');
  const dateStr = `2026-09-${dayStr}`;

  for (let t = 0; t < tripsPerDay; t++) {
    const slot = timeSlots[(day + t) % timeSlots.length];
    const driverObj = sampleDriverList[(day + t) % sampleDriverList.length];
    const carObj = sampleCarList[(day * 2 + t) % sampleCarList.length];
    const deptObj = sampleDeptList[(day + t * 2) % sampleDeptList.length];
    const userObj = sampleUsers[(day + t) % sampleUsers.length];
    const sched = sampleSchedules[(day * 3 + t) % sampleSchedules.length];

    septemberSampleBookings.push({
      id: `sep-gen-${sepIndex++}`,
      bookingUser: userObj,
      mainUser: userObj,
      department: deptObj,
      room: { mkey: carObj.mkey, mvalue: carObj.mvalue, licensePlateNumber: carObj.licensePlateNumber },
      roomType: carObj.roomType,
      createdDate: `2026-08-${String((day % 28) + 1).padStart(2, '0')} 09:00:00`,
      startDate: dateStr,
      endDate: dateStr,
      startTime: (day === 10 && t === 0) ? '08:00:00' : slot.start,
      endTime: (day === 10 && t === 0) ? '18:00:00' : slot.end,
      persons: ((day + t) % 5) + 1,
      employeeNumber: ((day + t) % 5) + 1,
      usagePurpose: mockMasterData.usagePurposes[0],
      usagePurposeLocale: 'vn',
      serviceType: { mkey: 'ST001', mvalue: 'Nội bộ' },
      driver: { mkey: driverObj.mkey, mvalue: driverObj.mvalue },
      driverUser: { mkey: driverObj.mkey, mvalue: driverObj.mvalue, driverPhoneNumber: driverObj.phone },
      licensePlateNumber: carObj.licensePlateNumber,
      driverPhoneNumber: driverObj.phone,
      detailedSchedule: (day === 10 && t === 0) ? "Chuyến xe đang di chuyển hôm nay - Thử nghiệm nút Kết thúc" : sched,
      isApproved: (day === 10 && t === 0) ? 3 : 4,
      isCancelled: 0,
      notificationDriverDate: `2026-08-${String((day % 28) + 1).padStart(2, '0')} 10:00:00`,
      notificationCount: 1,
    });
  }
}
additionalBookings.push(...septemberSampleBookings);

const bookings = [
  { 
    id: '1',
    bookingUser: users[0],
    mainUser: users[0],
    // users: users,
    employeeList: employees,
    department: mockMasterData.departments[0],
    building: mockMasterData.buildings[0],
    room: mockMasterData.rooms[0],
    roomType: mockMasterData.roomTypes[0],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[0],
    usagePurposeDetail: "Usage Purpose Detail 1",
    usagePurposeLocale: "vn",
    clients: 12,
    clientNames: ["Client 1", "Client 2", "Client 3"],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[1]],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
   
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[0].mkey],
    carLine: mockMasterData.carLines[0],
    driver: mockMasterData.drivers[0],
    serviceType: mockMasterData.serviceTypes[0],
    driverUser: mockMasterData.drivers[0],
    licensePlateNumber: mockMasterData.rooms[0].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[0].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '2',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[1],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 2",
    usagePurposeLocale: "vn",
    clients: 0,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[0], mockMasterData.approvers[2]],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
   
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],
    driver: mockMasterData.drivers[1],
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '3',
    bookingUser: users[2],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[2],
    building: mockMasterData.buildings[2],
    room: mockMasterData.rooms[2],
    roomType: mockMasterData.roomTypes[2],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[2],
    usagePurposeDetail: "Usage Purpose Detail 3",
    usagePurposeLocale: "vn",
    clients: 0,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[1]],
    approvedDate: "",
    rejectedUsers: [mockMasterData.approvers[0]],
    rejectedDate: "2026-05-26 12:30:00",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
   
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[2].mkey],
    carLine: mockMasterData.carLines[2],
    driver: mockMasterData.drivers[2],
    serviceType: mockMasterData.serviceTypes[2],
    driverUser: mockMasterData.drivers[2],
    licensePlateNumber: mockMasterData.rooms[2].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[2].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '4',
    bookingUser: users[0],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[0],
    building: mockMasterData.buildings[0],
    room: mockMasterData.rooms[3],
    roomType: mockMasterData.roomTypes[0],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[0],
    usagePurposeDetail: "Usage Purpose Detail 4",
    usagePurposeLocale: "vn",
    clients: 24,
    clientNames: ["Client 3", "Client 4", "Client 5"],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [],
    approvedDate: "",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
    
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[0].mkey],
    carLine: mockMasterData.carLines[0],
    driver: mockMasterData.drivers[0],   
    serviceType: mockMasterData.serviceTypes[0],   
    driverUser: mockMasterData.drivers[0],
    licensePlateNumber: mockMasterData.rooms[3].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[0].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '5',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[4],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 5",
    usagePurposeLocale: "vn",
    clients: 0,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[1], mockMasterData.approvers[0]],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [mockMasterData.approvers[1], mockMasterData.approvers[0]],
    rejectedDate: "2026-05-26 12:30:00",
    isCancelled: 1,
    cancelledReason: "Cancel Reason",
    cancelledDate: "2026-05-26 13:30:00",
    
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],
    driver: mockMasterData.drivers[1],
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[4].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '6',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[1],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "13:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 5",
    usagePurposeLocale: "vn",
    clients: 0,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
    
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],  
    driver: mockMasterData.drivers[1],
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '7',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[1],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-06-01 12:00:00",
    startDate: "2026-06-01",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 2",
    usagePurposeLocale: "jp",
    clients: 0,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[0], mockMasterData.approvers[2]],
    approvedDate: "2026-06-01 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
    
    managerReviewComment: "", 
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],  
    driver: mockMasterData.drivers[1],  
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '8',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[1],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "13:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 5",
    usagePurposeLocale: "vn",
    clients: 5,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 0,
    cancelledReason: "",
    cancelledDate: "",
    
    managerReviewComment: "Manager Review Comment 4",
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],  
    driver: mockMasterData.drivers[1],
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  { 
    id: '9',
    bookingUser: users[1],
    mainUser: users[0],
    employeeList: employees,
    department: mockMasterData.departments[1],
    building: mockMasterData.buildings[1],
    room: mockMasterData.rooms[4],
    roomType: mockMasterData.roomTypes[1],
    createdDate: "2026-05-26 12:00:00",
    startDate: "2026-05-26",
    startTime: "12:00:00",
    endTime: "18:00:00",
    equipments: [ mockMasterData.equipments[0], mockMasterData.equipments[1], mockMasterData.equipments[3] ],
    size: 30, 
    persons: 36,
    usagePurpose: mockMasterData.usagePurposes[1],
    usagePurposeDetail: "Usage Purpose Detail 5",
    usagePurposeLocale: "jp",
    clients: 12,
    clientNames: [],
    isApproved: randomIsApprovedStatus,
    approvedUsers: [mockMasterData.approvers[1], mockMasterData.approvers[0]],
    approvedDate: "2026-05-26 12:30:00",
    rejectedUsers: [],
    rejectedDate: "",
    isCancelled: 1,
    cancelledReason: "Cancel Reason",
    cancelledDate: "2026-05-26 13:30:00",
    
    managerReviewComment: "", 
    departureLocation: [mockMasterData.departureLocations[1].mkey],
    carLine: mockMasterData.carLines[1],  
    driver: mockMasterData.drivers[1],
    serviceType: mockMasterData.serviceTypes[1],
    driverUser: mockMasterData.drivers[1],
    licensePlateNumber: mockMasterData.rooms[4].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
    userReviewScore: 0,
    userReviewCommentMost: "heheh",
    userReviewCommentBad: "hahaha",
    driverReviewScore: 0,
    driverReviewCommentMost: "hyhyhy",
    driverReviewCommentBad: "huhuhu",
    driverReviewCommentRequest: "hjhj",
    managerReviewScore: randomInt(1, 5),
    managerReviewCommentMost: "123",
    managerReviewCommentBad: "456",
    managerReviewCommentRequest: "789",
  },
  ...additionalBookings
];

const normalizeBookingByAssignmentStatus = (booking) => {
  const status = Number(booking.isApproved ?? 0);
  const driverRef = booking.driverUser || booking.driver || null;
  const isExternalCar = booking.room?.hasServiceCar?.toString() === '1';

  const internalServiceType = mockMasterData.serviceTypes.find(s => s.mkey === 'ST001');
  const externalServiceType = mockMasterData.serviceTypes.find(s => s.mkey === 'ST002');

  const resolvedServiceType = isExternalCar
    ? externalServiceType
    : (booking.serviceType?.mkey === 'ST002' ? internalServiceType : (booking.serviceType || internalServiceType));

  const resolvedDriverUser = isExternalCar ? null : booking.driverUser;
  const resolvedLicensePlateNumber = isExternalCar
    ? (booking.licensePlateNumber || `51A-${String(10000 + Number(booking.id || 0)).slice(-5)}`)
    : booking.licensePlateNumber;
  const resolvedDriverPhoneNumber = isExternalCar
    ? (booking.driverPhoneNumber || `09${String(10000000 + Number(booking.id || 0)).slice(-8)}`)
    : booking.driverPhoneNumber;

  if (status === 0) { // Chưa duyệt
    return {
      ...booking,
      room: null,
       driverUser: null,
      approvalUser: [],
      serviceType: null,
      licensePlateNumber: null,
      driverPhoneNumber: null,
      driverConfirmationDate: null,
      driverConfirmationUser: [],
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [],
    };
  }
  if (status === 1) { // Chờ phân công
    return {
      ...booking,
      serviceType: null,
      driverUser: null,
      approvalUser: [mockMasterData.approvers[0]],
      licensePlateNumber: null, 
      driverPhoneNumber: null,
      driverConfirmationDate: null,
      driverConfirmationUser: [],
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [],
      room: null,
    };
  }

  if (status === 2) { // Chờ tài xế xác nhận
    return {
      ...booking,
      serviceType: booking.serviceType || resolvedServiceType,
      driverUser: resolvedDriverUser,
      licensePlateNumber: resolvedLicensePlateNumber,
      driverPhoneNumber: resolvedDriverPhoneNumber,
      driverConfirmationDate: null,
      driverConfirmationUser: [],
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [mockMasterData.approvers[0]],
    };
  }

    if (status === 3) { // Tài xế đã xác nhận
    return {
      ...booking,
      serviceType: booking.serviceType || resolvedServiceType,
      driverUser: resolvedDriverUser,
      licensePlateNumber: resolvedLicensePlateNumber,
      driverPhoneNumber: resolvedDriverPhoneNumber,
      driverConfirmationDate: booking.driverConfirmationDate || booking.approvedDate || booking.createdDate || null,
      driverConfirmationUser: resolvedDriverUser,
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [mockMasterData.approvers[0]],
      userReviewScore: 0,
      userReviewCommentMost: "",
      userReviewCommentBad: "",
      driverReviewScore: 0,
      driverReviewCommentMost: "",
      driverReviewCommentBad: "",
      driverReviewCommentRequest: "",
      managerReviewScore: 0,
      managerReviewCommentMost: "",
      managerReviewCommentBad: "",
      managerReviewCommentRequest: "",
      driverReviewPrep: "",
      driverReviewQcd: "",
      driverReviewCommentFeedback: "",
      userReviewExperience: "",
      userReviewQcd: "",
      userWantsToContinue: null,
    };
  }

   if (status === 4) { // Hoàn thành
    return {
      ...booking,
      serviceType: booking.serviceType || resolvedServiceType,
      driverUser: resolvedDriverUser,
      licensePlateNumber: resolvedLicensePlateNumber,
      driverPhoneNumber: resolvedDriverPhoneNumber,
      driverConfirmationDate: booking.driverConfirmationDate || booking.approvedDate || booking.createdDate || null,
      driverConfirmationUser: resolvedDriverUser,
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [mockMasterData.approvers[0]],
      userReviewScore: 0,
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: 0,
      driverReviewCommentMost: "hyhyhy",
      driverReviewCommentBad: "huhuhu",
      driverReviewCommentRequest: "hjhj",
      managerReviewScore: randomInt(1, 5),
      managerReviewCommentMost: "123",
      managerReviewCommentBad: "456",
      managerReviewCommentRequest: "789",
      driverReviewPrep: JSON.stringify({
        uniform: { value: "Có", note: "" },
        shoes: { value: "Có", note: "" },
        interior: { value: "Có", note: "" },
        aircon: { value: "Có", note: "" },
        water: { value: "Có", note: "" },
        dashcam: { value: "Có", note: "" },
        fuel: { value: "Có", note: "" },
        odor: { value: "Có", note: "" }
      }),
      driverReviewQcd: JSON.stringify({
        safety: { q: 5, c: 5, d: 5, note: "" },
        onTime: { q: 5, c: 5, d: 5, note: "" },
        service: { q: 5, c: 5, d: 5, note: "" },
        support: { q: 5, c: 5, d: 5, note: "" },
        privacy: { q: 5, c: 5, d: 5, note: "" },
        management: { q: 5, c: 5, d: 5, note: "" },
        overtime: { q: 5, c: 5, d: 5, note: "" }
      }),
      driverReviewCommentFeedback: "Khách hàng đi xe lịch sự, đúng giờ.",
      userReviewExperience: JSON.stringify({
        onTime: 5,
        polite: 5,
        clean: 5,
        safe: 5,
        support: 5,
        privacy: 5,
        response: 5,
        overall: 5
      }),
      userReviewQcd: JSON.stringify({
        q: 5,
        c: 5,
        d: 5
      }),
      userWantsToContinue: true
    };
  }

   if (status === -2) { // Tài xế từ chối
    return {
      ...booking,
      serviceType: randomServiceType,
      driverUser: resolvedDriverUser,
      licensePlateNumber: resolvedLicensePlateNumber,
      driverPhoneNumber: resolvedDriverPhoneNumber,
      driverDeclineReason: booking.driverDeclineReason || "Tài xế từ chối nhận chuyến",
      driverDeclineDate: booking.driverDeclineDate || booking.rejectedDate || booking.createdDate || null,
      driverDeclineUser: resolvedDriverUser,
      driverConfirmationDate: null,
      driverConfirmationUser: [],
      assignmentUser: [mockMasterData.approvers[0]],
    };
  }

  return { // Trạng thái từ chối (-1) và các trạng thái khác
     ...booking,
      serviceType: randomServiceType,
      driverUser: null,
      approvalUser: [],
      licensePlateNumber: null, 
      driverPhoneNumber: null,
      driverConfirmationDate: null,
      driverConfirmationUser: [],
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [],
      rejectedReason: status === -1 ? (booking.rejectedReason || "Đơn bị từ chối") : null,
  };
};

const normalizedBookings = bookings.map(normalizeBookingByAssignmentStatus);

const generateMockList = (items, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const currentItems = items.slice(startIndex, endIndex);

  return {
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit),
    currentItems: currentItems
  };
};

const mockLogList = [
  { id: '1', ...users[0], action: 'Action 1', createdDate: '2026-05-26 12:00:00' },
  { id: '2', ...users[1], action: 'Action 2', createdDate: '2026-05-26 12:00:00' },
  { id: '3', ...users[2], action: 'Action 3', createdDate: '2026-05-26 12:00:00' },
];

const mockReviewList = normalizedBookings.filter(booking => booking.isCancelled === 0 && ((new Date() > new Date(`${booking.endDate || booking.startDate} ${booking.endTime}`)) || booking.isApproved === 4));


const calculateGuestCounts = (bookings) => {
  const usagePurposeCounts = {};
  const partnerKeys = mockMasterData.config?.usagePurposeKeyForClient || [];

  bookings.forEach(booking => {
    const { usagePurpose, clients, persons } = booking;
    if (!usagePurpose || !usagePurpose.mkey) return;
    const purposeKey = usagePurpose.mkey;

    if (!usagePurposeCounts[purposeKey]) {
      usagePurposeCounts[purposeKey] = 0;
    }

    const isPartner = partnerKeys.includes(purposeKey);
    const count = isPartner ? (Number(clients) || 0) : (Number(persons) || 0);

    usagePurposeCounts[purposeKey] += count;
  });

  return { usagePurposeCounts };
};

const calculateUsedCounts = (bookings) => {
  const usagePurposeCounts = {};
  const localeCounts = { vn: 0, jp: 0 };

  (bookings || []).forEach(booking => {
    const { usagePurpose, usagePurposeLocale } = booking || {};
    if (!usagePurpose || !usagePurpose.mkey) return;
    const purposeKey = usagePurpose.mkey;
    const locale = usagePurposeLocale || 'vn';

    if (!usagePurposeCounts[purposeKey]) {
      usagePurposeCounts[purposeKey] = { vn: 0, jp: 0 };
    }

    if (usagePurposeCounts[purposeKey][locale] === undefined) {
      usagePurposeCounts[purposeKey][locale] = 0;
    }
    usagePurposeCounts[purposeKey][locale]++;

    if (localeCounts[locale] === undefined) {
      localeCounts[locale] = 0;
    }
    localeCounts[locale]++;
  });

  return { usagePurposeCounts, localeCounts };
};

const mockReportUsedCount = calculateUsedCounts(bookings);

const calculateCapacityCounts = (bookings) => {
  const roomTypeCapacities = {};
  const totalRoomTypeCapacities = {};
  const totalRoomCapacities = {};

  (bookings || []).forEach(booking => {
    const roomTypeKey = booking.roomType?.mkey || booking.roomType;
    const roomKey = booking.room?.mkey || booking.room;
    if (!roomTypeKey) return;

    if (!totalRoomTypeCapacities[roomTypeKey]) {
      totalRoomTypeCapacities[roomTypeKey] = 0;
    }
    totalRoomTypeCapacities[roomTypeKey] += 1;

    if (roomKey) {
      if (!roomTypeCapacities[roomTypeKey]) {
        roomTypeCapacities[roomTypeKey] = {};
      }
      if (!roomTypeCapacities[roomTypeKey][roomKey]) {
        roomTypeCapacities[roomTypeKey][roomKey] = 0;
      }
      roomTypeCapacities[roomTypeKey][roomKey] += 1;

      if (!totalRoomCapacities[roomKey]) {
        totalRoomCapacities[roomKey] = 0;
      }
      totalRoomCapacities[roomKey] += 1;
    }
  });

  return { roomTypeCapacities, totalRoomTypeCapacities, totalRoomCapacities };
};

const calculateUsageDemand = (bookings) => {
  const usageDemand = {};

  (bookings || []).forEach(booking => {
    const departmentKey = booking?.department?.mkey;
    if (!departmentKey) return;

    if (!usageDemand[departmentKey]) {
      usageDemand[departmentKey] = 0;
    }

    usageDemand[departmentKey]++;
  });

  return usageDemand;
};

const mockReportUsageDemand = calculateUsageDemand(bookings);



const calculateManagerReviewScores = (bookings) => {
const managerReviewScores = { score1: 0, score2: 0, score3: 0, score4: 0, score5: 0 };

  bookings.forEach(booking => {
    const { managerReviewScore } = booking;

    if (managerReviewScore >= 1 && managerReviewScore <= 5) {
      managerReviewScores[`score${managerReviewScore}`]++;
    }
  });

  return managerReviewScores;
};

const mockReportManagerReview = calculateManagerReviewScores(bookings);

const mockBookings = ({ myCalendar, fromDate, endDate, roomType, room, statusApproved }) => {
  const seenIds = new Set();
  return [...normalizedBookings, ...additionalBookings.map(normalizeBookingByAssignmentStatus)].filter(booking => {
    if (booking.id && seenIds.has(booking.id)) {
      return false;
    }
    if (booking.id) {
      seenIds.add(booking.id);
    }
    const bookingStart = new Date(`${booking.startDate} ${booking.startTime}`.replace(' ', 'T'));
    const endDateStr = booking.endDate || booking.startDate;
    const bookingEnd = new Date(`${endDateStr} ${booking.endTime}`.replace(' ', 'T'));
    const fromDateTime = fromDate ? new Date(String(fromDate).replace(' ', 'T')) : null;
    const endDateTime = endDate ? new Date(String(endDate).replace(' ', 'T')) : null;

    let isValid = true;
    if (fromDateTime && !isNaN(fromDateTime.getTime())) {
      isValid = isValid && bookingEnd >= fromDateTime;
    }
    if (endDateTime && !isNaN(endDateTime.getTime())) {
      isValid = isValid && bookingStart <= endDateTime;
    }

    if (roomType) {
      isValid = isValid && booking.roomType.mkey === roomType;
    }

    if (room) {
      isValid = isValid && booking.room?.mkey === room;
    }
    if (myCalendar && booking.room.mkey !== mockMasterData.rooms[0].mkey) {
      return false;
    }

    if (statusApproved !== null && statusApproved !== undefined) {
            if(statusApproved == 1) {
               isValid = isValid && booking.isApproved === 3 || booking.isApproved === 4;
            } 
    }

    return isValid;
  });
};

export const mockData = (action, data) => {
  const { page = 1, limit = 20 } = data;
  switch (action) {
    case 'endItem': {
      let target = normalizedBookings.find(b => String(b.id) === String(data.id));
      if (!target) {
        target = additionalBookings.find(b => String(b.id) === String(data.id));
      }
      if (target) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        target.endDate = `${year}-${month}-${day}`;
        target.endTime = `${hours}:${minutes}:${seconds}`;
        target.isApproved = 4;
      }
      return { status: 'success', message: 'Kết thúc chuyến xe thành công' };
    }
    case 'suggestionClients':
      return data.keyword
        ? clients.filter(client =>
            client.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
          )
        : [];
    case 'suggestionDepartureLocations':
      return data.keyword
        ? mockMasterData.departureLocations.filter(location =>
            location.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
          )
        : [];
    case 'suggestionUsers':
      switch (data.component) {
        case 'adminForm':
          return data.keyword
            ? mockMasterData.admins.filter(admin =>
                admin.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
              )
            : [];
        case 'approverForm':
            return data.keyword
            ? mockMasterData.approvers.filter(approver =>
              approver.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
              )
            : [];
        case 'managerForm':
          return data.keyword
            ? mockMasterData.managers.filter(manager =>
                manager.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
              )
            : [];
        case 'bookingForm':
          return data.keyword
            ? employees.filter(employee =>
                employee.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
              )
            : [];
        case 'driverForm':
          return data.keyword
            ? mockMasterData.drivers.filter(driver =>
                driver.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
              )
            : [];
        default:
          return {};
      }
    case 'getMasterDataVersion':
        return mockMasterDataVersion;
    case 'getMasterData':
        return mockMasterData;
    case 'getList':
      switch (data.component) {
        case 'adminList':
          return generateMockList(mockMasterData.admins, page, limit);
        case 'approverList':
          return generateMockList(mockMasterData.approvers, page, limit);
        case 'managerList':
          return generateMockList(mockMasterData.managers, page, limit);
        case 'buildingList':
          return generateMockList(mockMasterData.buildings, page, limit);
        case 'departmentList':
          return generateMockList(mockMasterData.departments, page, limit);
        case 'equipmentTypeList':
          return generateMockList(mockMasterData.equipmentTypes, page, limit);
        case 'equipmentList':
          return generateMockList(mockMasterData.equipments, page, limit);
        case 'usagePurposeList':
          return generateMockList(mockMasterData.usagePurposes, page, limit);
        case 'roomTypeList':
          return generateMockList(mockMasterData.roomTypes, page, limit);
        case 'roomList':
          return generateMockList(mockMasterData.rooms, page, limit);
        case 'bookingList':
          return generateMockList(normalizedBookings.filter(booking => {
            let tab = "";
            try {
              const filters = JSON.parse(data.filters);
              tab = filters.tab;
            } catch(e) {}
            if (tab === 'cancelled') {
              return booking.isCancelled === 1 && new Date() < new Date(`${booking.endDate || booking.startDate} ${booking.endTime}`);
            } else {
              return booking.isCancelled === 0 && new Date() < new Date(`${booking.endDate || booking.startDate} ${booking.endTime}`);
            }
          }), page, limit);
        case 'approveBookingList':
          return generateMockList(normalizedBookings.filter(booking => {
            let tab = "";
            try {
              const filters = JSON.parse(data.filters);
              tab = filters.tab;
            } catch(e) {}
            if (tab === 'pending') {
              return booking.isCancelled === 0 && (booking.isApproved === 0 
                || (booking.isApproved === 1 )
                || (booking.isApproved === -2)
              ) 
                && new Date() < new Date(`${booking.endDate || booking.startDate} ${booking.endTime}`);
            } else {
              return true;
            }
          }), page, limit);
        case 'userReviewList':
          return generateMockList(mockReviewList, page, limit);
        case 'managerReviewList':
          return generateMockList(mockReviewList, page, limit);
        case 'log':
          return generateMockList(mockLogList, page, limit);
        case 'carLineList':
          return generateMockList(mockMasterData.carLines, page, limit);
        case 'driverList': {
          let drivers = [...mockMasterData.drivers];
          try {
            const filters = JSON.parse(data.filters);
            if (filters.isActive !== undefined && filters.isActive !== '') {
              drivers = drivers.filter(d => String(d.isActive ? 1 : 0) === String(filters.isActive));
            }
            if (filters.driverPhoneNumber) {
              drivers = drivers.filter(d => (d.driverPhoneNumber || '').includes(filters.driverPhoneNumber));
            }
          } catch(e) {}
          return generateMockList(drivers, page, limit);
        }
        case 'driverConfirmBookingList':
          return generateMockList(normalizedBookings.filter(booking => {
            let tab = "";
            try {
              const filters = JSON.parse(data.filters);
              tab = filters.tab;
            } catch(e) {}
            if (tab === 'pending') {
              return booking.isCancelled === 0 && (booking.isApproved === 2 ) 
                && new Date() < new Date(`${booking.endDate || booking.startDate} ${booking.endTime}`);
            } else if (tab === 'review') {
              return booking.isCancelled === 0 && (booking.isApproved === 4 );
            }  else {
              // return true;
              return booking.isCancelled === 0 && (booking.isApproved === 3 || booking.isApproved === 4 || booking.isApproved === -2) 
            }
          }), page, limit);
        default:
          return {};
      }
    case 'getStatistics':
      let statsFilters = data.filters;
      if (typeof statsFilters === 'string') {
        try { statsFilters = JSON.parse(statsFilters); } catch (e) { statsFilters = {}; }
      }
      let filteredStatsBookings = bookings;
      if (statsFilters && (statsFilters.startDate || statsFilters.endDate)) {
        const fromStr = statsFilters.startDate ? statsFilters.startDate.substring(0, 10) : '0000-01-01';
        const toStr = statsFilters.endDate ? statsFilters.endDate.substring(0, 10) : '9999-12-31';
        filteredStatsBookings = bookings.filter(b => {
          const bDate = (b.startDate || b.createdDate || '').substring(0, 10);
          if (!bDate) return true;
          return bDate >= fromStr && bDate <= toStr;
        });
      }

      switch (data.component) {
        case 'reportGuestCount': 
          return calculateGuestCounts(filteredStatsBookings);
        case 'reportUsedCount':
          return calculateUsedCounts(filteredStatsBookings);
        case 'reportCapacity':
          return calculateCapacityCounts(filteredStatsBookings);
        case 'reportUsageDemand':
          return calculateUsageDemand(filteredStatsBookings);
        // case 'reportUserReview':
        //   return mockReportUserReview;
        case 'reportManagerReview':
          return mockReportManagerReview;
        default:
          return {};
    }
    case 'getBookings':
      return mockBookings(data);
    case 'getReportCarActivity': {
      let { fromDate, toDate, endDate, filterType, selectedMonth, month, selectedYear, year, room, roomType, driver, driverUser, department } = data;

      if (filterType === 'month' && (selectedMonth || month) && (selectedYear || year)) {
        const m = parseInt(selectedMonth || month, 10);
        const y = parseInt(selectedYear || year, 10);
        fromDate = `${y}-${String(m).padStart(2, '0')}-01 00:00:00`;
        const lastDay = new Date(y, m, 0).getDate();
        toDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;
      }

      const targetEnd = toDate || endDate;
      let allResults = mockBookings({
        fromDate,
        endDate: targetEnd,
        roomType,
        room,
      });

      // Chỉ lấy các chuyến xe có isApproved = 4 (đã hoàn thành), không bị hủy, và serviceType = ST001 (Xe nội bộ)
      allResults = allResults.filter(b => {
        if (Number(b.isApproved) !== 4 || Number(b.isCancelled) === 1) return false;
        const stKey = b.serviceType?.mkey || b.serviceType?.id || (typeof b.serviceType === 'string' ? b.serviceType : '');
        return stKey === 'ST001';
      });

      // Lọc theo tài xế nếu có truyền
      const targetDriver = driver || driverUser;
      if (targetDriver) {
        allResults = allResults.filter(b => {
          const dKey = b.driverUser?.mkey || b.driver?.mkey || '';
          return dKey === targetDriver;
        });
      }

      // Lọc theo phòng ban / BU nếu có truyền
      if (department) {
        allResults = allResults.filter(b => {
          const deptKey = b.department?.mkey || '';
          return deptKey === department;
        });
      }

      // Sắp xếp tăng dần theo startDate và startTime
      allResults.sort((a, b) => {
        const dateA = `${a.startDate || ''} ${a.startTime || ''}`;
        const dateB = `${b.startDate || ''} ${b.startTime || ''}`;
        return dateA.localeCompare(dateB);
      });

      return allResults;
    }
    default:
        return {};
  }
};
