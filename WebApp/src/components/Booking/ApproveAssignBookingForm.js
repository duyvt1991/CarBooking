import { useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { RequestContext } from '../../App';

const initForm = {
  id: { value: '' },
  serviceType: {
    value: '',
    label: 'booking.Loại dịch vụ',
    type: 'select',
    optionsMasterDataKey: 'serviceTypes',
    validate: (value, t) => !value ? t('booking.Loại dịch vụ không được để trống') : ''
  },
  room: {
    value: '',
    label: 'booking.Xe',
    type: 'select',
    // optionsMasterDataKey: 'rooms',
    options: [],
    validate: (value, t, request) => {
      const serviceType = request?.serviceType;
      if (!['ST001', 'ST002'].includes(serviceType)) return '';
      return !value ? t('booking.Xe không được để trống') : '';
    },
    // selectMappingField: (request) => request?.serviceType === 'ST001'
    //   ? [['licensePlateNumber', 'licensePlateNumber']]
    //   : []
  },
  driverUser: {
    value: '',
    label: 'booking.Tài xế',
    type: 'select',
    optionsMasterDataKey: 'drivers',
    validate: (value, t, request) => {
      const isInternalServiceType = request?.serviceType === 'ST001';
      if (!isInternalServiceType) return '';
      return !value ? t('booking.Tài xế không được để trống') : '';
    },
    selectMappingField: (request) => request?.serviceType === 'ST001'
      ? [['driverPhoneNumber', 'driverPhoneNumber']]
      : []
  },
  driverPhoneNumber: {
    value: '',
    label: 'booking.Số điện thoại tài xế',
    type: 'text',
    required: (request) => request?.serviceType === 'ST002',
    validate: (value, t, request) => {
      if (request?.serviceType !== 'ST002') return '';
      return !value ? t('booking.Số điện thoại tài xế không được để trống') : '';
    },
  },
  licensePlateNumber: {
    value: '',
    label: 'booking.Biển số xe',
    type: 'text',
    required: (request) => request?.serviceType === 'ST002',
    validate: (value, t, request) => {
      if (request?.serviceType !== 'ST002') return '';
      return !value ? t('booking.Biển số xe không được để trống' ) : '';
    },
  }
};

const component = routes.approveAssignBookingForm.component;

function ApproveAssignBookingForm({ request, errors, handleChange }) {
  useTranslation();
  const { masterData } = useContext(RequestContext);
  const [initFormState, setInitFormState] = useState(initForm);

  const getRoomOptions = () => {
    const rooms = masterData.rooms || [];

    if (request?.serviceType === 'ST002') {
      return rooms.filter(room => room?.hasServiceCar?.toString() === '1');
    }

    if (request?.serviceType === 'ST001') {
      return rooms.filter(room => room?.hasServiceCar?.toString() !== '1');
    }

    return [];
  };

  const toggleServiceTypeFieldsDisplay = useCallback((value) => {
    const isInternalServiceType = (value ?? '') === 'ST001';
    const isServiceCar = (value ?? '') === 'ST002';

    setInitFormState({
      ...initForm,
      room: {
        ...initForm.room,
        label: isInternalServiceType || isServiceCar ? 'booking.Xe' : ''
      },
      driverUser: {
        ...initForm.driverUser,
        label: isInternalServiceType ? 'booking.Tài xế' : ''
      },
      driverPhoneNumber: {
        ...initForm.driverPhoneNumber,
        readonly: () => isInternalServiceType
      },
      licensePlateNumber: {
        ...initForm.licensePlateNumber,
        readonly: () => isInternalServiceType
      }
    });
  }, []);

  const handleServiceTypeChange = (field, value) => {
    const isInternalServiceType = value === 'ST001';
    const isServiceCar = value === 'ST002';

    if (isInternalServiceType) {
      handleChange(field, value);
    } else if (isServiceCar) {
      handleChange(
        ['serviceType', 'driverUser', 'driverPhoneNumber', 'licensePlateNumber'],
        [value, '', '', '']
      );
    } else {
      handleChange(
        ['serviceType', 'room', 'driverUser', 'driverPhoneNumber', 'licensePlateNumber'],
        [value, '', '', '', '']
      );
    }

    toggleServiceTypeFieldsDisplay(value);
  };

  const handleRoomChange = (field, value) => {
    const selectedRoom = (masterData.rooms || []).find(room => room.mkey === value);

    if (request?.serviceType === 'ST001') {
      handleChange(
        ['room', 'licensePlateNumber'],
        [value, selectedRoom?.licensePlateNumber || '']
      );
      return;
    }

    handleChange(field, value);
  };

  useEffect(() => {
    toggleServiceTypeFieldsDisplay(request.serviceType);
  }, [request.serviceType, toggleServiceTypeFieldsDisplay]);

  const formState = {
    ...initFormState,
    room: {
      ...initFormState.room,
      options: getRoomOptions()
    }
  };

  return Object.keys(initFormState)
    .filter((field) => initFormState[field].label)
    .map((field) => (
      <LoopFormElement
        key={field}
        component={component}
        field={field}
        initForm={formState}
        request={request}
        errors={errors}
        handleChange={
        field === 'serviceType'
          ? handleServiceTypeChange
          : field === 'room'
            ? handleRoomChange
            : handleChange

        }
      />
    ));
}

export default withRequestForm(
  ApproveAssignBookingForm,
  component,
  -1,
  routes.approveAssignBookingForm.label,
  initForm
);