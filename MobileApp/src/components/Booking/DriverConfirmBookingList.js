import React, { useContext, useEffect } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaBan, FaCheck, FaClock, FaInfoCircle, FaTimes, FaRegHourglass, FaMinusCircle, FaFilter, FaRedo } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatUser, formatBookingStatus, formatDriverReviewScore } from '../../systems/util';
import { RequestContext } from '../../App';
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import CustomSelect from '../../shared/CustomSelect';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function DriverConfirmBookingList({
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
    { name: 'roomType', placeholder: t('booking.Loại xe'), type: 'select', options: (masterData?.roomTypes || []).map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Xe'), type: 'select', options: (masterData?.rooms || []).map(room => ({ value: room.mkey, label: room.mvalue })) },
    { name: 'startDate', placeholder: t('booking.Ngày sử dụng'), type: 'date' },
  ];

  const requestFields = [
    { name: 'id', label: 'ID', render: (field, request) => request[field] },
    { name: 'status', align: 'center',  label: t('common.Trạng thái'), render: (field, request) => formatBookingStatus(request, masterData, setModal, t) },
    ...(tempFilters?.tab === 'review' ? [
      { name: 'driverReviewScore', align: 'center', label: t('booking.Đánh giá'), render: (field, request) => formatDriverReviewScore(request, setModal, t) },
    ] : []),
    // { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    // { name: 'bookingUser', label: t('booking.Người đặt'), render: (field, request) => formatUser(request[field]) },
    { name: 'mainUser', label: t('booking.Người phụ trách'), render: (field, request) => formatUser(request[field]) },
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
    const isDriver = request?.driverUser?.mkey === masterData.userId;

    // Button templates
    const statusButtons = {
      default: { component: <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"><FaClock /></span> },
      inProgress: { component: <span className="flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> },
      done: { component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> },
      rejected: { component: <span className="flex items-center justify-center gap-1"><FaBan className="text-red-500" /></span> },
    };

    const actionDefs = {
      approve: { label: t('booking.Xác nhận'), className: 'bg-green-500', action: (id) => handleAction(id, 'confirm') },
      reject: { label: t('booking.Từ chối'), className: 'bg-red-500', action: (id) => handleEdit(id, routes.driverRejectBookingForm.path) },
    };

    if (tempFilters?.tab === 'review')
    {
       return (isDriver && request?.driverReviewScore === 0 && request?.isApproved === 4) ? 
             [
                { label: t('booking.Đánh giá'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.driverReviewForm.path) }
            ] : 
            [{ component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> }]
    }

    // Ưu tiên kiểm tra các trạng thái Hủy / Từ chối trước
    if (approvedStatus === -1 || approvedStatus === -2) return [statusButtons.rejected];

    // Sau đó mới kiểm tra tiến độ thời gian
    if (isBookingInProgress) return [statusButtons.inProgress];
    if (isPastBooking) return [statusButtons.done];

    // Xử lý các trạng thái chờ hành động
    if (isDriver && approvedStatus === 2) {
      return [actionDefs.approve, actionDefs.reject];
    }

    // Trả về mặc định (chờ đến giờ, v.v...)
    return [statusButtons.default];
  };

  return (
    <div className="p-1 relative max-w-full overflow-x-hidden">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          headerLabel={routes.driverConfirmBookingList.label}
          hideAddNew={true} 
        />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center text-sm text-nowrap">
              {t('common.Tổng')}:
              <span className="badge bg-red-600 ml-1">{totalItems}</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center text-sm font-medium transition duration-200"
                onClick={applyFilters}
              >
                <FaFilter className="mr-2" />
                {t('common.Lọc')}
              </button>
              <button 
                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center text-sm font-medium transition duration-200"
                onClick={resetFilters}
              >
                <FaRedo />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filterFields.map(field => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500" htmlFor={field.name}>
                  {field.placeholder}
                </label>
                {field.type === 'select' ? (
                  <CustomSelect
                    value={tempFilters[field.name]}
                    onChange={(e) => {
                      const mockEvent = { target: { name: field.name, value: e.target.value } };
                      handleFilterChange(mockEvent);
                    }}
                    options={field.options}
                    placeholder={`- ${field.placeholder} -`}
                    className="w-full h-[38px]"
                  />
                ) : field.type === 'date' ? (
                  <div className="relative w-full">
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
                      className="h-[38px] px-3 py-1.5 border rounded-lg bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                      wrapperClassName="w-full"
                      required
                    />
                  </div>
                ) : (
                  <input
                    id={field.name}
                    type={field.type || 'text'}
                    className="h-[38px] px-3 py-1.5 border rounded-lg bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={handleFilterChange}
                    value={tempFilters[field.name] ?? ''}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="mb-0 ml-[1px] flex sticky left-0 space-x-2 text-sm overflow-x-auto whitespace-nowrap scrollbar-none">
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(routes.driverConfirmBookingList.path)}>{t('booking.Tất cả')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "pending" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.driverConfirmBookingList.path}?tab=pending`)}>{t('booking.Chờ tài xế xác nhận')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 ${tempFilters.tab === "review" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => navigate(`${routes.driverConfirmBookingList.path}?tab=review`)}>{t('booking.Đánh giá')}</button>
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

export default withRequestData(DriverConfirmBookingList, routes.driverConfirmBookingList.component);
