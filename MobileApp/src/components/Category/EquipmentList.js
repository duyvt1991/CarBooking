import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import FilterTableLayout from '../../shared/FilterTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { RequestContext } from '../../App';
import { formatEquipmentType } from '../../systems/util';

function EquipmentList({
  handleAction, handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const { t } = useTranslation();
  const { masterData } = useContext(RequestContext);
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
    { name: 'id', placeholder: t('equipment.ID') },
    { name: 'mParentKey', placeholder: t('equipment.Loại thiết bị'), type: 'select', options: masterData.equipmentTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'mkey', placeholder: t('equipment.Mã thiết bị') },
    { name: 'mvalue', placeholder: t('equipment.Tên thiết bị') }
  ];

  const requestFields = [
    { name: 'id', label: t('equipment.ID'), render: (field, request) => request[field] },
    { name: 'mParentKey', label: t('equipment.Loại thiết bị'), render: (field, request) => formatEquipmentType(request[field], masterData) },
    { name: 'mkey', label: t('equipment.Mã thiết bị'), render: (field, request) => request[field] },
    { name: 'mvalue', label: t('equipment.Tên thiết bị'), render: (field, request) => request[field] },
    { name: 'quantity', label: t('equipment.Số lượng'), render: (field, request) => request[field] || "-" },
    { name: 'note', label: t('equipment.Trạng thái'), render: (field, request) => request[field] || "-" }
  ];
  
  const actionButtons = (request) => ([
    { label: t('common.Sửa'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.equipmentForm.path) },
    { label: t('common.Xoá'), className: 'bg-red-500', action: (id) => handleAction(id, 'delete') }
  ]);

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.equipmentForm.path} 
          headerLabel={routes.equipmentList.label} 
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

export default withRequestData(EquipmentList, routes.equipmentList.component);
