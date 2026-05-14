import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { suggestionUsers } from '../../systems/api';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  suggestUser: { 
    value: '', 
    label: ('approver.Tìm Esuhai User'), 
    type: 'suggest',
    suggestionApi: suggestionUsers,
    suggestionDisplayField: 'mvalue',
    suggestionMappingField: [['mkey', 'mkey'], ['mvalue', 'mvalue']],
  },
  mkey: { 
    value: '', 
    label: ('approver.Esuhai User ID'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('approver.Esuhai User ID không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: ('approver.Esuhai User Name'), 
    readonly: () => true,
    validate: (value, t) => !value ? t('approver.Esuhai User Name không được để trống') : '' 
  }
};

const component = routes.approverForm.component;

function ApproverForm({ request, errors, handleChange }) {

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
  ApproverForm, 
  component, 
  routes.approverList.path, 
  routes.approverList.label, 
  initForm
);
