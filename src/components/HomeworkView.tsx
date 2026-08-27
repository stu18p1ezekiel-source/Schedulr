import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  AlertCircle, 
  BookOpen, 
  Check, 
  ListTodo,
  Camera,
  Eye,
  Sparkles,
  AlertTriangle,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import { HomeworkItem, Student } from '../types';
import { HomeworkProofModal } from './HomeworkProofModal';

interface HomeworkViewProps {
  homeworkList: HomeworkItem[];
  currentStudent: Student | null;
  onToggleComplete: (id: string) => void;
  onOpenAddHomework: () => void;
  onSubmitProof: (homeworkId: string, proofImageUrl: string, studentNotes?: string) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  homeworkList,
  currentStudent,
  onToggleComplete,
  onOpenAddHomework,
  onSubmitProof,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'review' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected homework for Photo Proof Modal
  const [proofModalItem, setProofModalItem] = useState<HomeworkItem | null>(null);

  // Filter homework visible to student
  const visibleHomework = homeworkList.filter((hw) => {
    if (!currentStudent) return true;
    if (hw.targetAudience === 'ALL') return true;
    if (hw.targetAudience === 'CLASS') {
      return !hw.targetClass || hw.targetClass === currentStudent.classId;
    }
    if (hw.targetAudience === 'SPECIFIC_STUDENTS') {
      return hw.targetStudentIds?.includes(currentStudent.id) || hw.studentId === currentStudent.id;
    }
    return true;
  });

  // Unique subjects
  const subjects = ['all', ...Array.from(new Set(visibleHomework.map(h => h.subject)))];

  // Counts
  const completedCount = visibleHomework.filter(h => h.completed || h.submissionStatus === 'approved').length;
  const reviewCount = visibleHomework.filter(h => h.submissionStatus === 'pending_approval').length;
  const pendingCount = visibleHomework.filter(h => !h.completed && h.submissionStatus !== 'approved' && h.submissionStatus !== 'pending_approval').length;

  // Apply filters
  const filteredList = visibleHomework.filter((hw) => {
    const isApproved = hw.completed || hw.submissionStatus === 'approved';
    const isPendingReview = hw.submissionStatus === 'pending_approval';
    const isToSubmit = !isApproved && !isPendingReview;

    if (filterStatus === 'pending' && !isToSubmit) return false;
    if (filterStatus === 'review' && !isPendingReview) return false;
    if (filterStatus === 'completed' && !isApproved) return false;
    if (selectedSubject !== 'all' && hw.subject !== selectedSubject) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        hw.title.toLowerCase().includes(q) ||
        hw.subject.toLowerCase().includes(q) ||
        (hw.description && hw.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRowActionClick = (hw: HomeworkItem) => {
    // Open the proof modal so the student can capture/view photo proof
    setProofModalItem(hw);
  };

  return (
    <div id="homework-view-page" className="space-y-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#75777f]">Total Assigned</p>
            <h4 className="text-3xl font-serif font-bold text-[#082142] mt-1">{visibleHomework.length}</h4>
          </div>
          <div className="p-3 rounded-xl bg-[#edf7f6] text-[#139a91]">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#75777f]">Pending Proof</p>
            <h4 className="text-3xl font-serif font-bold text-[#ba1a1a] mt-1">{pendingCount}</h4>
          </div>
          <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a]">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#75777f]">Teacher Verified</p>
            <h4 className="text-3xl font-serif font-bold text-[#139a91] mt-1">{completedCount}</h4>
          </div>
          <div className="p-3 rounded-xl bg-[#d2f2ef] text-[#074e48]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Info helper banner explaining the photo proof requirement */}
      <div className="bg-gradient-to-r from-[#edf7f6] to-[#f4f9f8] p-4 rounded-2xl border border-[#cbe6e3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#139a91] text-white shrink-0 shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#082142]">
              Photo Proof Required for Completion
            </h4>
            <p className="text-[11px] text-[#40535e] mt-0.5">
              Snap a photo of your handwritten exercises or upload completed work. Your teacher will verify and approve it.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddHomework}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-white hover:bg-[#d2f2ef] border border-[#cbe6e3] text-[#139a91] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Personal Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-[#edf7f6] p-1 rounded-xl w-full sm:w-auto border border-[#cbe6e3] overflow-x-auto">
            <button
              id="filter-tab-all"
              onClick={() => setFilterStatus('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-[#082142] shadow-2xs font-bold'
                  : 'text-[#40535e] hover:text-[#082142]'
              }`}
            >
              All ({visibleHomework.length})
            </button>
            <button
              id="filter-tab-pending"
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white text-[#082142] shadow-2xs font-bold'
                  : 'text-[#40535e] hover:text-[#082142]'
              }`}
            >
              To Do ({pendingCount})
            </button>
            <button
              id="filter-tab-review"
              onClick={() => setFilterStatus('review')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === 'review'
                  ? 'bg-white text-[#082142] shadow-2xs font-bold'
                  : 'text-[#40535e] hover:text-[#082142]'
              }`}
            >
              In Review ({reviewCount})
            </button>
            <button
              id="filter-tab-completed"
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-white text-[#082142] shadow-2xs font-bold'
                  : 'text-[#40535e] hover:text-[#082142]'
              }`}
            >
              Verified ({completedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#75777f] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-homework"
              type="text"
              placeholder="Search by topic, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#f4f9f8] border border-[#cbe6e3] text-[#082142] placeholder-[#75777f] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-xs text-[#75777f] font-medium mr-1 shrink-0">Subject:</span>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 capitalize cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-[#139a91] text-white shadow-xs'
                  : 'bg-[#edf7f6] text-[#40535e] hover:bg-[#d8ecea]'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-3.5">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#cbe6e3] p-10 text-center text-[#75777f] shadow-xs">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#139a91] mb-2 opacity-50" />
            <h4 className="text-base font-semibold text-[#082142]">No assignments found</h4>
            <p className="text-xs mt-1">Try adjusting your filter or search query.</p>
          </div>
        ) : (
          filteredList.map((hw) => {
            const isApproved = hw.completed || hw.submissionStatus === 'approved';
            const isPendingReview = hw.submissionStatus === 'pending_approval';
            const isDeclined = hw.submissionStatus === 'declined';

            return (
              <div
                key={hw.id}
                id={`homework-row-${hw.id}`}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isApproved 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : isPendingReview
                    ? 'border-amber-200 bg-amber-50/20'
                    : isDeclined
                    ? 'border-red-200 bg-red-50/20'
                    : 'border-[#cbe6e3] hover:border-[#139a91] hover:shadow-md'
                }`}
              >
                {/* Left Side: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Photo Proof Trigger Button */}
                  <button
                    id={`btn-proof-trigger-${hw.id}`}
                    onClick={() => handleRowActionClick(hw)}
                    title={
                      isApproved 
                        ? "Verified by Teacher (Click to view proof)" 
                        : isPendingReview
                        ? "Submitted - Awaiting Review (Click to view/update)"
                        : isDeclined
                        ? "Declined (Click to resubmit proof)"
                        : "Take photo proof to complete"
                    }
                    className="mt-0.5 p-1 text-[#75777f] hover:text-[#139a91] rounded-xl transition-transform hover:scale-110 shrink-0 cursor-pointer"
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : isPendingReview ? (
                      <Clock className="w-6 h-6 text-amber-600 fill-amber-100 animate-pulse" />
                    ) : isDeclined ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 fill-red-100" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#75777f] hover:border-[#139a91] flex items-center justify-center">
                        <Camera className="w-3 h-3 text-[#75777f] hover:text-[#139a91]" />
                      </div>
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d2f2ef] text-[#074e48]">
                        {hw.subject}
                      </span>

                      {/* Verification Status Pill */}
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Teacher Verified</span>
                        </span>
                      )}

                      {isPendingReview && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Teacher Review</span>
                        </span>
                      )}

                      {isDeclined && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-900 flex items-center gap-1 border border-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Revision Requested</span>
                        </span>
                      )}

                      {hw.priority === 'high' && !isApproved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ffdad6] text-[#93000a]">
                          Urgent
                        </span>
                      )}

                      {hw.targetAudience === 'SPECIFIC_STUDENTS' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edf7f6] text-[#082142] border border-[#cbe6e3]">
                          Assigned to you
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 
                      onClick={() => handleRowActionClick(hw)}
                      className={`text-base font-semibold text-[#082142] hover:text-[#139a91] cursor-pointer transition-colors ${
                        isApproved ? 'line-through text-[#75777f]' : ''
                      }`}
                    >
                      {hw.title}
                    </h4>

                    {/* Description */}
                    {hw.description && (
                      <p className="text-xs text-[#40535e] line-clamp-2 leading-relaxed">
                        {hw.description}
                      </p>
                    )}

                    {/* Teacher Feedback Note if present */}
                    {hw.teacherFeedback && (
                      <div className="p-2 bg-white rounded-xl border border-[#cbe6e3] text-xs text-[#082142] flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#139a91] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#139a91]">
                            {hw.reviewedByTeacherName ? `${hw.reviewedByTeacherName}: ` : 'Teacher Feedback: '}
                          </span>
                          <span className="text-[#40535e]">"{hw.teacherFeedback}"</span>
                        </div>
                      </div>
                    )}

                    {/* Meta details */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#75777f]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#139a91]" />
                        <span>Due: {hw.dueDate}</span>
                      </span>
                      {hw.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#139a91]" />
                          <span>{hw.dueTime}</span>
                        </span>
                      )}
                      {hw.assignedBy && (
                        <span className="text-[#40535e]">
                          By: <strong className="font-semibold">{hw.assignedBy}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Photo Proof Preview & Action Buttons */}
                <div className="flex items-center gap-3 justify-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#cbe6e3]/60">
                  {/* Photo Proof Thumbnail if available */}
                  {hw.proofImageUrl && (
                    <div 
                      onClick={() => handleRowActionClick(hw)}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#139a91] cursor-pointer group shadow-2xs shrink-0"
                      title="Click to view full photo proof"
                    >
                      <img 
                        src={hw.proofImageUrl} 
                        alt="Proof Preview" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <button
                    id={`btn-action-hw-${hw.id}`}
                    onClick={() => handleRowActionClick(hw)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : isPendingReview
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : isDeclined
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#139a91] hover:bg-[#0e8b83] text-white hover:shadow-md'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </>
                    ) : isPendingReview ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>In Review</span>
                      </>
                    ) : isDeclined ? (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Resubmit Proof</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap Proof & Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Homework Photo Proof Modal */}
      {proofModalItem && (
        <HomeworkProofModal
          isOpen={Boolean(proofModalItem)}
          homework={proofModalItem}
          currentStudent={currentStudent}
          onClose={() => setProofModalItem(null)}
          onSubmitProof={(id, url, notes) => {
            onSubmitProof(id, url, notes);
            setProofModalItem(null);
          }}
        />
      )}
    </div>
  );
};
