import { FaFilter, FaRedo } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";

function FilterTableLayout({ filterFields, totalItems, handleFilterChange, tempFilters, applyFilters, resetFilters }) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex items-center text-sm text-nowrap h-[34px]">{t('common.Tổng')}:<span className="badge bg-red-600">{totalItems}</span></div>
      <div className="flex flex-wrap gap-2 justify-end">
        {filterFields.map(field => (
          <div key={field.name} className={`flex flex-nowrap space-x-1 items-center`}>
            <label className="text-sm text-gray-600" htmlFor={field.name}>{field.placeholder}:</label>
            {field.type === 'select' ? (
            <select
              id={field.name}
              className={`px-2 py-1 h-[34px] border rounded ${!tempFilters[field.name] ? "empty" : ""}`}
              name={field.name}
              onChange={handleFilterChange}
              value={tempFilters[field.name]}
            >
              <option value="">- {field.placeholder} -</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : field.type === 'datetime' ? (
            <DatePicker 
              id={field.name}
              name={field.name}
              placeholderText={field.placeholder}
              showTimeSelect={true}
              timeFormat="HH:mm:ss"
              selected={(() => {
                  try {
                  const date = parseISO(tempFilters[field.name] ?? "");
                  return !isNaN(date) ? date : null;
                  } catch (error) {
                  return null;
                  }
              })()}
              onChange={(date) => {
                  try {
                    const e = { target: { name: field.name, value: date ? format(date, 'yyyy-MM-dd HH:mm:ss') : '' } };
                    handleFilterChange(e);
                  } catch (error) {
                    const e = { target: { name: field.name, value: '' } };
                    handleFilterChange(e);
                  }
              }}
              dateFormat="dd/MM/yyyy HH:mm:ss"
              className={`px-2 py-1 border rounded ${!tempFilters[field.name] ? "empty" : ""}`}
              required
            />
          )  : field.type === 'date' ? (
            <DatePicker 
              id={field.name}
              name={field.name}
              placeholderText={field.placeholder}
              selected={(() => {
                  try {
                  const date = parseISO(tempFilters[field.name] ?? "");
                  return !isNaN(date) ? date : null;
                  } catch (error) {
                  return null;
                  }
              })()}
              onChange={(date) => {
                  try {
                    const e = { target: { name: field.name, value: date ? format(date, 'yyyy-MM-dd') : '' } };
                    handleFilterChange(e);
                  } catch (error) {
                    const e = { target: { name: field.name, value: '' } };
                    handleFilterChange(e);
                  }
              }}
              dateFormat="dd/MM/yyyy"
              className={`px-2 py-1 border rounded ${!tempFilters[field.name] ? "empty" : ""}`}
              required
            />
          ) : (
            <input
              id={field.name}
              className={`px-2 py-1 border rounded`}
              name={field.name}
              placeholder={field.placeholder}
              onChange={handleFilterChange}
              value={tempFilters[field.name]}
            />
          )}
          </div>
        ))}
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-blue-500 text-white rounded flex items-center whitespace-nowrap" onClick={applyFilters}>
          <FaFilter className="mr-2" />
          {t('common.Lọc')}
          </button>
          <button className="px-2 py-1 bg-gray-500 text-white rounded flex items-center" onClick={resetFilters}>
          <FaRedo />
          </button>
        </div>
    </div>
    </div>
  );
}

export default FilterTableLayout;