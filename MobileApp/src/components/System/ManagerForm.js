import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionUsers } from '../../systems/api';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  suggestUser: { 
    value: '', 
    label: ('manager.Tìm Esuhai User'), 
    type: 'suggest',
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['mkey', 'mkey'], ['mvalue', 'mvalue']],
  },
  mkey: { 
    value: '', 
    label: ('manager.Esuhai User ID'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('manager.Esuhai User ID không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: ('manager.Esuhai User Name'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('manager.Esuhai User Name không được để trống') : '' 
  }
};

const component = routes.managerForm.component;

function ManagerForm({ request, errors, handleChange }) {

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
  ManagerForm, 
  component, 
  routes.managerList.path, 
  routes.managerList.label, 
  initForm
);
