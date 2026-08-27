import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Bookmark, 
  Share2, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { EventItem } from '../types';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
  onDeleteEvent?: (id: string) => void;
  isTeacherMode?: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onDeleteEvent,
  isTeacherMode,
}) => {
  const [isRsvped, setIsRsvped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    if (isTeacherMode && onDeleteEvent && event) {
      onDeleteEvent(event.id);
      setShowConfirmDelete(false);
      onClose();
    }
  };

  return (
    <div 
      id="event-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="event-details-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#cbe6e3] animate-in zoom-in-95 duration-200 scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        {event.imageUrl ? (
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#082142]">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082142] via-[#082142]/30 to-transparent" />
            
            {/* Close Button */}
            <button 
              id="btn-close-event-modal"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges on image */}
            <div className="absolute bottom-4 left-6 right-6 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#139a91] text-white">
                  {event.category}
                </span>
                {event.targetAudience === 'CLASS' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {event.targetClass} Only
                  </span>
                )}
                {event.targetAudience === 'SPECIFIC_STUDENTS' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a]">
                    Special Assignment
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#edf7f6] border-b border-[#cbe6e3] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#139a91] text-white">
              {event.category}
            </span>
            <button 
              id="btn-close-event-modal-no-img"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#40535e] hover:bg-[#d8ecea] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#139a91]">
              Bina Bangsa Event
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#082142] mt-1">
              {event.title}
            </h2>
          </div>

          {/* Inline Delete Confirmation prompt */}
          {showConfirmDelete && (
            <div 
              id="confirm-delete-event-box"
              className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3 text-red-900">
                <div className="p-2 bg-red-100 rounded-full text-red-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-950">Remove event from calendar?</h4>
                  <p className="text-xs text-red-800">
                    This will delete "{event.title}" from the school schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-event"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Event</span>
                </button>
              </div>
            </div>
          )}

          {/* Time, Date, Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#edf7f6] border border-[#cbe6e3]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white text-[#139a91] shadow-2xs border border-[#cbe6e3]">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-[#75777f] uppercase font-semibold">Date</p>
                <p className="text-xs sm:text-sm font-semibold text-[#082142]">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white text-[#139a91] shadow-2xs border border-[#cbe6e3]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-[#75777f] uppercase font-semibold">Time</p>
                <p className="text-xs sm:text-sm font-semibold text-[#082142]">
                  {event.startTime && event.endTime 
                    ? `${event.startTime} - ${event.endTime}` 
                    : event.startTime || 'All Day Academic Event'}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 sm:col-span-2 pt-2 border-t border-[#cbe6e3]/60">
                <div className="p-2 rounded-lg bg-white text-[#139a91] shadow-2xs border border-[#cbe6e3]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#75777f] uppercase font-semibold">Campus Venue</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#082142]">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Details Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#75777f] mb-2">
              Event Details & Instructions
            </h4>
            <p className="text-sm sm:text-base text-[#40535e] leading-relaxed whitespace-pre-line">
              {event.details}
            </p>
          </div>

          {/* Counselors & Faculty In Charge */}
          {event.counselors && event.counselors.length > 0 && (
            <div className="pt-4 border-t border-[#cbe6e3]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#75777f] mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#139a91]" />
                <span>Supervising Faculty & Advisors</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.counselors.map((counselor, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f9f8] border border-[#cbe6e3] text-xs font-medium text-[#082142]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#139a91]" />
                    <span>{counselor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#cbe6e3]">
            <button
              id="btn-rsvp-event"
              onClick={() => setIsRsvped(!isRsvped)}
              className={`flex-1 min-w-[140px] py-3 px-5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isRsvped
                  ? 'bg-[#d2f2ef] text-[#074e48] border border-[#139a91]'
                  : 'bg-[#139a91] hover:bg-[#0e8b83] text-white shadow-xs'
              }`}
            >
              <Check className={`w-4 h-4 ${isRsvped ? 'stroke-[3]' : ''}`} />
              <span>{isRsvped ? 'Attending (RSVP Confirmed)' : 'RSVP for Event'}</span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-3 rounded-full border transition-colors ${
                isBookmarked
                  ? 'bg-[#d2f2ef] border-[#139a91] text-[#139a91]'
                  : 'border-[#cbe6e3] text-[#40535e] hover:bg-[#edf7f6]'
              }`}
              title="Bookmark Event"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#139a91]' : ''}`} />
            </button>

            <button
              onClick={() => alert('Event link copied to clipboard!')}
              className="p-3 rounded-full border border-[#cbe6e3] text-[#40535e] hover:bg-[#edf7f6] transition-colors"
              title="Share Event"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {isTeacherMode && onDeleteEvent && !showConfirmDelete && (
              <button
                id="btn-delete-event-modal"
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="py-3 px-4 rounded-full border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-bold transition-colors ml-auto flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
