/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionClients, suggestionExternalClients, suggestionUsers } from '../../systems/api';
import { routes } from '../../systems/constant';
import { RequestContext } from '../../App';
import { formatPersons, formatSize, formatEquipmentsWithType, formatUser } from '../../systems/util';

const generateTimeOptions = () => {
  // Tạo các lựa chọn thời gian từ 07:00 đến 21:30 với khoảng cách 30 phút
  const startHour = 7;
  const endHour = 22; // end boundary (22:00 not included as a slot start)
  const totalSlots = (endHour - startHour) * 2 + 1; // half-hour slots between 07:00 and 22:00
  const timeOptions = Array.from({ length: totalSlots }, (_, i) => {
    const hour = startHour + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const hh = String(hour).padStart(2, '0');
    return {
      mkey: `${hh}:${minute}:00`,
      mvalue: `${hh}:${minute}`
    };
  });
  
  return timeOptions;
};

const filterEndTimeOptions = (startTime, isEndBooking) => {
  const startTimeIndex = generateTimeOptions().findIndex(option => option.mkey === startTime);
  if (!isEndBooking) {
    return generateTimeOptions().slice(startTimeIndex + 1);
  } else {
    return generateTimeOptions().slice(startTimeIndex + 1).filter(option => {
      const currentTime = new Date();
      const currentDateString = currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1).toString().padStart(2, '0') + '-' + currentTime.getDate().toString().padStart(2, '0');
      const bookingEndTime = new Date(`${currentDateString} ${option.mkey}`);
      return currentTime > bookingEndTime;
    });
  }
};

export const initForm = {
  id: { value: '' },
  building: { 
    column: 1,
    value: '', 
    label: 'booking.Toà nhà', 
    type: 'select',
    disabled: (request) => request.isPriority || request.isEndBooking,
    isValueObject: true,
    optionsMasterDataKey: "buildings",
    validate: (value, t) => !value ? t('booking.Toà nhà không được để trống') : '' 
  },
  room: { 
    column: 1,
    value: '', 
    label: '', 
    type: 'select',
    disabled: (request) => request.isPriority || request.isEndBooking,
    isValueObject: true,
    options: [],
    validate: (value, t) => !value ? t('booking.Phòng không được để trống') : '' 
  },
  department: { 
    column: 2,
    value: '', 
    label: 'booking.Phòng ban', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "departments",
    validate: (value, t) => !value ? t('booking.Phòng ban không được để trống') : '' 
  },
  mainUser: { 
    column: 2,
    value: '', 
    label: 'booking.Người chủ trì', 
    type: 'suggest', 
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['*', 'mainUser']],
    formatter: (value) => formatUser(value),
    validate: (value, t) => !value ? t('booking.Người chủ trì không được để trống') : ''
  },
  users: { 
    column: 2,
    value: [], 
    label: 'booking.Người sử dụng', 
    type: 'tags', 
    tagsApi: suggestionUsers,
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['*', 'users']],
    tagsSchema: { key: 'mkey', value: 'mvalue' },
    validate: (value, t) => !value.length ? t('booking.Người sử dụng không được để trống') : '' 
  },
  startDate: { 
    column: 1,
    value: '', 
    label: 'booking.Ngày sử dụng', 
    type: 'datepicker',
    disabled: (request) => request.isPriority || request.isEndBooking,
    disabledPast: true,
    validate: (value, t) => !value ? t('booking.Ngày sử dụng không được để trống') : '' 
  },
  startTime: { 
    column: 1,
    value: '', 
    label: 'booking.Bắt đầu lúc', 
    type: 'select',
    disabled: (request) => request.isPriority || request.isEndBooking,
    options: generateTimeOptions().slice(0, 48),
    validate: (value, t) => !value ? t('booking.Bắt đầu lúc không được để trống') : '' 
  },
  endTime: { 
    column: 1,
    value: '', 
    label: 'booking.Kết thúc lúc', 
    type: 'select',
    disabled: (request) => request.isPriority,
    options: generateTimeOptions(),
    validate: (value, t) => !value ? t('booking.Kết thúc lúc không được để trống') : '' 
  },
  usagePurpose: { 
    column: 2,
    value: '', 
    label: 'booking.Mục đích sử dụng', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "usagePurposes",
    validate: (value, t) => !value ? t('booking.Mục đích sử dụng không được để trống') : '' 
  },
  usagePurposeLocale: { 
    column: 2,
    value: 'vn', 
    label: 'booking.Quốc gia', 
    type: 'radio',
    options: [
      { mkey: 'vn', mvalue: ('booking.Việt') },
      { mkey: 'jp', mvalue: ('booking.Nhật') }
    ],
    validate: (value, t) => !value ? t('booking.Quốc gia không được để trống') : '' 
  },
  clientNames: { 
    column: 2,
    value: [], 
    label: '', 
    type: 'tags',
    insertable: true,
    tagsApi: suggestionClients,
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'clientNames']],
    placeholder: 'common.Nhập từ khoá & enter để tạo mới...',
    validate: (value, t) => !value.length ? t('booking.Tên khách không được để trống') : ''
  },
  clients: { 
    column: 2,
    value: '', 
    label: '', 
    type: 'number'
  },
  externalClientNames: {
    column: 2,
    value: [], 
    label: '', 
    type: 'tags',
    insertable: true,
    tagsApi: suggestionExternalClients,
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'externalClientNames']],
    placeholder: 'common.Nhập từ khoá & enter để tạo mới...'
  },
  externalClients: {
    column: 2,
    value: '',
    label: '',
    type: 'number'
  },
  usagePurposeDetail: { 
    column: 2,
    value: '', 
    label: 'booking.Chi tiết MĐSD', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Chi tiết MĐSD không được để trống') : '' 
  },
  note: {
    column: 2,
    value: '', 
    label: 'booking.Ghi chú đặt phòng', 
    type: 'textarea'
  },
  isPriority: {
    value: 0,
    type: 'hidden'
  },
};

const component = routes.bookingForm.component;

function BookingForm({ request, setRequest, errors, handleChange }) {
  const { t } = useTranslation();
  const { masterData } = useContext(RequestContext);

  const [initFormState, setInitFormState] = useState(initForm);
  const [roomDetails, setRoomDetails] = useState({});

  const toggleRoomDisplay = (value) => {
    if (value?.mkey) {
      initForm.room.label = 'booking.Phòng';
      setRequest({ 
        ...request, 
        room: masterData.rooms.find(room => room.mkey.toString() === request.room?.mkey?.toString()),
        building: masterData.buildings.find(building => building.mkey.toString() === value?.mkey.toString()),
        department: masterData.departments.find(department => department.mkey.toString() === request.department?.mkey?.toString()),
        usagePurpose: masterData.usagePurposes.find(usagePurpose => usagePurpose.mkey.toString() === request.usagePurpose?.mkey?.toString()),
      });
    } else {
      initForm.room.label = '';
    }
    initForm.room.options = masterData.rooms.filter(room => room.building.toString() === value?.mkey?.toString());
    setInitFormState({ ...initForm });
  };

  const handleBuildingChange = (field, value) => {
    handleChange([field, 'room'], [value, '']);
    toggleRoomDisplay(value);
  };

  const getFacilities = (value) => {
    if (!value) {
      setRoomDetails({});
      return;
    }
    const room = masterData.rooms.find(room => room.mkey.toString() === value.toString());
    if (!room) {
      setRoomDetails({});
      return;
    }
    const roomType = masterData.roomTypes.find(roomType => roomType.mkey.toString() === room.roomType.toString());
    const facilities = {
      roomType: roomType?.mvalue,
      equipments: room?.equipments?.length 
        ? (room?.equipments?.map(equipment => masterData.equipments.find(e => e.mkey.toString() === equipment.toString())).filter(e => e) || [])
        : (roomType?.equipments?.map(equipment => masterData.equipments.find(e => e.mkey.toString() === equipment.toString())).filter(e => e) || []),
      size: room?.size || roomType?.size || 0,
      persons: room?.persons || roomType?.persons || 0,
      note: room?.note || '',
    }
    setRoomDetails(facilities);
  };

  const handleRoomChange = (field, value) => {
    handleChange(field, value);
    getFacilities(value?.mkey);
  };

  const setEndTimeOptions = (value, isEndBooking) => {
    initForm.endTime.options = filterEndTimeOptions(value, isEndBooking);
    setInitFormState({ ...initForm });
  };

  const handleStartTimeChange = (field, value) => {
    handleChange([field, "endTime"], [value, '']);
    setEndTimeOptions(value, request.isEndBooking);
  };

  const toggleClientFieldsDisplay = (value) => {
    const shouldDisplayClientFields = masterData.config.usagePurposeKeyForClient?.includes(value?.mkey);
    if (shouldDisplayClientFields) {
      initForm.clients.label = 'booking.Số lượng khách';
      initForm.clients.validate = (value, t) => !value ? t('booking.Số lượng khách không được để trống') : '';
      initForm.clientNames.label = 'booking.Tên khách';
      initForm.clientNames.validate = (value, t) => !value.length ? t('booking.Tên khách không được để trống') : '';
      initForm.externalClients.label = 'booking.Số lượng khách ngoài';
      initForm.externalClientNames.label = 'booking.Phân loại khách ngoài';
    } else {
      initForm.clients.label = '';
      initForm.clients.validate = false;
      initForm.clientNames.label = '';
      initForm.clientNames.validate = false;
      initForm.externalClients.label = '';
      initForm.externalClients.validate = false;
      initForm.externalClientNames.label = '';
      initForm.externalClientNames.validate = false;
    }
    setInitFormState({ ...initForm });
  };

  const handleUsagePurposeChange = (field, value) => {
    handleChange(field, value);
    toggleClientFieldsDisplay(value);
  };

  useEffect(() => {
    if (request.isEndBooking) {
      const newEndTime = filterEndTimeOptions(request.startTime, request.isEndBooking)?.pop();
      if (newEndTime) {
        setTimeout(() => {
          handleChange(['endTime'], [newEndTime.mkey]);
        }, 0);
      }
    }
  }, [request.isEndBooking]);

  useEffect(() => {
    toggleRoomDisplay(request.building);
  }, [request.building]);

  useEffect(() => {
    getFacilities(request.room?.mkey);
  }, [request.room]);

  useEffect(() => {
    setEndTimeOptions(request.startTime, request.isEndBooking);
  }, [request.startTime]);

  useEffect(() => {
    toggleClientFieldsDisplay(request.usagePurpose);
  }, [request.usagePurpose]);

  const renderRoomDetails = () => {
    const details = [
      { label: 'booking.Loại phòng', value: roomDetails.roomType },
      { label: 'booking.Thiết bị', value: formatEquipmentsWithType(roomDetails.equipments, masterData) },
      // { label: 'booking.Diện tích', value: formatSize(roomDetails.size) },
      { label: 'booking.Sức chứa', value: formatPersons(roomDetails.persons, null, t) },
      { label: 'booking.Ghi chú phòng', value: roomDetails.note }
    ].filter(detail => detail.value);
  
    return (
      <div className="my-4 border border-gray-200 rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {details.map((detail, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t(detail.label)}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFormElements = (column) => (
    Object.keys(initFormState).filter(field => initFormState[field].label && initForm[field].column === column).map((field, index) => (
      <Fragment key={index}>
        <LoopFormElement 
          component={component} 
          labelWidth='w-[220px]'
          field={field} 
          initForm={initFormState} 
          request={request} 
          errors={errors} 
          handleChange={
            field === 'building' ? handleBuildingChange : 
            field === 'usagePurpose' ? handleUsagePurposeChange : 
            field === 'room' ? handleRoomChange : 
            field === 'startTime' ? handleStartTimeChange : 
            handleChange
          } 
        />
        {request.room?.mkey && field === "room" && renderRoomDetails()}
      </Fragment>
    ))
  );

  return (
    <>
      <div className="flex gap-8">
        <div className="w-1/2">
          {renderFormElements(1)}
        </div>
        <div className="w-1/2">
          {renderFormElements(2)}
        </div>
      </div>
    </>
  );
}

export default withRequestForm(
  BookingForm, 
  component, 
  -1, 
  routes.bookingForm.label, 
  initForm
);
