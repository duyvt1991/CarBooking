import { useTranslation } from 'react-i18next';

function TableLayout({ requestFields, requests, actionButtons, maxHeight = 'calc(100vh - 280px)' }) {
  const { t } = useTranslation();

  return (
    <div
      className="w-full overflow-auto border border-gray-200 rounded shadow-inner relative"
      style={{ maxHeight: maxHeight || undefined }}
    >
      <table className="min-w-full bg-white table-fixed text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            {requestFields.map(field => {
              const isStickyLeft =
                field.additionalClassHeader?.includes('left-') ||
                field.additionalClass?.includes('left-');
              const zIndexClass = isStickyLeft ? '!z-40' : 'z-20';

              return (
                <th
                  key={field.name}
                  className={`table-cell sticky top-0 ${zIndexClass} ${
                    field.additionalClassHeader
                      ? field.additionalClassHeader
                      : field.additionalClass
                      ? field.additionalClass
                      : ''
                  } ${
                    field.align === 'right'
                      ? 'text-right'
                      : field.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } !py-2 bg-green-600 text-white border-l-[1px] border-b-[1px] border-green-700 shadow-sm`}
                >
                  {field.label}
                </th>
              );
            })}
            {actionButtons?.()?.length > 0 && (
              <th className="table-cell-action sticky top-0 -right-[1px] !z-40 !py-2 !bg-green-600 text-white w-0 border-l-[1px] border-b-[1px] border-green-700 shadow-sm">
                {t('common.Hành động')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((request, index) => {
            const rowBg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
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
                    {actionButtons?.(request)?.filter(button => button).map((button, bIndex) => (
                      button.label ? (
                        <button 
                          key={bIndex}
                          className={`px-2.5 py-0.5 text-xs whitespace-nowrap ${button.className} text-white rounded m-1`}
                          onClick={() => button.action(request.id)}
                        >
                          {button.label}
                        </button>
                      ) : (
                        <span key={bIndex}>{button.component}</span>
                      )
                    ))}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableLayout;