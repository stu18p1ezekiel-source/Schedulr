import React, { useState } from 'react';
import { Sparkles, Loader2, Check, RefreshCw, X, SlidersHorizontal, Wand2 } from 'lucide-react';

interface AIDetailsWriterProps {
  title: string;
  category?: string;
  targetAudience?: string;
  currentText: string;
  contextType: 'event' | 'bulletin' | 'assignment';
  onApplyText: (text: string) => void;
  className?: string;
}

export const AIDetailsWriter: React.FC<AIDetailsWriterProps> = ({
  title,
  category,
  targetAudience,
  currentText,
  contextType,
  onApplyText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'comprehensive' | 'concise' | 'guidelines' | 'parent_student'>('comprehensive');
  const [error, setError] = useState<string | null>(null);

  const stylePrompts = {
    comprehensive: 'Write a comprehensive, engaging, and professional description with clear event background, schedule highlights, and key student expectations.',
    concise: 'Write a clear, concise, and focused summary highlighting the most critical details in 2-3 sentences.',
    guidelines: 'Draft actionable student guidelines including preparation instructions, required materials/dress code, and deadlines as bullet points.',
    parent_student: 'Write an official notice suitable for both students and parents with clear logistical and academic information.',
  };

  const handleGenerate = async (overridePrompt?: string) => {
    setIsLoading(true);
    setError(null);

    const promptToUse = overridePrompt || customPrompt || stylePrompts[selectedStyle];

    try {
      const response = await fetch('/api/ai/generate-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || 'Academic Activity',
          category,
          targetAudience,
          currentText: currentText.trim(),
          contextType,
          prompt: promptToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate details.');
      }

      setGeneratedText(data.text || '');
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setError(err.message || 'Could not generate details. You can continue writing manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onApplyText(generatedText);
      setIsOpen(false);
    }
  };

  return (
    <div className={`mt-1.5 ${className}`}>
      {/* Toggle Button to Open AI Assistant */}
      {!isOpen ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              if (!generatedText && title.trim()) {
                handleGenerate();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e8b83] hover:text-[#074e48] bg-[#d2f2ef]/60 hover:bg-[#d2f2ef] px-3 py-1 rounded-lg transition-all cursor-pointer border border-[#cbe6e3]"
            title="Use AI to help draft or polish details"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#139a91]" />
            <span>AI Writing Assistant (Optional)</span>
          </button>
          <span className="text-[11px] text-[#75777f]">
            Optional assistant • You can also type directly below
          </span>
        </div>
      ) : (
        <div className="bg-[#f0fbf9] border-2 border-[#139a91]/30 rounded-2xl p-4 space-y-3.5 shadow-sm transition-all animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#139a91] text-white flex items-center justify-center shadow-2xs">
                <Wand2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#082142] flex items-center gap-1.5">
                  AI Detail Assistant
                  <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-[#139a91]/15 text-[#074e48]">
                    Gemini 3.7 Flash
                  </span>
                </h5>
                <p className="text-[11px] text-[#40535e]">
                  Draft, expand, or format details based on "{title || 'your title'}".
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#75777f] hover:text-[#082142] hover:bg-white transition-colors cursor-pointer"
              title="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Style Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#40535e] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3 text-[#139a91]" /> Style:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('comprehensive');
                handleGenerate(stylePrompts.comprehensive);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedStyle === 'comprehensive'
                  ? 'bg-[#139a91] text-white border-[#139a91] font-bold'
                  : 'bg-white text-[#40535e] border-[#cbe6e3] hover:bg-[#edf7f6]'
              }`}
            >
              Comprehensive
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('guidelines');
                handleGenerate(stylePrompts.guidelines);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedStyle === 'guidelines'
                  ? 'bg-[#139a91] text-white border-[#139a91] font-bold'
                  : 'bg-white text-[#40535e] border-[#cbe6e3] hover:bg-[#edf7f6]'
              }`}
            >
              Bullet Guidelines
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('concise');
                handleGenerate(stylePrompts.concise);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedStyle === 'concise'
                  ? 'bg-[#139a91] text-white border-[#139a91] font-bold'
                  : 'bg-white text-[#40535e] border-[#cbe6e3] hover:bg-[#edf7f6]'
              }`}
            >
              Concise Summary
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('parent_student');
                handleGenerate(stylePrompts.parent_student);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedStyle === 'parent_student'
                  ? 'bg-[#139a91] text-white border-[#139a91] font-bold'
                  : 'bg-white text-[#40535e] border-[#cbe6e3] hover:bg-[#edf7f6]'
              }`}
            >
              Parent & Student Notice
            </button>
          </div>

          {/* Custom Instruction Input (Optional) */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Optional: Enter custom instructions (e.g. Include bring lab goggles and 2B pencils)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#cbe6e3] text-xs bg-white text-[#082142] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleGenerate()}
              className="px-3 py-1.5 rounded-xl bg-[#082142] hover:bg-[#112f5a] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-[#ffdad6]/60 border border-[#ffdad6] text-xs text-[#93000a] flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-[10px] font-bold underline ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Result Preview & Actions */}
          {generatedText && (
            <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#cbe6e3]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#139a91]">
                  Generated Suggestion (Editable)
                </span>
                <span className="text-[10px] text-[#75777f]">
                  Click Apply to insert into your form
                </span>
              </div>

              <textarea
                rows={4}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#cbe6e3] text-xs text-[#082142] bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#139a91] font-sans leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setGeneratedText('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#75777f] hover:text-[#082142] hover:bg-[#edf7f6] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 rounded-lg bg-[#139a91] hover:bg-[#0e8b83] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to Details Field</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
