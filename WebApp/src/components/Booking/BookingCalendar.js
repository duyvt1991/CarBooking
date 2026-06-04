/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext, useEffect } from 'react';
import { approveItem, getBookings } from '../../systems/api';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../systems/constant';
import { endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { RequestContext } from '../../App';
import withRequestForm from '../../hoc/withRequestForm';
import { initForm as initBookingForm } from './BookingForm';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import { FaPlus } from 'react-icons/fa';
import LoopFormElement from '../../shared/LoopFormElement';
import Calendar, { constrast } from '../../shared/Calendar';
import ModalContent from '../../shared/ModalContent';
import { useTranslation } from 'react-i18next';
import { formatDate, formatPersons, formatTime, getFieldsBookingDetail } from '../../systems/util';

const initForm = {
  room: {
    value: '',
    label: ''
  },    
  roomType: { 
    value: '', 
    label: 'booking.Loại xe', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "roomTypes", 
  },
};

const component = routes.bookingCalendar.component;

const BookingCalendar = ({ request, errors, handleChange, isHome = false }) => {
  const [events, setEvents] = useState([]);
  const [myCalendar, setMyCalendar] = useState(false);
  const [tempRequests, setTempRequests] = useState([]);
  const navigate = useNavigate();
  const { setLoading, setRequest, masterData, setModal, showConfirmModal, setError } = useContext(RequestContext);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const { t } = useTranslation();
  
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const roomType = masterData.roomTypes.find(type => type.mkey === room.roomType);
    if (roomType) {
      if (!acc[roomType.mkey]) {
        acc[roomType.mkey] = [];
      }
      acc[roomType.mkey].push({ ...room, roomTypeDetail: roomType, roomTypeMValue: roomType.mvalue });
    }
    return acc;
  }, {});

  useEffect(() => {
  if (!request.roomType) {  // ← Thay building
    setFilteredRooms([]);
    setEvents([]);
  } else {
    const rooms = masterData.rooms.filter(room => 
      room.roomType.toString() === request.roomType.mkey.toString()  // ← Thay building
    );
    setFilteredRooms(rooms);
    refreshCalendar(request.roomType);  // ← Thay building
  }
}, [request.roomType, myCalendar]);  // ← Thay building
  
    useEffect(() => {
      sessionStorage.removeItem(`${routes.bookingForm.component}_requestContext`);
    }, []);
  
  useEffect(() => {
  if (!keepRoomTypeState() && isHome && masterData.roomTypes?.length > 0 && !request.roomType) {
    handleRoomTypeChange('roomType', masterData.roomTypes[0]);  // ← Thay building logic
  }
}, [masterData.roomTypes]);  // ← Thay

useEffect(() => {
  if (!keepRoomTypeState() && request.id && !request.roomType) {
    handleRoomTypeChange('roomType', masterData.roomTypes[0]);  // ← Thay
  }
}, [request.id]);

const keepRoomTypeState = () => {
  let hasRoomTypeState = false;
  const roomTypeState = sessionStorage.getItem('roomType_state');  // ← Thay building
  if (roomTypeState && masterData.roomTypes?.length > 0) {        // ← Thay
    const roomType = masterData.roomTypes.find(rt =>
      rt.mkey.toString() === roomTypeState.toString()
    );
    if (roomType) {
      handleRoomTypeChange('roomType', roomType);  // ← Thay
      hasRoomTypeState = true;
    }
  }
  return hasRoomTypeState;
};

const handleRoomTypeChange = (field, value) => {  // ← Thay
  handleChange([field, 'room'], [value, '']);
  const cloneRequest = { ...request };
  cloneRequest.roomType = value;  // ← Thay
  sessionStorage.setItem(`${component}_requestContext`, JSON.stringify(cloneRequest));
  sessionStorage.setItem('roomType_state', value?.mkey || '');  // ← Thay
};

  const handleRoomChange = (field, value) => {
    const cloneRequest = { ...request };
    if (value?.mkey === request.room?.mkey) {
      handleChange([field], ['']);
      refreshCalendar(undefined, '');
      cloneRequest.room = '';
    } else {
      handleChange([field], [value]);
      refreshCalendar(undefined, value);
      cloneRequest.room = value;
    }
    sessionStorage.setItem(`${component}_requestContext`, JSON.stringify(cloneRequest));
  };

  const refreshCalendar = (roomType, room) => {
    onCalendarChange(sessionStorage.getItem('calendar_mode') || 'week', sessionStorage.getItem('calendar_currentDate') ? new Date(sessionStorage.getItem('calendar_currentDate')) : new Date(), roomType, room);
  };

  const onCalendarChange = (mode, currentDate, roomType, room) => {
    let fromDate = startOfDay(currentDate);
    let endDate = startOfDay(currentDate);
    if (mode === 'week') {
      fromDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (mode === 'month') {
      fromDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    }
    fromDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    setLoading(true);
    const fromDateFormatted = format(new Date(`${fromDate}`), 'yyyy-MM-dd HH:mm:ss');
    const endDateFormatted = format(new Date(`${endDate}`), 'yyyy-MM-dd HH:mm:ss');
    getBookings(mode, { myCalendar: myCalendar ? 1 : 0, fromDate: fromDateFormatted, endDate: endDateFormatted, roomType: roomType === undefined ? request?.roomType?.mkey : roomType?.mkey, room: room === undefined ? request?.room?.mkey : room?.mkey }).then(data => {
      setTempRequests(data);
      const formattedEvents = data.filter(booking => booking.room?.mkey)
      .map(booking => ({
        id: booking.id,
        // room: booking.room.mkey,
        // title: booking.room.mvalue,
        room: booking.room?.mkey,
        title: booking.room?.mvalue,
        startDate: booking.startDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        color: booking.room?.color || booking.room?.options?.color || booking.roomType?.color || booking.roomType?.options?.color || '#17a34a',
        opacity: booking.isApproved === 0 ? 0.5 : 1,
        canPriorityBooking: booking.canPriorityBooking,
        isPriority: booking.isPriority,
        tooltip: <table className="w-full text-sm overflow-hidden">
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Ngày sử dụng')}</td>
            <td className="px-3 py-2 text-gray-600">{formatDate(booking.startDate)}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Khung giờ sử dụng')}</td>
            <td className="px-3 py-2 text-gray-600">{`${formatTime(booking.startTime).replace(":00", "")} - ${formatTime(booking.endTime).replace(":00", "")}`}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Loại xe')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.roomType.mvalue}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Dòng xe đề xuất')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.carLine.mvalue}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Người đặt')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.bookingUser?.mvalue}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Người sử dụng')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.mainUser?.mvalue}</td>
          </tr>
           <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Mục đích')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.usagePurposeDetail}</td>
          </tr>
          {booking.clients > 0 && <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Số lượng khách')}</td>
            <td className="px-3 py-2 text-gray-600">{formatPersons(booking.clients, null, t)}</td>
          </tr>}
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Biển số xe')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.licensePlateNumber}</td>
          </tr>
          <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Tài xế')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.driverUser?.mvalue}</td>
          </tr>
           <tr>
            <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Số điện thoại tài xế')}</td>
            <td className="px-3 py-2 text-gray-600">{booking.driverPhoneNumber}</td>
          </tr>

        </tbody>
      </table>
      }));
      setEvents(formattedEvents.sort((a, b) => a.room > b.room ? 1 : -1));
    }).catch(error => console.error('Lỗi khi lấy dữ liệu đặt xe:', error))
    .finally(() => setLoading(false));
  };

  const handleEdit = (request, editRoute) => {
    setRequest(request);
    navigate(`${editRoute}/${request.id}`);
    setModal(null);
  };

  const handleEndBooking = (request, editRoute) => {
    setRequest({...request, isEndBooking: true});
    navigate(`${editRoute}/${request.id}`);
    setModal(null);
  };

  const handleApprove = (request) => {
    showConfirmModal(t('common.Bạn có chắc chắn muốn duyệt đặt xe có ID = [id] không?', { id: request.id }), () => {
      setLoading(true);
      approveItem(routes.approveBookingList.component, request.id)
        .then((response) => {
          if (response?.status === "error") {
            setError(t(response.message ?? 'common.Lỗi khi gửi yêu cầu'));
          } else {
            refreshCalendar();
            setModal(null);
          }
        })
        .catch((error) => {
          setError(t('common.Lỗi khi gửi yêu cầu'));
        })
        .finally(() => setLoading(false));
    });
  }

  const onEventClick = (id) => {
    const request = tempRequests.find(request => request.id === id);
    const isOwner = request?.bookingUser?.mkey === masterData.userId;
    
    const actionButtons = [];
    const currentTime = new Date();
    const bookingStartTime = new Date(`${request?.startDate} ${request?.startTime}`);
    const bookingEndTime = new Date(`${request?.startDate} ${request?.endTime}`);
    const isBookingInProgress = currentTime >= bookingStartTime && currentTime <= bookingEndTime;
    const isPastBooking = currentTime > bookingEndTime;

    if (routes.approveBookingList.permissions.some(permission => masterData.roles.includes(permission))) {
      const canApprove = (masterData?.approvers || []).includes(masterData.userId);
      if (request?.isCancelled) {
        // DO NOTHING
      } else if (request?.isApproved === -1) {
        // DO NOTHING
      } else if (isBookingInProgress) {
           // DO NOTHING
      } else if (isPastBooking) {
        // DO NOTHING
      } else if (request?.isApproved === 1) { // Đã duyệt, chờ phân công
          if (canApprove) {
            actionButtons.push({
              label: t('booking.Từ chối'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.rejectBookingForm.path)
            });
          }
      } else {
          if (canApprove) {
            if (!request?.waitForPriority) {
              actionButtons.push({
                label: t('booking.Duyệt'), className: 'bg-green-500', action: (request) => handleApprove(request)
              });
            }
            actionButtons.push({
              label: t('booking.Từ chối'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.rejectBookingForm.path)
            });
          }
      }
    }

    if (isOwner) {
      if (request?.isCancelled) {
        // DO NOTHING
      } else {
        if (isPastBooking) {
          // DO NOTHING
        } else {
          if (!isBookingInProgress) {
            actionButtons.push({
              label: t('booking.Sửa'), className: 'bg-blue-500', action: (request) => handleEdit(request, routes.bookingForm.path)
            });
            actionButtons.push({
              label: t('booking.Huỷ'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.cancelBookingForm.path)
            });
          }
        }
      }
    }

    const { fields, fieldLogs } = getFieldsBookingDetail(request, masterData, t);
    setModal(<>
        <ModalContent title={t("common.Thông tin đặt xe")} fields={fields} fieldLogs={fieldLogs} tabs={Array.isArray(request.log) && request.log.length > 0 ? [
            { label: t('common.Thông tin'), isDetail: true },
            { label: t('common.Lịch sử'), isHistory: true },
          ] : []} />
        <div className="flex justify-center gap-2">
          {actionButtons.map((button, index) => (
            <button key={index} className={`px-4 py-2 text-white rounded ${button.className}`} onClick={() => button.action(request)}>
              {button.label}
            </button>
          ))}
        </div>
      </>);
  }

  const onPriorityClick = (id) => {
    const request = tempRequests.find(request => request.id === id);
    // const building = masterData.buildings.find(b => b.mkey === request?.building?.mkey);
    const roomType = masterData.roomTypes.find(rt => rt.mkey === request?.roomType?.mkey);
    setRequest({ 
      ...Object.fromEntries(Object.keys(initBookingForm).map(field => [field, initBookingForm[field].value])), 
      ...request, 
      // building,
      roomType,
      startDate: request?.startDate,
      startTime: request?.startTime,
      endTime: request?.endTime,
      isPriority: 1,
      department: '',
      mainUser: '',
      users: [],
      usagePurpose: '',
      clientNames: [],
      clients: '',
      externalClientNames: [],
      externalClients: '',
      usagePurposeDetail: '',
      note: '',
      id: "*" 
    });
    navigate(`${routes.bookingForm.path}/*`);
  }

  const goToBookingForm = (date) => {
    const roomType = masterData.roomTypes.find(rt => rt.mkey === request?.roomType?.mkey);
    setRequest({ 
      ...Object.fromEntries(Object.keys(initBookingForm).map(field => [field, initBookingForm[field].value])), 
      ...request, 
      roomType,
      startDate: date ? format(date, 'yyyy-MM-dd') : '',
      startTime: date ? format(date, 'HH:mm:00') : '',
      endTime: date ? format(new Date(date.getTime() + 30 * 60 * 1000), 'HH:mm:00') : '',
      isPriority: 0,
      id: "*" 
    });
    navigate(`${routes.bookingForm.path}/*`);
  }
  

  return (
    <div className="p-0">
        {!isHome && <HeaderTableLayout 
          additionButtons={[
            {
              icon: FaPlus,
              label: routes.bookingCalendar.label,
              onClick: () => goToBookingForm('')
            }
          ]}
          addNewPath={routes.searchByDemand.path} 
          labelAddNew={routes.searchByDemand.label}
          headerLabel={routes.bookingCalendar.label} 
          backToUrl={-1}
        />}
      {Object.keys(initForm).filter(field => initForm[field].label).map(field => (
        <div key={field} className="mb-4">
          <LoopFormElement 
            component={component} 
            field={field} 
            initForm={initForm} 
            request={request} 
            errors={errors} 
            // handleChange={
            //   field === 'building' ? handleBuildingChange : 
            //   handleChange
            // } 
            handleChange={field === 'roomType' ? handleRoomTypeChange : handleChange}
          />
        </div>
      ))}
      <div className="my-4 border border-gray-200 rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {Object.keys(groupedRooms).map(roomType => (
              <tr key={roomType}>
                {/* <td className="px-6 py-4 w-1/4 whitespace-nowrap text-sm font-medium text-gray-900"> {groupedRooms[roomType]?.[0]?.roomTypeMValue}</td> */}
                <td className="px-6 py-4 text-sm text-gray-800">
                  {groupedRooms[roomType].map(room => (
                    <div 
                      key={room.mkey} 
                      className={`inline-block cursor-pointer text-xs px-2 py-0.5 rounded-full mr-1 mb-1 bg-gray-100 text-gray-800`}
                      style={!request.room?.mkey ? {
                        backgroundColor: room.color || room.roomTypeDetail.color, 
                        color: constrast(room.color || room.roomTypeDetail.color)
                      } : request.room?.mkey === room.mkey ? {
                        backgroundColor: room.color || room.roomTypeDetail.color, 
                        color: constrast(room.color || room.roomTypeDetail.color),
                        fontWeight: "bold"
                      } : {}}
                      onClick={() => handleRoomChange('room', room)}
                    >
                      {room.mvalue}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!!request.roomType && <Calendar 
        myCalendar={myCalendar} 
        onMyCalendarClick={() => setMyCalendar(!myCalendar)} 
        onCellClick={goToBookingForm} 
        onPriorityClick={onPriorityClick}
        onEventClick={onEventClick} 
        onCalendarChange={onCalendarChange} 
        events={events} 
      />}
    </div>
  );
};

export default withRequestForm(
  BookingCalendar, 
  component, 
  routes.home.path, 
  routes.bookingCalendar.label, 
  initForm
);
