'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStakingPools, type StakingPool } from '../lib/services/api.service';
import { useWallet } from '../lib/services/wallet.service';
import { Loader2, Lock, Coins, Clock, ArrowLeft, ArrowRight, Zap, LayoutGrid, List } from 'lucide-react';
import Guardian from '../lib/components/layout/Guardian';

export default function StakingPoolsPage() {
 	const { connected } = useWallet();
	const [pools, setPools] = useState<StakingPool[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [showMyPools, setShowMyPools] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	const fetchPools = async (page = 1) => {
		setLoading(true);
		try {
			const response = await getStakingPools(page, 6);
			setPools(response.pools);
			setCurrentPage(response.pagination.page);
			setTotalPages(response.pagination.totalPages);
		} catch (err) {
			console.error('Failed to fetch staking pools:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPools(1);
	}, [showMyPools]);

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			fetchPools(page);
		}
	};

	const formatLockTime = (seconds: number) => {
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
		return `${Math.floor(seconds / 86400)}d`;
	};

	const formatMultiplier = (bps: number) => {
		return (bps / 10000).toFixed(1) + 'x';
	};

	const formatNumber = (num: string | number) => {
		const n = typeof num === 'string' ? parseFloat(num) : num;
		return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	};

	return (
		<Guardian>
			<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
				<div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>

				<div className="relative max-w-4xl mx-auto px-4 pt-24 pb-8">
					<div className="text-center mb-10 space-y-3">
						<div className="inline-flex">
							<div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
								<img src="/initia.png" alt="Initia" className="w-4 h-4" />
								<span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">Initia Network</span>
							</div>
						</div>
						<h1 className="text-3xl sm:text-4xl font-bold">
							<span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Staking</span>
							<span className="text-[#6fc7ba]"> Pools</span>
						</h1>
						<p className="text-gray-400 text-base">Lock tokens to earn rewards</p>
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-24">
							<Loader2 className="animate-spin h-12 w-12 text-[#6fc7ba]" />
						</div>
					) : pools.length === 0 ? (
						<div className="text-center py-16">
							<div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center">
								<Lock className="w-10 h-10 text-[#6fc7ba]" />
							</div>
							<h3 className="text-xl font-bold text-white mb-2">No Staking Pools Yet</h3>
							<p className="text-gray-400">Be the first to create a staking pool.</p>
						</div>
					) : (
						<>
							<div className="flex items-center justify-between mb-4">
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => setShowMyPools(false)}
										className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
											!showMyPools
												? 'bg-[#6fc7ba] text-black'
												: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
										}`}
									>
										All Stakes
									</button>
									{connected && (
										<button
											onClick={() => setShowMyPools(true)}
											className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
												showMyPools
													? 'bg-[#6fc7ba] text-black'
													: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
											}`}
										>
											My Stakes
										</button>
									)}
								</div>
								<div className="flex items-center gap-1">
									<button
										onClick={() => setViewMode('grid')}
										className={`p-2 rounded-lg transition-all ${
											viewMode === 'grid' ? 'bg-[#6fc7ba]/20 text-[#6fc7ba]' : 'text-gray-500 hover:text-white'
										}`}
										aria-label="Grid view"
									>
										<LayoutGrid className="w-4 h-4" />
									</button>
									<button
										onClick={() => setViewMode('list')}
										className={`p-2 rounded-lg transition-all ${
											viewMode === 'list' ? 'bg-[#6fc7ba]/20 text-[#6fc7ba]' : 'text-gray-500 hover:text-white'
										}`}
										aria-label="List view"
									>
										<List className="w-4 h-4" />
									</button>
								</div>
							</div>

							<div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-2'}>
								{pools.map((pool) => (
									<Link key={pool.poolAddress} href={`/stake/${pool.poolAddress}`} className="relative group">
										<div className="absolute -inset-0.5 bg-[#6fc7ba]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
										<div
											className={`relative p-5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-[#6fc7ba]/30 transition-all ${
												viewMode === 'list' ? 'flex items-center gap-4' : 'h-full flex flex-col'
											}`}
										>
											<div className={viewMode === 'list' ? '' : 'flex items-center gap-3 mb-3'}>
												<div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
													{pool.logo ? (
														<img src={pool.logo} alt={pool.tokenSymbol} className="w-full h-full object-cover" />
													) : (
														<span className="text-[#6fc7ba] font-bold text-lg">{pool.tokenSymbol?.slice(0, 2)}</span>
													)}
												</div>
											</div>

											<div className={viewMode === 'list' ? 'flex-1 min-w-0 flex items-center gap-6' : ''}>
												{viewMode === 'list' ? (
													<div className="min-w-0">
														<h3 className="text-white font-semibold truncate">{pool.tokenName} Staking</h3>
														<span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">
															{pool.tokenSymbol}
														</span>
													</div>
												) : (
													<div className="flex-1 min-w-0 mb-3">
														<h3 className="text-white font-semibold truncate">{pool.tokenName} Staking</h3>
														<span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">
															{pool.tokenSymbol}
														</span>
													</div>
												)}

												{viewMode === 'grid' && pool.description && (
													<p className="text-xs text-gray-500 mb-3 line-clamp-2">{pool.description}</p>
												)}

												<div className={`flex items-center gap-4 ${viewMode === 'list' ? '' : 'mb-3'} text-xs text-gray-400`}>
													<span className="flex items-center gap-1">
														<Coins className="w-3 h-3" />
														{formatNumber(pool.rewardAmount)} rewards
													</span>
													<span className="flex items-center gap-1">
														<Clock className="w-3 h-3" />
														{formatLockTime(pool.lockSeconds)} lock
													</span>
													<span className="flex items-center gap-1 text-[#6fc7ba]">
														<Zap className="w-3 h-3" />
														{formatMultiplier(pool.multiplierBps)} multiplier
													</span>
												</div>

												{viewMode === 'grid' ? (
													<div className="mt-auto flex items-center justify-end">
														<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#6fc7ba]/20 text-[#6fc7ba]">Stake</span>
													</div>
												) : (
													<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#6fc7ba]/20 text-[#6fc7ba] flex-shrink-0">
														Stake
													</span>
												)}
											</div>
										</div>
									</Link>
								))}
							</div>

							{totalPages > 1 && (
								<div className="mt-8 flex items-center justify-center gap-2">
									<button
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
										className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
									>
										<ArrowLeft className="h-4 w-4" /> Prev
									</button>
									<span className="px-3 py-2 text-sm text-gray-400">
										{currentPage} / {totalPages}
									</span>
									<button
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage >= totalPages}
										className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
									>
										Next <ArrowRight className="h-4 w-4" />
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</Guardian>
	);
}