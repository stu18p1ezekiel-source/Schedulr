import React, { useState } from 'react';
import { BookOpen, ExternalLink, Sparkles, X, Download, Bookmark } from 'lucide-react';

export const FeaturedResourceCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const libraryImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuEWQqOv3l1tWdFP92TXdflfYx_mrC2fT2rL-iUwm52DHymyLxgCByNEKK5O4_kl8MRC8W9DR3VBy97u1cbvfzawjr-s4hPaMgxAoH5mcd6Yaeya6AckCOm9S5PIjwoJggzK8HgET9A2yYQxXzGmGUCF5lq7Mxf_fyzp6_7cJR8fXTp5EeIG3XAwBYTjf2WLssyu4vUBww219O_V3HOErmSSBbT9vDZNl6bmN4MsG-m2A1xUNIHA_U';

  return (
    <>
      <div 
        id="featured-resource-card"
        onClick={() => setShowModal(true)}
        className="rounded-2xl overflow-hidden border border-[#cbe6e3] relative group cursor-pointer shadow-xs hover:shadow-lg transition-all duration-500"
      >
        <div 
          className="bg-cover bg-center w-full h-48 transition-transform duration-700 group-hover:scale-105" 
          style={{ backgroundImage: `url('${libraryImageUrl}')` }}
        />
        
        {/* Dark BBS gradient overlay for typography readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#082142] via-[#082142]/65 to-transparent flex flex-col justify-end p-5">
          <div className="flex items-center gap-1.5 text-xs text-[#84f0e5] font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>BBS Digital Library</span>
          </div>
          <h4 className="text-lg font-serif font-bold text-white tracking-tight flex items-center justify-between">
            <span>Academic Resource Hub</span>
            <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-[#84f0e5] transition-colors" />
          </h4>
          <p className="text-xs text-[#b2d9d4] mt-0.5">Access Cambridge & IB past papers, journals, and syllabus guides</p>
        </div>
      </div>

      {/* Resource Modal */}
      {showModal && (
        <div 
          id="library-resource-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#cbe6e3] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url('${libraryImageUrl}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#082142] to-black/30" />
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#139a91] text-white">
                  Digital Repository
                </span>
                <h3 className="text-2xl font-serif font-bold mt-1.5">BBS Academic Library</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-[#40535e] leading-relaxed">
                Access over 50,000 peer-reviewed journal articles, Cambridge IGCSE / A-Level past examination papers, syllabus rubrics, and high-resolution science diagrams curated by Bina Bangsa School faculty.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#edf7f6] border border-[#cbe6e3]">
                  <span className="text-xs text-[#139a91] font-semibold">Science & STEM</span>
                  <p className="text-sm font-semibold text-[#082142]">JSTOR & Nature Access</p>
                </div>
                <div className="p-3 rounded-xl bg-[#edf7f6] border border-[#cbe6e3]">
                  <span className="text-xs text-[#139a91] font-semibold">Humanities & Languages</span>
                  <p className="text-sm font-semibold text-[#082142]">Oxford Literature Archives</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#cbe6e3]">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex-1 py-2.5 px-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                    saved 
                      ? 'bg-[#d2f2ef] border-[#139a91] text-[#074e48]' 
                      : 'border-[#cbe6e3] text-[#40535e] hover:bg-[#edf7f6]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{saved ? 'Saved to Bookmarks' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={() => {
                    alert('Redirecting to Bina Bangsa School Digital Library repository...');
                    setShowModal(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full font-semibold text-sm bg-[#139a91] text-white hover:bg-[#0e8b83] transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Enter Repository</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
