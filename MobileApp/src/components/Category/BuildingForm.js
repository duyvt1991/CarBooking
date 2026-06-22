import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'building.Mã toà nhà', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('building.Mã toà nhà không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'building.Tên toà nhà', 
    validate: (value, t) => !value ? t('building.Tên toà nhà không được để trống') : '' 
  },
  address: { 
    value: '', 
    label: 'building.Địa chỉ'
  }
};

const component = routes.buildingForm.component;

function BuildingForm({ request, errors, handleChange }) {

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
  BuildingForm, 
  component, 
  routes.buildingList.path, 
  routes.buildingList.label, 
  initForm
);
