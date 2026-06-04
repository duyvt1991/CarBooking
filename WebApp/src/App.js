import React, { createContext, useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

import Home from './components/Home.js';

import { getMasterData, getMasterDataVersion } from './systems/api';
import packageJson from '../package.json';
import { routes } from './systems/constant.js';
import Loading from './shared/Loading.js';
import AdminList from './components/System/AdminList.js';
import AdminForm from './components/System/AdminForm.js';
import ApproverList from './components/System/ApproverList.js';
import ApproverForm from './components/System/ApproverForm.js';
import PriorityApproverList from './components/System/PriorityApproverList.js';
import PriorityApproverForm from './components/System/PriorityApproverForm.js';
import ManagerList from './components/System/ManagerList.js';
import ManagerForm from './components/System/ManagerForm.js';
import BuildingList from './components/Category/BuildingList.js';
import BuildingForm from './components/Category/BuildingForm.js';
import DepartmentList from './components/Category/DepartmentList.js';
import DepartmentForm from './components/Category/DepartmentForm.js';
import EquipmentTypeList from './components/Category/EquipmentTypeList.js';
import EquipmentTypeForm from './components/Category/EquipmentTypeForm.js';
import EquipmentList from './components/Category/EquipmentList.js';
import EquipmentForm from './components/Category/EquipmentForm.js';
import UsagePurposeList from './components/Category/UsagePurposeList.js';
import UsagePurposeForm from './components/Category/UsagePurposeForm.js';
import Log from './components/System/Log.js';
import ConfigForm from './components/System/ConfigForm.js';
import RoomTypeList from './components/Category/RoomTypeList.js';
import RoomTypeForm from './components/Category/RoomTypeForm.js';
import Modal from './shared/Modal.js';
import RoomList from './components/Category/RoomList.js';
import RoomForm from './components/Category/RoomForm.js';
import BookingList from './components/Booking/BookingList.js';
import BookingForm from './components/Booking/BookingForm.js';
import CancelBookingForm from './components/Booking/CancelBookingForm.js';
import RejectBookingForm from './components/Booking/RejectBookingForm.js';
import ApproveBookingList from './components/Booking/ApproveBookingList.js';
import SearchByDemand from './components/Booking/SearchByDemand.js';
import UserReviewList from './components/Booking/UserReviewList.js';
import ManagerReviewList from './components/Booking/ManagerReviewList.js';
import UserReviewForm from './components/Booking/UserReviewForm.js';
import ManagerReviewForm from './components/Booking/ManagerReviewForm.js';
import ReportGuestCount from './components/Report/ReportGuestCount.js';
import ReportUsedCount from './components/Report/ReportUsedCount.js';
import ReportCapacity from './components/Report/ReportCapacity.js';
import ReportUsageDemand from './components/Report/ReportUsageDemand.js';
import ReportManagerReview from './components/Report/ReportManagerReview.js';
import ReportUserReview from './components/Report/ReportUserReview.js';
import BookingCalendar from './components/Booking/BookingCalendar.js';
import CarLineList from './components/Category/CarLineList.js';
import CarLineForm from './components/Category/CarLineForm.js';
import DriverList from './components/System/DriverList.js';
import DriverForm from './components/System/DriverForm.js';
import ApproveAssignBookingForm from './components/Booking/ApproveAssignBookingForm.js';
import DriverConfirmBookingList from './components/Booking/DriverConfirmBookingList.js';
import DriverRejectBookingForm from './components/Booking/DriverRejectBookingForm.js';

import jpFlag from './i18n/flags/jp.svg';
import vnFlag from './i18n/flags/vn.svg';

export const RequestContext = createContext();

const App = () => {
  const { t } = useTranslation();
  const [request, setRequest] = useState(null);
  const [masterDataVersion, setMasterDataVersion] = useState(0);
  const [masterData, setMasterData] = useState({
    userId: "",
    roles: [],
    admins: [],
    approvers: [],
    approversDeleted: [],
    priorityApprovers: [],
    priorityApproversDeleted: [],
    managers: [],
    config: {
      maxDayToBooking: 0,
      maxHourToAutoApprove: 0,
      maxDayToReview: 0,
      bookingAdminGroupId: 0,
      bookingApprovalGroupId: 0,
      bookingMonitorGroupId: 0,
      bookingPriorityApprovalGroupId: 0,
      // buildingDefault: 0,
      bookingDriverGroupId: 0
    },
    buildings: [],
    departments: [],
    equipmentTypes: [],
    equipments: [],
    usagePurposes: [],
    carLines: [],
    drivers: [],
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [toastVisible, setToastVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const showConfirmModal = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ show: false, message: '', onConfirm: null });
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'vn';
    i18n.changeLanguage(savedLanguage);

    getMasterData()
      .then(data => {
        setMasterData(data);
      })
      .catch(error => console.error('Error fetching user list:', error))
      .finally(() => setLoading(false));
  }, [masterDataVersion]);

  useEffect(() => {
    if (error) {
      setToastVisible(true);
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            setToastVisible(false);
            setError("");
            clearInterval(interval);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [error]);

  const routeComponents = [
    { path: routes.adminList.path, permissions: routes.adminList.permissions, component: <AdminList /> },
    { path: `${routes.adminForm.path}/:id`, permissions: routes.adminForm.permissions, component: <AdminForm /> },
    { path: routes.approverList.path, permissions: routes.approverList.permissions, component: <ApproverList /> },
    { path: `${routes.approverForm.path}/:id`, permissions: routes.approverForm.permissions, component: <ApproverForm /> },
    { path: routes.priorityApproverList.path, permissions: routes.priorityApproverList.permissions, component: <PriorityApproverList /> },
    { path: `${routes.priorityApproverForm.path}/:id`, permissions: routes.priorityApproverForm.permissions, component: <PriorityApproverForm /> },
    { path: routes.managerList.path, permissions: routes.managerList.permissions, component: <ManagerList /> },
    { path: `${routes.managerForm.path}/:id`, permissions: routes.managerForm.permissions, component: <ManagerForm /> },
    { path: routes.buildingList.path, permissions: routes.buildingList.permissions, component: <BuildingList /> },
    { path: `${routes.buildingForm.path}/:id`, permissions: routes.buildingForm.permissions, component: <BuildingForm /> },
    { path: routes.departmentList.path, permissions: routes.departmentList.permissions, component: <DepartmentList /> },
    { path: `${routes.departmentForm.path}/:id`, permissions: routes.departmentForm.permissions, component: <DepartmentForm /> },
    { path: routes.equipmentTypeList.path, permissions: routes.equipmentTypeList.permissions, component: <EquipmentTypeList /> },
    { path: `${routes.equipmentTypeForm.path}/:id`, permissions: routes.equipmentTypeForm.permissions, component: <EquipmentTypeForm /> },
    { path: routes.equipmentList.path, permissions: routes.equipmentList.permissions, component: <EquipmentList /> },
    { path: `${routes.equipmentForm.path}/:id`, permissions: routes.equipmentForm.permissions, component: <EquipmentForm /> },
    { path: routes.usagePurposeList.path, permissions: routes.usagePurposeList.permissions, component: <UsagePurposeList /> },
    { path: `${routes.usagePurposeForm.path}/:id`, permissions: routes.usagePurposeForm.permissions, component: <UsagePurposeForm /> },
    { path: routes.roomTypeList.path, permissions: routes.roomTypeList.permissions, component: <RoomTypeList /> },
    { path: `${routes.roomTypeForm.path}/:id`, permissions: routes.roomTypeForm.permissions, component: <RoomTypeForm /> },
    { path: routes.roomList.path, permissions: routes.roomList.permissions, component: <RoomList /> },
    { path: `${routes.roomForm.path}/:id`, permissions: routes.roomForm.permissions, component: <RoomForm /> },
    { path: routes.log.path, permissions: routes.log.permissions, component: <Log /> },
    { path: `${routes.config.path}/:id`, permissions: routes.config.permissions, component: <ConfigForm /> },
    { path: routes.bookingList.path, permissions: routes.bookingList.permissions, component: <BookingList /> },
    { path: `${routes.bookingForm.path}/:id`, permissions: routes.bookingForm.permissions, component: <BookingForm /> },
    { path: `${routes.cancelBookingForm.path}/:id`, permissions: routes.cancelBookingForm.permissions, component: <CancelBookingForm /> },
    { path: `${routes.rejectBookingForm.path}/:id`, permissions: routes.rejectBookingForm.permissions, component: <RejectBookingForm /> },
    { path: routes.approveBookingList.path, permissions: routes.approveBookingList.permissions, component: <ApproveBookingList /> },
    { path: `${routes.searchByDemand.path}/:id`, permissions: routes.searchByDemand.permissions, component: <SearchByDemand /> },
    { path: routes.userReviewList.path, permissions: routes.userReviewList.permissions, component: <UserReviewList /> },
    { path: `${routes.userReviewForm.path}/:id`, permissions: routes.userReviewForm.permissions, component: <UserReviewForm /> },
    { path: routes.managerReviewList.path, permissions: routes.managerReviewList.permissions, component: <ManagerReviewList /> },
    { path: `${routes.managerReviewForm.path}/:id`, permissions: routes.managerReviewForm.permissions, component: <ManagerReviewForm /> },
    { path: routes.reportGuestCount.path, permissions: routes.reportGuestCount.permissions, component: <ReportGuestCount /> },
    { path: routes.reportUsedCount.path, permissions: routes.reportUsedCount.permissions, component: <ReportUsedCount /> },
    { path: routes.reportCapacity.path, permissions: routes.reportCapacity.permissions, component: <ReportCapacity /> },
    { path: routes.reportUsageDemand.path, permissions: routes.reportUsageDemand.permissions, component: <ReportUsageDemand /> },
    { path: routes.reportManagerReview.path, permissions: routes.reportManagerReview.permissions, component: <ReportManagerReview /> },
    { path: routes.reportUserReview.path, permissions: routes.reportUserReview.permissions, component: <ReportUserReview /> },
    { path: `${routes.bookingCalendar.path}/:id`, permissions: routes.bookingCalendar.permissions, component: <BookingCalendar /> },
    { path: routes.carLineList.path, permissions: routes.carLineList.permissions, component: <CarLineList /> },
    { path: `${routes.carLineForm.path}/:id`, permissions: routes.carLineForm.permissions, component: <CarLineForm /> },
    { path: routes.driverList.path, permissions: routes.driverList.permissions, component: <DriverList /> },
    { path: `${routes.driverForm.path}/:id`, permissions: routes.driverForm.permissions, component: <DriverForm /> },
    { path: `${routes.approveAssignBookingForm.path}/:id`, permissions: routes.approveAssignBookingForm.permissions, component: <ApproveAssignBookingForm /> },
    { path: routes.driverConfirmBookingList.path, permissions: routes.driverConfirmBookingList.permissions, component: <DriverConfirmBookingList /> },
    { path: `${routes.driverRejectBookingForm.path}/:id`, permissions: routes.driverRejectBookingForm.permissions, component: <DriverRejectBookingForm /> },

  ]

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <RequestContext.Provider value={{ masterData, setModal, error, setError, request, setRequest, loading, setLoading, showConfirmModal, hideConfirmModal }}>
      {loading &&  <Loading />}
      {confirmModal.show && (
        <div className="fixed w-full h-full inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-[2000]" onClick={hideConfirmModal}>
          <div className="bg-white p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl mb-4">{t('common.Xác nhận')}</h2>
            <p>{confirmModal.message}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={hideConfirmModal}>{t('common.Hủy')}</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => { confirmModal.onConfirm(); hideConfirmModal(); }}>{t('common.Xác nhận')}</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex space-x-2 my-1 pr-1 items-center justify-end">
        <span className="text-xs">{t('common.Chọn ngôn ngữ')}:</span>
        <img
          src={vnFlag}
          alt={t('common.Tiếng Việt')}
          className="h-5 cursor-pointer border border-gray-200"
          onClick={() => changeLanguage('vn')}
        />
        <img
          src={jpFlag}
          alt={t('common.Tiếng Nhật')}
          className="h-5 cursor-pointer border border-gray-200"
          onClick={() => changeLanguage('jp')}
        />
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={routes.adminList.path} element={<AdminList />} />
          <Route path={`${routes.adminList.path}/:id`} element={<AdminForm />} />
          {routeComponents.filter(({ permissions }) => permissions.some(permission => masterData.roles.includes(permission))).map(({ path, component }) => (
            <Route key={path} path={path} element={component} />
          ))}
          {!loading && <Route path="*" element={<Navigate to="/" />} />}
        </Routes>
        <TitleUpdater setMasterDataVersion={setMasterDataVersion} />
      </Router>
      {toastVisible && (
        <div className="fixed top-10 right-24 z-[4000] bg-red-500 text-white p-2 rounded shadow-lg cursor-pointer" onClick={() => { setToastVisible(false); setError(""); }}>
          <p>{error ? error : t('common.Có lỗi xảy ra, vui lòng thử lại')} ({countdown}s)</p>
        </div>
      )}
      {!!modal && <Modal onClose={() => setModal(null)}>{modal}</Modal>}
    </RequestContext.Provider>
  );
};

const TitleUpdater = ({ setMasterDataVersion }) => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles = Object.fromEntries(
        Object.entries(routes).map(([key, { path, label }]) => [path, label])
    );
    const matchedRoute = Object.keys(routeTitles).reverse().find(route => location.pathname.includes(route));
    const title = matchedRoute ? (routeTitles[matchedRoute] + ' (v' + packageJson.version + ')') : ('Đặt xe  (v' + packageJson.version + ')');
    document.title = title;
    document.querySelector(".bx-im-navigation__close")?.click();

    getMasterDataVersion()
      .then(data => {
        setMasterDataVersion(data.version);
      })
      .catch(error => console.error('Error fetching user list:', error));
  }, [location, setMasterDataVersion]);

  return null;
};

export default App;
