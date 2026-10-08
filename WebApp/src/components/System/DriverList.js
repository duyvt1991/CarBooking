import React from 'react';
import { useTranslation } from 'react-i18next';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import FilterTableLayout from '../../shared/FilterTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';

import { formatDateTime } from '../../systems/util';

function DriverList({
  handleAction, handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const { t } = useTranslation();

  const handleFilterChange = (e) => {
    // const { name, value } = e.target;
    // setTempFilters({ ...tempFilters, [name]: value });
     const { name, value } = e.target;
    if (name === 'driverPhoneNumber') {
      const numericValue = value.replace(/\D/g, ''); // Chỉ giữ lại số
      setTempFilters({ ...tempFilters, [name]: numericValue });
    } else {
      setTempFilters({ ...tempFilters, [name]: value });
    }
  };

  const applyFilters = () => setFilters(tempFilters);

  const resetFilters = () => {
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const filterFields = [
    { name: 'id', placeholder: t('driver.ID') },
    { name: 'mkey', placeholder: t('driver.Esuhai User ID') },
    { name: 'mvalue', placeholder: t('driver.Esuhai User Name') },
    { name: 'driverPhoneNumber', type: 'text', placeholder: t('driver.Số điện thoại') },
    { name: 'isActive', placeholder: t('driver.Trạng thái'), type: 'select', options: [
      { value: '1', label: t('driver.Hoạt động') },
      { value: '0', label: t('driver.Tạm khoá') }
    ]}
  ];

  const requestFields = [
    { name: 'id', label: t('driver.ID'), render: (field, request) => request[field] },
    { name: 'mkey', label: t('driver.Esuhai User ID'), render: (field, request) => request[field] },
    { name: 'mvalue', label: t('driver.Esuhai User Name'), render: (field, request) => request[field] },
    { name: 'driverPhoneNumber', label: t('driver.Số điện thoại'), render: (field, request) => request[field] },
    { name: 'lockStartDate', align: 'center', label: t('driver.Khóa từ lúc'), render: (field, request) => formatDateTime(request[field]) },
    { name: 'lockEndDate', align: 'center', label: t('driver.Khóa đến lúc'), render: (field, request) => formatDateTime(request[field]) },
    { 
      name: 'status', 
      align: 'center', 
      label: t('driver.Trạng thái'), 
      render: (field, request) => (request.lockStartDate && request.lockEndDate) 
        ? <span className="text-red-500 font-semibold">{t('driver.Tạm khoá')}</span> 
        : <span className="text-green-600 font-medium">{t('driver.Hoạt động')}</span> 
    }
  ];

  const actionButtons = () => ([
    { label: t('common.Sửa'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.driverForm.path) },
    { label: t('common.Xoá'), className: 'bg-red-500', action: (id) => handleAction(id, 'delete') }
  ]);

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.driverForm.path} 
          headerLabel={routes.driverList.label} 
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

export default withRequestData(DriverList, routes.driverList.component);
