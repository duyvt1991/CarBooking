import React, { useState } from 'react';
import withRequestForm from '../../hoc/withRequestForm';
import { routes } from '../../systems/constant';
import { useTranslation } from 'react-i18next';

const initForm = {
  userReviewCommentMost: { 
    value: '', 
    label: 'review.Điều hài lòng nhất', 
    type: 'textarea',
  },
  userReviewCommentBad: { 
    value: '', 
    label: 'review.Điều cần cải thiện', 
    type: 'textarea',
  },
  userReviewExperience: {
    value: '', 
  },
  userReviewQcd: {
    value: '', 
  },
  userWantsToContinue: {
    value: null, 
  }
};

const component = routes.userReviewForm.component;

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

function UserReviewForm({ request, errors, handleChange }) {
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

  const expData = parseJsonField('userReviewExperience', {
    onTime: 0,
    polite: 0,
    clean: 0,
    safe: 0,
    support: 0,
    privacy: 0,
    response: 0,
    overall: 0
  });

  const qcdData = parseJsonField('userReviewQcd', {
    q: 0,
    c: 0,
    d: 0
  });

  const handleExpChange = (key, value) => {
    const updated = { ...expData, [key]: value };
    handleChange('userReviewExperience', updated);
  };

  const handleQcdChange = (key, value) => {
    const updated = { ...qcdData, [key]: value };
    handleChange('userReviewQcd', updated);
  };

  return (
    <div className="text-left py-2 text-base">
      {/* SECTION A. ĐÁNH GIÁ TRẢI NGHIỆM DỊCH VỤ */}
      <CollapsibleSection title={t('review.A. ĐÁNH GIÁ TRẢI NGHIỆM DỊCH VỤ')}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-left border-collapse text-base">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-3 font-semibold text-gray-600 border-r border-gray-200 w-[50%]">{t('review.Nội dung')}</th>
                {[1, 2, 3, 4, 5].map((num) => (
                  <th key={num} className="py-2 px-3 font-semibold text-gray-600 text-center border-r border-gray-200 last:border-r-0 w-[10%]">
                    {num}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { key: 'onTime', label: t('review.Tài xế đúng giờ') },
                { key: 'polite', label: t('review.Thái độ lễ phép') },
                { key: 'clean', label: t('review.Xe sạch sẽ') },
                { key: 'safe', label: t('review.Lái xe an toàn, êm') },
                { key: 'support', label: t('review.Chủ động hỗ trợ') },
                { key: 'privacy', label: t('review.Bảo mật/tế nhị') },
                { key: 'response', label: t('review.Phản hồi nhanh') },
                { key: 'overall', label: t('review.Trải nghiệm tổng thể') },
              ].map((item) => {
                const currentVal = expData[item.key] || 0;
                return (
                  <tr key={item.key} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-700 border-r border-gray-200">
                      {item.label}
                    </td>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <td key={num} className="py-2 px-3 text-center border-r border-gray-200 last:border-r-0">
                        <input
                          type="radio"
                          name={`exp-${item.key}`}
                          checked={currentVal === num}
                          onChange={() => handleExpChange(item.key, num)}
                          className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* SECTION B. ĐÁNH GIÁ QCD */}
      <CollapsibleSection title={t('review.B. ĐÁNH GIÁ QCD')}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-left border-collapse text-base">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-3 font-semibold text-gray-600 border-r border-gray-200 w-[50%]">{t('review.Nội dung')}</th>
                <th className="py-2 px-3 font-semibold text-gray-600 text-center w-[50%]">{t('review.Điểm')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { key: 'q', label: t('review.Q - Chất lượng phục vụ') },
                { key: 'c', label: t('review.C - Hiệu quả & không lãng phí') },
                { key: 'd', label: t('review.D - Đúng giờ & đúng yêu cầu') },
              ].map((item) => (
                <tr key={item.key} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-2 px-3 font-medium text-gray-700 border-r border-gray-200">
                    {item.label}
                  </td>
                  <td className="p-1.5 text-center">
                    <select
                      value={qcdData[item.key] || ''}
                      onChange={(e) => handleQcdChange(item.key, e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full max-w-[120px] border border-gray-300 rounded px-2 py-1 text-base bg-white focus:ring-blue-500 focus:border-blue-500 text-center"
                    >
                      <option value="">- / 5</option>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* SECTION C. NHẬN XÉT NHANH */}
      <CollapsibleSection title={t('review.C. NHẬN XÉT NHANH')}>
        <div className="space-y-3 text-base">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.Điều hài lòng nhất')}:
            </label>
            <textarea
              rows={1}
              value={request.userReviewCommentMost || ''}
              onChange={(e) => handleChange('userReviewCommentMost', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.Điều cần cải thiện')}:
            </label>
            <textarea
              rows={1}
              value={request.userReviewCommentBad || ''}
              onChange={(e) => handleChange('userReviewCommentBad', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {t('review.Có muốn tiếp tục sử dụng tài xế này không?')}
            </label>
            <div className="flex items-center space-x-6 mt-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userWantsToContinue"
                  value="true"
                  checked={request.userWantsToContinue === true}
                  onChange={() => handleChange('userWantsToContinue', true)}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 font-medium text-gray-700">{t('review.Có')}</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userWantsToContinue"
                  value="false"
                  checked={request.userWantsToContinue === false}
                  onChange={() => handleChange('userWantsToContinue', false)}
                  className="h-5 w-5 text-red-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 font-medium text-gray-700">{t('review.Không')}</span>
              </label>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default withRequestForm(
  UserReviewForm, 
  component, 
  -1, 
  routes.userReviewList.label, 
  initForm
);
