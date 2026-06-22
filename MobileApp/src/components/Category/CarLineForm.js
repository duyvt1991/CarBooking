import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'carLine.Mã dòng xe', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('carLine.Mã dòng xe không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'carLine.Tên dòng xe', 
    validate: (value, t) => !value ? t('carLine.Tên dòng xe không được để trống') : '' 
  }
};

const component = routes.carLineForm.component;

function CarLineForm({ request, errors, handleChange }) {

  return (
        Object.keys(initForm).filter(field => initForm[field].label).map(field => (
          <LoopFormElement 
            key={field} 
            labelWidth='w-[240px]'
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
  CarLineForm, 
  component, 
  routes.carLineList.path, 
  routes.carLineList.label, 
  initForm
);
