import React, { useCallback, useEffect, useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';

const initForm = {
  userReviewScore: { 
    value: 0, 
    label: 'booking.Điểm dịch vụ', 
    type: 'reviewScore',
    validate: (value, t) => value <= 0 ? t('booking.Điểm dịch vụ không được để trống') : '' 
  },
  userReviewCommentMost: { 
    value: '', 
    label: 'booking.Điều hài lòng nhất', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá thiết bị không được để trống') : '' 
  },
  userReviewCommentBad: { 
    value: '', 
    label: 'booking.Điều cần cải thiện', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá cơ sở vật chất không được để trống') : '' 
  }
};

const component = routes.userReviewForm.component;

function UserReviewForm({ request, errors, handleChange }) {
  const { t } = useTranslation();
  const [initFormState, setInitFormState] = useState(initForm);

  return (
    Object.keys(initFormState).filter(field => initFormState[field].label).map(field => (
        <LoopFormElement 
          key={field} 
          component={component} 
          labelWidth='w-[240px]'
          field={field} 
          initForm={initFormState} 
          request={request} 
          errors={errors} 
          handleChange={
           
            handleChange
          } 
        />
    ))
  );
}

export default withRequestForm(
  UserReviewForm, 
  component, 
  -1, 
  routes.userReviewList.label, 
  initForm
);
