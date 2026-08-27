import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Tag, 
  Bookmark,
  X,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { TeacherPost, Student } from '../types';

interface PostsViewProps {
  posts: TeacherPost[];
  currentStudent: Student | null;
  onToggleLike: (postId: string) => void;
  isTeacherMode: boolean;
  onOpenCreatePost?: () => void;
  onDeletePost?: (postId: string) => void;
}

export const PostsView: React.FC<PostsViewProps> = ({
  posts,
  currentStudent,
  onToggleLike,
  isTeacherMode,
  onOpenCreatePost,
  onDeletePost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter posts visible to student
  const visiblePosts = posts.filter((post) => {
    if (!currentStudent) return true;
    if (!post.targetClass || post.targetClass === 'ALL') return true;
    if (post.targetClass === currentStudent.classId) return true;
    if (post.targetStudentIds?.includes(currentStudent.id)) return true;
    return false;
  });

  const filteredPosts = visiblePosts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'announcement':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d2f2ef] text-[#074e48]">Announcement</span>;
      case 'reminder':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#edf7f6] text-[#082142] border border-[#cbe6e3]">Important Reminder</span>;
      case 'deadline':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#93000a]">Deadline Alert</span>;
      case 'event':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d2f2ef] text-[#139a91]">
            <Calendar className="w-3 h-3" />
            <span>School Event</span>
          </span>
        );
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (isTeacherMode && onDeletePost) {
      onDeletePost(id);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div id="teacher-posts-feed" className="space-y-6 max-w-4xl mx-auto">
      {/* Category Filter & Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#082142]">Faculty Bulletins & Advisories</h3>
          <p className="text-xs text-[#40535e] mt-0.5">
            Official announcements from Bina Bangsa School faculty, department chairs, and advisors.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'announcement', 'reminder', 'deadline', 'event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#082142] text-white shadow-xs'
                  : 'bg-[#edf7f6] text-[#40535e] hover:bg-[#d8ecea]'
              }`}
            >
              {cat === 'all' ? 'All Bulletins' : cat}
            </button>
          ))}

          {isTeacherMode && onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className="bg-[#139a91] hover:bg-[#0e8b83] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#cbe6e3] p-10 text-center text-[#75777f]">
            <MessageSquare className="w-10 h-10 mx-auto text-[#139a91] mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#082142]">No posts found for this filter</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id}
              id={`post-card-${post.id}`}
              className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-4"
            >
              {/* Teacher Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.teacherAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt={post.teacherName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#139a91]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#082142]">{post.teacherName}</h4>
                    <p className="text-xs text-[#139a91] font-medium">{post.teacherRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getCategoryBadge(post.category)}
                  <span className="text-xs text-[#75777f]">{post.date}</span>
                  {isTeacherMode && onDeletePost && confirmDeleteId !== post.id && (
                    <button
                      id={`btn-delete-post-${post.id}`}
                      type="button"
                      onClick={() => setConfirmDeleteId(post.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ml-1"
                      title="Delete this post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Delete Confirmation prompt */}
              {confirmDeleteId === post.id && (
                <div 
                  id={`confirm-delete-box-${post.id}`}
                  className="bg-red-50 border-2 border-red-400 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center gap-2 text-red-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Are you sure you want to permanently delete this bulletin post?</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(post.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Body */}
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-[#082142] tracking-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-[#40535e] leading-relaxed whitespace-pre-line">
                  {post.fullMessage}
                </p>
              </div>

              {/* Post Attached Image */}
              {post.imageUrl && (
                <div 
                  className="rounded-xl overflow-hidden border border-[#cbe6e3] max-h-72 cursor-pointer relative group"
                  onClick={() => setLightboxImage(post.imageUrl!)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Click to enlarge visual
                  </div>
                </div>
              )}

              {/* Footer Engagement Bar */}
              <div className="pt-3 border-t border-[#cbe6e3]/60 flex items-center justify-between text-xs text-[#40535e]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      post.likedByCurrentUser
                        ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold'
                        : 'hover:bg-[#edf7f6] text-[#40535e]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByCurrentUser ? 'fill-[#ba1a1a]' : ''}`} />
                    <span>{post.likesCount} {post.likesCount === 1 ? 'Acknowledgment' : 'Acknowledgments'}</span>
                  </button>

                  <span className="text-xs text-[#75777f] hidden sm:inline">
                    Target: <strong>{post.targetClass === 'ALL' ? 'All BBS Students' : post.targetClass}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert('Post link copied to clipboard!')}
                    className="p-1.5 rounded-lg hover:bg-[#edf7f6] text-[#75777f] hover:text-[#082142] transition-colors"
                    title="Share Bulletin"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Enlarged Bulletin" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
