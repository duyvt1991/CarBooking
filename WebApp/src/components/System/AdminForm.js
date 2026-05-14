import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionUsers } from '../../systems/api';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  suggestUser: { 
    value: '', 
    label: ('admin.Tìm Esuhai User'), 
    type: 'suggest',
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['mkey', 'mkey'], ['mvalue', 'mvalue']],
  },
  mkey: { 
    value: '', 
    label: ('admin.Esuhai User ID'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('admin.Esuhai User ID không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: ('admin.Esuhai User Name'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('admin.Esuhai User Name không được để trống') : '' 
  }
};

const component = routes.adminForm.component;

function AdminForm({ request, errors, handleChange }) {

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
  AdminForm, 
  component, 
  routes.adminList.path, 
  routes.adminList.label, 
  initForm
);
