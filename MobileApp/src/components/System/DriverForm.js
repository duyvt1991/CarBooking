import { type } from '@testing-library/user-event/dist/type';
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
    type: 'number',
    validate: (value, t) => !value ? t('driver.Số điện thoại không được để trống') : '' 
  },
  isSync: {
    value: 0,
    type: 'hidden'
  }
};

const component = routes.driverForm.component;

function DriverForm({ request, errors, handleChange }) {

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
  DriverForm, 
  component, 
  routes.driverList.path, 
  routes.driverList.label, 
  initForm
);
