import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  FileText, 
  BookOpen, 
  MessageSquare,
  Eye,
  Check,
  AlertTriangle,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { HomeworkItem, Student } from '../types';

interface HomeworkProofModalProps {
  homework: HomeworkItem | null;
  currentStudent: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (homeworkId: string, proofImageUrl: string, studentNotes?: string) => void;
  isTeacherMode?: boolean;
  onDeleteHomework?: (id: string) => void;
}

const SAMPLE_PROOF_PHOTOS = [
  {
    name: 'Lab Notebook & Calculations',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    desc: 'STEM / Physics & Chemistry experiments',
  },
  {
    name: 'Handwritten Math Problem Set',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    desc: 'Step-by-step calculus & algebra solutions',
  },
  {
    name: 'Annotated Essay & Primary Sources',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuEWQqOv3l1tWdFP92TXdflfYx_mrC2fT2rL-iUwm52DHymyLxgCByNEKK5O4_kl8MRC8W9DR3VBy97u1cbvfzawjr-s4hPaMgxAoH5mcd6Yaeya6AckCOm9S5PIjwoJggzK8HgET9A2yYQxXzGmGUCF5lq7Mxf_fyzp6_7cJR8fXTp5EeIG3XAwBYTjf2WLssyu4vUBww219O_V3HOErmSSBbT9vDZNl6bmN4MsG-m2A1xUNIHA_U',
    desc: 'Citations, bibliography & thesis draft',
  },
  {
    name: 'Computer Code & Test Suite',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    desc: 'Algorithm implementations & diagram',
  },
];

export const HomeworkProofModal: React.FC<HomeworkProofModalProps> = ({
  homework,
  currentStudent,
  isOpen,
  onClose,
  onSubmitProof,
  isTeacherMode = false,
  onDeleteHomework,
}) => {
  const [photoMode, setPhotoMode] = useState<'camera' | 'upload' | 'samples'>('upload');
  const [proofImage, setProofImage] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with open homework item
  useEffect(() => {
    if (homework) {
      setProofImage(homework.proofImageUrl || '');
      setStudentNotes(homework.studentNotes || '');
      // If already has proof or is not completed, default to appropriate view
      if (!homework.proofImageUrl) {
        setPhotoMode('upload');
      }
    }
    return () => {
      stopCameraStream();
    };
  }, [homework, isOpen]);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser device.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can upload an image file or pick a demo sample below.'
          : 'Could not activate camera on this device. Please upload a photo instead.'
      );
      setIsCameraActive(false);
      setPhotoMode('upload');
    }
  };

  const compressImage = (dataUrl: string, maxWidth = 900, maxHeight = 900, quality = 0.72): Promise<string> => {
    return new Promise((resolve) => {
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = Math.min(video.videoWidth || 640, 800);
    const height = Math.min(video.videoHeight || 480, 800);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.72);
      const compressed = await compressImage(rawDataUrl, 800, 800, 0.72);
      setProofImage(compressed);
      stopCameraStream();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Please choose an image file under 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressImage(raw, 900, 900, 0.72);
        setProofImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressImage(raw, 900, 900, 0.72);
        setProofImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homework) return;
    if (!proofImage) {
      alert('Please take or upload a picture of your completed homework as proof before submitting.');
      return;
    }
    setIsSubmitting(true);
    stopCameraStream();

    setTimeout(() => {
      try {
        onSubmitProof(homework.id, proofImage, studentNotes.trim());
      } catch (err) {
        console.error('Submit proof error:', err);
      } finally {
        setIsSubmitting(false);
        onClose();
      }
    }, 200);
  };

  if (!isOpen || !homework) return null;

  const isApproved = homework.submissionStatus === 'approved';
  const isPending = homework.submissionStatus === 'pending_approval';
  const isDeclined = homework.submissionStatus === 'declined';

  return (
    <div 
      id="homework-proof-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082142]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={() => {
        stopCameraStream();
        onClose();
      }}
    >
      <div 
        id="homework-proof-modal-card"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#cbe6e3] overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#edf7f6] px-6 py-5 border-b border-[#cbe6e3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#139a91] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#d2f2ef] text-[#074e48]">
                  {homework.subject}
                </span>
                <span className="text-xs text-[#75777f]">Due: {homework.dueDate}</span>
                {homework.targetClass && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#082142] border border-[#cbe6e3]">
                    Class {homework.targetClass}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold font-serif text-[#082142] truncate mt-0.5">
                {homework.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Teacher Only Delete X / Trash Button */}
            {isTeacherMode && onDeleteHomework && (
              <button 
                id="btn-delete-hw-detail-teacher"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                title="Delete this homework assignment (Faculty only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-200 text-red-900 group-hover:bg-red-800 group-hover:text-white text-[10px] font-black">
                  ✕
                </span>
              </button>
            )}

            <button 
              id="btn-close-proof-modal"
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="p-2 rounded-full text-[#75777f] hover:text-[#082142] hover:bg-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teacher Delete Confirmation Warning Banner */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border-b-2 border-red-300 p-4 sm:p-5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 text-xs text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-950">
                    Delete Assignment Permanently?
                  </p>
                  <p className="text-red-800 text-xs mt-0.5">
                    Are you sure you want to delete <strong className="text-red-950">"{homework.title}"</strong>? This will remove it from all student feeds and delete all student submissions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-gray-300 text-[#40535e] text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-hw-modal"
                  onClick={() => {
                    if (onDeleteHomework) {
                      onDeleteHomework(homework.id);
                    }
                    stopCameraStream();
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Callout Banners */}
        {isApproved && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 flex-1">
              <p className="font-bold text-sm text-emerald-950">
                Verified & Approved by {homework.reviewedByTeacherName || 'Teacher'}
              </p>
              <p className="mt-0.5 text-emerald-800">
                {homework.reviewedAt ? `Reviewed on ${homework.reviewedAt}` : 'Assignment officially approved.'}
              </p>
              {homework.teacherFeedback && (
                <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                  <strong>Teacher Note:</strong> "{homework.teacherFeedback}"
                </div>
              )}
            </div>
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 flex-1">
              <p className="font-bold text-sm text-amber-950">
                Proof Submitted — Awaiting Teacher Approval
              </p>
              <p className="mt-0.5 text-amber-800">
                Your submission photo has been received. Your teacher will review and verify your work soon.
              </p>
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 flex-1">
              <p className="font-bold text-sm text-red-950">
                Submission Declined — Revision Requested
              </p>
              <p className="mt-0.5 text-red-800">
                {homework.teacherFeedback || 'Your teacher requested a clearer or completed photo proof of your work.'}
              </p>
              <p className="mt-1 font-semibold text-red-900">
                Please take or upload a new photo showing the complete work to resubmit.
              </p>
            </div>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Assignment Description Info */}
          {homework.description && (
            <div className="p-3.5 bg-[#f4f9f8] rounded-2xl border border-[#cbe6e3] text-xs text-[#40535e] leading-relaxed">
              <span className="font-semibold text-[#082142]">Assignment Details: </span>
              {homework.description}
            </div>
          )}

          {/* Photo Capture & Upload Modes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#082142] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#139a91]" />
                <span>Proof of Completed Homework *</span>
              </label>

              {/* Mode switch tabs */}
              <div className="flex bg-[#edf7f6] p-1 rounded-xl border border-[#cbe6e3] text-[11px] font-semibold">
                <button
                  type="button"
                  id="tab-mode-camera"
                  onClick={() => {
                    setPhotoMode('camera');
                    startCameraStream();
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    photoMode === 'camera'
                      ? 'bg-white text-[#082142] shadow-2xs font-bold'
                      : 'text-[#40535e] hover:text-[#082142]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  id="tab-mode-upload"
                  onClick={() => {
                    stopCameraStream();
                    setPhotoMode('upload');
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    photoMode === 'upload'
                      ? 'bg-white text-[#082142] shadow-2xs font-bold'
                      : 'text-[#40535e] hover:text-[#082142]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  id="tab-mode-samples"
                  onClick={() => {
                    stopCameraStream();
                    setPhotoMode('samples');
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    photoMode === 'samples'
                      ? 'bg-white text-[#082142] shadow-2xs font-bold'
                      : 'text-[#40535e] hover:text-[#082142]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#139a91]" />
                  <span>Samples</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {cameraError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Camera Viewfinder Mode */}
            {photoMode === 'camera' && !proofImage && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex flex-col items-center justify-center border-2 border-[#139a91]">
                <video 
                  ref={videoRef} 
                  playsInline 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
                
                {/* Viewfinder Target Grid Overlay */}
                <div className="absolute inset-4 border border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                    Align your notebook page or homework here
                  </span>
                </div>

                {/* Bottom Camera Controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
                  <button
                    type="button"
                    id="btn-snap-homework-photo"
                    onClick={handleCapturePhoto}
                    className="px-6 py-2.5 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Homework Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setPhotoMode('upload');
                    }}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs cursor-pointer"
                    title="Switch to file upload"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload File Mode */}
            {photoMode === 'upload' && !proofImage && (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#cbe6e3] hover:border-[#139a91] bg-[#f4f9f8] hover:bg-[#edf7f6] rounded-2xl p-8 text-center transition-all cursor-pointer group"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-white group-hover:bg-[#d2f2ef] text-[#139a91] flex items-center justify-center shadow-xs transition-colors mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#082142]">
                  Click to select homework photo or drag & drop
                </h4>
                <p className="text-xs text-[#75777f] mt-1 max-w-sm mx-auto">
                  Take a clear photo of your completed worksheets, math equations, or essay. Supports JPG, PNG, WebP (up to 8MB).
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white text-[#139a91] border border-[#cbe6e3]">
                    Browse Files
                  </span>
                </div>
              </div>
            )}

            {/* Samples Mode */}
            {photoMode === 'samples' && !proofImage && (
              <div className="space-y-3">
                <p className="text-xs text-[#40535e]">
                  Select a realistic sample proof photo for demonstration testing:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_PROOF_PHOTOS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProofImage(sample.url)}
                      className="text-left p-3 rounded-2xl border border-[#cbe6e3] hover:border-[#139a91] bg-white hover:bg-[#f4f9f8] transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <img 
                        src={sample.url} 
                        alt={sample.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-[#cbe6e3] shrink-0" 
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#082142] group-hover:text-[#139a91] truncate">
                          {sample.name}
                        </h5>
                        <p className="text-[11px] text-[#75777f] truncate mt-0.5">
                          {sample.desc}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-[#139a91] mt-1">
                          Use This Sample →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Preview Card with Retake/Replace Actions */}
            {proofImage && (
              <div className="bg-[#f4f9f8] p-4 rounded-2xl border border-[#cbe6e3] space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-[#cbe6e3] bg-black max-h-72 flex items-center justify-center">
                  <img 
                    src={proofImage} 
                    alt="Homework Submission Proof" 
                    className="w-full h-auto max-h-72 object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Photo Attached</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#40535e] font-medium">
                    {homework.submittedAt ? `Captured / Submitted: ${homework.submittedAt}` : 'Ready for submission'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProofImage('');
                        setPhotoMode('camera');
                        startCameraStream();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#139a91] hover:bg-[#d2f2ef] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProofImage('');
                        setPhotoMode('upload');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#75777f] hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Different</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Comment / Notes Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#082142] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#139a91]" />
              <span>Student Reflection or Submission Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g., Completed all 15 problem sets and verified with formula sheet."
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#f4f9f8] border border-[#cbe6e3] text-[#082142] placeholder-[#75777f] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#cbe6e3] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#40535e] bg-[#edf7f6] hover:bg-[#d8ecea] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="btn-submit-homework-proof"
              type="submit"
              disabled={!proofImage || isSubmitting}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                proofImage && !isSubmitting
                  ? 'bg-[#139a91] hover:bg-[#0e8b83] text-white hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Proof...</span>
                </>
              ) : isApproved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Verified Submission</span>
                </>
              ) : isPending ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Submitted Proof</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Proof for Teacher Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
