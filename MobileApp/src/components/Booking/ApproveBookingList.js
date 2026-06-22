import React, { useContext, useEffect } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaBan, FaCheck, FaClock, FaInfoCircle, FaTimes, FaRegHourglass, FaMinusCircle } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatUser, formatBookingStatus } from '../../systems/util';
import { RequestContext } from '../../App';
import FilterTableLayout from '../../shared/FilterTableLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ApproveBookingList({
  handleEndBooking, handleEdit, handleApproveAssignBooking, handleAction, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = { ...tempFilters, tab: params.get('tab') || "" };
    setTempFilters(newFilters);
    setFilters(newFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
    { name: 'id', placeholder: 'ID' },
    { name: 'roomType', placeholder: t('booking.Loại xe'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Xe'), type: 'select', options: masterData.rooms.map(room => ({ value: room.mkey, label: room.mvalue })) },
    { name: 'startDate', placeholder: t('booking.Ngày sử dụng'), type: 'date' },
    { name: 'isApproved', placeholder: t('common.Trạng thái'), type: 'select', 
      options: [
        {value: -1, label: t('booking.Từ chối')}, 
        {value: 0, label: t('booking.Chờ duyệt')}, 
        {value: 1, label: t('booking.Đã duyệt')},
        {value: 2, label: t('booking.Đã phân công')},
        {value: 3, label: t('booking.Tài xế đã xác nhận')},
        {value: 4, label: t('booking.Hoàn thành')},
      ]
    },
  ];

  const requestFields = [
    { name: 'id', label: 'ID', render: (field, request) => request[field] },
    { name: 'status', align: 'center',  label: t('common.Trạng thái'), render: (field, request) => formatBookingStatus(request, masterData, setModal, t) },
    { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    { name: 'bookingUser', label: t('booking.Người đặt'), render: (field, request) => formatUser(request[field]) },
    { name: 'mainUser', label: t('booking.Người sử dụng'), render: (field, request) => formatUser(request[field]) },
    { name: 'startDate', align: 'center',  label: t('booking.Ngày sử dụng'), render: (field, request) => formatDate(request[field]) },
    { name: 'endTime', align: 'center',  label: t('booking.Khung giờ sử dụng'), render: (field, request) => `${formatTime(request['startTime']).replace(":00", "")} - ${formatTime(request[field]).replace(":00", "")}` },
    { name: 'departureLocation', label: t('booking.Điểm xuất phát'), render: (field, request) => (request[field] || []).join(', ') || '-'},
    { name: 'department', label: t('booking.Phòng ban'), render: (field, request) => request[field].mvalue },
    { name: 'usagePurpose', label: t('booking.Phân loại khách'), render: (field, request) => request[field].mvalue },
    { name: 'roomType', label: t('booking.Loại xe'), render: (field, request) => request[field].mvalue },
    { name: 'serviceType', label: t('booking.Loại dịch vụ'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'room', label: t('booking.Xe'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'licensePlateNumber', label: t('common.Biển số xe'), render: (field, request) => request[field] || '-' },
    { name: 'driverUser', label: t('common.Tài xế'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'driverPhoneNumber', label: t('common.Số điện thoại tài xế'), render: (field, request) => request[field] || '-' },
  ];

  const actionButtons = (request) => {
    const currentTime = new Date();
    const bookingStartTime = new Date(`${request?.startDate} ${request?.startTime}`);
    const bookingEndTime = new Date(`${request?.startDate} ${request?.endTime}`);
    const isBookingInProgress = currentTime >= bookingStartTime && currentTime <= bookingEndTime;
    const isPastBooking = currentTime > bookingEndTime;
    const approvedStatus = Number(request?.isApproved);

    // Button templates
    const statusButtons = {
      default: { component: <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"><FaClock /></span> },
      inProgress: { component: <span className="flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> },
      cancelled: { component: <span className="flex items-center justify-center gap-1"><FaMinusCircle className="text-red-500" /> {t('booking.Đã huỷ')}</span> },
      done: { component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> },
      rejected: { component: <span className="flex items-center justify-center gap-1"><FaBan className="text-red-500" /></span> },
    };

    const actionDefs = {
      approve: { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') },
      approveAndAssign: { label: t('booking.Duyệt & phân công'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.approveAssignBookingForm.path) },
      // assign: { label: t('booking.Phân công tài xế'), className: 'bg-green-500', action: (id) => handleAction(id, 'assign') },
      assignBlue: { label: t('booking.Phân công tài xế'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.approveAssignBookingForm.path) },
      reject: { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) },
      end: { label: t('booking.Kết thúc'), className: 'bg-blue-500', action: (id) => handleEndBooking(id, routes.bookingForm.path) },
    };

    // Early exits for time-based or cancelled status
    if (request?.isCancelled) return [statusButtons.cancelled];
    if (isBookingInProgress) return [statusButtons.inProgress, ...(approvedStatus === 3 ? [actionDefs.end] : [])];
    if (isPastBooking) return [statusButtons.done];
    if (approvedStatus === -1) return [statusButtons.rejected];

    // Pending tab logic
    if (tempFilters?.tab === "pending") {
      const result = [];
      if (approvedStatus === 0) {
        result.push(actionDefs.approve, actionDefs.approveAndAssign);
      } else {
        result.push(actionDefs.assignBlue);
      }
      result.push(actionDefs.reject);
      return result;
    }

    // Default view by approval status
    switch (approvedStatus) {
      case 0:
        return [actionDefs.approve, actionDefs.approveAndAssign, actionDefs.reject];
      case 1:
        return [actionDefs.assignBlue, actionDefs.reject];
      case 2:
        return [actionDefs.reject];
      case 3:
        return [actionDefs.reject];
      case -2:
        return [actionDefs.assignBlue, actionDefs.reject];
      default:
        return [actionDefs.approve, actionDefs.approveAndAssign, actionDefs.reject];
    }
  };

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          headerLabel={routes.approveBookingList.label}
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
      <div className="w-full">
        <div className="mb-0 ml-[1px] flex sticky left-0 space-x-2 text-sm">
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(routes.approveBookingList.path)}>{t('booking.Tất cả')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "pending" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.approveBookingList.path}?tab=pending`)}>{t('booking.Chờ duyệt và phân công tài xế')}</button>
          {/* <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "priority" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.approveBookingList.path}?tab=priority`)}>{t('booking.Chờ duyệt ưu tiên')}</button> */}
        </div>
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
        handlePageLimitChange={setRequestsPerPage} />
    </div>
  );
}

export default withRequestData(ApproveBookingList, routes.approveBookingList.component);
