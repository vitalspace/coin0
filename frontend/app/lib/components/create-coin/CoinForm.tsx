'use client';

import Link from 'next/link';
import { Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import type { MemecoinNameSuggestion } from '../../services/api.service';
import NameGenerator from './NameGenerator';
import ImageUpload from './ImageUpload';
import SuccessMessage from './SuccessMessage';

interface Props {
  tokenName: string;
  onTokenNameChange: (v: string) => void;
  tokenSymbol: string;
  onTokenSymbolChange: (v: string) => void;
  tokenSupply: string;
  onTokenSupplyChange: (v: string) => void;
  imagePreview: string | null;
  onImagePreviewChange: (v: string | null) => void;
  imageFile: File | null;
  onImageFileChange: (v: File | null) => void;
  walletAddress: string;
  loading: boolean;
  creating: boolean;
  error: string | null;
  success: boolean;
  contractAddress: string | null;
  explorerUrl: string | null;
  creationFee: string;
  tokenLogo?: string | null;
  generatorTheme: string;
  onGeneratorThemeChange: (v: string) => void;
  generatorKeywords: string;
  onGeneratorKeywordsChange: (v: string) => void;
  showGenerator: boolean;
  onShowGeneratorChange: (v: boolean) => void;
  generatorLoading: boolean;
  generatedSuggestions: MemecoinNameSuggestion[];
  onGenerateNames: () => void;
  onSelectSuggestion: (suggestion: MemecoinNameSuggestion) => void;
  onSubmit: () => void;
}

export default function TokenForm({
  tokenName, onTokenNameChange,
  tokenSymbol, onTokenSymbolChange,
  tokenSupply, onTokenSupplyChange,
  imagePreview, onImagePreviewChange,
  imageFile, onImageFileChange,
  walletAddress,
  loading, creating,
  error, success,
  contractAddress, explorerUrl,
  tokenSymbol: tokenSymbolProp,
  tokenName: tokenNameProp,
  tokenLogo,
  creationFee,
  generatorTheme, onGeneratorThemeChange,
  generatorKeywords, onGeneratorKeywordsChange,
  showGenerator, onShowGeneratorChange,
  generatorLoading,
  generatedSuggestions, onGenerateNames, onSelectSuggestion,
  onSubmit,
  }: Props) {
  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-[#6fc7ba]/20 rounded-2xl blur opacity-50" />

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="relative space-y-4 p-6 rounded-2xl bg-white/2 border border-white/10 backdrop-blur-sm"
      >
        {/* Token Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="token-name" className="block text-xs font-medium text-gray-300">
              Token Name <span className="text-[#6fc7ba]">*</span>
            </label>
            <button
              type="button"
              onClick={() => onShowGeneratorChange(!showGenerator)}
              className="cursor-pointer text-xs text-[#6fc7ba] hover:text-[#4c63c4] transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} />
              {showGenerator ? 'Hide AI Generator' : 'Get AI Suggestions'}
            </button>
          </div>
          <input
            id="token-name"
            type="text"
            value={tokenName}
            onChange={(e) => onTokenNameChange(e.target.value)}
            placeholder="My Awesome Token"
            className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none transition-all"
          />
        </div>

        {/* AI Name Generator */}
        {showGenerator && (
          <NameGenerator
            theme={generatorTheme}
            onThemeChange={onGeneratorThemeChange}
            keywords={generatorKeywords}
            onKeywordsChange={onGeneratorKeywordsChange}
            loading={generatorLoading}
            suggestions={generatedSuggestions}
            onGenerate={onGenerateNames}
            onSelect={onSelectSuggestion}
          />
        )}

        {/* Symbol & Supply Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="token-symbol" className="block text-xs font-medium text-gray-300">
              Symbol <span className="text-[#6fc7ba]">*</span>
            </label>
            <input
              id="token-symbol"
              type="text"
              value={tokenSymbol}
              onChange={(e) => onTokenSymbolChange(e.target.value)}
              placeholder="MAT"
              maxLength={5}
              className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none transition-all uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="token-supply" className="block text-xs font-medium text-gray-300">
              Supply <span className="text-[#6fc7ba]">*</span>
            </label>
            <input
              id="token-supply"
              type="text"
              value={tokenSupply}
              onChange={(e) => onTokenSupplyChange(e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Token Image */}
        <ImageUpload
          imagePreview={imagePreview}
          onImagePreviewChange={onImagePreviewChange}
          imageFile={imageFile}
          onImageFileChange={onImageFileChange}
          tokenName={tokenName}
        />

        {/* Owner Address */}
        <div className="space-y-1.5">
          <label htmlFor="owner-address" className="block text-xs font-medium text-gray-300">
            Owner Address
          </label>
          <input
            id="owner-address"
            type="text"
            value={walletAddress || 'Connect Initia wallet first'}
            disabled
            className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-gray-400 font-mono cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && contractAddress && (
          <SuccessMessage
            contractAddress={contractAddress}
            explorerUrl={explorerUrl}
            walletAddress={walletAddress}
            tokenSymbol={tokenSymbol}
            tokenName={tokenName}
            tokenLogo={tokenLogo || undefined}
          />
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-base transition-all duration-300 rounded-full overflow-hidden hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_30px_rgba(98,126,234,0.3)]"
          >
            <div className="absolute inset-0 bg-[#6fc7ba] group-hover:bg-[#4c63c4] transition-colors" />
            <div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-full blur opacity-0 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/30 to-transparent rounded-t-full" />
            <span className="relative flex items-center gap-2 text-white font-bold">
              {creating ? (
                <><Loader2 size={16} className="animate-spin" /> Creating Token...</>
              ) : loading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <>
                  Create Token ({creationFee} Initia)
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          By creating, you agree to{' '}
          <Link href="/" className="text-[#6fc7ba] hover:underline">Terms</Link>$2
        </p>
      </form>
    </div>
  );
}