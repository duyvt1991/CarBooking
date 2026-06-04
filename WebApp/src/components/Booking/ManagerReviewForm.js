import React, { useCallback, useEffect, useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';

const initForm = {
  managerReviewScore: { 
    value: 0, 
    label: 'booking.Điểm đánh giá', 
    type: 'reviewScore',
    validate: (value, t) => value <= 0 ? t('booking.Điểm đánh giá không được để trống') : '' 
  },
  managerReviewCommentMost: { 
    value: '', 
    label: 'booking.Điểm mạnh nổi bật', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  },
   managerReviewCommentBad: { 
    value: '', 
    label: 'booking.Điểm cần cải thiện', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  },
   managerReviewCommentRequest: { 
    value: '', 
    label: 'booking.Đề xuất thưởng - phạt - đào tạo', 
    type: 'textarea',
    // validate: (value, t) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '' 
  }
};

const component = routes.managerReviewForm.component;

function ManagerReviewForm({ request, errors, handleChange }) {
  const { t } = useTranslation();
  const [initFormState, setInitFormState] = useState(initForm);

  // const toggleCommentDisplay = useCallback((value) => {
  //   if (value === 0 || value === 5) {
  //       initForm.managerReviewComment.label = '';
  //       initForm.managerReviewComment.validate = false;
  //   } else {
  //       initForm.managerReviewComment.label = t('booking.Chi tiết đánh giá');
  //       initForm.managerReviewComment.validate = (value) => !value ? t('booking.Chi tiết đánh giá không được để trống') : '';
  //   }
  //   setInitFormState({ ...initForm });
  // }, [t]);

  // const handleScoreChange = (field, value) => {
  //   handleChange(field, value);
  //   toggleCommentDisplay(value);
  // }

  // useEffect(() => {
  //     toggleCommentDisplay(request.managerReviewScore);
  // }, [request.managerReviewScore, toggleCommentDisplay]);

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
  ManagerReviewForm, 
  component, 
  routes.managerReviewList.path, 
  routes.managerReviewList.label, 
  initForm
);
