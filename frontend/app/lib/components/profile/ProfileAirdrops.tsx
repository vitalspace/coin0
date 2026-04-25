'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Gift, Clock, Users, Coins, XCircle } from 'lucide-react';
import type { Airdrop } from '../../services/api.service';

interface Props {
  userAirdrops: Airdrop[];
  airdropsLoading: boolean;
}

export default function ProfileAirdrops({ userAirdrops, airdropsLoading }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const timeUntil = (distributionTime: string) => {
    const diff = new Date(distributionTime).getTime() - now;
    if (diff <= 0) return 'Ready';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m`;
  };

  const isDistributionPassed = (distributionTime: string) => {
    return new Date(distributionTime).getTime() <= now;
  };

  return (
    <>
      {airdropsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-[#6fc7ba]" />
        </div>
      ) : userAirdrops.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center">
            <Gift className="w-8 h-8 text-[#6fc7ba]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Airdrops Yet</h3>
          <p className="text-gray-400 text-sm">You haven't created any airdrops.</p>
          <Link href="/create-coin" className="inline-block mt-4 px-6 py-2 bg-[#6fc7ba] text-black font-bold rounded-full text-sm hover:bg-[#5db8a5] transition-colors">
            Create a Token First
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userAirdrops.map((airdrop) => {
            const active = !isDistributionPassed(airdrop.distributionTime);
            return (
              <Link key={airdrop.poolAddress} href={`/airdrop/${airdrop.poolAddress}`} className="relative group">
                <div className="absolute -inset-0.5 bg-[#6fc7ba]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-5 rounded-xl bg-white/2 border border-white/10 backdrop-blur-sm hover:border-[#6fc7ba]/30 transition-all h-full flex flex-col">
                  {/* Top: Logo + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {airdrop.logo ? (
                        <img src={airdrop.logo} alt={airdrop.tokenSymbol} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#6fc7ba] font-bold text-lg">{airdrop.tokenSymbol?.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{airdrop.tokenName}</h3>
                      <span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">{airdrop.tokenSymbol}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {formatNumber(airdrop.totalAmount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {airdrop.maxUsers} max
                    </span>
                  </div>

                  {/* Bottom */}
                  <div className="mt-auto flex items-center justify-between">
                    {airdrop.isCancelled ? (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="w-3 h-3" />
                        Cancelled
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 text-xs ${active ? 'text-[#6fc7ba]' : 'text-green-400'}`}>
                        <Clock className="w-3 h-3" />
                        {timeUntil(airdrop.distributionTime)}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${airdrop.isCancelled ? 'bg-red-500/20 text-red-400' : active ? 'bg-[#6fc7ba]/20 text-[#6fc7ba]' : 'bg-green-500/20 text-green-400'}`}>
                      {airdrop.isCancelled ? 'Cancelled' : active ? 'Active' : 'Claim'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}