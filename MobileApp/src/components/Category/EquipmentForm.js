import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mParentKey: { 
    value: '', 
    label: 'equipment.Loại thiết bị', 
    type: 'select',
    optionsMasterDataKey: 'equipmentTypes',
    validate: (value, t) => !value ? t('equipment.Loại thiết bị không được để trống') : '' 
  },
  mkey: { 
    value: '', 
    label: 'equipment.Mã thiết bị', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('equipment.Mã thiết bị không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'equipment.Tên thiết bị', 
    validate: (value, t) => !value ? t('equipment.Tên thiết bị không được để trống') : '' 
  },
  quantity: { 
    value: '', 
    label: 'equipment.Số lượng', 
  },
  note: { 
    value: '', 
    label: 'equipment.Trạng thái', 
  }
};

const component = routes.equipmentForm.component;

function EquipmentForm({ request, errors, handleChange }) {

  return (
    <>
      {Object.keys(initForm).filter(field => initForm[field].label).map(field => (
        <LoopFormElement 
          key={field} 
          component={component} 
          field={field} 
          initForm={initForm} 
          request={request} 
          errors={errors} 
          handleChange={handleChange} 
        />
      ))}
    </>
  );
}

export default withRequestForm(
  EquipmentForm, 
  component, 
  routes.equipmentList.path, 
  routes.equipmentList.label, 
  initForm
);
