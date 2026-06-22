import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';

const initForm = {
  id: { value: '' },
  cancelledReason: { 
    value: '', 
    label: 'booking.Lý do huỷ', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Lý do huỷ không được để trống') : '' 
  }
};

const component = routes.cancelBookingForm.component;

function CancelBookingForm({ request, errors, handleChange }) {
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
  CancelBookingForm, 
  component, 
  -1, 
  routes.bookingList.label, 
  initForm
);
