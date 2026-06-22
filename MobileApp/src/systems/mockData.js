import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { vi } from "date-fns/locale";

const mockMasterDataVersion = {
  version: 1
};

const mockMasterData = {
  userId: "mock-user-id",
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
    { id: '1', mkey: '107', mvalue: 'Driver 7 (driver7@esuhai.com)', driverPhoneNumber: '0901234567' },
    { id: '2', mkey: '108', mvalue: 'Driver 8 (driver8@esuhai.com)', driverPhoneNumber: '0901234568' },
    { id: '3', mkey: '109', mvalue: 'Driver 9 (driver9@esuhai.com)', driverPhoneNumber: '0901234569' },
  ],
  departureLocations: [
    { mkey: 'Location 1', mvalue: 'Location 1' },
    { mkey: 'Location 2', mvalue: 'Location 2' },
    { mkey: 'Location 3', mvalue: 'Location 3' }
  ],
  serviceTypes : [
    { id: '1', mkey: 'ST001', mvalue: 'Xe nội bộ', isActive: true },
    { id: '2', mkey: 'ST002', mvalue: 'Xe dịch vụ', isActive: true },
    { id: '3', mkey: 'ST003', mvalue: 'Xe Grab', isActive: true },
  ]

};

const users = [
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

    const randomUsagePurposeDetail = `Usage Purpose Detail ${Math.floor(Math.random() * 5) + 1}`;
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
      department: randomDepartment,
      // building: randomBuilding,
      roomType: roomType,
      createdDate: "2026-05-26 12:00:00",
      startDate: formattedDate,
      startTime: startTime,
      endTime: endTime,
      // equipments: randomEquipments,
      size: randomSize,
      persons: randomPersons,
      usagePurpose: randomUsagePurpose,
      usagePurposeDetail: randomUsagePurposeDetail,
      usagePurposeLocale: randomUsagePurposeLocale,
      clients: randomClients,
      clientNames: randomClientNames,
      isApproved: randomIsApprovedStatus,
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

const bookings = [
  { 
    id: '1',
    bookingUser: users[0],
    mainUser: users[0],
    users: users,
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
   
    managerReviewScore: 0,
    managerReviewComment: "",
    departureLocation: [mockMasterData.departureLocations[0].mkey],
    carLine: mockMasterData.carLines[0],
    driver: mockMasterData.drivers[0],
    serviceType: mockMasterData.serviceTypes[0],
    driverUser: mockMasterData.drivers[0],
    licensePlateNumber: mockMasterData.rooms[0].licensePlateNumber,
    driverPhoneNumber: mockMasterData.drivers[0].driverPhoneNumber,
    userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
   
    managerReviewScore: 0,
    managerReviewComment: "",
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],
      driver: mockMasterData.drivers[1],
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
   
    managerReviewScore: 0,
    managerReviewComment: "",
      departureLocation: [mockMasterData.departureLocations[2].mkey],
      carLine: mockMasterData.carLines[2],
      driver: mockMasterData.drivers[2],
      serviceType: mockMasterData.serviceTypes[2],
      driverUser: mockMasterData.drivers[2],
      licensePlateNumber: mockMasterData.rooms[2].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[2].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 0,
    managerReviewComment: "",
      departureLocation: [mockMasterData.departureLocations[0].mkey],
      carLine: mockMasterData.carLines[0],
      driver: mockMasterData.drivers[0],   
      serviceType: mockMasterData.serviceTypes[0],   
      driverUser: mockMasterData.drivers[0],
      licensePlateNumber: mockMasterData.rooms[3].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[0].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 0,
    managerReviewComment: "",
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],
      driver: mockMasterData.drivers[1],
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[4].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 0,
    managerReviewComment: "",
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],  
      driver: mockMasterData.drivers[1],
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 0,
    managerReviewComment: "", 
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],  
      driver: mockMasterData.drivers[1],  
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 4,
    managerReviewComment: "Manager Review Comment 4",
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],  
      driver: mockMasterData.drivers[1],
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[1].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
    users: users,
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
    
    managerReviewScore: 0,
    managerReviewComment: "", 
      departureLocation: [mockMasterData.departureLocations[1].mkey],
      carLine: mockMasterData.carLines[1],  
      driver: mockMasterData.drivers[1],
      serviceType: mockMasterData.serviceTypes[1],
      driverUser: mockMasterData.drivers[1],
      licensePlateNumber: mockMasterData.rooms[4].licensePlateNumber,
      driverPhoneNumber: mockMasterData.drivers[1].driverPhoneNumber,
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
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
      serviceType: randomServiceType, // Khi ở trạng thái chờ tài xế xác nhận, nếu chưa có serviceType thì mặc định là nội bộ
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
      serviceType: randomServiceType,
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
    };
  }

   if (status === 4) { // Hoàn thành
    return {
      ...booking,
      serviceType: randomServiceType,
      driverUser: resolvedDriverUser,
      licensePlateNumber: resolvedLicensePlateNumber,
      driverPhoneNumber: resolvedDriverPhoneNumber,
      driverConfirmationDate: booking.driverConfirmationDate || booking.approvedDate || booking.createdDate || null,
      driverConfirmationUser: resolvedDriverUser,
      driverDeclineReason: null,
      driverDeclineDate: null,
      driverDeclineUser: [],
      assignmentUser: [mockMasterData.approvers[0]],
      userReviewScore: randomInt(1, 5),
      userReviewCommentMost: "heheh",
      userReviewCommentBad: "hahaha",
      driverReviewScore: randomInt(1, 5),
      driverReviewCommentMost: "hyhyhy",
      driverReviewCommentBad: "huhuhu",
      driverReviewCommentRequest: "hjhj",
      managerReviewScore: randomInt(1, 5),
      managerReviewCommentMost: "123",
      managerReviewCommentBad: "456",
      managerReviewCommentRequest: "789",
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

const mockReviewList = normalizedBookings.filter(booking => booking.isCancelled === 0 && ((new Date() > new Date(`${booking.startDate} ${booking.endTime}`)) || booking.isApproved === 4));


const calculateGuestCounts = (bookings) => {
  const usagePurposeCounts = {};
  const localeCounts = { vn: 0, jp: 0 };

  bookings.forEach(booking => {
    const { usagePurpose, usagePurposeLocale, clients } = booking;
    const purposeKey = usagePurpose.mkey;
    const locale = usagePurposeLocale;

    if (!usagePurposeCounts[purposeKey]) {
      usagePurposeCounts[purposeKey] = { vn: 0, jp: 0 };
    }

    usagePurposeCounts[purposeKey][locale] += clients;
    localeCounts[locale] += clients;
  });

  return { usagePurposeCounts, localeCounts };
};

const mockReportGuestCount = calculateGuestCounts(bookings);

const calculateUsedCounts = (bookings) => {
  const usagePurposeCounts = {};
  const localeCounts = { vn: 0, jp: 0 };

  bookings.forEach(booking => {
    const { usagePurpose, usagePurposeLocale } = booking;
    const purposeKey = usagePurpose.mkey;
    const locale = usagePurposeLocale;

    if (!usagePurposeCounts[purposeKey]) {
      usagePurposeCounts[purposeKey] = { vn: 0, jp: 0 };
    }

    usagePurposeCounts[purposeKey][locale]++;
    localeCounts[locale]++;
  });

  return { usagePurposeCounts, localeCounts };
};

const mockReportUsedCount = calculateUsedCounts(bookings);

const calculateCapacityCounts = (rooms) => {
  const buildingCapacities = {};
  const totalCapacities = {};

  rooms.forEach(room => {
    const { building, roomType, persons } = room;
    const buildingKey = building;
    const roomTypeKey = roomType;

    if (!buildingCapacities[buildingKey]) {
      buildingCapacities[buildingKey] = {};
    }

    if (!buildingCapacities[buildingKey][roomTypeKey]) {
      buildingCapacities[buildingKey][roomTypeKey] = 0;
    }

    if (!totalCapacities[roomTypeKey]) {
      totalCapacities[roomTypeKey] = 0;
    }

    buildingCapacities[buildingKey][roomTypeKey] += persons || 0;
    totalCapacities[roomTypeKey] += persons || 0;
  });

  return { buildingCapacities, totalCapacities };
};

const mockReportCapacity = calculateCapacityCounts(mockMasterData.rooms);

const calculateUsageDemand = (bookings) => {
  const usageDemand = {};

  bookings.forEach(booking => {
    const departmentKey = booking.department.mkey;

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

const mockBookings = ({ myCalendar, fromDate, endDate, roomType, room }) => 
  [...normalizedBookings, ...additionalBookings.map(normalizeBookingByAssignmentStatus)].filter(booking => {
    const bookingDate = new Date(booking.startDate);
    const fromDateTime = new Date(fromDate);
    const endDateTime = new Date(endDate);
    let isValid = bookingDate >= fromDateTime && bookingDate <= endDateTime;

    if (roomType) {
      isValid = isValid && booking.roomType.mkey === roomType;
    }

    if (room) {
      isValid = isValid && booking.room?.mkey === room;
    }
    if (myCalendar && booking.room.mkey !== mockMasterData.rooms[0].mkey) {
      return false;
    }

    return isValid;
  });

export const mockData = (action, data) => {
  const { page = 1, limit = 20 } = data;
  switch (action) {
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
            ? users.filter(user =>
                user.mvalue.toLowerCase().includes(data.keyword.toLowerCase())
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
              return booking.isCancelled === 1 && new Date() < new Date(`${booking.startDate} ${booking.endTime}`);
            } else {
              return booking.isCancelled === 0 && new Date() < new Date(`${booking.startDate} ${booking.endTime}`);
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
                && new Date() < new Date(`${booking.startDate} ${booking.endTime}`);
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
        case 'driverList':
          return generateMockList(mockMasterData.drivers, page, limit);
        case 'driverConfirmBookingList':
          return generateMockList(normalizedBookings.filter(booking => {
            let tab = "";
            try {
              const filters = JSON.parse(data.filters);
              tab = filters.tab;
            } catch(e) {}
            if (tab === 'pending') {
              return booking.isCancelled === 0 && (booking.isApproved === 2 ) 
                && new Date() < new Date(`${booking.startDate} ${booking.endTime}`);
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
      switch (data.component) {
        case 'reportGuestCount': 
          return mockReportGuestCount;
        case 'reportUsedCount':
          return mockReportUsedCount;
        case 'reportCapacity':
          return mockReportCapacity;
        case 'reportUsageDemand':
          return mockReportUsageDemand;
        // case 'reportUserReview':
        //   return mockReportUserReview;
        case 'reportManagerReview':
          return mockReportManagerReview;
        default:
          return {};
    }
    case 'getBookings':
      return mockBookings(data);
    default:
        return {};
  }
};
