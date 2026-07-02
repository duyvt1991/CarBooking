import React, { useContext, useEffect } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaBan, FaCheck, FaClock, FaInfoCircle, FaTimes, FaRegHourglass, FaMinusCircle, FaFilter, FaRedo } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatUser, formatBookingStatus } from '../../systems/util';
import { RequestContext } from '../../App';
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import CustomSelect from '../../shared/CustomSelect';
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
    { name: 'roomType', placeholder: t('booking.Loại xe'), type: 'select', options: (masterData?.roomTypes || []).map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Xe'), type: 'select', options: (masterData?.rooms || []).map(room => ({ value: room.mkey, label: room.mvalue })) },
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

    // Button templates
    const statusButtons = {
      default: { component: <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"><FaClock /></span> },
      inProgress: { component: <span className="flex items-center justify-center gap-1"><FaRegHourglass className="text-yellow-500" /> {t('booking.Đang sử dụng')}</span> },
      cancelled: { component: <span className="flex items-center justify-center gap-1"><FaMinusCircle className="text-red-500" /></span> },
      done: { component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> },
      rejected: { component: <span className="flex items-center justify-center gap-1"><FaBan className="text-red-500" /></span> },
    };

    const actionDefs = {
      approve: { label: t('booking.Duyệt'), className: 'bg-green-500', action: (id) => handleAction(id, 'approve') },
      approveAndAssign: { label: t('booking.Phân công'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.approveAssignBookingForm.path) },
      assignBlue: { label: t('booking.Phân công'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.approveAssignBookingForm.path) },
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
    <div className="p-1 relative max-w-full overflow-x-hidden">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          headerLabel={routes.approveBookingList.label}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
