import React, { useContext, useEffect } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaBan, FaCheck, FaRegHourglass,FaClock, FaMinusCircle } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatBookingStatus } from '../../systems/util';
import { RequestContext } from '../../App';
import FilterTableLayout from '../../shared/FilterTableLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BookingList({
    handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const navigate = useNavigate();
  const location = useLocation();
    const { t } = useTranslation();
  const { masterData, setModal } = useContext(RequestContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = { ...tempFilters, tab: params.get('tab') || "" };
    setTempFilters(newFilters);
    setFilters(newFilters);
    sessionStorage.removeItem(`${routes.bookingForm.component}_requestContext`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
    { name: 'id', placeholder: t('booking.ID') },
    { name: 'roomType', placeholder: t('booking.Loại xe'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Xe'), type: 'select', options: masterData.rooms.map(room => ({ value: room.mkey, label: room.mvalue })) },
  ];

  const requestFields = [
    { name: 'id', label: t('booking.ID'), render: (field, request) => request[field] },
    { name: 'status', align: 'center',  label: t('common.Trạng thái'), render: (field, request) => formatBookingStatus(request, masterData, setModal, t) },
    { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    // { name: 'building', label: t('booking.Toà nhà'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'startDate', align: 'center',  label: t('booking.Ngày sử dụng'), render: (field, request) => formatDate(request[field]) },
    { name: 'endTime', align: 'center',  label: t('booking.Khung giờ sử dụng'), render: (field, request) => `${formatTime(request['startTime']).replace(":00", "")} - ${formatTime(request[field]).replace(":00", "")}` },
    // { name: 'departureLocation', label: t('booking.Điểm xuất phát'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'departureLocation', label: t('booking.Điểm xuất phát'), render: (field, request) => (request[field] || []).join(', ') || '-'},
    { name: 'department', label: t('booking.Phòng ban'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'usagePurpose', label: t('booking.Phân loại khách'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'roomType', label: t('booking.Loại xe'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'serviceType', label: t('booking.Loại dịch vụ'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'room', label: t('booking.Xe'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'licensePlateNumber', label: t('common.Biển số xe'), render: (field, request) => request[field] || '-' },
    { name: 'driverUser', label: t('common.Tài xế'), render: (field, request) => request[field]?.mvalue || '-' },
    { name: 'driverPhoneNumber', label: t('common.Số điện thoại tài xế'), render: (field, request) => request[field] || '-' },

  ];

  const actionButtons = (request) => { 
    // if (!request) return [];
    const currentTime = new Date();
    const bookingStartTime = new Date(`${request?.startDate} ${request?.startTime}`);
    const bookingEndTime = new Date(`${request?.startDate} ${request?.endTime}`);
    const isBookingInProgress = currentTime >= bookingStartTime && currentTime <= bookingEndTime;
    const isPastBooking = currentTime > bookingEndTime;
    const approvedStatus = Number(request?.isApproved);
    const canEdit = [0, -1].includes(approvedStatus);
    const canCancel = [0, -1].includes(approvedStatus);

    const defaultButton = { component: <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"><FaClock /></span> };
    const buttons = [];

    if (request?.isCancelled) {
      return [{ component: <span className="flex items-center justify-center gap-1"><FaMinusCircle className="text-red-500" /> {t('booking.Đã huỷ')}</span> }];
    }

    if (isPastBooking) {
      return [{ component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> }];
    }

    if (!isBookingInProgress) {
      if (canEdit) {
        buttons.push({ label: t('booking.Sửa'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.bookingForm.path) });
      }
      if (canCancel) {
        buttons.push({ label: t('booking.Huỷ'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.cancelBookingForm.path) });
      }
      return buttons.length > 0 ? buttons : [defaultButton];
    }

    if (isBookingInProgress) {
      return [{ component: <span className="inline-flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> }];
    }

    return [defaultButton];
  };

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          addNewPath={routes.bookingCalendar.path} 
          labelAddNew={routes.bookingCalendar.label}
          headerLabel={routes.bookingList.label} 
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
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(routes.bookingList.path)}>{t('booking.Đặt xe')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 bg-gray-200 hover:bg-gray-300`} onClick={() => navigate(`${routes.userReviewList.path}?tab=review`)}>{t('booking.Đánh giá')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "cancelled" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.bookingList.path}?tab=cancelled`)}>{t('booking.Huỷ')}</button>
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
        handlePageLimitChange={setRequestsPerPage}  />
    </div>
  );
}

export default withRequestData(BookingList, routes.bookingList.component);
