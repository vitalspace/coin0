import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import type { MemecoinNameSuggestion } from '../../services/api.service'; 

interface Props {
  theme: string;
  onThemeChange: (value: string) => void;
  keywords: string;
  onKeywordsChange: (value: string) => void;
  loading: boolean;
  suggestions: MemecoinNameSuggestion[];
  onGenerate: () => void;
  onSelect: (suggestion: MemecoinNameSuggestion) => void;
}

export default function AINameGenerator({
  theme,
  onThemeChange,
  keywords,
  onKeywordsChange,
  loading,
  suggestions,
  onGenerate,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-linear-to-br from-[#6fc7ba]/10 to-[#4c63c4]/10 border border-[#6fc7ba]/20">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#6fc7ba]" />
        <span className="text-sm font-medium text-[#6fc7ba]">AI Name Generator</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="generator-theme" className="text-xs text-gray-400">
            Theme (optional)
          </label>
          <input
            id="generator-theme"
            type="text"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="e.g., Space, Animals, Crypto"
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="generator-keywords" className="text-xs text-gray-400">
            Keywords (optional)
          </label>
          <input
            id="generator-keywords"
            type="text"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="e.g., moon, rocket, fast"
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="cursor-pointer w-full py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-sm text-[#6fc7ba] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generate Names
          </>
        )}
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400">Click a suggestion to use it:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.symbol}
                type="button"
                onClick={() => onSelect(suggestion)}
                className="cursor-pointer w-full p-3 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-[#6fc7ba]/30 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-[#6fc7ba] transition-colors">
                      {suggestion.name}
                    </span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-[#6fc7ba]/20 text-[#6fc7ba] rounded">
                      {suggestion.symbol}
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 group-hover:text-[#6fc7ba] transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {suggestion.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}