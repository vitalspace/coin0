'use client';

import  Link  from 'next/link';
import { useRouter } from 'next/navigation';
import type { Token } from '../../services/api.service';
import { Loader2, Plus, Coins, Clock, Hash } from 'lucide-react';

interface Props {
  userTokens: Token[];
  tokensLoading: boolean;
}

export default function ProfileTokens({ userTokens, tokensLoading }: Props) {
  const router = useRouter();

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return typeof num === 'string' ? num : num.toString();

    // For very large numbers, use exponential notation
    if (n >= 1e12) {
      return n.toExponential(2);
    }

    // Format with commas, no decimals for supply
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const truncateAddress = (addr: string, start = 4, end = 4) => {
    if (!addr) return '';
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  return (
    <>
      {tokensLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-[#6fc7ba]" />
        </div>
      ) : userTokens.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center">
            <Coins className="w-8 h-8 text-[#6fc7ba]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Tokens Yet</h3>
          <p className="text-gray-400 text-sm mb-4">You haven't created any tokens yet.</p>
          <button
            onClick={() => router.push('/create-coin')}
            className="cursor-pointer inline-flex items-center gap-2 px-6 py-2 bg-[#6fc7ba] text-black font-bold rounded-full text-sm hover:bg-[#5db8a5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Token
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userTokens.map((token, index) => {
            const tokenAddress = token.contractAddress || token._id;
            return (
                          <Link
              href={`/mytoken/${tokenAddress}`}
              key={token._id || token.contractAddress || 'token-' + index}
              className="relative group block"
            >
              <div className="absolute -inset-0.5 bg-[#6fc7ba]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-[#6fc7ba]/30 transition-all h-full flex flex-col">
                {/* Top: Logo + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#6fc7ba]/20">
                    {token.logo ? (
                      <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-[#6fc7ba]">{token.symbol.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{token.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">{token.symbol}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {formatNumber(token.supply)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {/* Bottom */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <Hash className="w-3 h-3" />
                    {truncateAddress(token.contractAddress)}
                  </span>
                   <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#6fc7ba]/20 text-[#6fc7ba]">Token</span>
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