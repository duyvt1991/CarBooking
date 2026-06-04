import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { formatApprovers, formatEquipments } from '../../systems/util';

const initForm = {
  id: { value: '' },
  mkey: { 
    value: '', 
    label: 'roomType.Mã loại xe', 
    readonly: (request) => !!request.id,
    validate: (value, t) => !value ? t('roomType.Mã loại xe không được để trống') : '' 
  },
  mvalue: { 
    value: '', 
    label: 'roomType.Tên loại xe', 
    validate: (value, t) => !value ? t('roomType.Tên loại xe không được để trống') : '' 
  },
  // approvers: { 
  //   value: [], 
  //   label: 'roomType.Người phê duyệt', 
  //   type: 'tags', 
  //   optionsMasterDataKey: 'approvers',
  //   tagsDisplayField: 'mvalue',
  //   tagsMappingField: [['mkey', 'approvers']],
  //   formatter: formatApprovers,
  //   validate: (value, t) => !value.length ? t('roomType.Người phê duyệt không được để trống') : '' 
  // },
  // equipments: { 
  //   value: [], 
  //   label: 'roomType.Thiết bị', 
  //   type: 'tags', 
  //   optionsMasterDataKey: 'equipments',
  //   tagsDisplayField: 'mvalue',
  //   tagsMappingField: [['mkey', 'equipments']],
  //   formatter: formatEquipments,
  //   // validate: (value, t) => !value.length ? t('roomType.Thiết bị không được để trống') : '' 
  // },
  // size: { 
  //   value: '', 
  //   label: 'roomType.Diện tích (m²)', 
  //   validate: (value, t) => !value ? t('roomType.Diện tích (m²) không được để trống') : '' 
  // },
  persons: { 
    value: '', 
    label: 'roomType.Sức chứa (người)', 
    validate: (value, t) => !value ? t('roomType.Sức chứa (người) không được để trống') : '' 
  },
  color: { 
    value: '', 
    label: 'roomType.Màu đại diện', 
    type: 'color', 
    validate: (value, t) => !value ? t('roomType.Màu đại diện không được để trống') : '' 
  },
  // hasAutoApprove: { 
  //   value: '', 
  //   label: 'roomType.Tự động duyệt', 
  //   type: 'select', 
  //   options: [
  //     { mkey: '1', mvalue: ('roomType.Có') },
  //     { mkey: '0', mvalue: ('roomType.Không') }
  //   ],
  //   validate: (value, t) => value === '' ? t('roomType.Tự động duyệt không được để trống') : '' 
  // }
};

const component = routes.roomTypeForm.component;

function RoomTypeForm({ request, errors, handleChange }) {

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
  RoomTypeForm, 
  component, 
  routes.roomTypeList.path, 
  routes.roomTypeList.label, 
  initForm
);
