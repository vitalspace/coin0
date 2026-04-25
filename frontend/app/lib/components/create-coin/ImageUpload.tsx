'use client';

import { useState } from 'react';
import { generateImage, uploadImage } from '../../services/api.service';
import { Loader2, RefreshCw, X, Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  imagePreview: string | null;
  onImagePreviewChange: (value: string | null) => void;
  imageFile: File | null;
  onImageFileChange: (value: File | null) => void;
  tokenName?: string;
}

export default function TokenImageUpload({
  imagePreview,
  onImagePreviewChange,
  imageFile,
  onImageFileChange,
  tokenName = '',
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isLoading = generating || uploading;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onImagePreviewChange(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const response = await uploadImage(file);
      if (response.imageUrl) {
        onImagePreviewChange(response.imageUrl);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!tokenName) return;
    setGenerating(true);
    try {
      const prompt = `A sleek, modern logo icon for a cryptocurrency token called "${tokenName}", minimalist design, vibrant colors, 512x512, no text`;
      const response = await generateImage(prompt);
      if (response.imageUrl) {
        onImagePreviewChange(response.imageUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageFileChange(null);
    onImagePreviewChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="token-image" className="block text-xs font-medium text-gray-300">
          Token Image <span className="text-gray-500">(optional)</span>
        </label>
        {tokenName && !imagePreview && !isLoading && (
          <button
            type="button"
            onClick={handleGenerate}
            className="cursor-pointer text-xs text-[#6fc7ba] hover:text-[#4c63c4] transition-colors flex items-center gap-1.5 group"
          >
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            Generate with AI
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="token-image"
      />

      {imagePreview ? (
        <div className="relative group/image">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6fc7ba]/30 to-[#4c63c4]/30 rounded-2xl blur opacity-40 group-hover/image:opacity-60 transition-opacity" />
          <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-0.5 bg-[#6fc7ba]/20 rounded-xl blur-sm" />
              <img
                src={imagePreview}
                alt="Token preview"
                className="relative w-16 h-16 rounded-xl object-cover border border-white/20 shadow-lg"
              />
              {(uploading || generating) && (
                <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="animate-spin h-6 w-6 text-[#6fc7ba]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">Image uploaded</p>
              <p className="text-xs text-gray-500 mt-0.5">Click to change or remove</p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all group/remove"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <label htmlFor="token-image" className="absolute inset-0 cursor-pointer" />
        </div>
      ) : isLoading ? (
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6fc7ba]/5 to-transparent animate-[shimmer_2s_infinite]" />
          <div className="flex items-center gap-4 p-4">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-0.5 bg-[#6fc7ba]/20 rounded-xl blur-sm animate-pulse" />
              <div className="relative w-16 h-16 rounded-xl bg-[#6fc7ba]/10 border border-[#6fc7ba]/20 flex items-center justify-center">
                {generating ? (
                  <ImageIcon className="w-6 h-6 text-[#6fc7ba]" />
                ) : (
                  <Upload className="w-6 h-6 text-[#6fc7ba]" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
                {generating ? 'Generating with AI...' : 'Uploading image...'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Please wait a moment</p>
            </div>
            <Loader2 className="animate-spin h-5 w-5 text-[#6fc7ba]" />
          </div>
        </div>
      ) : (
        <label
          htmlFor="token-image"
          className="group relative flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#6fc7ba]/30 cursor-pointer transition-all duration-300"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6fc7ba]/0 via-[#6fc7ba]/10 to-[#4c63c4]/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="absolute -inset-0.5 bg-[#6fc7ba]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#6fc7ba]/10 group-hover:bg-[#6fc7ba]/20 flex items-center justify-center transition-colors border border-[#6fc7ba]/20">
              <Upload className="w-6 h-6 text-[#6fc7ba] group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="relative text-center">
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Click to upload image
            </span>
            <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-500 transition-colors">
              PNG, JPG, WEBP — auto-converted to WEBP
            </p>
          </div>
        </label>
      )}
    </div>
  );
}