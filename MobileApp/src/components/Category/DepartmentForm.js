import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'department.Mã phòng ban', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('department.Mã phòng ban không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'department.Tên phòng ban', 
    validate: (value, t) => !value ? t('department.Tên phòng ban không được để trống') : '' 
  }
};

const component = routes.departmentForm.component;

function DepartmentForm({ request, errors, handleChange }) {

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
  DepartmentForm, 
  component, 
  routes.departmentList.path, 
  routes.departmentList.label, 
  initForm
);
