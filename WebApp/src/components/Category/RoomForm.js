import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { formatApprovers, formatEquipments, formatPriorityApprovers } from '../../systems/util';

const initForm = {
  id: { value: '' },
  roomType: { 
    value: '', 
    label: 'room.Loại phòng', 
    type: 'select', 
    optionsMasterDataKey: 'roomTypes',
    validate: (value, t) => !value ? t('room.Loại phòng không được để trống') : '',
    selectMappingField: [
      ['approvers'],
      ['equipments'],
      ['size'],
      ['persons'],
      ['color'],
      ['hasAutoApprove']
    ]
  },
  mkey: { 
    value: '', 
    label: 'room.Mã phòng', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('room.Mã phòng không được để trống') : '' 
  },
  building: { 
    value: '', 
    label: 'room.Toà nhà', 
    type: 'select', 
    optionsMasterDataKey: 'buildings',
    validate: (value, t) => !value ? t('room.Toà nhà không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'room.Tên phòng', 
    validate: (value, t) => !value ? t('room.Tên phòng không được để trống') : '' 
  },
  approvers: { 
    value: [], 
    label: 'room.Người phê duyệt', 
    type: 'tags', 
    optionsMasterDataKey: 'approvers',
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'approvers']],
    formatter: formatApprovers
  },
  priorityApprovers: {
    value: [], 
    label: 'room.Người phê duyệt ưu tiên', 
    type: 'tags', 
    maxItems: 1,
    optionsMasterDataKey: 'priorityApprovers',
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'priorityApprovers']],
    formatter: formatPriorityApprovers
  },
  equipments: { 
    value: [], 
    label: 'room.Thiết bị', 
    type: 'tags', 
    optionsMasterDataKey: 'equipments',
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'equipments']],
    formatter: formatEquipments
  },
  // size: { 
  //   value: '', 
  //   label: 'room.Diện tích (m²)'
  // },
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
