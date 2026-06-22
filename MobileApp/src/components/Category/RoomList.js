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
import { formatApprovers, formatBuilding, formatEquipmentsWithType, formatPersons, formatPriorityApprovers, formatRoomType, formatSize } from '../../systems/util';
import ModalContent from '../../shared/ModalContent';
import { FaCheck } from 'react-icons/fa';

function RoomList({
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
    { name: 'id', placeholder: t('room.ID') },
    // { name: 'building', placeholder: t('room.Toà nhà'), type: 'select', options: masterData.buildings.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'mkey', placeholder: t('room.Mã xe') },
    { name: 'mvalue', placeholder: t('room.Tên xe') },
    { name: 'roomType', placeholder: t('room.Loại xe'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'isActive', placeholder: t('room.Trạng thái'), type: 'select', options: [
      { value: '1', label: t('room.Hoạt động') },
      { value: '0', label: t('room.Tạm khoá') }
    ]}
  ];

  const requestFields = [
    { name: 'id', label: t('room.ID'), render: (field, request) => request[field] },
    // { name: 'building', label: t('room.Toà nhà'), render: (field, request) => formatBuilding(request[field], masterData) },
    { name: 'roomType', label: t('room.Loại xe'), render: (field, request) => formatRoomType(request[field], masterData) },
    { name: 'mkey', label: t('room.Mã xe'), render: (field, request) => request[field] },
    { name: 'mvalue', label: t('room.Tên xe'), render: (field, request) => request[field] },
    { name: 'licensePlateNumber', label: t('room.Biển số'), render: (field, request) => request[field] },
    // { name: 'approvers', align: 'right',  label: t('room.Người phê duyệt'), render: (field, request) => {
    //     const roomType = masterData.roomTypes.find(type => type.mkey.toString() === request.roomType.toString());
    //     const values = request[field]?.length ? request[field] : (roomType?.approvers || []);
    //     const approversValue = (formatApprovers(values, masterData).split(', ') || []).filter(tag => tag);
    //     const fields = [
    //         { label: t('room.Người phê duyệt'), value: approversValue.map(tag => <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{tag}</span>) },
    //     ].filter(field => field && field.value);
    //     return approversValue.length === 0 ? t('common.[count] người', { count: 0 }) : <button onClick={() => setModal(<ModalContent title={t(`routes.${routes.roomList.label}`)} fields={fields} />)} className={`${request[field]?.length ? "font-bold" : ""} cursor-pointer underline text-blue-700 text-ellipsis overflow-hidden`}>{t('common.[count] người', { count: approversValue.length })}</button>;
    // } },
    // { name: 'priorityApprovers', align: 'right',  label: t('room.Người phê duyệt ưu tiên'), render: (field, request) => {
    //     const values = request[field]?.length ? request[field] : [];
    //     const priorityApproversValue = (formatPriorityApprovers(values, masterData).split(', ') || []).filter(tag => tag);
    //     const fields = [
    //         { label: t('room.Người phê duyệt ưu tiên'), value: priorityApproversValue.map(tag => <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{tag}</span>) },
    //     ].filter(field => field && field.value);
    //     return priorityApproversValue.length === 0 ? t('common.[count] người', { count: 0 }) : <button onClick={() => setModal(<ModalContent title={t(`routes.${routes.roomList.label}`)} fields={fields} />)} className={`${request[field]?.length ? "font-bold" : ""} cursor-pointer underline text-blue-700 text-ellipsis overflow-hidden`}>{t('common.[count] người', { count: priorityApproversValue.length })}</button>;
    // } },
    // { name: 'equipments', align: 'right',  label: t('room.Thiết bị'), render: (field, request) => {
    //     const roomType = masterData.roomTypes.find(type => type.mkey.toString() === request.roomType.toString());
    //     const values = request[field]?.length ? request[field] : (roomType?.equipments || []);
    //     const equipmentsValue = values.map(equipment => masterData.equipments?.find(e => e.mkey.toString() === equipment.toString())).filter(e => e) || [];
    //     const fields = [
    //         { label: t('room.Thiết bị'), value: formatEquipmentsWithType(equipmentsValue, masterData) },
    //     ].filter(field => field && field.value);
    //     return equipmentsValue.length === 0 ? t('common.[count] thiết bị', { count: 0 }) : <button onClick={() => setModal(<ModalContent title={t(`routes.${routes.roomList.label}`)} fields={fields} />)} className={`${request[field]?.length ? "font-bold" : ""} cursor-pointer underline text-blue-700 text-ellipsis overflow-hidden`}>{t('common.[count] thiết bị', { count: equipmentsValue.length })}</button>;
    // } },
    { name: 'persons', align: 'right',  label: t('room.Sức chứa'), render: (field, request) => {
        const roomType = masterData.roomTypes.find(type => type.mkey.toString() === request.roomType.toString());
        const values = request[field] ? request[field] : (roomType?.persons || "0");
        return <span className={request[field] ? "font-bold" : ""}>{formatPersons(values, null, t)}</span>
    } },
    { name: 'color', align: 'center',  label: t('room.Màu đại diện'), render: (field, request) => {
        const roomType = masterData.roomTypes.find(type => type.mkey.toString() === request.roomType.toString());
        const values = request[field] ? request[field] : (roomType?.color || "");
        return <span style={{ backgroundColor: values, border: request[field] ? "2px solid black" : "2px solid transparent" }} className="badge">&nbsp;</span>
    } },
    // { name: 'hasAutoApprove', align: 'center',  label: t('room.Tự động duyệt'), render: (field, request) => {
    //     const roomType = masterData.roomTypes.find(type => type.mkey.toString() === request.roomType.toString());
    //     const values = request[field] ? request[field] : (roomType?.hasAutoApprove || "0");
    //   switch (values) {
    //     case '1':
    //       return <span style={{ border: request[field] ? "2px solid black" : "2px solid transparent" }} className={`inline-flex items-center rounded-sm justify-center w-5 h-5 bg-green-500`}><FaCheck className="text-white" /></span>;
    //     default:
    //       return <span className={request[field] ? "font-bold" : ""}>-</span>;
    //   }
    // } },
     { name: 'hasServiceCar', align: 'center', label: t('room.Xe đặt ngoài'), render: (field, request) => {
      switch (request[field]) {
        case '1':
          return <FaCheck className="text-green-500 inline-block" />;
        default:
          return "-";
      }
    } },
    { name: 'isActive', align: 'center',  label: t('room.Trạng thái'), render: (field, request) => request[field] ? t('room.Hoạt động') : t('room.Tạm khoá') }
  ];
    
  const actionButtons = (request) => ([
    request?.isActive ? 
    { label: t('common.Sửa'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.roomForm.path) } :
    null,
    request?.isActive ? 
    { label: t('common.Tạm khoá'), className: 'bg-gray-500', action: (id) => handleAction(id, 'deactivateRoom') } : 
    { label: t('common.Mở khoá'), className: 'bg-green-500', action: (id) => handleAction(id, 'activate') },
    { label: t('common.Xoá'), className: 'bg-red-500', action: (id) => handleAction(id, 'deleteRoom') }
  ]);

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.roomForm.path} 
          headerLabel={routes.roomList.label} 
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

export default withRequestData(RoomList, routes.roomList.component);
