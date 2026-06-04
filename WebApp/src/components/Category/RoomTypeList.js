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
import { formatApprovers, formatColor, formatEquipmentsWithType, formatPersons, formatSize } from '../../systems/util';
import ModalContent from '../../shared/ModalContent';
import { FaCheck } from 'react-icons/fa';

function RoomTypeList({
  handleAction, handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const { t } = useTranslation();
  const { masterData, setModal } = useContext(RequestContext);
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
    { name: 'id', placeholder: t('roomType.ID') },
    { name: 'mkey', placeholder: t('roomType.Mã loại xe') },
    { name: 'mvalue', placeholder: t('roomType.Tên loại xe') }
  ];

  const requestFields = [
    { name: 'id', label: t('roomType.ID'), render: (field, request) => request[field] },
    { name: 'mkey', label: t('roomType.Mã loại xe'), render: (field, request) => request[field] },
    { name: 'mvalue', label: t('roomType.Tên loại xe'), render: (field, request) => request[field] },
    // { name: 'approvers', align: 'right', label: t('roomType.Người phê duyệt'), render: (field, request) => {
    //   const approversValue = formatApprovers(request[field], masterData).split(', ') || [];
    //   const fields = [
    //     { label: t('roomType.Người phê duyệt'), value: approversValue.map(tag => <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{tag}</span>) },
    //   ].filter(field => field && field.value);
    //   return approversValue.length === 0 ? t('common.[count] người', { count: 0 }) : <button onClick={() => setModal(<ModalContent title={t(`routes.${routes.roomTypeList.label}`)} fields={fields} />)} className="cursor-pointer underline text-blue-700 text-ellipsis overflow-hidden">{t('common.[count] người', { count: approversValue.length })}</button>;
    // } },
    // { name: 'equipments', align: 'right', label: t('roomType.Thiết bị'), render: (field, request) => {
    //   const equipmentsValue = request[field].map(equipment => masterData.equipments?.find(e => e.mkey.toString() === equipment.toString())).filter(e => e) || [];
    //   const fields = [
    //     { label: t('roomType.Thiết bị'), value: formatEquipmentsWithType(equipmentsValue, masterData) },
    //   ].filter(field => field && field.value);
    //   return equipmentsValue.length === 0 ? t('common.[count] thiết bị', { count: 0 }) : <button onClick={() => setModal(<ModalContent title={t(`routes.${routes.roomTypeList.label}`)} fields={fields} />)} className="cursor-pointer underline text-blue-700 text-ellipsis overflow-hidden">{t('common.[count] thiết bị', { count: equipmentsValue.length })}</button>;
    // } },
    // { name: 'size', align: 'right', label: t('roomType.Diện tích (m²)'), render: (field, request) => formatSize(request[field]) },
    { name: 'persons',  align: 'right',label: t('roomType.Sức chứa (người)'), render: (field, request) => formatPersons(request[field], null, t) },
    { name: 'color', align: 'center', label: t('roomType.Màu đại diện'), render: (field, request) => formatColor(request[field]) },
    // { name: 'hasAutoApprove', align: 'center', label: t('roomType.Tự động duyệt'), render: (field, request) => {
    //   switch (request[field]) {
    //     case '1':
    //       return <FaCheck className="text-green-500 inline-block" />;
    //     default:
    //       return "-";
    //   }
    // } }
  ];
    
  const actionButtons = (request) => ([
    { label: t('common.Sửa'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.roomTypeForm.path) },
    { label: t('common.Xoá'), className: 'bg-red-500', action: (id) => handleAction(id, 'delete') }
  ]);

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.roomTypeForm.path} 
          headerLabel={routes.roomTypeList.label} 
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

export default withRequestData(RoomTypeList, routes.roomTypeList.component);
