import { useContext, useEffect } from 'react';
import { RequestContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaClipboardList, FaCogs, FaCalendarAlt, FaClipboardCheck, FaStar, FaChartBar, FaUsers, FaInfoCircle, FaChartPie, FaClipboard, FaCar } from 'react-icons/fa';
import { routes } from '../systems/constant';
import { useTranslation } from 'react-i18next';
import BookingCalendar from './Booking/BookingCalendar';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { masterData, loading, setRequest } = useContext(RequestContext);
  const { roles } = masterData;
  const hasPermission = roles.includes('Permission [Car_Booking_Admin]') || roles.includes('Permission [Car_Booking_Approval]') || roles.includes('Permission [Car_Booking_Monitor]') || roles.includes('Permission [Car_Booking_Driver_Confirm]') || roles.includes('*');

  useEffect(() => {
    Object.values(routes).forEach(route => {
      sessionStorage.removeItem(`${route.component}_currentPage`);
      sessionStorage.removeItem(`${route.component}_filters`);
      sessionStorage.removeItem(`${route.component}_requestContext`);
    }); 
    sessionStorage.removeItem('calendar_currentDate');
    sessionStorage.removeItem('calendar_mode');
  }, []);

  const systemButtons = [
    { ...routes.adminList, icon: FaUser },
    { ...routes.approverList, icon: FaUser },
    // { ...routes.priorityApproverList, icon: FaUser },
    { ...routes.managerList, icon: FaUser },
    { ...routes.log, icon: FaClipboardList },
    { ...routes.config, icon: FaCogs },
    { ...routes.driverList, icon: FaUser },
  ];

  const categoryButtons = [
    // { ...routes.buildingList, icon: FaBuilding },
    { ...routes.departmentList, icon: FaUsers },
    // { ...routes.equipmentTypeList, icon: FaClipboard },
    // { ...routes.equipmentList, icon: FaClipboard },
    { ...routes.usagePurposeList, icon: FaClipboardCheck },
    { ...routes.carLineList, icon: FaClipboardList },
    { ...routes.roomTypeList, icon: FaClipboardList },
    { ...routes.roomList, icon: FaClipboardList }
  ];

  const bookingButtons = [
    { ...routes.bookingCalendar, icon: FaCalendarAlt },
    { ...routes.bookingList, icon: FaClipboardList },
    { ...routes.approveBookingList, icon: FaClipboardCheck },
    { ...routes.managerReviewList, icon: FaStar },
    { ...routes.driverConfirmBookingList, icon: FaCar }

  ];

  const reportButtons = [
    { ...routes.reportGuestCount, icon: FaUsers },
    { ...routes.reportUsedCount, icon: FaInfoCircle },
    { ...routes.reportCapacity, icon: FaChartPie },
    { ...routes.reportUsageDemand, icon: FaChartBar },
    { ...routes.reportUserReview, icon: FaStar },
    { ...routes.reportManagerReview, icon: FaStar }
  ];

  const renderButtons = (buttons) => {
    const goTo = (path) => {
      if (path === routes.config.path) {
        setRequest({ ...masterData.config, id: "*" });
        navigate(`${path}/*`);
      } else if(path === routes.bookingCalendar.path) {
        setRequest({ id: "*" });
        navigate(`${path}/*`);
      } else {
        navigate(path);
      }
    };
    return buttons
      .filter(({ permissions }) => permissions.some(permission => roles.includes(permission)))
      .map(({ path, icon: Icon, label }) => (
        <button key={path} className="home-button" onClick={() => goTo(path)}>
          <div className="home-icon-holder"><Icon className="home-icon" /></div>
          {t(`routes.${label}`)}
        </button>
      ));
  };

  const systemSection = renderButtons(systemButtons);
  const categorySection = renderButtons(categoryButtons);
  const bookingSection = renderButtons(bookingButtons);
  const reportSection = renderButtons(reportButtons);

  return (
    <section className="p-1 space-y-6">
      {systemSection.length > 0 && (
        <div className="space-y-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold">{t('home.Hệ thống')}</h2>
          <div className="flex flex-wrap gap-4">
            {systemSection}
          </div>
        </div>
      )}
      {categorySection.length > 0 && (
        <div className="space-y-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold">{t('home.Danh mục')}</h2>
          <div className="flex flex-wrap gap-4">
            {categorySection}
          </div>
        </div>
      )}
      {bookingSection.length > 0 && (
        <div className="space-y-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold">{t('home.Nghiệp vụ')}</h2>
          <div className="flex flex-wrap gap-4">
            {bookingSection}
          </div>
        </div>
      )}
      <div className='-mx-1'>
        <BookingCalendar isHome={true} />
      </div>
      {/* {reportSection.length > 0 && (
        <div className="space-y-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold">{t('home.Báo cáo thống kê')}</h2>
          <div className="flex flex-wrap gap-4">
            {reportSection}
          </div>
        </div>
      )} */}
      {(!hasPermission && !loading) && (
        <div className="text-red-500 text-lg font-bold">
          {t('common.Bạn chưa được phân quyền')}
        </div>
      )}
    </section>
  );
}

export default Home;
