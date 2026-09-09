import { useTranslation } from 'react-i18next';

function TableLayout({ requestFields, requests, actionButtons }) {
  const { t } = useTranslation();

  return (
    <table className="min-w-full bg-white table-fixed text-sm">
        <thead>
        <tr>
            {requestFields.map(field => (
            <th key={field.name} className={`table-cell ${field.additionalClassHeader ? field.additionalClassHeader : field.additionalClass ? field.additionalClass : ''} ${field.align === 'right' ? 'text-right' : field.align === 'center' ? 'text-center' : 'text-left'} !py-2 bg-green-600 text-white border-l-[1px] border-gray-300`}>{field.label}</th>
            ))}
            {actionButtons?.()?.length > 0 && (
              <th className="table-cell-action !py-2 !bg-green-600 text-white w-0 border-l-[1px] border-gray-300">{t('common.Hành động')}</th>
            )}
        </tr>
        </thead>
        <tbody>
        {requests.map((request, index) => {
            const rowBg = request.isApproved === 0 ? 'bg-[#d1d5db]' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            return (
            <tr key={request.id} className={rowBg}>
            {requestFields.map(field => {
                const rendered = field.render(field.name, request);
                const titleAttr = (typeof rendered === 'string' || typeof rendered === 'number') ? String(rendered) : undefined;
                return (
                  <td 
                    key={field.name} 
                    title={titleAttr && titleAttr !== '-' ? titleAttr : undefined}
                    className={`border table-cell ${rowBg} ${field.additionalClass ? field.additionalClass : ''} ${field.align === 'right' ? 'text-right' : field.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {rendered}
                  </td>
                );
            })}
            {actionButtons?.()?.length > 0 && (
              <td className={`border table-cell-action w-0 ${index % 2 === 0 ? '!bg-gray-50' : '!bg-white'}`}>
                  {actionButtons?.(request)?.filter(button => button).map((button, index) => (
                  button.label ? <button 
                      key={index}
                      className={`px-2.5 py-0.5 text-xs whitespace-nowrap ${button.className} text-white rounded m-1`}
                      onClick={() => button.action(request.id)}
                  >
                      {button.label}
                  </button> : <span key={index}>{button.component}</span>
                  ))}
              </td>
            )}
            </tr>
            );
        })}
        </tbody>
    </table>
  );
}

export default TableLayout;