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
  building: { 
    value: '', 
    label: 'booking.Toà nhà', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "buildings", 
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
    if (!request.building) {
      setFilteredRooms([]);
      setEvents([]);
    } else {
      const rooms = masterData.rooms.filter(room => room.building.toString() === request.building.mkey.toString());
      setFilteredRooms(rooms);
      refreshCalendar(request.building);
    }
  }, [request.building, myCalendar]);
  
    useEffect(() => {
      sessionStorage.removeItem(`${routes.bookingForm.component}_requestContext`);
    }, []);
  
    useEffect(() => {
      if (!keepBuildingState() && isHome && masterData.buildings?.length > 0 && !request.building) {
        handleBuildingChange('building', masterData.config.buildingDefault || masterData.buildings[0]);
      }
    }, [masterData.buildings]);
    useEffect(() => {
      if (!keepBuildingState() && request.id && !request.building) {
        handleBuildingChange('building', masterData.config.buildingDefault || masterData.buildings[0]);
      }
    }, [request.id]);

  const keepBuildingState = () => {
    let hasBuildingState = false;
    const buildingState = sessionStorage.getItem('building_state');
    if (buildingState && masterData.buildings?.length > 0) {
      const building = masterData.buildings.find(b => b.mkey.toString() === buildingState.toString());
      if (building) {
        handleBuildingChange('building', building);
        hasBuildingState = true;
      }
    }
    console.log("hasBuildingState", hasBuildingState);
    return hasBuildingState;
  };

  const handleBuildingChange = (field, value) => {
    handleChange([field, 'room'], [value, '']);
    const cloneRequest = { ...request };
    cloneRequest.building = value;
    sessionStorage.setItem(`${component}_requestContext`, JSON.stringify(cloneRequest));
    sessionStorage.setItem('building_state', value?.mkey || '');
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

  const refreshCalendar = (building, room) => {
    onCalendarChange(sessionStorage.getItem('calendar_mode') || 'week', sessionStorage.getItem('calendar_currentDate') ? new Date(sessionStorage.getItem('calendar_currentDate')) : new Date(), building, room);
  };

  const onCalendarChange = (mode, currentDate, building, room) => {
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
    getBookings(mode, { myCalendar: myCalendar ? 1 : 0, fromDate: fromDateFormatted, endDate: endDateFormatted, building: building === undefined ? request?.building?.mkey : building?.mkey, room: room === undefined ? request?.room?.mkey : room?.mkey }).then(data => {
      setTempRequests(data);
      const formattedEvents = data.map(booking => ({
        id: booking.id,
        room: booking.room.mkey,
        title: booking.room.mvalue,
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
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Phòng')}</td>
        <td className="px-3 py-2 text-gray-600">{booking.room.mvalue}</td>
          </tr>
          <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Người đặt')}</td>
        <td className="px-3 py-2 text-gray-600">{booking.bookingUser?.mvalue || "-"}</td>
          </tr>
          <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Người chủ trì')}</td>
        <td className="px-3 py-2 text-gray-600">{booking.mainUser?.mvalue || "-"}</td>
          </tr>
          <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Người sử dụng phòng')}</td>
        <td className="px-3 py-2 text-gray-600">{Array.isArray(booking.users) && booking.users.length > 0 
          ? booking.users.map(user => user.mvalue).join(', ') 
          : '-'}</td>
          </tr>
          <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Mục đích sử dụng')}</td>
        <td className="px-3 py-2 text-gray-600">{booking.usagePurpose?.mvalue || '-'}</td>
          </tr>
          {booking.clients > 0 && <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Số lượng khách')}</td>
        <td className="px-3 py-2 text-gray-600">{formatPersons(booking.clients, null, t)}</td>
          </tr>}
          {booking.externalClients > 0 && <tr>
        <td className="font-semibold px-3 py-2 text-gray-700 text-nowrap">{t('common.Số lượng khách ngoài')}</td>
        <td className="px-3 py-2 text-gray-600">{formatPersons(booking.externalClients, null, t)}</td>
          </tr>}
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
    showConfirmModal(t('common.Bạn có chắc chắn muốn duyệt đặt phòng có ID = [id] không?', { id: request.id }), () => {
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
      const canPriorityApprove = (request?.room?.priorityApprovers || []).includes(masterData.userId);
      const canApprove = (request?.room?.approvers || request?.roomType?.approvers || []).includes(masterData.userId);
      const isApprovedUser = (request?.approvedUsers || []).length === 0 || (request?.approvedUsers || []).map(user => user.mkey).includes(masterData.userId);
      if (request?.isCancelled) {
        // DO NOTHING
      } else if (request?.isApproved === -1) {
        // DO NOTHING
      } else if (isBookingInProgress) {
        if (request?.isPriority) {
          if (canPriorityApprove && isApprovedUser) {
            actionButtons.push({
              label: t('booking.Kết thúc'), className: 'bg-blue-500', action: (request) => handleEndBooking(request, routes.bookingForm.path)
            });
          }
        } else {
          if ((canPriorityApprove || canApprove) && isApprovedUser) {
            actionButtons.push({
              label: t('booking.Kết thúc'), className: 'bg-blue-500', action: (request) => handleEndBooking(request, routes.bookingForm.path)
            });
          }
        }
      } else if (isPastBooking) {
        // DO NOTHING
      } else if (request?.isApproved === 1) {
        if (request?.isPriority) {
          if (canPriorityApprove && isApprovedUser) {
            actionButtons.push({
              label: t('booking.Từ chối'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.rejectBookingForm.path)
            });
          }
        } else {
          if ((canPriorityApprove || canApprove) && isApprovedUser) {
            actionButtons.push({
              label: t('booking.Từ chối'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.rejectBookingForm.path)
            });
          }
        }
      } else {
        if (request?.isPriority) {
          if (canPriorityApprove) {
            actionButtons.push({
              label: t('booking.Duyệt'), className: 'bg-green-500', action: (request) => handleApprove(request)
            });
            actionButtons.push({
              label: t('booking.Từ chối'), className: 'bg-red-500', action: (request) => handleEdit(request, routes.rejectBookingForm.path)
            });
          }
        } else {
          if (canPriorityApprove || canApprove) {
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
        <ModalContent title={t("common.Thông tin đặt phòng")} fields={fields} fieldLogs={fieldLogs} tabs={Array.isArray(request.log) && request.log.length > 0 ? [
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
    const building = masterData.buildings.find(b => b.mkey === request?.building?.mkey);
    setRequest({ 
      ...Object.fromEntries(Object.keys(initBookingForm).map(field => [field, initBookingForm[field].value])), 
      ...request, 
      building,
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
    const building = masterData.buildings.find(b => b.mkey === request?.building?.mkey);
    setRequest({ 
      ...Object.fromEntries(Object.keys(initBookingForm).map(field => [field, initBookingForm[field].value])), 
      ...request, 
      building,
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
            handleChange={
              field === 'building' ? handleBuildingChange : 
              handleChange
            } 
          />
        </div>
      ))}
      <div className="my-4 border border-gray-200 rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {Object.keys(groupedRooms).map(roomType => (
              <tr key={roomType}>
                <td className="px-6 py-4 w-1/4 whitespace-nowrap text-sm font-medium text-gray-900"> {groupedRooms[roomType]?.[0]?.roomTypeMValue}</td>
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
      {!!request.building && <Calendar 
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
