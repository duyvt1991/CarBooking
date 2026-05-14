import React, { useContext, useEffect, useState } from 'react';
import withRequestData from '../../hoc/withRequestData';
import { defaultFilters, routes } from '../../systems/constant';
import HeaderTableLayout from '../../shared/HeaderTableLayout';
import Loading from '../../shared/Loading';
import PaginationTableLayout from '../../shared/PaginationTableLayout';
import TableLayout from '../../shared/TableLayout';
import { FaCheck } from 'react-icons/fa';
import { formatDateTime, formatDate, formatTime, formatUserReviewCleanScore, formatUserReviewEquipmentScore, formatUserReviewFacilityScore, formatIdDetail } from '../../systems/util';
import { RequestContext } from '../../App';
import FilterTableLayout from '../../shared/FilterTableLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function UserReviewList({
  handleEdit, currentPage, setCurrentPage, requestsPerPage, setRequestsPerPage, requests, totalPages, totalItems, setFilters, loading, tempFilters, setTempFilters
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();  const [ showAll, setShowAll ] = useState(false);

  const { masterData, setModal } = useContext(RequestContext);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowAll(!params.get('tab'));
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
    { name: 'id', placeholder: 'ID' },
    { name: 'building', placeholder: t('booking.Toà nhà'), type: 'select', options: masterData.buildings.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'roomType', placeholder: t('booking.Loại phòng'), type: 'select', options: masterData.roomTypes.map(type => ({ value: type.mkey, label: type.mvalue })) },
    { name: 'room', placeholder: t('booking.Phòng'), type: 'select', options: masterData.rooms.map(room => ({ value: room.mkey, label: room.mvalue })) },
    { name: 'userReviewCleanScore', placeholder: t('booking.Đánh giá vệ sinh'), type: 'select', options: [
        { value: '1', label: t('booking.Vệ sinh: 1 sao') },
        { value: '2', label: t('booking.Vệ sinh: 2 sao') },
        { value: '3', label: t('booking.Vệ sinh: 3 sao') },
        { value: '4', label: t('booking.Vệ sinh: 4 sao') },
        { value: '5', label: t('booking.Vệ sinh: 5 sao') }
      ] 
    },
    { name: 'userReviewEquipmentScore', placeholder: t('booking.Đánh giá thiết bị'), type: 'select', options: [
        { value: '1', label: t('booking.Thiết bị: 1 sao') },
        { value: '2', label: t('booking.Thiết bị: 2 sao') },
        { value: '3', label: t('booking.Thiết bị: 3 sao') },
        { value: '4', label: t('booking.Thiết bị: 4 sao') },
        { value: '5', label: t('booking.Thiết bị: 5 sao') }
      ] 
    },
    { name: 'userReviewFacilityScore', placeholder: t('booking.Đánh giá cơ sở vật chất'), type: 'select', options: [
        { value: '1', label: t('booking.Cơ sở vật chất: 1 sao') },
        { value: '2', label: t('booking.Cơ sở vật chất: 2 sao') },
        { value: '3', label: t('booking.Cơ sở vật chất: 3 sao') },
        { value: '4', label: t('booking.Cơ sở vật chất: 4 sao') },
        { value: '5', label: t('booking.Cơ sở vật chất: 5 sao') }
      ] 
    }
  ];

  const requestFields = [
    { name: 'id', label: 'ID', render: (field, request) => formatIdDetail(request, masterData, setModal, t) },
    { name: 'userReviewCleanScore', align: 'center',  label: t('booking.Đánh giá vệ sinh'), render: (field, request) => formatUserReviewCleanScore(request, setModal, t) },
    { name: 'userReviewEquipmentScore', align: 'center',  label: t('booking.Đánh giá thiết bị'), render: (field, request) => formatUserReviewEquipmentScore(request, setModal, t) },
    { name: 'userReviewFacilityScore', align: 'center',  label: t('booking.Đánh giá cơ sở vật chất'), render: (field, request) => formatUserReviewFacilityScore(request, setModal, t) },
    { name: 'createdDate', align: 'center',  label: t('booking.Thời điểm đặt'), render: (field, request) => formatDateTime(request[field]) },
    { name: 'building', label: t('booking.Toà nhà'), render: (field, request) => request[field].mvalue },
    { name: 'roomType', label: t('booking.Loại phòng'), render: (field, request) => request[field].mvalue },
    { name: 'room', label: t('booking.Phòng'), render: (field, request) => request[field].mvalue },
    { name: 'startDate', align: 'center',  label: t('booking.Ngày sử dụng'), render: (field, request) => formatDate(request[field]) },
    { name: 'endTime', align: 'center',  label: t('booking.Khung giờ sử dụng'), render: (field, request) => `${formatTime(request['startTime']).replace(":00", "")} - ${formatTime(request[field]).replace(":00", "")}` },
    { name: 'department', label: t('booking.Phòng ban'), render: (field, request) => request[field].mvalue },
    { name: 'usagePurpose', label: t('booking.Mục đích sử dụng'), render: (field, request) => request[field].mvalue },
  ];

  const actionButtons = (request) => { 
    return request?.userReviewCleanScore > 0 || request?.userReviewEquipmentScore > 0 || request?.userReviewFacilityScore > 0 ? 
      [{ component: <span className="flex items-center justify-center gap-1"><FaCheck className="text-green-500" /></span> }]
      : [
          { label: t('booking.Đánh giá'), className: 'bg-blue-500', action: (id) => handleEdit(id, routes.userReviewForm.path) }
      ]
  };

  return (
    <div className="p-1 relative">
      {loading && <Loading />}
      <div className="space-y-2 p-4 mb-4 bg-white shadow-md rounded-lg">
        <HeaderTableLayout 
          headerLabel={routes.userReviewList.label}
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
        {!showAll && <div className="mb-0 ml-[1px] flex sticky left-0 space-x-2 text-sm">
          <button className={`p-2 rounded-t transition-colors duration-300 bg-gray-200 hover:bg-gray-300`} onClick={() => navigate(routes.bookingList.path)}>{t('booking.Đặt phòng')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 bg-green-600 text-white`} onClick={() => navigate(`${routes.userReviewList.path}?tab=review`)}>{t('booking.Đánh giá')}</button>
          <button className={`p-2 rounded-t transition-colors duration-300 bg-gray-200 hover:bg-gray-300`} onClick={() => navigate(`${routes.bookingList.path}?tab=cancelled`)}>{t('booking.Huỷ')}</button>
        </div>}
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

export default withRequestData(UserReviewList, routes.userReviewList.component);
