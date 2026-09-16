import { useContext, useEffect, useState } from 'react';
import { RequestContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaClipboardList, 
  FaCogs, 
  FaCalendarAlt, 
  FaClipboardCheck, 
  FaStar, 
  FaUsers, 
  FaCar,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { routes } from '../systems/constant';
import { useTranslation } from 'react-i18next';
import BookingCalendar from './Booking/BookingCalendar';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { masterData, loading, setRequest } = useContext(RequestContext);
  const { roles } = masterData;
  const hasPermission = roles.includes('Permission [Car_Booking_Admin]') || roles.includes('Permission [Car_Booking_Approval]') || roles.includes('Permission [Car_Booking_Monitor]') || roles.includes('Permission [Car_Booking_Driver_Confirm]') || roles.includes('*');

  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('home_collapsed_sections');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleSection = (key) => {
    setCollapsedSections(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('home_collapsed_sections', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

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
    // { ...routes.reportGuestCount, icon: FaUsers },
    // { ...routes.reportUsedCount, icon: FaInfoCircle },
    // { ...routes.reportCapacity, icon: FaChartPie },
    // { ...routes.reportUsageDemand, icon: FaChartBar },
    // { ...routes.reportUserReview, icon: FaStar },
    // { ...routes.reportManagerReview, icon: FaStar },
    { ...routes.reportCarActivity, icon: FaCar }
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

  const renderCollapsibleSection = (key, title, content) => {
    if (!content || content.length === 0) return null;
    const isCollapsed = !!collapsedSections[key];

    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-200">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-gray-50 transition"
          onClick={() => toggleSection(key)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {content.length}
            </span>
          </div>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-200 transition focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection(key);
            }}
            title={isCollapsed ? (t('common.Mở rộng') || 'Mở rộng') : (t('common.Thu gọn') || 'Thu gọn')}
          >
            {isCollapsed ? <FaChevronDown size={16} /> : <FaChevronUp size={16} />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3">
              {content}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="p-1 space-y-6">
      {renderCollapsibleSection('system', t('home.Hệ thống'), systemSection)}
      {renderCollapsibleSection('category', t('home.Danh mục'), categorySection)}
      {renderCollapsibleSection('booking', t('home.Nghiệp vụ'), bookingSection)}

      <div className='-mx-1'>
        <BookingCalendar isHome={true} />
      </div>

      {renderCollapsibleSection('report', t('home.Báo cáo thống kê'), reportSection)}

      {(!hasPermission && !loading) && (
        <div className="text-red-500 text-lg font-bold">
          {t('common.Bạn chưa được phân quyền')}
        </div>
      )}
    </section>
  );
}

export default Home;
