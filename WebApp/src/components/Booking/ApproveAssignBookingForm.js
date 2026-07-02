import { useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { RequestContext } from '../../App';
import { getBookings } from '../../systems/api';

const getVal = (val) => {
  if (!val) return '';
  if (typeof val === 'object') return val.mkey || val.id || '';
  return String(val);
};

const initForm = {
  id: { value: '' },
  serviceType: {
    value: '',
    label: 'booking.Loại dịch vụ',
    type: 'select',
    optionsMasterDataKey: 'serviceTypes',
    validate: (value, t) => !getVal(value) ? t('booking.Loại dịch vụ không được để trống') : ''
  },
  room: {
    value: '',
    label: 'booking.Xe',
    type: 'select',
    // optionsMasterDataKey: 'rooms',
    options: [],
    validate: (value, t, request) => {
      const serviceType = getVal(request?.serviceType);
      if (!['ST001', 'ST002'].includes(serviceType)) return '';
      return !getVal(value) ? t('booking.Xe không được để trống') : '';
    },
    // selectMappingField: (request) => request?.serviceType === 'ST001'
    //   ? [['licensePlateNumber', 'licensePlateNumber']]
    //   : []
  },
  driverUser: {
    value: '',
    label: 'booking.Tài xế',
    type: 'select',
    options: [],
    validate: (value, t, request) => {
      const isInternalServiceType = getVal(request?.serviceType) === 'ST001';
      if (!isInternalServiceType) return '';
      return !getVal(value) ? t('booking.Tài xế không được để trống') : '';
    }
    // ,
    // selectMappingField: (request) => request?.serviceType === 'ST001'
    //   ? [['driverPhoneNumber', 'driverPhoneNumber']]
    //   : []
  },
  driverPhoneNumber: {
    value: '',
    label: 'booking.Số điện thoại tài xế',
    type: 'text',
    required: (request) => getVal(request?.serviceType) === 'ST002',
    validate: (value, t, request) => {
      if (getVal(request?.serviceType) !== 'ST002') return '';
      return !value ? t('booking.Số điện thoại tài xế không được để trống') : '';
    },
  },
  licensePlateNumber: {
    value: '',
    label: 'booking.Biển số xe',
    type: 'text',
    required: (request) => getVal(request?.serviceType) === 'ST002',
    validate: (value, t, request) => {
      if (getVal(request?.serviceType) !== 'ST002') return '';
      return !value ? t('booking.Biển số xe không được để trống' ) : '';
    },
  }
};

const component = routes.approveAssignBookingForm.component;

function ApproveAssignBookingForm({ request, errors, handleChange }) {
  useTranslation();
  const { masterData } = useContext(RequestContext);
  const [initFormState, setInitFormState] = useState(initForm);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState(null);

  const startDateStr = typeof request?.startDate === 'object' && request?.startDate.toISOString 
    ? request.startDate.toISOString().split('T')[0] 
    : String(request?.startDate || '').split(' ')[0];

  const reqStartTimeStr = typeof request?.startTime === 'object' && request?.startTime.toISOString 
    ? request.startTime.toISOString().split('T')[1].substring(0,8) 
    : String(request?.startTime || '');

  const reqEndTimeStr = typeof request?.endTime === 'object' && request?.endTime.toISOString 
    ? request.endTime.toISOString().split('T')[1].substring(0,8) 
    : String(request?.endTime || '');

  useEffect(() => {
    if (!startDateStr || !reqStartTimeStr || !reqEndTimeStr) return;
    
    let isMounted = true;
    const fromDateStr = `${startDateStr} 00:00:00`;
    const toDateStr = `${startDateStr} 23:59:59`;
    
    getBookings('day', {
      fromDate: fromDateStr,
      endDate: toDateStr
    }).then(data => {
      if (!isMounted) return;
      const reqStart = new Date(`${startDateStr} ${reqStartTimeStr}`).getTime();
      const reqEnd = new Date(`${startDateStr} ${reqEndTimeStr}`).getTime();
      
      const overlappingBookings = data.filter(b => {
        if (String(b.id) === String(request.id)) return false;
        if (Number(b.isCancelled) === 1) return false;
        if (![2, 3, 4].includes(Number(b.isApproved))) return false;
        // Lọc trùng lịch: Chỉ lấy các booking có isServiceCar = '0' (hoặc trống)
        const serviceTypeVal = b.serviceType;
        let isServiceCarVal = '0';
        if (serviceTypeVal) {
          if (typeof serviceTypeVal === 'object') {
            isServiceCarVal = String(serviceTypeVal.isServiceCar ?? '0');
          } else {
            try {
              const parsed = JSON.parse(serviceTypeVal);
              isServiceCarVal = String(parsed.isServiceCar ?? '0');
            } catch (e) {}
          }
        }
        if (isServiceCarVal !== '0') return false;
        
        const bStartStr = typeof b.startDate === 'object' && b.startDate.toISOString ? b.startDate.toISOString().split('T')[0] : String(b.startDate).split(' ')[0];
        const bStartTimeStr = typeof b.startTime === 'object' && b.startTime.toISOString ? b.startTime.toISOString().split('T')[1].substring(0,8) : String(b.startTime);
        const bEndTimeStr = typeof b.endTime === 'object' && b.endTime.toISOString ? b.endTime.toISOString().split('T')[1].substring(0,8) : String(b.endTime);

        const bStart = new Date(`${bStartStr} ${bStartTimeStr}`).getTime();
        const bEnd = new Date(`${bStartStr} ${bEndTimeStr}`).getTime();
        
        return (reqStart >= bStart && reqStart < bEnd) ||
               (reqEnd > bStart && reqEnd <= bEnd) ||
               (reqStart <= bStart && reqEnd >= bEnd);
      });
      
      const safeParseKey = (item) => {
        if (!item) return null;
        if (typeof item === 'object') return item.mkey;
        try { return JSON.parse(item).mkey; } catch (e) { return null; }
      };
      
      const busyRoomKeys = overlappingBookings.map(b => safeParseKey(b.room)).filter(Boolean);
      const busyDriverKeys = overlappingBookings.map(b => safeParseKey(b.driverUser)).filter(Boolean);
      
      const freeRooms = (masterData.rooms || []).filter(r => !busyRoomKeys.includes(r.mkey));
      const freeDrivers = (masterData.drivers || []).filter(d => !busyDriverKeys.includes(d.mkey));
      
      setAvailableRooms(freeRooms);
      setAvailableDrivers(freeDrivers);
    }).catch(err => {
      console.error(err);
      if (isMounted) {
        setAvailableRooms(masterData.rooms || []);
        setAvailableDrivers(masterData.drivers || []);
      }
    });

    return () => { isMounted = false; };
  }, [startDateStr, reqStartTimeStr, reqEndTimeStr, request?.id, masterData.rooms?.length, masterData.drivers?.length]);

  const getRoomOptions = () => {
    const rooms = availableRooms !== null ? availableRooms : (masterData.rooms || []);
    const st = getVal(request?.serviceType);

    if (st === 'ST002') {
      return rooms.filter(room => room?.hasServiceCar?.toString() === '1');
    }

    if (st === 'ST001') {
      return rooms.filter(room => room?.hasServiceCar?.toString() !== '1');
    }

    return [];
  };

  const getDriverOptions = () => {
    return availableDrivers !== null ? availableDrivers : (masterData.drivers || []);
  };

  const toggleServiceTypeFieldsDisplay = useCallback((value) => {
    const st = getVal(value);
    const isInternalServiceType = st === 'ST001';
    const isServiceCar = st === 'ST002';

    setInitFormState({
      ...initForm,
      room: {
        ...initForm.room,
        label: isInternalServiceType || isServiceCar ? 'booking.Xe' : ''
      },
      driverUser: {
        ...initForm.driverUser,
        label: isInternalServiceType ? 'booking.Tài xế' : ''
      },
      driverPhoneNumber: {
        ...initForm.driverPhoneNumber,
        readonly: () => isInternalServiceType
      },
      licensePlateNumber: {
        ...initForm.licensePlateNumber,
        readonly: () => isInternalServiceType
      }
    });
  }, []);

  const handleServiceTypeChange = (field, value) => {
    const st = getVal(value);
    const isInternalServiceType = st === 'ST001';
    const isServiceCar = st === 'ST002';

    if (isInternalServiceType) {
      handleChange(field, st);
    } else if (isServiceCar) {
      handleChange(
        ['serviceType', 'driverUser', 'driverPhoneNumber', 'licensePlateNumber'],
        [st, '', '', '']
      );
    } else {
      handleChange(
        ['serviceType', 'room', 'driverUser', 'driverPhoneNumber', 'licensePlateNumber'],
        [st, '', '', '', '']
      );
    }

    toggleServiceTypeFieldsDisplay(st);
  };

  const handleRoomChange = (field, value) => {
    const roomVal = getVal(value);
    const selectedRoom = (masterData.rooms || []).find(room => room.mkey === roomVal);

    if (getVal(request?.serviceType) === 'ST001') {
      handleChange(
        ['room', 'licensePlateNumber'],
        [roomVal, selectedRoom?.licensePlateNumber || '']
      );
      return;
    }

    handleChange(field, roomVal);
  };

  const handleDriverUserChange = (field, value) => {
    const driverVal = getVal(value);
    const selectedDriverUser = (masterData.drivers || []).find(driverUser => driverUser.mkey === driverVal);

    if (getVal(request?.serviceType) === 'ST001') {
      handleChange(
        ['driverUser', 'driverPhoneNumber'],
        [driverVal, selectedDriverUser?.driverPhoneNumber || '']
      );
      return;
    }

    handleChange(field, driverVal);
  };

  useEffect(() => {
    toggleServiceTypeFieldsDisplay(request.serviceType);
  }, [request.serviceType, toggleServiceTypeFieldsDisplay]);

  const formState = {
    ...initFormState,
    room: {
      ...initFormState.room,
      options: getRoomOptions()
    },
    driverUser: {
      ...initFormState.driverUser,
      options: getDriverOptions()
    }
  };

  return Object.keys(initFormState)
    .filter((field) => initFormState[field].label)
    .map((field) => (
      <LoopFormElement
        key={field}
        component={component}
        field={field}
        initForm={formState}
        request={request}
        errors={errors}
        handleChange={
        field === 'serviceType' ? handleServiceTypeChange
          : field === 'room' ? handleRoomChange
          : field === 'driverUser' ? handleDriverUserChange
            : handleChange

        }
      />
    ));
}

export default withRequestForm(
  ApproveAssignBookingForm,
  component,
  -1,
  routes.approveAssignBookingForm.label,
  initForm
);