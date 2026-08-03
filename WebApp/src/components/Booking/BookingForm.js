/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionClients, suggestionExternalClients, suggestionUsers, suggestionDepartureLocations } from '../../systems/api';
import { routes } from '../../systems/constant';
import { RequestContext } from '../../App';
import { formatPersons, formatSize, formatEquipmentsWithType, formatUser } from '../../systems/util';

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

const filterEndTimeOptions = (startTime, startDate, endDate, isEndBooking) => {
  const allOptions = generateTimeOptions();
  // Nếu khác ngày thì load toàn bộ danh sách giờ (không filter theo startTime)
  if (startDate && endDate && startDate !== endDate) {
    return allOptions;
  }
  // Nếu cùng ngày thì chỉ lấy các khung giờ sau startTime như cũ
  const startTimeIndex = allOptions.findIndex(option => option.mkey === startTime);
  if (!isEndBooking) {
    return startTimeIndex >= 0 ? allOptions.slice(startTimeIndex + 1) : allOptions;
  } else {
    return (startTimeIndex >= 0 ? allOptions.slice(startTimeIndex + 1) : allOptions).filter(option => {
      const currentTime = new Date();
      const currentDateString = currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1).toString().padStart(2, '0') + '-' + currentTime.getDate().toString().padStart(2, '0');
      const bookingEndTime = new Date(`${currentDateString} ${option.mkey}`);
      return currentTime > bookingEndTime;
    });
  }
};

export const initForm = {
  id: { value: '' },
  departureLocation: { 
    column: 1,
    value: [], 
    label: 'booking.Điểm xuất phát', 
    type: 'tags',
    maxItems: 1,
    insertable: true,
    tagsApi: suggestionDepartureLocations,
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'departureLocation']],
    placeholder: 'common.Nhập từ khoá & enter để tạo mới...',
    validate: (value, t) => !(value?.length) ? t('booking.Điểm xuất phát không được để trống') : ''
  },
  roomType: { 
    column: 1,
    value: '', 
    label: 'booking.Loại xe', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "roomTypes",
    validate: (value, t) => !value ? t('booking.Loại xe không được để trống') : '' 
  },
  startDate: { 
    column: 1,
    value: '', 
    label: 'booking.Ngày bắt đầu', 
    type: 'datepicker',
    disabled: (request) => request.isPriority || request.isEndBooking,
    validate: (value, t) => !value ? t('booking.Ngày bắt đầu không được để trống') : '' 
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
  endDate: { 
    column: 1,
    value: '', 
    label: 'booking.Ngày kết thúc', 
    type: 'datepicker',
    disabled: (request) => request.isPriority,
    minDate: (request) => {
      if (request?.startDate) {
        const parts = String(request.startDate).split('-');
        if (parts.length === 3) {
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
      }
      return null;
    },
    validate: (value, t, request) => {
      if (!value) return t('booking.Ngày kết thúc không được để trống');
      if (request?.startDate && value < request.startDate) return t('booking.Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      return '';
    } 
  },
  endTime: { 
    column: 1,
    value: '', 
    label: 'booking.Kết thúc lúc', 
    type: 'select',
    disabled: (request) => request.isPriority,
    options: generateTimeOptions(),
    validate: (value, t, request) => {
      if (!value) return t('booking.Kết thúc lúc không được để trống');
      if (request?.startDate && request?.endDate && request.startDate === request.endDate && request.startTime) {
        if (value <= request.startTime) return t('booking.Giờ kết thúc phải lớn hơn giờ bắt đầu khi cùng ngày');
      }
      return '';
    } 
  },
  employeeNumber: { 
    column: 1,
    value: '', 
    label: 'booking.Số lượng người', 
    type: 'number',
  },
  employeeList: { 
    column: 1,
    value: [], 
    label: 'booking.Tên nhân viên tham gia', 
    type: 'tags', 
    tagsApi: suggestionUsers,
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['*', 'employeeList']],
    tagsSchema: { key: 'mkey', value: 'mvalue' },
  },
  usagePurposeDetail: { 
    column: 1,
    value: '', 
    label: 'booking.Mục đích chuyến đi', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Mục đích chuyến đi không được để trống') : '' 
  },
  carLine: { 
    column: 2,
    value: '', 
    label: 'booking.Dòng xe đề xuất', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "carLines",
  },
 
  driver: { 
    column: 2,
    value: '', 
    label: 'booking.Tài xế đề xuất', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "drivers",
  },
  mainUser: { 
    column: 2,
    value: '', 
    label: 'booking.Người phụ trách', 
    type: 'suggest', 
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['*', 'mainUser']],
    formatter: (value) => formatUser(value),
    validate: (value, t) => !value ? t('booking.Người phụ trách không được để trống') : ''
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
  usagePurpose: { 
    column: 2,
    value: '', 
    label: 'booking.Phân loại khách', 
    type: 'select',
    isValueObject: true,
    optionsMasterDataKey: "usagePurposes",
    validate: (value, t) => !value ? t('booking.Phân loại khách không được để trống') : '' 
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
 flightNumber: {
    column: 2,
    value: '', 
    label: 'booking.Số hiệu chuyến bay', 
    type: 'text'
  },

  detailedSchedule: { 
    column: 2,
    value: '', 
    label: 'booking.Lịch trình chi tiết', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Lịch trình chi tiết không được để trống') : '' 
  },
  note: {
    column: 2,
    value: '', 
    label: 'booking.Ghi chú đặt xe', 
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
  
  const setEndTimeOptions = (startTime, startDate, endDate, isEndBooking) => {
    const options = filterEndTimeOptions(startTime, startDate, endDate, isEndBooking);
    initForm.endTime.options = options;
    setInitFormState(prevState => ({
      ...prevState,
      endTime: {
        ...prevState.endTime,
        options
      }
    }));
  };

  const handleStartDateChange = (field, value) => {
    let newEndDate = request.endDate;
    let newEndTime = request.endTime;

    if (!newEndDate) {
      newEndDate = value;
    } else if (newEndDate < value) {
      newEndDate = '';
      newEndTime = '';
    } else if (newEndDate === value && newEndTime && request.startTime && newEndTime <= request.startTime) {
      newEndTime = '';
    }

    handleChange(['startDate', 'endDate', 'endTime'], [value, newEndDate, newEndTime]);
    setEndTimeOptions(request.startTime, value, newEndDate, request.isEndBooking);
  };

  const handleEndDateChange = (field, value) => {
    handleChange(field, value);
    setEndTimeOptions(request.startTime, request.startDate, value, request.isEndBooking);
  };

  const handleStartTimeChange = (field, value) => {
    if (request.startDate === request.endDate && request.endTime && request.endTime <= value) {
      handleChange([field, "endTime"], [value, '']);
    } else {
      handleChange(field, value);
    }
    setEndTimeOptions(value, request.startDate, request.endDate, request.isEndBooking);
  };

  const toggleClientFieldsDisplay = (value) => {
    const shouldDisplayClientFields = masterData.config.usagePurposeKeyForClient?.includes(value?.mkey);
    if (shouldDisplayClientFields) {
      initForm.clients.label = 'booking.Số lượng khách';
      initForm.clients.validate = (value, t) => !value ? t('booking.Số lượng khách không được để trống') : '';
      initForm.clientNames.label = 'booking.Tên khách';
      initForm.clientNames.validate = (value, t) => !value.length ? t('booking.Tên khách không được để trống') : '';
    } else {
      initForm.clients.label = '';
      initForm.clients.validate = false;
      initForm.clientNames.label = '';
      initForm.clientNames.validate = false;
    }
    setInitFormState({ ...initForm });
  };

  const handleUsagePurposeChange = (field, value) => {
    handleChange(field, value);
    toggleClientFieldsDisplay(value);
  };

  useEffect(() => {
    if (request.isEndBooking) {
      const newEndTime = filterEndTimeOptions(request.startTime, request.startDate, request.endDate, request.isEndBooking)?.pop();
      if (newEndTime) {
        setTimeout(() => {
          handleChange(['endTime'], [newEndTime.mkey]);
        }, 0);
      }
    }
  }, [request.isEndBooking]);

  useEffect(() => {
    setEndTimeOptions(request.startTime, request.startDate, request.endDate, request.isEndBooking);
  }, [request.startTime, request.startDate, request.endDate]);

  useEffect(() => {
    toggleClientFieldsDisplay(request.usagePurpose);
  }, [request.usagePurpose]);

  
  const renderColumn1 = () => {
    const col1Fields = Object.keys(initFormState).filter(
      field => initFormState[field].label && initForm[field].column === 1
    );

    return col1Fields.map((field, index) => {
      if (field === 'startDate') {
        return (
          <div key={field} className="mb-4 flex items-center">
            <label className="block text-gray-700 w-[220px]">
              <span className="text-red-600">*</span> {t('booking.Ngày bắt đầu')}:
            </label>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1">
                <LoopFormElement 
                  hideLabel
                  containerClassName="mb-0"
                  component={component} 
                  field="startDate" 
                  initForm={initFormState} 
                  request={request} 
                  errors={errors} 
                  handleChange={handleStartDateChange} 
                />
              </div>
              <span className="text-gray-700 font-medium px-1">{t('common.lúc')}</span>
              <div className="flex-1">
                <LoopFormElement 
                  hideLabel
                  containerClassName="mb-0"
                  component={component} 
                  field="startTime" 
                  initForm={initFormState} 
                  request={request} 
                  errors={errors} 
                  handleChange={handleStartTimeChange} 
                />
              </div>
            </div>
          </div>
        );
      }
      if (field === 'startTime') {
        return null;
      }
      if (field === 'endDate') {
        return (
          <div key={field} className="mb-4 flex items-center">
            <label className="block text-gray-700 w-[220px]">
              <span className="text-red-600">*</span> {t('booking.Ngày kết thúc')}:
            </label>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1">
                <LoopFormElement 
                  hideLabel
                  containerClassName="mb-0"
                  component={component} 
                  field="endDate" 
                  initForm={initFormState} 
                  request={request} 
                  errors={errors} 
                  handleChange={handleEndDateChange} 
                />
              </div>
              <span className="text-gray-700 font-medium px-1">{t('common.lúc')}</span>
              <div className="flex-1">
                <LoopFormElement 
                  hideLabel
                  containerClassName="mb-0"
                  component={component} 
                  field="endTime" 
                  initForm={initFormState} 
                  request={request} 
                  errors={errors} 
                  handleChange={handleChange} 
                />
              </div>
            </div>
          </div>
        );
      }
      if (field === 'endTime') {
        return null;
      }

      return (
        <Fragment key={index}>
          <LoopFormElement 
            component={component} 
            labelWidth='w-[220px]'
            field={field} 
            initForm={initFormState} 
            request={request} 
            errors={errors} 
            handleChange={
              field === 'usagePurpose' ? handleUsagePurposeChange : 
              handleChange
            } 
          />
        </Fragment>
      );
    });
  };

  const renderFormElements = (column) => {
    if (column === 1) return renderColumn1();
    return Object.keys(initFormState).filter(field => initFormState[field].label && initForm[field].column === column).map((field, index) => (
      <Fragment key={index}>
        <LoopFormElement 
          component={component} 
          labelWidth='w-[220px]'
          field={field} 
          initForm={initFormState} 
          request={request} 
          errors={errors} 
          handleChange={
            field === 'usagePurpose' ? handleUsagePurposeChange : 
            handleChange
          } 
        />
      </Fragment>
    ));
  };

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
