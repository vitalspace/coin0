'use client';

import Link from 'next/link';
import { Loader2, Lock, Clock, Coins, ExternalLink } from 'lucide-react';
import type { StakingPool } from '../../services/api.service';

interface Props {
  userPools: StakingPool[];
  poolsLoading: boolean;
}

export default function ProfileStakingPools({ userPools, poolsLoading }: Props) {
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const formatLockDays = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days}d`;
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  };

  const formatMultiplier = (bps: number) => {
    return (bps / 10000).toFixed(1) + 'x';
  };

  return (
    <>
      {poolsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-[#6fc7ba]" />
        </div>
      ) : userPools.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#6fc7ba]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Staking Pools Yet</h3>
          <p className="text-gray-400 text-sm">You haven't created any staking pools.</p>
          <Link href="/create-coin" className="inline-block mt-4 px-6 py-2 bg-[#6fc7ba] text-black font-bold rounded-full text-sm hover:bg-[#5db8a5] transition-colors">
            Create a Token First
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userPools.map((pool) => (
            <Link key={pool.poolAddress} href={`/stake/${pool.poolAddress}`} className="relative group">
              <div className="absolute -inset-0.5 bg-[#6fc7ba]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-[#6fc7ba]/30 transition-all h-full flex flex-col">
                {/* Top: Logo + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {pool.logo ? (
                      <img src={pool.logo} alt={pool.tokenSymbol} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#6fc7ba] font-bold text-lg">{pool.tokenSymbol?.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{pool.tokenName}</h3>
                    <span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">{pool.tokenSymbol}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {formatNumber(pool.rewardAmount)} rewards
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLockDays(pool.lockSeconds)} lock
                  </span>
                  <span>{formatMultiplier(pool.multiplierBps)}</span>
                </div>

                {/* Pool Address */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono truncate max-w-[160px]">
                    {pool.poolAddress}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}