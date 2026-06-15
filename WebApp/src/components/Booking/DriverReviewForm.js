import React, { useCallback, useEffect, useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';

const initForm = {
  driverReviewScore: { 
    value: 0, 
    label: 'booking.Điểm đánh giá', 
    type: 'reviewScore',
    validate: (value, t) => value <= 0 ? t('booking.Điểm đánh giá không được để trống') : '' 
  },
  driverReviewCommentMost: { 
    value: '', 
    label: 'booking.Việc làm tốt hôm nay', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  },
   driverReviewCommentBad: { 
    value: '', 
    label: 'booking.Việc chưa tốt cần cải thiện', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  },
   driverReviewCommentRequest: { 
    value: '', 
    label: 'booking.Đề xuất hỗ trợ từ quản lý', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  }
};

const component = routes.driverReviewForm.component;

function DriverReviewForm({ request, errors, handleChange }) {
  const { t } = useTranslation();
  const [initFormState, setInitFormState] = useState(initForm);


  return (
    Object.keys(initFormState).filter(field => initFormState[field].label).map(field => (
        <LoopFormElement 
          key={field} 
          component={component} 
          field={field} 
          initForm={initFormState} 
          request={request} 
          errors={errors} 
          handleChange={
            // field === 'managerReviewScore' ? handleScoreChange : 
            handleChange
          } 
        />
    ))
  );
}

export default withRequestForm(
  DriverReviewForm, 
  component, 
  routes.driverConfirmBookingList.path, 
  routes.driverConfirmBookingList.label, 
  initForm
);
