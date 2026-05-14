import { FaCheck, FaClock, FaStar, FaTimes } from "react-icons/fa";
import ModalContent from "../shared/ModalContent";
import { logMasterDataKeyMapping, logMasterDataTypeMapping } from "./log";

export const cacheRequest = (requestContext, id, component) => {
  let cachedRequest;
  const componentKey = component || 'default';
  try {
    cachedRequest = JSON.parse(sessionStorage.getItem(`${componentKey}_requestContext`));
    if (cachedRequest && cachedRequest.id === id && !requestContext.request) {
      requestContext.setRequest(cachedRequest);
    } else if (cachedRequest && cachedRequest.id === "*") {
      requestContext.setRequest(cachedRequest);
    } else {
      cachedRequest = requestContext.request;
      sessionStorage.setItem(`${componentKey}_requestContext`, JSON.stringify(cachedRequest));
    }
  } catch (error) {
    cachedRequest = requestContext.request;
    sessionStorage.setItem(`${componentKey}_requestContext`, JSON.stringify(cachedRequest));
  }
  return cachedRequest;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const [datePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${timePart || ''}`;
};

export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const timePart = dateString.split(' ').pop();
  return `${timePart || ''}`;
};

export const formatLogType = (logType, t) => {
  switch (logType) {
    case "Add":
      return <span className="px-2 py-1 rounded text-black bg-white border border-gray-300">{t('log.Thêm')}</span>;
    case "Edit":
      return <span className="px-2 py-1 rounded text-white bg-blue-500">{t('log.Sửa')}</span>;
    case "Delete":
      return <span className="px-2 py-1 rounded text-white bg-red-500">{t('log.Xoá')}</span>;
    case "Active":
      return <span className="px-2 py-1 rounded text-white bg-gray-500">{t('log.Mở khoá')}</span>;
    case "Deactive":
      return <span className="px-2 py-1 rounded text-white bg-green-500">{t('log.Tạm khoá')}</span>;
    default:
      return '-';
  }
}

export const formatLogPage = (log) => {
  const oldValue = log.logOldValue;
  const newValue = log.logNewValue;
  const id = oldValue.id ?? newValue.id;
  return logMasterDataTypeMapping[oldValue.mtype ?? newValue.mtype] + (id ? (" - ID: " + id) : "");
}

export const formatLogValue = (value, type) => {
  return formatLogData(value, type)
    .filter(item => item)
    .map((item, index) => (<li key={index}>{`${item.displayKey}: '${item.displayValue}'`}</li>));
}

export const formatLogData = (value, type) => {
  return Object.keys(value)
    .map((key, index) => {
      if (key === 'id' || key === 'mtype' || key === 'isDeleted' || key === 'isActive'|| (key === 'mParentKey' && type !== "equipments")) return null;
      const displayKey = logMasterDataKeyMapping(type, key);
      const displayValue = Array.isArray(value[key]) ? value[key].map(v => v?.mvalue || v).join(', ') : (value[key]?.mvalue || value[key]);
      return {displayKey, displayValue};
    });
}

export const formatLogOldValue = (log) => {
  if (log.logOldValue) {
    const newValue = log.logNewValue || {};
    let oldValue = log.logOldValue;
    oldValue = Object.fromEntries(
      Object.keys(oldValue)
        .filter(key => {
          return (log.logType === "Edit" && (key in newValue || key === 'mtype')) ||
            (log.logType !== "Edit" && ['id', 'mtype', 'mkey', 'mvalue'].includes(key));
        })
        .map(key => ([key, oldValue[key]]))
    );

    return formatLogValue(oldValue, oldValue.mtype ?? newValue.mtype);
  }
  return '-';
}

export const formatLogNewValue = (log) => {
  if (log.logNewValue) {
    const oldValue = log.logOldValue;
    const newValue = log.logNewValue;
    return formatLogValue(newValue, newValue.mtype ?? oldValue.mtype);
  }
  return '-';
}

export const formatEquipmentType = (mkey, masterData) => {
  const equipmentType = masterData?.equipmentTypes?.find((item) => item.mkey.toString() === mkey.toString());
  return equipmentType ? equipmentType.mvalue : '-';
};

export const formatRoomType = (mkey, masterData) => {
  const roomType = masterData?.roomTypes?.find((item) => item.mkey.toString() === mkey.toString());
  return roomType ? roomType.mvalue : '-';
};

export const formatRoom = (mkey, masterData) => {
  const room = masterData?.rooms?.find((item) => item.mkey.toString() === mkey.toString());
  return room ? room.mvalue : '-';
};

export const formatBuilding = (mkey, masterData) => {
  const building = masterData?.buildings?.find((item) => item.mkey.toString() === mkey.toString());
  return building ? building.mvalue : '-';
};

export const formatDepartment = (mkey, masterData) => {
  const department = masterData?.departments?.find((item) => item.mkey.toString() === mkey.toString());
  return department ? department.mvalue : '-';
};

export const formatScore = (score, t) => {
  switch (score) {
    case "score1":
      return t('common.1 điểm');
    case "score2":
      return t('common.2 điểm');
    case "score3":
      return t('common.3 điểm');
    case "score4":
      return t('common.4 điểm');
    case "score5":
      return t('common.5 điểm');
    default:
      return '-';
  }
};

export const formatLocale = (mkey) => {
  return mkey === "vn" ? "Việt" : mkey === "jp" ? "Nhật" : "-";
};

export const formatUsagePurpose = (mkey, masterData) => {
  const usagePurpose = masterData?.usagePurposes?.find((item) => item.mkey.toString() === mkey.toString());
  return usagePurpose ? usagePurpose.mvalue : '-';
};

export const formatUsagePurposes = (mkeys, masterData) => {
  return mkeys.map(mkey => {
    const usagePurpose = masterData?.usagePurposes?.find((item) => item.mkey.toString() === mkey.toString());
    return usagePurpose ? usagePurpose.mvalue : '-';
  }).filter(e => e !== "-").join(', ');
};

export const formatApprovers = (mkeys, masterData) => {
  return mkeys.map(mkey => {
    const approver = masterData?.approvers?.find((item) => item.mkey.toString() === mkey.toString());
    return approver ? approver.mvalue : '-';
  }).filter(e => e !== "-").join(', ');
};

export const formatPriorityApprovers = (mkeys, masterData) => {
  return mkeys.map(mkey => {
    const priorityApprover = masterData?.priorityApprovers?.find((item) => item.mkey.toString() === mkey.toString());
    return priorityApprover ? priorityApprover.mvalue : '-';
  }).filter(e => e !== "-").join(', ');
};

export const formatEquipments = (mkeys, masterData) => {
  return mkeys.map(mkey => {
    const equipment = masterData?.equipments?.find((item) => item.mkey.toString() === mkey.toString());
    return equipment ? equipment.mvalue : '-';
  }).filter(e => e !== "-").join(', ');
};

export const formatEquipmentsWithType = (equipments, masterData) => {
  const groupedEquipments = equipments.reduce((acc, equipment) => {
    const equipmentType = masterData.equipmentTypes.find(type => type.mkey === equipment.mParentKey);
    if (equipmentType) {
      if (!acc[equipmentType.mvalue]) {
        acc[equipmentType.mvalue] = [];
      }
      acc[equipmentType.mvalue].push(equipment.mvalue);
    }
    return acc;
  }, {});

  return <div className="flex flex-col gap-2">
    {Object.entries(groupedEquipments).map(([type, equipmentList]) => (
      <div key={type} className="flex flex-col gap-1">
        <strong className="text-xs font-medium text-gray-800">{type}:</strong>
        <div>
          {equipmentList.map((equipment, index) => (
            <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">
              {equipment}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>;
};

export const formatSize = (size, masterData) => {
  // return size ? `${size} m²` : '-';
  return size ? `${size}` : '-';
};

export const formatPersons = (persons, masterData, t) => {
  return persons ? t('common.[count] người', { count: persons }) : '-';
};

export const formatUser = (user, masterData) => {
  return user ? user.mvalue : '-';
};

export const formatColor = (color, masterData) => {
  return (
    <div className="w-5 h-5 rounded-full inline-block" style={{ backgroundColor: color }} />
  );
};

export const getFieldsBookingDetail = (request, masterData, t) => {
  const room = masterData.rooms.find(r => r.mkey.toString() === request.room.mkey.toString()) || {...request.room, approvers: request.options?.approvers || []};
  const roomType = masterData.roomTypes.find(rt => rt.mkey.toString() === request.roomType.mkey.toString()) || {...request.roomType, approvers: request.options?.approvers || []};
  const approvedCount = request.approvedUsers.length;
  const rejectedCount = request.rejectedUsers.length;

  const approvers = [
    ...(room?.approvers?.length ? room.approvers : (roomType.approvers || [])),
    ...(request.approvedUsers.map(user => user.mkey.toString()) || []),
    ...(request.rejectedUsers.map(user => user.mkey.toString()) || []),
  ].filter((value, index, self) => self.indexOf(value) === index);
  const fields = [
    { label: 'ID', value: request.id },
    { label: t('common.Thời điểm đặt'), value: formatDateTime(request.createdDate) },
    {
      label: t('common.Trạng thái'), value:
        (request.isApproved === 1 && approvedCount === 0) ?
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs mr-1 mb-1 rounded-full bg-green-100 text-green-500"><FaCheck /> {t('common.Duyệt tự động')}</span>
          : (request.isApproved === -1 && rejectedCount === 0) ?
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs mr-1 mb-1 rounded-full bg-red-100 text-red-500"><FaTimes /> {t('common.Hệ thống từ chối')}</span>
          : approvers.map((approver, index) => {
            const user = masterData.approvers?.find(user => user.mkey.toString() === approver.toString()) || masterData.approversDeleted?.find(user => user.mkey.toString() === approver.toString());
            if (!user) return null;
            if (request.rejectedUsers.some(row => row.mkey.toString() === approver.toString())) {
              return (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs mr-1 mb-1 rounded-full bg-red-100 text-red-500"><FaTimes /> {user.mvalue}</span>
              );
            } else if (request.approvedUsers.some(row => row.mkey.toString() === approver.toString())) {
              return (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs mr-1 mb-1 rounded-full bg-green-100 text-green-500"><FaCheck /> {user.mvalue}</span>
              );
            } else {
              return (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs mr-1 mb-1 rounded-full bg-gray-100 text-gray-500"><FaClock /> {user.mvalue}</span>
              );
            }
          })
    },
    !!request.rejectedReason && { label: t('booking.Lý do từ chối'), value: request.rejectedReason },
    { label: t('common.Phòng ban'), value: request.department.mvalue },
    { label: t('common.Người đặt'), value: <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{request.bookingUser.mvalue}</span> },
    { label: t('common.Người chủ trì'), value: <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{request.mainUser.mvalue}</span> },
    {
      label: t('common.Người sử dụng phòng'), value: request.users.map(user => (
        <span key={user.mkey} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{user.mvalue}</span>
      ))
    },
    { label: t('common.Toà nhà'), value: request.building.mvalue },
    { label: t('common.Loại phòng'), value: request.roomType.mvalue },
    { label: t('common.Phòng'), value: request.room.mvalue },
    { label: t('booking.Ghi chú phòng'), value: request.room.note },
    { label: t('common.Ngày sử dụng'), value: formatDate(request.startDate) },
    { label: t('common.Khung giờ sử dụng'), value: `${formatTime(request.startTime).replace(":00", "")} - ${formatTime(request.endTime).replace(":00", "")}` },
    {
      label: t('common.Thiết bị'), value: request.equipments.map(equipment => (
        <span key={equipment.mkey} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{equipment.mvalue}</span>
      ))
    },
    // { label: t('common.Diện tích'), value: formatSize(request.size) },
    { label: t('common.Sức chứa'), value: formatPersons(request.persons, null, t) },
    { label: t('common.Mục đích sử dụng'), value: request.usagePurpose.mvalue },
    { label: t('common.Chi tiết MĐSD'), value: request.usagePurposeDetail },
    request.clients > 0 && { label: t('common.Số lượng khách'), value: formatPersons(request.clients, null, t) },
    request.clientNames.length > 0 && {
      label: t('common.Tên khách'), value: request.clientNames.map((name, index) => (
        <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{name}</span>
      ))
    },
    request.externalClients > 0 && { label: t('common.Số lượng khách ngoài'), value: formatPersons(request.externalClients, null, t) },
    request.externalClientNames.length > 0 && {
      label: t('common.Phân loại khách ngoài'), value: request.externalClientNames.map((name, index) => (
        <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{name}</span>
      ))
    },
    request.isCancelled && { label: t('common.Lý do huỷ'), value: request.cancelledReason },
    request.isCancelled && request.cancelledDate && { label: t('common.Thời điểm huỷ'), value: formatDateTime(request.cancelledDate) },
    { label: t('booking.Ghi chú đặt phòng'), value: request.note },
  ].filter(field => field && field.value);

  let fieldLogs = [];
  if (request.log && Array.isArray(request.log)) {
    fieldLogs = request.log.map((log, index) => ({
      title: formatUser(log.logUser).split(" (")[0] + " - " + formatDateTime(log.logDate),
      oldValues: formatLogData(log.logOldValue, "booking"),
      newValues: formatLogData(log.logNewValue, "booking")
    }));
  }
  return { fields, fieldLogs };
}

export const formatIdDetail = (request, masterData, setModal, t) => {
  const bgColor = 'bg-green-100 text-green-500';
  const { fields, fieldLogs } = getFieldsBookingDetail(request, masterData, t);
  return (
    <span
      className={`flex items-center cursor-pointer justify-center gap-1 px-1 py-0 text-sm my-1.5 rounded ${bgColor}`}
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đặt phòng")} fields={fields} fieldLogs={fieldLogs} tabs={Array.isArray(request.log) && request.log.length > 0 ? [
        { label: t('common.Thông tin'), isDetail: true },
        { label: t('common.Lịch sử'), isHistory: true },
      ] : []} />)}
    >
      {request.id}
    </span>
  );
}

export const formatBookingApproveStatus = (request, masterData, setModal, t) => {
  const approvedCount = request.approvedUsers.length;
  const rejectedCount = request.rejectedUsers.length;

  let icon, text, bgColor;
  if (rejectedCount > 0) {
    icon = <FaTimes />;
    text = t('common.Từ chối');
    bgColor = 'bg-red-100 text-red-500';
  } else if (request.isApproved === -1 && rejectedCount === 0) {
    icon = <FaCheck />;
    text = t('common.Hệ thống từ chối');
    bgColor = 'bg-red-100 text-red-500';
  } else if (request.isApproved === 1 && approvedCount === 0) {
    icon = <FaCheck />;
    text = t('common.Duyệt tự động');
    bgColor = 'bg-green-100 text-green-500';
  } else if (approvedCount > 0) {
    icon = <FaCheck />;
    text = t('common.Đã duyệt');
    bgColor = 'bg-green-100 text-green-500';
  } else {
    icon = <FaClock />;
    text = t('common.Chờ duyệt');
    bgColor = 'bg-gray-100 text-gray-500';
  }
  const { fields, fieldLogs } = getFieldsBookingDetail(request, masterData, t);
  return (
    <span
      className={`flex items-center cursor-pointer justify-center gap-1 px-1 py-0 text-sm my-1.5 rounded ${bgColor}`}
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đặt phòng")} fields={fields} fieldLogs={fieldLogs} tabs={Array.isArray(request.log) && request.log.length > 0 ? [
        { label: t('common.Thông tin'), isDetail: true },
        { label: t('common.Lịch sử'), isHistory: true },
      ] : []} />)}
    >
      {icon}
      {text}
    </span>
  );
};

export const formatUserReviewCleanScore = (request, setModal, t) => {
  const fields = [
    { label: t('common.Chi tiết đánh giá'), value: request.userReviewCleanComment || '-' },
  ];

  return request.userReviewCleanScore > 0 ? (
    <span
      className="cursor-pointer flex gap-1 justify-center"
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đánh giá")} fields={fields} />)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} className={i < request.userReviewCleanScore ? 'text-yellow-500' : 'text-gray-300'} />
      ))}
    </span>
  ) : <span className="flex justify-center">-</span>;
}

export const formatUserReviewEquipmentScore = (request, setModal, t) => {
  const fields = [
    { label: t('common.Chi tiết đánh giá'), value: request.userReviewEquipmentComment || '-' },
  ];

  return request.userReviewEquipmentScore > 0 ? (
    <span
      className="cursor-pointer flex gap-1 justify-center"
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đánh giá")} fields={fields} />)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} className={i < request.userReviewEquipmentScore ? 'text-yellow-500' : 'text-gray-300'} />
      ))}
    </span>
  ) : <span className="flex justify-center">-</span>;
}

export const formatUserReviewFacilityScore = (request, setModal, t) => {
  const fields = [
    { label: t('common.Chi tiết đánh giá'), value: request.userReviewFacilityComment || '-' },
  ];

  return request.userReviewFacilityScore > 0 ? (
    <span
      className="cursor-pointer flex gap-1 justify-center"
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đánh giá")} fields={fields} />)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} className={i < request.userReviewFacilityScore ? 'text-yellow-500' : 'text-gray-300'} />
      ))}
    </span>
  ) : <span className="flex justify-center">-</span>;
}

export const formatManagerReviewScore = (request, setModal, t) => {
  const fields = [
    { label: t('common.Chi tiết đánh giá'), value: request.managerReviewComment || '-' },
  ];

  return request.managerReviewScore > 0 ? (
    <span
      className="cursor-pointer flex gap-1 justify-center"
      onClick={() => setModal(<ModalContent title={t("common.Thông tin đánh giá")} fields={fields} />)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} className={i < request.managerReviewScore ? 'text-yellow-500' : 'text-gray-300'} />
      ))}
    </span>
  ) : <span className="flex justify-center">-</span>;
};