'use client';

import { useWallet } from '../../services/wallet.service';
import { toast } from '../../stores/toastStore';
import type { User } from '../../services/api.service';
import { Link, Check, Copy, Edit, Settings } from 'lucide-react';

interface Props {
  profileData: User | null;
  isEditing: boolean;
  onToggleEdit: () => void;
  showSettings?: boolean;
  onToggleSettings?: () => void;
  autoSignEnabled?: boolean;
  onAutoSignToggle?: () => void;
}

export default function ProfileHeader({ 
  profileData, 
  isEditing, 
  onToggleEdit,
  showSettings,
  onToggleSettings,
  autoSignEnabled,
  onAutoSignToggle
}: Props) {
  const { address } = useWallet();

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  return (
    <div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden mb-6">
      {/* Banner */}
      <div className="h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6fc7ba]/30 via-[#4c63c4]/30 to-[#6fc7ba]/30"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-8 left-8 w-40 h-40 bg-[#6fc7ba] rounded-full blur-3xl"></div>
          <div className="absolute bottom-8 right-8 w-48 h-48 bg-[#4c63c4] rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="px-6 md:px-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-20 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#6fc7ba] via-[#5bb9a8] to-[#4c63c4] p-1 shadow-2xl">
              <div className="w-full h-full rounded-xl bg-black/70 flex items-center justify-center text-5xl font-bold text-[#6fc7ba] backdrop-blur-sm">
                {profileData?.username?.[0]?.toUpperCase() ||
                  profileData?.address?.[0]?.toUpperCase() ||
                  '?'}
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-[#6fc7ba] flex items-center justify-center shadow-lg border-2 border-black">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6fc7ba] to-[#4c63c4] rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
          </div>

          {/* Name & Address */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {profileData?.username || 'Anonymous User'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-lg border border-white/10 backdrop-blur-sm">
                <Link className="w-4 h-4 text-[#6fc7ba]" />
                <span className="font-mono text-sm text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <button
                onClick={copyAddress}
                aria-label="Copy wallet address"
                className="p-2 bg-black/40 hover:bg-black/60 text-gray-400 hover:text-[#6fc7ba] rounded-lg transition-all border border-white/5"
              >
                <Copy className="w-4 h-4" />
              </button>
              {profileData?.createdAt && (
                <span className="text-sm text-gray-500">
                  Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Edit & Settings Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSettings}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleEdit}
              className="px-6 py-3 bg-[#6fc7ba]/10 border border-[#6fc7ba]/40 text-[#6fc7ba] font-semibold rounded-xl hover:bg-[#6fc7ba]/20 hover:border-[#6fc7ba]/60 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 md:px-8 pb-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Auto-Sign</h3>
                <p className="text-white/60 text-sm">Automatically sign transactions</p>
              </div>
              <button
                onClick={onAutoSignToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoSignEnabled ? 'bg-[#6fc7ba]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    autoSignEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}