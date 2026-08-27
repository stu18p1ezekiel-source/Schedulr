import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Image as ImageIcon,
  Sparkles,
  Info,
  Layers,
  Trash2
} from 'lucide-react';
import { EventItem, HomeworkItem, Student } from '../types';

interface CalendarViewProps {
  events: EventItem[];
  homeworkList: HomeworkItem[];
  currentStudent: Student | null;
  onSelectEvent: (event: EventItem) => void;
  onDeleteEvent?: (id: string) => void;
  isTeacherMode?: boolean;
  onSelectHomework?: (homework: HomeworkItem) => void;
  onDayClick?: (dateStr: string) => void;
  selectedMonthDate: Date;
  setSelectedMonthDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  homeworkList,
  currentStudent,
  onSelectEvent,
  onDeleteEvent,
  isTeacherMode,
  onSelectHomework,
  onDayClick,
  selectedMonthDate,
  setSelectedMonthDate,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const year = selectedMonthDate.getFullYear();
  const month = selectedMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setSelectedMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setSelectedMonthDate(new Date(2026, 7, 27)); // August 27, 2026
  };

  // Student visibility filter for events
  const visibleEvents = events.filter((ev) => {
    if (!currentStudent) return true;
    if (ev.targetAudience === 'ALL') return true;
    if (ev.targetAudience === 'CLASS') {
      return !ev.targetClass || ev.targetClass === currentStudent.classId;
    }
    if (
      ev.targetAudience === 'GROUP_STUDENTS' || 
      ev.targetAudience === 'SINGLE_STUDENT' || 
      ev.targetAudience === 'SPECIFIC_STUDENTS'
    ) {
      return ev.targetStudentIds?.includes(currentStudent.id);
    }
    return true;
  });

  // Filter by category if set
  const filteredEvents = visibleEvents.filter((ev) => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  // Filter homework for current student
  const visibleHomework = homeworkList.filter((hw) => {
    if (!currentStudent) return true;
    if (hw.targetAudience === 'ALL') return true;
    if (hw.targetAudience === 'CLASS') {
      return !hw.targetClass || hw.targetClass === currentStudent.classId;
    }
    if (
      hw.targetAudience === 'GROUP_STUDENTS' || 
      hw.targetAudience === 'SINGLE_STUDENT' || 
      hw.targetAudience === 'SPECIFIC_STUDENTS'
    ) {
      return hw.targetStudentIds?.includes(currentStudent.id) || hw.studentId === currentStudent.id;
    }
    return true;
  });

  // Calculate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create grid cells
  const gridCells: {
    dayNumber: number;
    isCurrentMonth: boolean;
    dateStr: string;
    events: EventItem[];
    homework: HomeworkItem[];
    isToday: boolean;
  }[] = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    gridCells.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateStr,
      events: filteredEvents.filter(e => e.date === dateStr),
      homework: visibleHomework.filter(h => h.dueDate === dateStr),
      isToday: false,
    });
  }

  // Current month days (August 27, 2026)
  const todayStr = '2026-08-27';

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;

    gridCells.push({
      dayNumber: day,
      isCurrentMonth: true,
      dateStr,
      events: filteredEvents.filter(e => e.date === dateStr),
      homework: visibleHomework.filter(h => h.dueDate === dateStr),
      isToday,
    });
  }

  // Next month padding to fill grid
  const remainingSlots = (7 - (gridCells.length % 7)) % 7;
  for (let day = 1; day <= remainingSlots; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    gridCells.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateStr,
      events: filteredEvents.filter(e => e.date === dateStr),
      homework: visibleHomework.filter(h => h.dueDate === dateStr),
      isToday: false,
    });
  }

  return (
    <div 
      id="calendar-container"
      className="bg-white rounded-2xl border border-[#cbe6e3] p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-300"
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold font-serif text-[#082142]">Monthly Schedule</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#edf7f6] text-[#082142] font-semibold border border-[#cbe6e3]">
              {visibleEvents.length} Events • {visibleHomework.length} Due Tasks
            </span>
          </div>
          <p className="text-xs text-[#40535e] mt-1">
            Bina Bangsa academic events, laboratory schedules, and submission deadlines.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-calendar-jump-today"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#139a91] bg-[#d2f2ef] hover:bg-[#bceae5] rounded-lg transition-colors cursor-pointer"
          >
            Aug 2026 (Today)
          </button>
          <div className="flex items-center bg-[#edf7f6] rounded-xl p-1 border border-[#cbe6e3]">
            <button
              id="btn-calendar-prev"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg hover:bg-white text-[#082142] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-[#082142] min-w-[90px] text-center">
              {monthNames[month].slice(0, 3)} {year}
            </span>
            <button
              id="btn-calendar-next"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg hover:bg-white text-[#082142] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 text-xs scrollbar-none">
        <span className="text-[#75777f] mr-1 shrink-0 font-medium">Filter:</span>
        {[
          { id: 'all', label: 'All Items' },
          { id: 'academic', label: 'Academic & Labs' },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'workshop', label: 'Workshops' },
          { id: 'sports', label: 'Sports & Arts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
              filterCategory === tab.id
                ? 'bg-[#082142] text-white shadow-xs'
                : 'bg-[#edf7f6] text-[#40535e] hover:bg-[#d8ecea]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-[#cbe6e3] rounded-xl overflow-hidden shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-[#edf7f6] border-b border-[#cbe6e3]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div 
              key={d} 
              className="py-2.5 text-center text-xs font-bold text-[#082142] uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-[#cbe6e3]/50 gap-[1px]">
          {gridCells.map((cell, idx) => {
            return (
              <div
                key={`${cell.dateStr}-${idx}`}
                id={`cal-cell-${cell.dateStr}`}
                onClick={() => onDayClick?.(cell.dateStr)}
                className={`min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-colors relative group ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-[#f4f9f8]/70 text-[#75777f]'
                } ${cell.isToday ? 'bg-[#d2f2ef]/40 ring-1 ring-[#139a91] inset-0' : 'hover:bg-[#edf7f6]/80'}`}
              >
                {/* Day Header with Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                      cell.isToday
                        ? 'bg-[#139a91] text-white font-bold shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-[#082142] group-hover:text-[#139a91]'
                        : 'text-[#75777f]'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.events.some(e => e.imageUrl) && (
                    <span 
                      title="Event includes poster or guideline visual" 
                      className="text-[#139a91] bg-[#d2f2ef] p-0.5 rounded"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Events & Homework Badges / Thumbnails */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none flex-1">
                  {/* Event Badges */}
                  {cell.events.map((ev) => {
                    return (
                      <div
                        key={ev.id}
                        id={`event-pill-${ev.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className={`group/pill flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all shadow-2xs cursor-pointer hover:scale-[1.02] ${
                          ev.category === 'academic' || ev.title.includes('Physics')
                            ? 'bg-[#139a91] text-white'
                            : ev.title.includes('Science') || ev.category === 'general'
                            ? 'bg-[#082142] text-white'
                            : ev.category === 'sports'
                            ? 'bg-[#047857] text-white'
                            : ev.category === 'deadline'
                            ? 'bg-[#854d0e] text-white'
                            : 'bg-[#d2f2ef] text-[#082142]'
                        }`}
                      >
                        {/* Event Thumbnail */}
                        {ev.imageUrl && (
                          <img
                            src={ev.imageUrl}
                            alt=""
                            className="w-4 h-4 rounded-xs object-cover shrink-0 border border-white/40"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="truncate flex-1 font-semibold">{ev.title}</span>

                        {isTeacherMode && onDeleteEvent && (
                          <button
                            type="button"
                            title="Delete Event"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(ev.id);
                            }}
                            className="opacity-0 group-hover/pill:opacity-100 p-0.5 rounded hover:bg-black/30 text-white/90 hover:text-white transition-opacity ml-0.5 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Homework Due Badges */}
                  {cell.homework.map((hw) => (
                    <div
                      key={hw.id}
                      id={`hw-pill-${hw.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHomework?.(hw);
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer hover:opacity-90 ${
                        hw.completed
                          ? 'bg-[#edf7f6] text-[#75777f] border-[#cbe6e3] line-through'
                          : 'bg-[#ffdad6]/70 text-[#93000a] border-[#ffdad6]'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{hw.subject}: {hw.title}</span>
                    </div>
                  ))}
                </div>

                {/* Day status footer indicator */}
                {cell.events.length > 2 && (
                  <div className="text-[9px] text-[#139a91] font-semibold pt-0.5 text-right">
                    +{cell.events.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 pt-3 border-t border-[#cbe6e3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#40535e]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#082142]"></span>
            <span>School Fairs & Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#139a91]"></span>
            <span>Science & Labs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#854d0e]"></span>
            <span>Academic Deadlines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#ffdad6] border border-[#ba1a1a]"></span>
            <span>Homework Due</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#139a91] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated for Bina Bangsa School • {currentStudent?.classId || 'Senior Division'}</span>
        </div>
      </div>
    </div>
  );
};
