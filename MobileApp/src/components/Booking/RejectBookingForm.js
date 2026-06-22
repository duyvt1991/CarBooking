import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  rejectedReason: { 
    value: '', 
    label: 'booking.Lý do từ chối', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Lý do từ chối không được để trống') : '' 
  }
};

const component = routes.rejectBookingForm.component;

function RejectBookingForm({ request, errors, handleChange }) {
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
  RejectBookingForm, 
  component, 
  -1, 
  routes.approveBookingList.label, 
  initForm
);
