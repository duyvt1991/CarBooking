import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { formatApprovers, formatEquipments } from '../../systems/util';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'roomType.Mã loại xe', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('roomType.Mã loại xe không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'roomType.Tên loại xe', 
    validate: (value, t) => !value ? t('roomType.Tên loại xe không được để trống') : '' 
  },
  persons: { 
    value: '', 
    label: 'roomType.Sức chứa (người)', 
    validate: (value, t) => !value ? t('roomType.Sức chứa (người) không được để trống') : '' 
  },
  color: { 
    value: '', 
    label: 'roomType.Màu đại diện', 
    type: 'color', 
    validate: (value, t) => !value ? t('roomType.Màu đại diện không được để trống') : '' 
  }

};

const component = routes.roomTypeForm.component;

function RoomTypeForm({ request, errors, handleChange }) {

  return (
        Object.keys(initForm).filter(field => initForm[field].label).map(field => (
          <LoopFormElement 
            key={field} 
            component={component} 
            field={field} 
            initForm={initForm} 
            request={request} 
            errors={errors} 
            handleChange={handleChange} 
          />
        ))
  );
}

export default withRequestForm(
  RoomTypeForm, 
  component, 
  routes.roomTypeList.path, 
  routes.roomTypeList.label, 
  initForm
);
