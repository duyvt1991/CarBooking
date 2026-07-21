import React, { useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../shared/CustomSelect';

const qcdRatingOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

const initForm = {
  driverReviewCommentMost: { 
    value: '', 
    label: 'review.1. Việc làm tốt trong chuyến đi', 
    type: 'textarea',
  },
  driverReviewCommentBad: { 
    value: '', 
    label: 'review.2. Việc chưa tốt cần cải tiến', 
    type: 'textarea',
  },
  driverReviewCommentFeedback: { 
    value: '', 
    label: 'review.3. Góp ý/đánh giá dành cho nhân viên/khách hàng tham gia chuyến đi', 
    type: 'textarea',
  },
  driverReviewCommentRequest: { 
    value: '', 
    label: 'review.4. Đề xuất hỗ trợ từ quản lý', 
    type: 'textarea',
  },
  driverReviewPrep: {
    value: '',
  },
  driverReviewQcd: {
    value: '',
  }
};

const component = routes.driverReviewForm.component;

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-gray-50 px-4 py-2 font-semibold text-gray-800 text-left hover:bg-gray-100/80 transition-colors text-base"
      >
        <span>{title}</span>
        <span className="text-gray-500 text-lg transition-transform duration-200 transform">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && <div className="p-3 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );
};

function DriverReviewForm({ request, errors, handleChange }) {
  const { t } = useTranslation();

  const parseJsonField = (field, defaultValue) => {
    try {
      if (typeof request[field] === 'string' && request[field]) {
        return JSON.parse(request[field]);
      }
      return request[field] || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const prepData = parseJsonField('driverReviewPrep', {
    uniform: { value: '', note: '' },
    shoes: { value: '', note: '' },
    interior: { value: '', note: '' },
    aircon: { value: '', note: '' },
    water: { value: '', note: '' },
    dashcam: { value: '', note: '' },
    fuel: { value: '', note: '' },
    odor: { value: '', note: '' }
  });

  const qcdData = parseJsonField('driverReviewQcd', {
    safety: { q: '', c: '', d: '', note: '' },
    onTime: { q: '', c: '', d: '', note: '' },
    service: { q: '', c: '', d: '', note: '' },
    support: { q: '', c: '', d: '', note: '' },
    privacy: { q: '', c: '', d: '', note: '' },
    management: { q: '', c: '', d: '', note: '' },
    overtime: { q: '', c: '', d: '', note: '' }
  });

  const handlePrepChange = (key, prop, value) => {
    const updated = {
      ...prepData,
      [key]: {
        ...(prepData[key] || { value: '', note: '' }),
        [prop]: value
      }
    };
    handleChange('driverReviewPrep', updated);
  };

  const handleQcdChange = (key, prop, value) => {
    const updated = {
      ...qcdData,
      [key]: {
        ...(qcdData[key] || { q: '', c: '', d: '', note: '' }),
        [prop]: value
      }
    };

    handleChange('driverReviewQcd', updated);
  };

  const checklistItems = [
    { key: 'uniform', label: t('review.Đồng phục đúng chuẩn') },
    { key: 'shoes', label: t('review.Giày sạch') },
    { key: 'interior', label: t('review.Xe sạch nội thất') },
    { key: 'aircon', label: t('review.Điều hòa làm mát sẵn') },
    { key: 'water', label: t('review.Nước/khăn giấy đầy đủ') },
    { key: 'dashcam', label: t('review.Camera hành trình hoạt động') },
    { key: 'fuel', label: t('review.Xe đủ nhiên liệu') },
    { key: 'odor', label: t('review.Không có mùi khó chịu') },
  ];

  const qcdItems = [
    { key: 'safety', label: t('review.An toàn khi lái xe') },
    { key: 'onTime', label: t('review.Đúng giờ đón/trả') },
    { key: 'service', label: t('review.Tác phong phục vụ') },
    { key: 'support', label: t('review.Chủ động hỗ trợ') },
    { key: 'privacy', label: t('review.Bảo mật thông tin') },
    { key: 'management', label: t('review.Quản lý xe & chi phí') },
    { key: 'overtime', label: t('review.Sẵn sàng OT') },
  ];

  return (
    <div className="text-left py-2 text-base">
      {/* SECTION A. CHUẨN BỊ XE & HÌNH ẢNH CÁ NHÂN */}
      <CollapsibleSection title={t('review.A. CHUẨN BỊ XE & HÌNH ẢNH CÁ NHÂN')}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-left border-collapse text-base">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-3 font-semibold text-gray-600 border-r border-gray-200 w-[35%]">{t('review.Nội dung')}</th>
                <th className="py-2 px-3 font-semibold text-gray-600 text-center border-r border-gray-200 w-[20%]">{t('review.Có')} / {t('review.Không')}</th>
                <th className="py-2 px-3 font-semibold text-gray-600 w-[45%]">{t('review.Ghi chú')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checklistItems.map((item) => {
                const currentVal = prepData[item.key]?.value || '';
                return (
                  <tr key={item.key} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-700 border-r border-gray-200">
                      {item.label}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-gray-200">
                      <div className="flex justify-center space-x-6">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`prep-${item.key}`}
                            value="Có"
                            checked={currentVal === 'Có'}
                            onChange={() => handlePrepChange(item.key, 'value', 'Có')}
                            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1.5 text-gray-700">{t('review.Có')}</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`prep-${item.key}`}
                            value="Không"
                            checked={currentVal === 'Không'}
                            onChange={() => handlePrepChange(item.key, 'value', 'Không')}
                            className="h-5 w-5 text-red-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1.5 text-gray-700">{t('review.Không')}</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={prepData[item.key]?.note || ''}
                        onChange={(e) => handlePrepChange(item.key, 'note', e.target.value)}
                        placeholder="..."
                        className="w-full border border-gray-300 rounded px-2.5 py-1 text-base focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* SECTION B. TỰ ĐÁNH GIÁ QCD */}
      <CollapsibleSection title={t('review.B. TỰ ĐÁNH GIÁ QCD')}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-left border-collapse text-base min-w-[500px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-3 font-semibold text-gray-600 border-r border-gray-200 w-[30%]">{t('review.Đầu mục')}</th>
                <th className="py-2 px-3 font-semibold text-gray-600 text-center border-r border-gray-200 w-[11%]">Q</th>
                <th className="py-2 px-3 font-semibold text-gray-600 text-center border-r border-gray-200 w-[11%]">C</th>
                <th className="py-2 px-3 font-semibold text-gray-600 text-center border-r border-gray-200 w-[11%]">D</th>
                <th className="py-2 px-3 font-semibold text-gray-600 w-[37%]">{t('review.Ghi chú')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {qcdItems.map((item) => (
                <tr key={item.key} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-2 px-3 font-medium text-gray-700 border-r border-gray-200">
                    {item.label}
                  </td>
                  <td className="p-1 border-r border-gray-200">
                    <CustomSelect
                      value={qcdData[item.key]?.q || ''}
                      onChange={(e) => handleQcdChange(item.key, 'q', e.target.value ? parseInt(e.target.value, 10) : '')}
                      options={qcdRatingOptions}
                      placeholder="- / 5"
                      className="w-full h-8"
                      style={{ minWidth: '60px' }}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-200">
                    <CustomSelect
                      value={qcdData[item.key]?.c || ''}
                      onChange={(e) => handleQcdChange(item.key, 'c', e.target.value ? parseInt(e.target.value, 10) : '')}
                      options={qcdRatingOptions}
                      placeholder="- / 5"
                      className="w-full h-8"
                      style={{ minWidth: '60px' }}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-200">
                    <CustomSelect
                      value={qcdData[item.key]?.d || ''}
                      onChange={(e) => handleQcdChange(item.key, 'd', e.target.value ? parseInt(e.target.value, 10) : '')}
                      options={qcdRatingOptions}
                      placeholder="- / 5"
                      className="w-full h-8"
                      style={{ minWidth: '60px' }}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={qcdData[item.key]?.note || ''}
                      onChange={(e) => handleQcdChange(item.key, 'note', e.target.value)}
                      placeholder="..."
                      className="w-full border border-gray-300 rounded px-2.5 py-1 text-base focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* SECTION C. TỰ NHẬN XÉT */}
      <CollapsibleSection title={t('review.C. TỰ NHẬN XÉT')}>
        <div className="space-y-3 text-base">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.1. Việc làm tốt trong chuyến đi')}:
            </label>
            <textarea
              rows={1}
              value={request.driverReviewCommentMost || ''}
              onChange={(e) => handleChange('driverReviewCommentMost', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.2. Việc chưa tốt cần cải tiến')}:
            </label>
            <textarea
              rows={1}
              value={request.driverReviewCommentBad || ''}
              onChange={(e) => handleChange('driverReviewCommentBad', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.3. Góp ý/đánh giá dành cho nhân viên/khách hàng tham gia chuyến đi')}:
            </label>
            <textarea
              rows={1}
              value={request.driverReviewCommentFeedback || ''}
              onChange={(e) => handleChange('driverReviewCommentFeedback', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.4. Đề xuất hỗ trợ từ quản lý')}:
            </label>
            <textarea
              rows={1}
              value={request.driverReviewCommentRequest || ''}
              onChange={(e) => handleChange('driverReviewCommentRequest', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default withRequestForm(
  DriverReviewForm, 
  component, 
  routes.driverConfirmBookingList.path, 
  routes.driverConfirmBookingList.label, 
  initForm
);
