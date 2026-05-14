import withRequestForm from '../../hoc/withRequestForm';
import LoopFormElement from '../../shared/LoopFormElement';
import { routes } from '../../systems/constant';
import { formatUsagePurposes } from '../../systems/util';

const initForm = {
  maxDayToBooking: { 
    value: '', 
    label: 'config.Không được đặt phòng quá (ngày)', 
    validate: (value, t) => !value ? t('config.Không được đặt phòng quá (ngày) không được để trống') : '' 
  },
  maxHourToAutoApprove: { 
    value: '', 
    label: 'config.Tự động duyệt khi dưới (giờ)', 
    validate: (value, t) => !value ? t('config.Tự động duyệt khi dưới (giờ) không được để trống') : '' 
  },
  maxDayToReview: { 
    value: '', 
    label: 'config.Thời gian đánh giá không quá (ngày)', 
    validate: (value, t) => !value ? t('config.Thời gian đánh giá không quá (ngày) không được để trống') : '' 
  },
  usagePurposeKeyForClient: { 
    value: [], 
    label: 'config.Mã mục đích sử dụng cho tiếp khách', 
    type: 'tags', 
    optionsMasterDataKey: 'usagePurposes',
    tagsDisplayField: 'mvalue',
    tagsMappingField: [['mkey', 'usagePurposeKeyForClient']],
    formatter: formatUsagePurposes,
    validate: (value, t) => !value ? t('config.Mã mục đích sử dụng cho tiếp khách không được để trống') : '' 
  },
  buildingDefault: { 
    value: '', 
    label: 'config.Tòa nhà mặc định', 
    type: 'select',
    disabled: (request) => request.isPriority || request.isEndBooking,
    isValueObject: true,
    optionsMasterDataKey: "buildings",
    validate: (value, t) => !value ? t('config.Tòa nhà mặc định không được để trống') : '' 
  },
  bookingAdminGroupId: { 
    value: '', 
    label: 'config.Workgroup ID của quản trị viên', 
    validate: (value, t) => !value ? t('config.Workgroup ID của quản trị viên không được để trống') : '' 
  },
  bookingApprovalGroupId: { 
    value: '', 
    label: 'config.Workgroup ID của người duyệt', 
    validate: (value, t) => !value ? t('config.Workgroup ID của người duyệt không được để trống') : '' 
  },
  bookingPriorityApprovalGroupId: { 
    value: '', 
    label: 'config.Workgroup ID của người duyệt ưu tiên', 
    validate: (value, t) => !value ? t('config.Workgroup ID của người duyệt ưu tiên không được để trống') : '' 
  },
  bookingMonitorGroupId: { 
    value: '', 
    label: 'config.Workgroup ID của người quản lý phòng', 
    validate: (value, t) => !value ? t('config.Workgroup ID của người quản lý phòng không được để trống') : '' 
  }
};

const component = routes.config.component;

function ConfigForm({ request, errors, handleChange }) {

  return (
    Object.keys(initForm).filter(field => initForm[field].label).map(field => (
        <LoopFormElement 
            key={field} 
            labelWidth='w-[420px]'
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
  ConfigForm, 
  component, 
  routes.home.path, 
  routes.config.label, 
  initForm
);
