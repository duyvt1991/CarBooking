import React, { useContext } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaCheck } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatManagerReviewScore, formatIdDetail } from '../../systems/util';
import { RequestContext } from '../../App';
import FilterTableLayout from '../../shared/FilterTableLayout';
import { useTranslation } from 'react-i18next';

function ManagerReviewList({
  handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const { masterData, setModal } = useContext(RequestContext);
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
    { name: 'id', placeholder: 'ID' },
    // { name: 'building', placeholder: t('booking.Toà nhà'), type: 'select', options: masterData.buildings.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'roomType', placeholder: t('booking.Loại xe'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Xe'), type: 'select', options: masterData.rooms.map(room => ({ value: room.mkey, label: room.mvalue })) },
    { name: 'managerReviewScore', placeholder: t('booking.Điểm đánh giá'), type: 'select', options: [
        { value: '1', label: t('booking.Đánh giá: 1 sao') },
        { value: '2', label: t('booking.Đánh giá: 2 sao') },
        { value: '3', label: t('booking.Đánh giá: 3 sao') },
        { value: '4', label: t('booking.Đánh giá: 4 sao') },
        { value: '5', label: t('booking.Đánh giá: 5 sao') }
      ] 
    },
  ];

  const requestFields = [
    { name: 'id', label: 'ID', render: (field, request) => formatIdDetail(request, masterData, setModal, t) },
    { name: 'managerReviewScore', align: 'center',  label: t('booking.Điểm đánh giá'), render: (field, request) => formatManagerReviewScore(request, setModal, t) },
    { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    // { name: 'building', label: t('booking.Toà nhà'), render: (field, request) => request[field].mvalue },
    { name: 'startDate', align: 'center',  label: t('booking.Ngày sử dụng'), render: (field, request) => formatDate(request[field]) },
    { name: 'endTime', align: 'center',  label: t('booking.Khung giờ sử dụng'), render: (field, request) => `${formatTime(request['startTime']).replace(":00", "")} - ${formatTime(request[field]).replace(":00", "")}` },
    { name: 'departureLocation', label: t('booking.Điểm xuất phát'), render: (field, request) => (request[field] || []).join(', ') || '-'},
    { name: 'department', label: t('booking.Phòng ban'), render: (field, request) => request[field].mvalue },
    { name: 'usagePurpose', label: t('booking.Phân loại khách'), render: (field, request) => request[field].mvalue },
    { name: 'roomType', label: t('booking.Loại xe'), render: (field, request) => request[field].mvalue },
    { name: 'serviceType', label: t('booking.Loại dịch vụ'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'room', label: t('booking.Xe'), render: (field, request) => request[field]?.mvalue },
    { name: 'licensePlateNumber', label: t('common.Biển số xe'), render: (field, request) => request[field] || '-' },
    { name: 'driverUser', label: t('common.Tài xế'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'driverPhoneNumber', label: t('common.Số điện thoại tài xế'), render: (field, request) => request[field] || '-' },
  ];

  const actionButtons = (request) => { 
    return request?.managerReviewScore > 0 ? 
      [{ component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> }]
      : [
          { label: t('booking.Đánh giá'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.managerReviewForm.path) }
      ]
  };

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          headerLabel={routes.managerReviewList.label}
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

export default withRequestData(ManagerReviewList, routes.managerReviewList.component);
