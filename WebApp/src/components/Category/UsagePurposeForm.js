import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'usagePurpose.Mã mục đích sử dụng', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('usagePurpose.Mã mục đích sử dụng không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'usagePurpose.Tên mục đích sử dụng', 
    validate: (value, t) => !value ? t('usagePurpose.Tên mục đích sử dụng không được để trống') : '' 
  }
};

const component = routes.usagePurposeForm.component;

function UsagePurposeForm({ request, errors, handleChange }) {

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
  UsagePurposeForm, 
  component, 
  routes.usagePurposeList.path, 
  routes.usagePurposeList.label, 
  initForm
);
