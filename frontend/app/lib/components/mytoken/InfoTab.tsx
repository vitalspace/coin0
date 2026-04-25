'use client';

import type { TokenBalance, TokenInfo } from '../../services/evm.service';
import type { Token } from '../../services/api.service';
import { Coins, Send, Gift, Lock } from 'lucide-react';

const EVM_EXPLORER_URL = 'https://etherscan.io';

interface Props {
  token: Token | null;
  activeTab: 'info' | 'send' | 'airdrop' | 'stake';
  tokenBalance: TokenBalance | null;
  mintInfo: TokenInfo | null;
  address: string;
  fetchOnChainData: () => void;
}

export default function InfoTab({ token, tokenBalance }: Props) {
  const formatSupply = (supply: string | number) => {
    try {
      const supplyStr = String(supply);
      const n = parseFloat(supplyStr);
      if (isNaN(n) || n === 0) return '0';
      if (Math.abs(n) >= 1e15) {
        return n.toExponential(2);
      }
      return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } catch {
      return String(supply);
    }
  };

  const formatBalance = (uiAmount: string) => {
    const parsed = parseFloat(uiAmount);
    if (isNaN(parsed)) return uiAmount;

    // For very large numbers, use exponential notation
    if (parsed >= 1e12) {
      return parsed.toExponential(2);
    }

    // For large numbers, format with commas
    if (parsed >= 1e6) {
      return parsed.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
    }

    // For smaller numbers, show up to 6 decimals
    return parsed.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0
    });
  };

  const truncateAddress = (addr: string, start = 6, end = 4) => {
    if (!addr) return '';
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'Unknown') {
      if (token?._id && typeof token._id === 'string' && token._id.length === 24) {
        const timestamp = parseInt(token._id.substring(0, 8), 16) * 1000;
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
      return 'Recently created';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!token) return null;

  return (
    <div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6">
      {/* Balance */}
      {tokenBalance && (
        <div className="mb-6 p-4 rounded-xl bg-[#6fc7ba]/5 border border-[#6fc7ba]/20">
          <p className="text-sm text-gray-400">Your Balance</p>
          <p className="text-2xl font-bold text-white">
            {formatBalance(tokenBalance.uiAmount)} {token.symbol}
          </p>
        </div>
      )}

      {/* Token Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/2 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Total Supply</p>
          <p className="text-lg font-bold text-white">
            {formatSupply(token.supply)} {token.symbol}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/2 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Creator</p>
          <p className="text-lg font-bold text-white font-mono">
            {truncateAddress(token.owner)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/2 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Created</p>
          <p className="text-lg font-bold text-white">{formatDate(token.createdAt)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/2 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Chain</p>
          <p className="text-lg font-bold text-white">{token.chainName || 'EVM'}</p>
        </div>
      </div>

      {/* Mint Address */}
      {token.contractAddress && (
        <div className="mt-4 p-4 rounded-xl bg-white/2 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Mint Address</p>
          <div className="flex items-center gap-3">
            <p className="text-sm font-mono text-white break-all flex-1">{token.contractAddress}</p>
            <button
              onClick={() => copyToClipboard(token.contractAddress)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-xs"
            >
              Copy
            </button>
            <a
              href={`${EVM_EXPLORER_URL}/token/${token.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-[#6fc7ba] transition-all text-xs"
            >
              View
            </a>
          </div>
        </div>
      )}

      {/* Tx Hash */}
      <div className="mt-4 p-4 rounded-xl bg-white/2 border border-white/10">
        <p className="text-sm text-gray-400 mb-2">Creation Transaction</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-mono text-white break-all flex-1">{token.txHash}</p>
          <button
            onClick={() => copyToClipboard(token.txHash)}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-xs"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}