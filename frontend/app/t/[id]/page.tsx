'use client';

import { useState, useEffect } from 'react';
import  Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getTokenByTxHash, getTokenByAddress, type Token } from '../../lib/services/api.service';
import { ArrowLeft, Loader2, Database, Hash, RefreshCw, CheckCircle, AlertCircle, Clock, User, Copy, ExternalLink } from 'lucide-react';

const EXPLORER_URL = 'https://explorer.Initia.com';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchTokenDetails();
  }, [id]);

  const fetchTokenDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      let response;
      if (id.startsWith('0x')) {
        response = await getTokenByAddress(id);
      } else {
        response = await getTokenByTxHash(id);
      }
      setToken(response.token);
    } catch (err: any) {
      // Don't show toast for 404 errors
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load token details');
      } else {
        setError('Token not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'Unknown') {
      // If no createdAt, try to extract date from MongoDB _id
      if (token?._id && typeof token._id === 'string' && token._id.length === 24) {
        // MongoDB ObjectId contains timestamp in first 8 hex chars
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

  const formatNumber = (num: string) => {
    return Number(num).toLocaleString();
  };

  const truncateAddress = (addr: string, start = 6, end = 4) => {
    if (!addr) return '';
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6fc7ba]/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#6fc7ba]/5 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6fc7ba]/5 blur-3xl"></div>

      <div className="relative mx-auto max-w-4xl px-4 py-16 mt-10">
        {/* Back Button */}
        <Link
          href="/tokens"
          className="group mb-12 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#6fc7ba]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Tokens</span>
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-[#6fc7ba]/20 blur-xl"></div>
              <Loader2 className="relative h-16 w-16 animate-spin text-[#6fc7ba]" />
            </div>
            <p className="mt-8 text-lg font-medium text-gray-400">Loading token details...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg py-24 text-center">
            <div className="relative mb-8 inline-block">
              <div className="absolute -inset-2 rounded-full bg-red-500/20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Failed to load token</h3>
            <p className="mb-8 text-lg text-gray-400">{error}</p>
            <button
              onClick={fetchTokenDetails}
              className="group relative inline-flex items-center gap-3 rounded-full bg-[#6fc7ba] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-[#5db8a5]"
            >
              <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" />
              <span className="drop-shadow-sm">Try Again</span>
              <div className="absolute -inset-0.5 rounded-full bg-[#6fc7ba] opacity-30 blur transition-opacity group-hover:opacity-60"></div>
            </button>
          </div>
        ) : token ? (
          <>
            {/* Token Header */}
            <div className="mb-16 text-center">
              {/* Token Logo with glow effect */}
              <div className="relative mb-8 inline-block">
                <div className="absolute -inset-2 rounded-full bg-[#6fc7ba]/20 blur-xl"></div>
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#6fc7ba]/40 bg-gradient-to-br from-[#6fc7ba]/20 to-[#6fc7ba]/5 shadow-[0_0_50px_rgba(111,199,186,0.3)]">
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="h-28 w-28 rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-[#6fc7ba]">{token.symbol?.slice(0, 2)}</span>
                  )}
                </div>
              </div>

              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">{token.name}</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="rounded-full border border-[#6fc7ba]/30 bg-[#6fc7ba]/20 px-4 py-2 text-sm font-bold text-[#6fc7ba]">{token.symbol}</span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Database className="h-4 w-4" />
                  on {token.chainName || 'Initia'}
                </span>
              </div>
            </div>

            {/* Token Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Supply Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6fc7ba] opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
                <div className="relative flex min-h-[180px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#6fc7ba]/40 hover:bg-white/[0.04]">
                  <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6fc7ba]/20">
                      <Database className="h-5 w-5 text-[#6fc7ba]" />
                    </div>
                    <span className="font-medium">Total Supply</span>
                  </div>
                  <div className="mt-auto">
                    <p className="mb-1 text-3xl font-bold text-white">{formatNumber(token.supply)}</p>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                  </div>
                </div>
              </div>

              {/* Owner Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6fc7ba] opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
                <div className="relative flex min-h-[180px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#6fc7ba]/40 hover:bg-white/[0.04]">
                  <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6fc7ba]/20">
                      <User className="h-5 w-5 text-[#6fc7ba]" />
                    </div>
                    <span className="font-medium">Owner</span>
                  </div>
                  <div className="mt-auto flex items-center gap-3">
                    <p className="font-mono text-xl font-bold text-white">{truncateAddress(token.owner)}</p>
                    <button
                      onClick={() => copyToClipboard(token.owner)}
                      className="rounded-lg bg-white/5 p-2 text-gray-400 transition-all hover:bg-[#6fc7ba]/20 hover:text-[#6fc7ba]"
                      aria-label="Copy owner address"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Created At Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6fc7ba] opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
                <div className="relative flex min-h-[180px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#6fc7ba]/40 hover:bg-white/[0.04]">
                  <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6fc7ba]/20">
                      <Clock className="h-5 w-5 text-[#6fc7ba]" />
                    </div>
                    <span className="font-medium">Created</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-bold text-white">{formatDate(token.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Hash Section */}
            {token.txHash && (
              <div className="group relative mb-6">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6fc7ba] opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6fc7ba]/20">
                          <Hash className="h-5 w-5 text-[#6fc7ba]" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-400">Transaction Hash</h3>
                      </div>
                      <p className="font-mono text-lg leading-relaxed break-all text-white">{token.txHash}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => copyToClipboard(token.txHash)}
                        className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-gray-300 transition-all hover:scale-105 hover:bg-white/10 hover:text-white"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5" />
                            <span className="font-medium">Copy</span>
                          </>
                        )}
                      </button>
                      <div
                        onClick={() => window.open(`${EXPLORER_URL}/tx/${token.txHash}?cluster=devnet`, '_blank')}
                        className="group/link relative flex items-center gap-2 rounded-xl border border-[#6fc7ba]/50 bg-[#6fc7ba]/20 px-6 py-3 text-[#6fc7ba] transition-all hover:scale-105 hover:bg-[#6fc7ba]/30 cursor-pointer"
                      >
                        <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span className="font-medium">View Transaction</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mint Address Section */}
            {token.contractAddress && (
              <div className="group relative mb-6">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6fc7ba] opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6fc7ba]/20">
                          <Database className="h-5 w-5 text-[#6fc7ba]" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-400">Mint Address</h3>
                      </div>
                      <p className="font-mono text-lg leading-relaxed break-all text-white">{token.contractAddress}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => copyToClipboard(token.contractAddress)}
                        className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-gray-300 transition-all hover:scale-105 hover:bg-white/10 hover:text-white"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5" />
                            <span className="font-medium">Copy</span>
                          </>
                        )}
                      </button>
                      <div
                        onClick={() => window.open(`${EXPLORER_URL}/token/${token.contractAddress}?cluster=devnet`, '_blank')}
                        className="group/link relative flex items-center gap-2 rounded-xl border border-[#6fc7ba]/50 bg-[#6fc7ba]/20 px-6 py-3 text-[#6fc7ba] transition-all hover:scale-105 hover:bg-[#6fc7ba]/30 cursor-pointer"
                      >
                        <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span className="font-medium">View on Initia Scan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-6 sm:flex-row">
              {token.contractAddress ? (
                <Link
                  href={`/t/${token.contractAddress}`}
                  className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-5 text-center font-bold transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-[#6fc7ba] transition-all duration-500 group-hover:bg-[#5db8a5]"></div>
                  <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-[#6fc7ba] opacity-60 blur transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                  <div className="absolute top-0 right-0 left-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/30 to-transparent"></div>
                  <span className="relative flex items-center gap-3 text-lg text-black">
                    <Database className="h-6 w-6 transition-transform group-hover:rotate-12" />
                    <span className="font-extrabold tracking-wide drop-shadow-sm">Manage Token</span>
                  </span>
                </Link>
              ) : (
                <Link
                  href="/create-coin"
                  className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-5 text-center font-bold transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-[#6fc7ba] transition-all duration-500 group-hover:bg-[#5db8a5]"></div>
                  <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-[#6fc7ba] opacity-60 blur transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                  <div className="absolute top-0 right-0 left-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/30 to-transparent"></div>
                  <span className="relative flex items-center gap-3 text-lg text-black">
                    <Database className="h-6 w-6 transition-transform group-hover:rotate-12" />
                    <span className="font-extrabold tracking-wide drop-shadow-sm">Create Your Token</span>
                  </span>
                </Link>
              )}
              <Link
                href="/t"
                className="group flex flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-center font-bold text-white transition-all hover:scale-105 hover:bg-white/10"
              >
                <Database className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="font-extrabold tracking-wide">View All Tokens</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-lg py-24 text-center">
            <div className="relative mb-8 inline-block">
              <div className="absolute -inset-2 rounded-full bg-[#6fc7ba]/20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#6fc7ba]/20 bg-[#6fc7ba]/10">
                <Hash className="h-12 w-12 text-[#6fc7ba]" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Token not found</h3>
            <p className="mb-8 text-lg text-gray-400">
              The token you're looking for doesn't exist or hasn't been created yet.
            </p>
            <Link
              href="/create-coin"
              className="group relative inline-flex items-center gap-3 rounded-full bg-[#6fc7ba] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-[#5db8a5]"
            >
              <Database className="h-5 w-5" />
              <span className="drop-shadow-sm">Create a Token</span>
              <div className="absolute -inset-0.5 rounded-full bg-[#6fc7ba] opacity-30 blur transition-opacity group-hover:opacity-60"></div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}