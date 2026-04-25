'use client';

import { User as UserIcon, Coins, Gift, Lock } from 'lucide-react';

type Tab = 'profile' | 'tokens' | 'airdrops' | 'pools';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  tokenCount: number;
  airdropCount: number;
  poolCount: number;
}

export default function ProfileTabs({ activeTab, onTabChange, tokenCount, airdropCount, poolCount }: Props) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <button
        onClick={() => onTabChange('profile')}
        className={`cursor-pointer px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'profile'
            ? 'bg-[#6fc7ba] text-black'
            : 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10 backdrop-blur-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Profile
        </span>
      </button>
      <button
        onClick={() => onTabChange('tokens')}
        className={`cursor-pointer px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'tokens'
            ? 'bg-[#6fc7ba] text-black'
            : 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10 backdrop-blur-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          My Tokens
          {tokenCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-[#6fc7ba]/20 text-[#6fc7ba] rounded-full">
              {tokenCount}
            </span>
          )}
        </span>
      </button>
      <button
        onClick={() => onTabChange('airdrops')}
        className={`cursor-pointer px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'airdrops'
            ? 'bg-[#6fc7ba] text-black'
            : 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10 backdrop-blur-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          My Airdrops
          {airdropCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-orange-400/20 text-orange-400 rounded-full">
              {airdropCount}
            </span>
          )}
        </span>
      </button>
      <button
        onClick={() => onTabChange('pools')}
        className={`cursor-pointer px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'pools'
            ? 'bg-[#6fc7ba] text-black'
            : 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10 backdrop-blur-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          My Pools
          {poolCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-purple-400/20 text-purple-400 rounded-full">
              {poolCount}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}