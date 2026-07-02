/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { RequestContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { initForm as initBookingForm } from './BookingForm';
import { constrast } from '../../shared/Calendar';
import { useTranslation } from 'react-i18next';
import { getAvailableRooms } from '../../systems/api';

const generateTimeOptions = () => {
  // Tạo các lựa chọn thời gian từ 00:00 đến 23:30 với khoảng cách 30 phút
  const timeOptions = [];
  for (let hour = 0; hour <= 23; hour++) {
    for (const minute of ['00', '30']) {
      const hh = String(hour).padStart(2, '0');
      timeOptions.push({
        mkey: `${hh}:${minute}:00`,
        mvalue: `${hh}:${minute}`
      });
    }
  }
  
  return timeOptions;
};

const filterEndTimeOptions = (startTime) => {
  const startTimeIndex = generateTimeOptions().findIndex(option => option.mkey === startTime);
  return generateTimeOptions().slice(startTimeIndex + 1);
};

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
  date: { 
    value: '', 
    label: 'booking.Ngày', 
    type: 'datepicker',
    disabledPast: true,
  },
  startTime: { 
    value: '', 
    label: 'booking.Bắt đầu lúc', 
    type: 'select',
    options: generateTimeOptions().slice(0, 48),
  },
  endTime: { 
    value: '', 
    label: 'booking.Kết thúc lúc', 
    type: 'select',
    options: generateTimeOptions(),
  },
};

const component = routes.searchByDemand.component;

function SearchByDemand({ request, errors, handleChange }) {
  const { t } = useTranslation();
  const { masterData, setRequest, setLoading } = useContext(RequestContext);
  const [initFormState, setInitFormState] = useState(initForm);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fromDate = `${request.date || '1900-01-01'} ${request.startTime || '00:00:00'}`;
    const toDate = `${request.date || '2100-01-01'} ${request.endTime || '23:59:59'}`;
    setLoading(true);
    getAvailableRooms(component, { fromDate, toDate, roomType: request.roomType?.mkey }, { signal }).then(data => {
      setAvailableRooms(data);
      handleChange('room', '');
        }).catch(error => console.error('Lỗi khi lấy dữ liệu đặt xe:', error))
        .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [request.date, request.startTime, request.endTime]);

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const roomType = masterData.roomTypes.find(type => type.mkey === room.roomType);
    if (roomType) {
      if (!acc[roomType.mkey]) {
        acc[roomType.mkey] = [];
      }
      acc[roomType.mkey].push({ ...room, roomTypeDetail: roomType, roomTypeMValue: roomType.mvalue});
    }
    return acc;
  }, {});

  const setEndTimeOptions = (value) => {
    initForm.endTime.options = filterEndTimeOptions(value);
    setInitFormState({ ...initForm });
  };

  const handleStartTimeChange = (field, value) => {
    handleChange([field, "endTime"], [value, '']);
    setEndTimeOptions(value);
  };

  const searchRooms = () => {
    const rooms = masterData.rooms.filter(room => room.roomType.toString() === request.roomType?.mkey?.toString());
    setFilteredRooms(request.roomType?.mkey ? rooms : masterData.rooms);
  };

  const handleRoomTypeChange = (field, value) => {
    handleChange([field, 'room'], [value, '']);
    searchRooms();
  };

  const goToBookingForm = () => {
    const building = masterData.buildings.find(building => building.mkey === request?.room?.building);
    const cloneRequest = { 
      ...Object.fromEntries(Object.keys(initBookingForm).map(field => [field, initBookingForm[field].value])), 
      ...request, 
      building,
      id: "*" 
    };
    setRequest(cloneRequest);
    sessionStorage.setItem(`${component}_requestContext`, JSON.stringify(cloneRequest));
    navigate(`${routes.bookingForm.path}/*`);
  };
  
  useEffect(() => {
    setEndTimeOptions(request.startTime);
  }, [request.startTime]);

  useEffect(() => {
    searchRooms();
  }, [request.roomType]);

  useEffect(() => {
    sessionStorage.removeItem(`${routes.bookingForm.component}_requestContext`);
  }, []);

  return (
    <div className="p-0">
      {Object.keys(initFormState).filter(field => initFormState[field].label).map(field => (
        <div key={field} className="mb-4">
          <LoopFormElement 
            component={component} 
            field={field} 
            initForm={initFormState} 
            request={request} 
            errors={errors} 
            handleChange={
              field === 'roomType' ? handleRoomTypeChange : 
              field === 'startTime' ? handleStartTimeChange : 
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
                {/* <td className="px-6 py-4 w-1/4 whitespace-nowrap text-sm font-medium text-gray-900"> {groupedRooms[roomType]?.[0]?.roomTypeMValue}</td> */}
                <td className="px-6 py-4 text-sm text-gray-800">
                  {groupedRooms[roomType].map(room => {
                    const isAvailable = Array.isArray(availableRooms) && availableRooms.some(availableRoom => availableRoom === room.mkey);
                    return <div 
                      key={room.mkey} 
                      className={`inline-block cursor-pointer text-xs px-2 py-0.5 rounded-full mr-1 mb-1 bg-gray-100 text-gray-800`}
                      style={!request.room?.mkey && isAvailable ? {
                        backgroundColor: room.color || room.roomTypeDetail.color, 
                        color: constrast(room.color || room.roomTypeDetail.color)
                      } : request.room?.mkey === room.mkey && isAvailable ? {
                        backgroundColor: room.color || room.roomTypeDetail.color, 
                        color: constrast(room.color || room.roomTypeDetail.color),
                        fontWeight: "bold"
                      } : !isAvailable ? {
                        cursor: "default"
                      } : {}}
                      onClick={() => isAvailable && handleChange('room', room)}
                    >
                      {room.mvalue} {!isAvailable && <span>({t('booking.Không khả dụng')})</span>}
                    </div>
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex mt-4 justify-center space-x-6">
        <button
          className="back-btn"
          type="button"
          onClick={() => navigate(-1)}
        >
          {t('booking.Trở về')}
        </button>
        {/* <button
          className="submit-btn"
          type="button"
          disabled={availableRooms.length === 0 || !request.room?.mkey}
          onClick={() => goToBookingForm()}
        >
          {t('booking.Đặt xe')}
        </button> */}
      </div>
    </div>
  );
}

export default withRequestForm(
  SearchByDemand, 
  component, 
  routes.home.path, 
  routes.searchByDemand.label, 
  initForm
);
