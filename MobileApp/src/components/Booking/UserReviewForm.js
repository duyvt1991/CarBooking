import React, { useCallback, useEffect, useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';

const initForm = {
  userReviewCleanScore: { 
    value: 0, 
    label: 'booking.Điểm đánh giá vệ sinh', 
    type: 'reviewScore',
    validate: (value, t) => value === 0 ? t('booking.Điểm đánh giá vệ sinh không được để trống') : '' 
  },
  userReviewCleanComment: { 
    value: '', 
    label: 'booking.Chi tiết đánh giá vệ sinh', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Chi tiết đánh giá vệ sinh không được để trống') : '' 
  },
  userReviewEquipmentScore: { 
    value: 0, 
    label: 'booking.Điểm đánh giá thiết bị', 
    type: 'reviewScore',
    validate: (value, t) => value === 0 ? t('booking.Điểm đánh giá thiết bị không được để trống') : '' 
  },
  userReviewEquipmentComment: { 
    value: '', 
    label: 'booking.Chi tiết đánh giá thiết bị', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Chi tiết đánh giá thiết bị không được để trống') : '' 
  },
  userReviewFacilityScore: { 
    value: 0, 
    label: 'booking.Điểm đánh giá cơ sở vật chất', 
    type: 'reviewScore',
    validate: (value, t) => value === 0 ? t('booking.Điểm đánh giá cơ sở vật chất không được để trống') : '' 
  },
  userReviewFacilityComment: { 
    value: '', 
    label: 'booking.Chi tiết đánh giá cơ sở vật chất', 
    type: 'textarea',
    validate: (value, t) => !value ? t('booking.Chi tiết đánh giá cơ sở vật chất không được để trống') : '' 
  }
};

const component = routes.userReviewForm.component;

function UserReviewForm({ request, errors, handleChange }) {
  const { t } = useTranslation();
  const [initFormState, setInitFormState] = useState(initForm);

  const toggleCleanCommentDisplay = useCallback((value) => {
    if (value === 0 || value === 5) {
        initForm.userReviewCleanComment.label = '';
        initForm.userReviewCleanComment.validate = false;
    } else {
        initForm.userReviewCleanComment.label = t('booking.Chi tiết đánh giá vệ sinh');
        initForm.userReviewCleanComment.validate = (value) => !value ? t('booking.Chi tiết đánh giá vệ sinh không được để trống') : '';
    }
    setInitFormState({ ...initForm });
  }, [t]);

  const toggleEquipmentCommentDisplay = useCallback((value) => {
    if (value === 0 || value === 5) {
        initForm.userReviewEquipmentComment.label = '';
        initForm.userReviewEquipmentComment.validate = false;
    } else {
        initForm.userReviewEquipmentComment.label = t('booking.Chi tiết đánh giá thiết bị');
        initForm.userReviewEquipmentComment.validate = (value) => !value ? t('booking.Chi tiết đánh giá thiết bị không được để trống') : '';
    }
    setInitFormState({ ...initForm });
  }, [t]);

  const toggleFacilityCommentDisplay = useCallback((value) => {
    if (value === 0 || value === 5) {
        initForm.userReviewFacilityComment.label = '';
        initForm.userReviewFacilityComment.validate = false;
    } else {
        initForm.userReviewFacilityComment.label = t('booking.Chi tiết đánh giá cơ sở vật chất');
        initForm.userReviewFacilityComment.validate = (value) => !value ? t('booking.Chi tiết đánh giá cơ sở vật chất không được để trống') : '';
    }
    setInitFormState({ ...initForm });
  }, [t]);

  const handleCleanScoreChange = (field, value) => {
    handleChange(field, value);
    toggleCleanCommentDisplay(value);
  }

  const handleEquipmentScoreChange = (field, value) => {
    handleChange(field, value);
    toggleEquipmentCommentDisplay(value);
  }

  const handleFacilityScoreChange = (field, value) => {
    handleChange(field, value);
    toggleFacilityCommentDisplay(value);
  }

  useEffect(() => {
      toggleCleanCommentDisplay(request.userReviewCleanScore);
  }, [request.userReviewCleanScore, toggleCleanCommentDisplay]);

  useEffect(() => {
      toggleEquipmentCommentDisplay(request.userReviewEquipmentScore);
  }, [request.userReviewEquipmentScore, toggleEquipmentCommentDisplay]);

  useEffect(() => {
      toggleFacilityCommentDisplay(request.userReviewFacilityScore);
  }, [request.userReviewFacilityScore, toggleFacilityCommentDisplay]);

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
            field === 'userReviewCleanScore' ? handleCleanScoreChange : 
            field === 'userReviewEquipmentScore' ? handleEquipmentScoreChange : 
            field === 'userReviewFacilityScore' ? handleFacilityScoreChange :
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
