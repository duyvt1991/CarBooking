import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'equipmentType.Mã loại thiết bị', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('equipmentType.Mã loại thiết bị không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'equipmentType.Tên loại thiết bị', 
    validate: (value, t) => !value ? t('equipmentType.Tên loại thiết bị không được để trống') : '' 
  }
};

const component = routes.equipmentTypeForm.component;

function EquipmentTypeForm({ request, errors, handleChange }) {

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
  EquipmentTypeForm, 
  component, 
  routes.equipmentTypeList.path, 
  routes.equipmentTypeList.label, 
  initForm
);
