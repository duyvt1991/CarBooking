import { useTranslation } from 'react-i18next';

function TableLayout({ requestFields, requests, actionButtons, minWidth }) {
  const { t } = useTranslation();

  const colCount = requestFields.length + (actionButtons?.()?.length > 0 ? 1 : 0);
  const tableMinWidth = minWidth || (colCount > 5 ? `${colCount * 120}px` : '100%');

  return (
    <div className="w-full overflow-x-auto scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table 
        className="w-full bg-white table-auto text-sm"
        style={{ minWidth: tableMinWidth }}
      >
          <thead>
          <tr>
              {requestFields.map(field => (
              <th key={field.name} className={`table-cell ${field.align === 'right' ? 'text-right' : field.align === 'center' ? 'text-center' : 'text-left'} !py-2 bg-green-600 text-white border-l-[1px] border-gray-300`}>{field.label}</th>
              ))}
              {actionButtons?.()?.length > 0 && (
                <th className="table-cell-action !z-20 !py-2 !bg-green-600 text-white min-w-[120px] border-l-[1px] border-gray-300">{t('common.Hành động')}</th>
              )}
          </tr>
          </thead>
          <tbody>
          {requests.map((request, index) => (
              <tr key={request.id} className={request.isApproved === 0 ? 'bg-[#66666652]' : index % 2 === 0 ? 'bg-gray-50' : ''}>
              {requestFields.map(field => (
                  <td key={field.name} className={`border table-cell ${field.additionalClass ? field.additionalClass : ''} ${field.align === 'right' ? 'text-right' : field.align === 'center' ? 'text-center' : 'text-left'}`}>{field.render(field.name, request)}</td>
              ))}
              {actionButtons?.()?.length > 0 && (
                <td className={`border table-cell-action min-w-[120px] !z-10 ${index % 2 === 0 ? '!bg-gray-50' : '!bg-white'}`}>
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
          ))}
          </tbody>
      </table>
    </div>
  );
}

export default TableLayout;