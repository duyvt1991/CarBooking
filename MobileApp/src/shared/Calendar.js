import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, addMinutes, isSameDay, eachDayOfInterval, getDay, isSameWeek, isSameMonth } from 'date-fns';
import { vi, ja } from 'date-fns/locale';
import { FaCalendarWeek, FaCalendarDay, FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCalendar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Calendar.scss'; 
import i18n from '../i18n';

const halfHourPixels = 33;
const padding = 10;

export const constrast = (color, forceBlack = true) => {
  if (forceBlack) return '#000000';
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 255/2 ? '#000000' : '#FFFFFF';
};

const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


const Calendar = ({ events, myCalendar = false, onMyCalendarClick, onCalendarChange, onCellClick, onPriorityClick, onEventClick }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(sessionStorage.getItem('calendar_mode') || 'week');
  const [currentDate, setCurrentDate] = useState(sessionStorage.getItem('calendar_currentDate') ? new Date(sessionStorage.getItem('calendar_currentDate')) : new Date());
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, event: null });
  const calendarRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const currentTimeLine = document.querySelector('.current-time-line');
    if (currentTimeLine) {
      currentTimeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    sessionStorage.setItem('calendar_currentDate', currentDate);
    sessionStorage.setItem('calendar_mode', mode);
  }, [mode, currentDate]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    onCalendarChange(newMode, currentDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    onCalendarChange(mode, new Date());
  };

  const handleDateChange = (amount, unit) => {
    const newDate = new Date(currentDate);
    if (unit === 'week') {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else if (unit === 'day') {
      newDate.setDate(newDate.getDate() + amount);
    } else {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
    onCalendarChange(mode, newDate);
  };

  const handlePrevClick = () => handleDateChange(-1, mode);
  const handleNextClick = () => handleDateChange(1, mode);

  const handleDayEvent = (day) => {
    setMode('day');
    setCurrentDate(day);
    onCalendarChange('day', day);
  };

  const handleMouseEnter = (event, e) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      event: event
    });
  };

  const handleMouseMove = (e, currentEvent) => {
    if (tooltip.visible && calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current ? tooltipRef.current.offsetWidth : 200; // Default fallback width
      const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 100; // Default fallback height
      
      let xPos = e.clientX + 15;
      let yPos = e.clientY + 15;
      
      // Kiểm tra nếu tooltip sẽ vượt quá mép phải của calendar
      if (xPos + tooltipWidth > calendarRect.right) {
        xPos = e.clientX - tooltipWidth - 10; // Di chuyển tooltip sang bên trái của con trỏ
      }
      
      // Kiểm tra nếu tooltip sẽ vượt quá mép dưới của màn hình
      if (yPos + tooltipHeight > window.innerHeight) {
        yPos = e.clientY - tooltipHeight - 10; // Di chuyển tooltip lên trên con trỏ
      }
      
      setTooltip({
        ...tooltip,
        x: xPos,
        y: yPos,
        // Cập nhật event nếu có truyền vào event mới
        event: currentEvent || tooltip.event
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, event: null });
  };

  const parseDateTime = (d, t) => {
    if (!d) return new Date();
    const dateOnly = String(d).trim().split(' ')[0];
    const timeOnly = t ? String(t).trim().slice(0, 8) : '00:00:00';
    return new Date(`${dateOnly}T${timeOnly}`);
  };

  const computeDayEventsLayout = (dayEvents) => {
    if (!dayEvents || dayEvents.length === 0) return [];

    const sorted = [...dayEvents].sort((a, b) => {
      if (a.segStart.getTime() !== b.segStart.getTime()) {
        return a.segStart.getTime() - b.segStart.getTime();
      }
      return (b.segEnd.getTime() - b.segStart.getTime()) - (a.segEnd.getTime() - a.segStart.getTime());
    });

    const clusters = [];
    let currentCluster = [];
    let clusterEnd = 0;

    sorted.forEach(event => {
      const eStart = event.segStart.getTime();
      const eEnd = event.segEnd.getTime();

      if (currentCluster.length === 0) {
        currentCluster.push(event);
        clusterEnd = eEnd;
      } else {
        if (eStart < clusterEnd) {
          currentCluster.push(event);
          if (eEnd > clusterEnd) clusterEnd = eEnd;
        } else {
          clusters.push(currentCluster);
          currentCluster = [event];
          clusterEnd = eEnd;
        }
      }
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    clusters.forEach(cluster => {
      const columns = [];

      cluster.forEach(event => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const colEvents = columns[i];
          const lastEventInCol = colEvents[colEvents.length - 1];
          if (lastEventInCol.segEnd.getTime() <= event.segStart.getTime()) {
            colEvents.push(event);
            event.colIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          event.colIndex = columns.length;
          columns.push([event]);
        }
      });

      const maxCols = columns.length;
      cluster.forEach(event => {
        event.maxCols = maxCols;
        event.width = 100 / maxCols;
        event.offsetLeft = event.colIndex * (100 / maxCols);
      });
    });

    return sorted;
  };

  const renderEvents = (day, timeSlot) => {
    const dayStart = startOfDay(day);
    const nextDayStart = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const rawDayEvents = events.filter(e => {
      const eStart = parseDateTime(e.startDate, e.startTime);
      const eEnd = parseDateTime(e.endDate || e.startDate, e.endTime);
      return eStart < nextDayStart && eEnd > dayStart;
    }).map(e => {
      const eStart = parseDateTime(e.startDate, e.startTime);
      const eEnd = parseDateTime(e.endDate || e.startDate, e.endTime);
      const isStartOfTrip = eStart >= dayStart;
      const isEndOfTrip = eEnd <= nextDayStart;
      const segStart = isStartOfTrip ? eStart : dayStart;
      const segEnd = isEndOfTrip ? eEnd : nextDayStart;
      return {
        ...e,
        eStart,
        eEnd,
        segStart,
        segEnd,
        isStartOfTrip,
        isEndOfTrip
      };
    });

    const dayEvents = computeDayEventsLayout(rawDayEvents);

    return dayEvents.map((event, index) => {
      const shouldRenderEvent = event.segStart.getHours() === timeSlot.getHours()
      && event.segStart.getMinutes() === timeSlot.getMinutes();
      const duration = (event.segEnd.getTime() - event.segStart.getTime()) / (1000 * 60 * 30) * halfHourPixels;

      let timeText = '';
      if (event.isStartOfTrip && event.isEndOfTrip) {
        timeText = `${format(event.eStart, 'HH:mm')} - ${format(event.eEnd, 'HH:mm')}`;
      } else if (event.isStartOfTrip && !event.isEndOfTrip) {
        timeText = `${format(event.eStart, 'HH:mm')} - 24:00`;
      } else if (!event.isStartOfTrip && event.isEndOfTrip) {
        timeText = `00:00 - ${format(event.eEnd, 'HH:mm')}`;
      } else {
        timeText = `00:00 - 24:00`;
      }

      return shouldRenderEvent ? (
        <div key={index} 
          onClick={() => onEventClick(event.id)} 
          onMouseEnter={(e) => handleMouseEnter(event, e)}
          onMouseMove={(e) => handleMouseMove(e, event)}
          onMouseLeave={handleMouseLeave}
          className="event" 
          style={{ 
            backgroundColor: hexToRgba(event.color, event.opacity ?? 1),
            color: constrast(event.color),
            height: `${Math.max(duration - 2, 18)}px`,
            width: `calc(${event.width}% - 1px)`,
            left: `${event.offsetLeft}%`,
            border: event.isPriority ? `2px solid ${event.color}` : 'none'
          }}>
          <strong>{event.title || 'Đặt xe'}</strong>
          <span className="event-timeslot">{timeText}</span>
          {!!event.canPriorityBooking && <button className='btn-priority' onClick={(e) => {
            e.stopPropagation();
            onPriorityClick(event.id);
          }}>{t('common.Đặt ưu tiên')}</button>}
        </div>
      ) : null;
    });
  };

  const renderMonthEvents = (day) => {
    const dayStart = startOfDay(day);
    const nextDayStart = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayEvents = events.filter(e => {
      const eStart = parseDateTime(e.startDate, e.startTime);
      const eEnd = parseDateTime(e.endDate || e.startDate, e.endTime);
      return eStart < nextDayStart && eEnd > dayStart;
    });
    return (
      <div className="month-events">
        {dayEvents.length > 0 && <span onClick={() => handleDayEvent(day)}>{t('common.[count] đặt xe', { count: dayEvents.length })}</span>}
      </div>
    );
  };

  const renderButton = (label, icon, onClick, isActive, reverseIcon = false) => (
    <div onClick={onClick} className={isActive ? 'button active' : 'button'}>
      {reverseIcon ? <span>{label}</span> : icon} 
      {reverseIcon ? icon : <span>{label}</span>}
    </div>
  );

  const renderCurrentTimeLine = (start) => {
    const now = new Date();
    const matchesView = (mode === "week" && isSameWeek(now, start, { weekStartsOn: 1 }))
      || (mode === "day" && isSameDay(now, start));
    if (matchesView) {
      const minutesSinceStartOfDay = now.getHours() * 60 + now.getMinutes();
      const topPosition = (minutesSinceStartOfDay / 30) * halfHourPixels;
      return <div className={`current-time-line ${mode}`} style={{ top: `${topPosition + 55}px` }}></div>;
    }
    return null;
  };

  const renderCalendar = () => {
    if (mode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });

      // Tính padding cho tuần bắt đầu từ Thứ Hai (Monday = 0, Sunday = 6)
      const startDayOfWeek = (getDay(start) + 6) % 7; // Convert Sunday=0 -> 6, Monday=1 -> 0, etc.
      const endDayOfWeek = (getDay(end) + 6) % 7;
      
      const paddedDays = [
        ...Array.from({ length: startDayOfWeek }, () => null),
        ...days,
        ...Array.from({ length: 6 - endDayOfWeek }, () => null)
      ];

      return (
        <div className="calendar-grid-month-wrapper">
          <table className="calendar-grid">
            <thead className="calendar-header">
              <tr>
                {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((day, i) => (
                  <th key={i} className="calendar-header-cell">
                    {t(`common.${day}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="calendar-body">
              {Array.from({ length: Math.ceil(paddedDays.length / 7) }, (_, weekIndex) => (
                <tr key={weekIndex}>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = paddedDays[weekIndex * 7 + dayIndex];
                    return (
                      <td key={dayIndex} className="calendar-time-slot">
                        {day ? (
                          <>
                            <div>{format(day, 'dd')}</div>
                            {renderMonthEvents(day)}
                          </>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const start = mode === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfDay(currentDate);
    const days = mode === 'week' ? 7 : 1;
    const slotCount = 48; // half-hour steps between 00:00 and 23:30 (inclusive)
    const timeSlots = Array.from({ length: slotCount }, (_, i) =>
      addMinutes(startOfDay(start), i * 30)
    );

    return (
      <div className="calendar-grid-wrapper">
        <table className="calendar-grid">
          <thead className="calendar-header">
            <tr>
              <th className="calendar-header-cell calendar-header-timeslot"></th>
              {Array.from({ length: days }, (_, i) => (
                <th key={i} className="calendar-header-cell">
                  {format(addDays(start, i), 'dd|EEEE', { locale: i18n.language === "vn" ? vi : ja }).split('|').map((part, j) => {
                    return <div key={j} className={j === 0 ? "day" : "week-day"}>{part}</div>;
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="calendar-body">
            {timeSlots.map((timeSlot, i) => (
              <tr key={i}>
                <td className="calendar-time-slot">
                  <span className="timeslot">{format(timeSlot, 'HH:mm')}</span>
                </td>
                {Array.from({ length: days }, (_, dayIndex) => {
                  const timeSlotOfDate = new Date(addDays(start, dayIndex).setHours(timeSlot.getHours(), timeSlot.getMinutes()));
                  return (
                  <td key={dayIndex} className="calendar-time-slot">
                    <span className="timeslot-bg" onClick={() => onCellClick(timeSlotOfDate)}></span>
                    {renderEvents(addDays(start, dayIndex), timeSlotOfDate)}
                  </td>
                )})}
              </tr>
            ))}
          </tbody>
        </table>
        {renderCurrentTimeLine(start)}
      </div>
    );
  };

  return (
    <div className="calendar" ref={calendarRef}>
      <div className="controls responsive-controls">
        <div className="button-group">
          {renderButton(t('common.Ngày'), <FaCalendarDay />, () => handleModeChange('day'), mode === 'day')}
          {renderButton(t('common.Tuần'), <FaCalendarWeek />, () => handleModeChange('week'), mode === 'week')}
          {renderButton(t('common.Tháng'), <FaCalendar />, () => handleModeChange('month'), mode === 'month')}
        </div>
        <div className="current-month">
          <h3>{format(currentDate, 'MMMM/yyyy', { locale: i18n.language === "vn" ? vi : ja }).replace(/^\w/, c => c.toUpperCase())}</h3>
        </div>
        <div className="my-calendar-group">
          <div className="button-group my-calendar">
            {renderButton(t('common.Lịch của tôi'), null, () => !myCalendar && onMyCalendarClick(), myCalendar)}
            {renderButton(t('common.Lịch chung'), null, () => myCalendar && onMyCalendarClick(), !myCalendar)}
          </div>
          <div className="button-group">
            {renderButton(t('common.Trước'), <FaArrowLeft />, handlePrevClick)}
            {renderButton(t('common.Hiện tại'), <FaCalendarAlt />, handleTodayClick, (mode === "day" && isSameDay(currentDate, new Date())) || (mode === "week" && isSameWeek(currentDate, new Date(), { weekStartsOn: 1 })) || (mode === "month" && isSameMonth(currentDate, new Date())))}
            {renderButton(t('common.Tiếp'), <FaArrowRight />, handleNextClick, false, true)}
          </div>
        </div>
      </div>
      {renderCalendar()}
      {tooltip.visible && tooltip.event && (
        <div 
          ref={tooltipRef}
          className="event-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            zIndex: 1000,
            backgroundColor: 'white',
            border: `2px solid ${tooltip.event.color || '#4285f4'}`,
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            maxWidth: '400px',
            opacity: 0.9,
            width: 'auto'
          }}
        >
          {tooltip.event.tooltip}
        </div>
      )}
    </div>
  );
};

export default Calendar;