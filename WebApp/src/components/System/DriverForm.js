import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionUsers } from '../../systems/api';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  suggestUser: { 
    value: '', 
    label: ('driver.Tìm Esuhai User'), 
    type: 'suggest',
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['mkey', 'mkey'], ['mvalue', 'mvalue']],
  },
  mkey: { 
    value: '', 
    label: ('driver.Esuhai User ID'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('driver.Esuhai User ID không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: ('driver.Esuhai User Name'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('driver.Esuhai User Name không được để trống') : '' 
  },
  driverPhoneNumber: { 
    value: '', 
    label: 'driver.Số điện thoại', 
    validate: (value, t) => !value ? t('driver.Số điện thoại không được để trống') : !/^\d+$/.test(value) ? t('driver.Số điện thoại chỉ được chứa số') : ''
  },
  lockStartDate: {
    value: '',
    label: 'driver.Khóa từ lúc',
    type: 'datetimepicker',
    timeIntervals: 30,
    placeholder: 'driver.Chọn ngày giờ bắt đầu khóa',
    required: (request) => !!request?.lockEndDate,
    validate: (value, t, request) => {
      if (request?.lockEndDate && !value) {
        return t('driver.Vui lòng chọn ngày giờ bắt đầu khóa');
      }
      return '';
    }
  },
  lockEndDate: {
    value: '',
    label: 'driver.Khóa đến lúc',
    type: 'datetimepicker',
    timeIntervals: 30,
    placeholder: 'driver.Chọn ngày giờ kết thúc khóa',
    minDate: (request) => request?.lockStartDate ? new Date(request.lockStartDate.replace(' ', 'T')) : null,
    required: (request) => !!request?.lockStartDate,
    validate: (value, t, request) => {
      if (request?.lockStartDate && !value) {
        return t('driver.Vui lòng chọn ngày giờ kết thúc khóa');
      }
      if (request?.lockStartDate && value) {
        const startTs = new Date(request.lockStartDate.replace(' ', 'T')).getTime();
        const endTs = new Date(value.replace(' ', 'T')).getTime();
        if (endTs <= startTs) {
          return t('driver.Thời gian kết thúc khóa phải lớn hơn thời gian bắt đầu khóa');
        }
      }
      return '';
    }
  },
  isSync: {
    value: 0,
    type: 'hidden'
  }
};

const component = routes.driverForm.component;

function DriverForm({ request, errors, handleChange }) {

  const customHandleChange = (field, value) => {
  if (field === 'driverPhoneNumber') {
      const numericValue = value.replace(/\D/g, ''); // Chỉ giữ lại số
      handleChange(field, numericValue);
    } else {
      handleChange(field, value);
    }
  };

  return (
        Object.keys(initForm).filter(field => initForm[field].label).map(field => (
          <LoopFormElement 
            key={field} 
            component={component} 
            field={field} 
            initForm={initForm} 
            request={request} 
            errors={errors} 
            handleChange={customHandleChange} 
          />
        ))
  );
}

export default withRequestForm(
  DriverForm, 
  component, 
  routes.driverList.path, 
  routes.driverList.label, 
  initForm
);
