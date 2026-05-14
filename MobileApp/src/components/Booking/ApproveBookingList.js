import React, { useContext, useEffect } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaBan, FaCheck, FaClock, FaInfoCircle, FaTimes, FaRegHourglass } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatBookingApproveStatus, formatUser } from '../../systems/util';
import { RequestContext } from '../../App';
import FilterTableLayout from '../../shared/FilterTableLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ApproveBookingList({
  handleEndBooking, handleEdit, handleAction, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
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
    { name: 'roomType', placeholder: t('booking.Loại phòng'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Phòng'), type: 'select', options: masterData.rooms.map(room => ({ value: room.mkey, label: room.mvalue })) },
    { name: 'startDate', placeholder: t('booking.Ngày sử dụng'), type: 'date' },
    { name: 'isApproved', placeholder: t('booking.Trạng thái duyệt'), type: 'select', options: [{value: -1, label: "Từ chối"}, {value: 0, label: "Chờ duyệt"}, {value: 1, label: "Đã duyệt"}] },
  ];

  const requestFields = [
    { name: 'id', label: 'ID', render: (field, request) => request[field] },
    { name: 'status', align: 'center',  label: t('booking.Trạng thái duyệt'), render: (field, request) => formatBookingApproveStatus(request, masterData, setModal, t) },
    { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    { name: 'building', label: t('booking.Toà nhà'), render: (field, request) => request[field].mvalue },
    { name: 'roomType', label: t('booking.Loại phòng'), render: (field, request) => request[field].mvalue },
    { name: 'room', label: t('booking.Phòng'), render: (field, request) => request[field].mvalue },
    { name: 'bookingUser', label: t('booking.Người đặt'), render: (field, request) => formatUser(request[field]) },
    { name: 'mainUser', label: t('booking.Người chủ trì'), render: (field, request) => formatUser(request[field]) },
    { name: 'startDate', align: 'center',  label: t('booking.Ngày sử dụng'), render: (field, request) => formatDate(request[field]) },
    { name: 'endTime', align: 'center',  label: t('booking.Khung giờ sử dụng'), render: (field, request) => `${formatTime(request['startTime']).replace(":00", "")} - ${formatTime(request[field]).replace(":00", "")}` },
    { name: 'department', label: t('booking.Phòng ban'), render: (field, request) => request[field].mvalue },
    { name: 'usagePurpose', label: t('booking.Mục đích sử dụng'), render: (field, request) => request[field].mvalue },
  ];

  const actionButtons = (request) => {
    const currentTime = new Date();
    const bookingStartTime = new Date(`${request?.startDate} ${request?.startTime}`);
    const bookingEndTime = new Date(`${request?.startDate} ${request?.endTime}`);
    const isBookingInProgress = currentTime >= bookingStartTime && currentTime <= bookingEndTime;
    const isPastBooking = currentTime > bookingEndTime;
    if (tempFilters?.tab === "pending") {
      return isBookingInProgress ? [{ component: <span className="flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> }] : [
            !request?.waitForPriority ? 
            { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') } : 
            { component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaClock className="text-yellow-500" /> Chờ</span> },
            { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) }
        ];
    } else if (tempFilters?.tab === "priority") {
      return isBookingInProgress ? [{ component: <span className="flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> }] : [
            { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') },
            { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) }
        ];
    } else {
      const canPriorityApprove = (request?.room?.priorityApprovers || []).includes(masterData.userId);
      const isApprovedUser = (request?.approvedUsers || []).length === 0 || (request?.approvedUsers || []).map(user => user.mkey).includes(masterData.userId);
      if (request?.isCancelled) {
        return [{ component: <span className="flex items-center justify-center gap-1"><FaBan className="text-red-500" /> {t('booking.Đã huỷ')}</span> }];
      } else if (request?.isApproved === -1) {
        return [{ component: <span className="flex items-center justify-center gap-1"><FaTimes className="text-red-500" /></span> }];
      } else if (isBookingInProgress) {
        if (request?.isPriority) {
          return [
            { component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> },
            canPriorityApprove && isApprovedUser ? { label: t('booking.Kết thúc'), className: 'bg-blue-500', action: (id) => handleEndBooking(id, routes.bookingForm.path) } : null
          ];
        } else {
          return [
            { component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> },
            isApprovedUser ? { label: t('booking.Kết thúc'), className: 'bg-blue-500', action: (id) => handleEndBooking(id, routes.bookingForm.path) } : null
          ];
        }
      } else if (isPastBooking) {
        return [{ component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> }];
      } else if (request?.isApproved === 1) {
        if (request?.isPriority) {
          return [
            { component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaInfoCircle className="text-green-500" /> Ưu tiên</span> },
            canPriorityApprove && isApprovedUser ? { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) } : null
          ];
        } else {
          return [isApprovedUser ? 
            { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) } : 
            { component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-yellow-500" /></span> }
          ];
        }
      } else {
        if (request?.isPriority) {
          return canPriorityApprove ? [
            { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') },
            { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) }
          ] : [{ component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaInfoCircle className="text-green-500" /> Ưu tiên</span> }];
        } else {
          return [
            !request?.waitForPriority ? 
            { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') } : 
            { component: <span className="inline-flex items-center justify-center gap-1 mr-1"><FaClock className="text-yellow-500" /> Chờ</span> },
            { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.rejectBookingForm.path) }
          ];
        }
      }
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
      <div className="w-full overflow-x-auto">
        <div className="mb-0 ml-[1px] flex sticky left-0 space-x-2 text-sm">
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(routes.approveBookingList.path)}>{t('booking.Tất cả')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "pending" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.approveBookingList.path}?tab=pending`)}>{t('booking.Chờ duyệt')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "priority" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.approveBookingList.path}?tab=priority`)}>{t('booking.Chờ duyệt ưu tiên')}</button>
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
