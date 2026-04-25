'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getTokens, type Token, type PaginationInfo } from '../lib/services/api.service';
import { Clock, Hash, ArrowRight, ArrowLeft, Loader2, Search, Coins } from 'lucide-react';
import Guardian from '../lib/components/layout/Guardian';

export default function Page() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTokens = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTokens(page, 6);
      setTokens(response.tokens);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(1);
  }, []);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTokens(page);
    }
  };

  const truncateHash = (hash: string) => {
    if (!hash || hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const filteredTokens = useMemo(
    () =>
      searchQuery
        ? tokens.filter(
            (t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : tokens,
    [tokens, searchQuery]
  );

  return (
    <Guardian>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-linear-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6fc7ba]/10 blur-3xl"></div>
        <div className="relative mx-auto max-w-5xl px-4 py-16">
          {/* Header */}
          <div className="mb-8 space-y-3 text-center mt-14">
            <div className="inline-flex">
              <div className="flex items-center gap-2 rounded-full border border-[#6fc7ba]/30 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
                <img src="/initia.png" alt="Initia" className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide text-[#6fc7ba]">Initia Network</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Created</span>
              <span className="text-[#6fc7ba]"> Tokens</span>
            </h1>
            <p className="mt-2 text-base text-gray-400">All tokens deployed on Initia</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or symbol..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-[#6fc7ba]/20 blur-xl"></div>
                <Loader2 className="relative h-12 w-12 animate-spin text-[#6fc7ba]" />
              </div>
              <p className="mt-6 font-medium text-gray-400">Loading tokens...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <h3 className="mb-2 text-2xl font-bold text-white">
                {searchQuery ? 'No tokens found' : 'No tokens created yet'}
              </h3>
              <p className="mb-8 text-gray-400">
                {searchQuery ? 'Try a different search' : 'Be the first to deploy a token on Initia'}
              </p>
              {!searchQuery && (
                <Link
                  href="/create-coin"
                  className="group relative inline-flex items-center gap-3 rounded-full bg-[#6fc7ba] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-[#5db8a5]"
                >
                  <span className="drop-shadow-sm">Create your first token</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute -inset-0.5 rounded-full bg-[#6fc7ba] opacity-30 blur transition-opacity group-hover:opacity-60"></div>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTokens.map((token) => {
                const tokenAddress = token.contractAddress || token.txHash;
                return (
                <Link key={token.txHash} href={'/t/' + tokenAddress} className="group relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-[#6fc7ba]/10 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                  <div className="relative rounded-xl border border-white/10 bg-white/2 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#6fc7ba]/30 h-full flex flex-col">
                    {/* Top: Logo + Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center shrink-0 overflow-hidden border border-[#6fc7ba]/20">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-[#6fc7ba]">{token.symbol.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate transition-colors group-hover:text-[#6fc7ba]">
                          {token.name}
                        </h3>
                        <span className="inline-block rounded-full bg-[#6fc7ba]/20 px-2 py-0.5 text-xs font-semibold text-[#6fc7ba]">
                          {token.symbol}
                        </span>
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

                    {/* Bottom: Tx hash + arrow */}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                        <Hash className="w-3 h-3" />
                        {truncateHash(token.txHash)}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all group-hover:border-[#6fc7ba]/30 group-hover:bg-[#6fc7ba]/10 group-hover:text-[#6fc7ba]">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    </div>
                </Link>
              );
            })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-gray-500">
                  Page <span className="font-semibold text-white">{pagination.page}</span> of 
                  <span className="font-semibold text-white"> {pagination.totalPages}</span>
                  <span className="mx-2 text-gray-600">•</span>
                  <span className="font-semibold text-[#6fc7ba]">{pagination.total}</span> tokens
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-400">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                    className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Guardian>
  );
}