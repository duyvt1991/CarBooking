import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { formatApprovers, formatEquipments, formatPriorityApprovers } from '../../systems/util';

const initForm = {
  id: { value: '' },
  roomType: { 
    value: '', 
    label: 'room.Loại xe', 
    type: 'select', 
    optionsMasterDataKey: 'roomTypes',
    validate: (value, t) => !value ? t('room.Loại xe không được để trống') : '',
    selectMappingField: [
      ['persons'],
      ['color']
    ]
  },
  mkey: { 
    value: '', 
    label: 'room.Mã xe', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('room.Mã xe không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'room.Tên xe', 
    validate: (value, t) => !value ? t('room.Tên xe không được để trống') : '' 
  },
  // licensePlateNumber: { 
  //   value: '', 
  //   label: 'room.Biển số',
  //   validate: (value, t, request) => String(request?.hasServiceCar) === '1' && !value ? t('room.Biển số không được để trống') : '' 
  // },
  licensePlateNumber: { 
    value: '', 
    label: 'room.Biển số',
    required: (request) => String(request?.hasServiceCar) !== '1',
    validate: (value, t, request) => String(request?.hasServiceCar) !== '1' && !value ? t('room.Biển số không được để trống') : '' 
  },
  persons: { 
    value: '', 
    label: 'room.Sức chứa (người)'
  },
  color: { 
    value: '', 
    label: 'room.Màu đại diện', 
    type: 'color'
  },
  note: {
    value: '', 
    label: 'room.Ghi chú', 
    type: 'textarea'
  },
  hasServiceCar: { 
    value: '', 
    label: 'room.Xe ngoài', 
    type: 'select', 
    options: [
      { mkey: '1', mvalue: ('room.Có') },
      { mkey: '0', mvalue: ('room.Không') }
    ],
    validate: (value, t) => value === '' ? t('room.Xe ngoài không được để trống') : '' 
  },
  isSync: {
    value: 0,
    type: 'hidden'
  }
};

const component = routes.roomForm.component;

function RoomForm({ request, errors, handleChange }) {

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
  RoomForm, 
  component, 
  routes.roomList.path, 
  routes.roomList.label, 
  initForm
);
