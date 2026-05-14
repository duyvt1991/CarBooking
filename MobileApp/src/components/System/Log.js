import React from 'react';
import { useTranslation } from 'react-i18next';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import FilterTableLayout from '../../shared/FilterTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { formatDateTime, formatLogNewValue, formatLogOldValue, formatLogPage, formatLogType, formatUser } from '../../systems/util';
import { logMasterDataTypeMapping } from '../../systems/log';

function Log({
  currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const { t } = useTranslation();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters({ ...tempFilters, [name]: value });
  };

  const applyFilters = () => setFilters(tempFilters);

  const resetFilters = () => {
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const filterFields = [
    { name: 'id', placeholder: t('log.ID') },
    { name: 'fromDate', type: "datetime", placeholder: t('log.Từ lúc') },
    { name: 'toDate', type: "datetime", placeholder: t('log.Đến lúc') },
    { name: 'logUser', placeholder: t('log.Người dùng') },
    { name: 'logType', placeholder: t('log.Hành động'), type: 'select', options: [{value: "Add", label: "Thêm"}, {value: "Edit", label: "Sửa"}, {value: "Delete", label: "Xoá"}, {value: "Active", label: "Mở khoá"}, {value: "Deactive", label: "Tạm khoá"}] },
    { name: 'logPage', placeholder: t('log.Chức năng'), type: 'select', options: Object.keys(logMasterDataTypeMapping).map(key => ({value: key, label: logMasterDataTypeMapping[key]})) },
    { name: 'oldValue', placeholder: t('log.Giá trị cũ') },
    { name: 'newValue', placeholder: t('log.Giá trị mới') },
  ];

  const requestFields = [
    { name: 'id', label: t('log.ID'), render: (field, request) => request[field] },
    { name: 'logDate', label: t('log.Thời điểm'), render: (field, request) => formatDateTime(request[field]) },
    { name: 'logUser', label: t('log.Người dùng'), render: (field, request) => formatUser(request[field]) },
    { name: 'logType', label: t('log.Hành động'), render: (field, request) => formatLogType(request[field], t) },
    { name: 'logPage', label: t('log.Chức năng'), render: (field, request) => formatLogPage(request) },
    { name: 'oldValue', label: t('log.Giá trị cũ'), additionalClass: 'table-cell-viewall', render: (field, request) => formatLogOldValue(request) },
    { name: 'newValue', label: t('log.Giá trị mới'), additionalClass: 'table-cell-viewall', render: (field, request) => formatLogNewValue(request) },
  ];

  const actionButtons = () => ([]);

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.log.path} 
          headerLabel={routes.log.label} 
          hideAddNew={true}
        />
        <FilterTableLayout 
          totalItems={totalItems}
          filterFields={filterFields} 
          handleFilterChange={handleFilterChange} 
          tempFilters={tempFilters} 
          applyFilters={applyFilters} 
          resetFilters={resetFilters} 
        /> 
      </div>
      <div className="w-full overflow-x-auto">
        <TableLayout 
          requestFields={requestFields} 
          requests={requests}
          actionButtons={actionButtons}
        />
      </div>
      <PaginationTableLayout 
        totalItems={totalItems} 
        totalPages={totalPages} 
        currentPage={currentPage} 
        handlePageChange={setCurrentPage} 
        requestsPerPage={requestsPerPage}
        handlePageLimitChange={setRequestsPerPage}  />
    </div>
  );
}

export default withRequestData(Log, routes.log.component);
