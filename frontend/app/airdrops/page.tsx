'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAirdrops, type Airdrop } from '../lib/services/api.service';
import { useWallet } from '../lib/services/wallet.service';
import {
	Loader2,
	Gift,
	Clock,
	Users,
	Coins,
	Zap,
	Archive,
	XCircle,
	ArrowLeft,
	ArrowRight,
	LayoutGrid,
	List
} from 'lucide-react';


type StatusFilter = 'all' | 'active' | 'past' | 'cancelled';
type ViewMode = 'grid' | 'list';

export default function AirdropsPage() {
	const router = useRouter();
	const { address: walletAddress, connected } = useWallet();

	const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalAirdrops, setTotalAirdrops] = useState(0);
	const [loading, setLoading] = useState(true);
	const [showMyAirdrops, setShowMyAirdrops] = useState(false);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		fetchAirdrops(1);
		const interval = setInterval(() => {
			setNow(Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		fetchAirdrops(1);
	}, [showMyAirdrops]);

	const fetchAirdrops = async (page = 1) => {
		setLoading(true);
		try {
			const creator = showMyAirdrops && walletAddress ? walletAddress : undefined;
			const response = await getAirdrops(page, 6, creator);
			setAirdrops(response.airdrops);
			setCurrentPage(response.pagination.page);
			setTotalPages(response.pagination.totalPages);
			setTotalAirdrops(response.pagination.total);
		} catch (err) {
			console.error('Failed to fetch airdrops:', err);
		} finally {
			setLoading(false);
		}
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			fetchAirdrops(page);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatNumber = (num: string | number) => {
		const n = typeof num === 'string' ? parseFloat(num) : num;
		return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	};

	const isDistributionPassed = (distributionTime: string) => {
		return new Date(distributionTime).getTime() <= now;
	};

	const timeUntil = (distributionTime: string) => {
		const diff = new Date(distributionTime).getTime() - now;
		if (diff <= 0) return 'Ready to claim';
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h`;
		const mins = Math.floor(diff / (1000 * 60));
		if (mins > 0) return `${mins}m`;
		const secs = Math.floor(diff / 1000);
		return `${secs}s`;
	};

	const truncateAddress = (addr: string, start = 4, end = 4) => {
		if (!addr) return '';
		return `${addr.slice(0, start)}...${addr.slice(-end)}`;
	};

	const filteredAirdrops = useMemo(() => {
		return airdrops.filter((a) => {
			if (statusFilter === 'cancelled') return !!a.isCancelled;
			if (a.isCancelled) return false;
			if (statusFilter === 'all') return true;
			const active = new Date(a.distributionTime).getTime() > now;
			return statusFilter === 'active' ? active : !active;
		});
	}, [airdrops, statusFilter, now]);

	return (
		<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
				<div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>

				<div className="relative max-w-4xl mx-auto px-4 pt-24 pb-8">
					{/* Header */}
					<div className="text-center mb-10 space-y-3">
						<div className="inline-flex">
							<div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
								<img src="/initia.png" alt="Initia" className="w-4 h-4" />
								<span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">Initia Network</span>
							</div>
						</div>
						<h1 className="text-3xl sm:text-4xl font-bold">
							<span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
								Token
							</span>
							<span className="text-[#6fc7ba]"> Airdrops</span>
						</h1>
						<p className="text-gray-400 text-base">Join active airdrops to earn free tokens</p>
					</div>

					{/* Filter Tabs + View Toggle */}
					<div className="flex items-center justify-between mb-4">
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setShowMyAirdrops(false)}
								className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
									!showMyAirdrops
										? 'bg-[#6fc7ba] text-black'
										: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
								}`}
							>
								All Airdrops
							</button>
							{connected && (
								<button
									onClick={() => setShowMyAirdrops(true)}
									className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
										showMyAirdrops
											? 'bg-[#6fc7ba] text-black'
											: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
									}`}
								>
									My Airdrops
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

					{/* Status Filter */}
					<div className="flex gap-2 mb-6">
						<button
							onClick={() => setStatusFilter('all')}
							className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								statusFilter === 'all'
									? 'bg-white/10 text-white border border-white/20'
									: 'text-gray-500 hover:text-gray-300'
							}`}
						>
							All
						</button>
						<button
							onClick={() => setStatusFilter('active')}
							className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
								statusFilter === 'active'
									? 'bg-[#6fc7ba]/20 text-[#6fc7ba] border border-[#6fc7ba]/30'
									: 'text-gray-500 hover:text-gray-300'
							}`}
						>
							<Zap className="w-3.5 h-3.5" />
							Active
						</button>
						<button
							onClick={() => setStatusFilter('past')}
							className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
								statusFilter === 'past'
									? 'bg-green-500/20 text-green-400 border border-green-500/30'
									: 'text-gray-500 hover:text-gray-300'
							}`}
						>
							<Archive className="w-3.5 h-3.5" />
							Past
						</button>
						<button
							onClick={() => setStatusFilter('cancelled')}
							className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
								statusFilter === 'cancelled'
									? 'bg-red-500/20 text-red-400 border border-red-500/30'
									: 'text-gray-500 hover:text-gray-300'
							}`}
						>
							<XCircle className="w-3.5 h-3.5" />
							Cancelled
						</button>
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-24">
							<Loader2 className="animate-spin h-12 w-12 text-[#6fc7ba]" />
						</div>
					) : filteredAirdrops.length === 0 ? (
						<div className="text-center py-16">
							<div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center">
								<Gift className="w-10 h-10 text-[#6fc7ba]" />
							</div>
							<h3 className="text-xl font-bold text-white mb-2">No Airdrops Found</h3>
							<p className="text-gray-400 mb-6">
								{statusFilter === 'active'
									? 'No active airdrops right now.'
									: statusFilter === 'past'
									? 'No past airdrops yet.'
									: statusFilter === 'cancelled'
									? 'No cancelled airdrops.'
									: showMyAirdrops
									? "You haven't created any airdrops yet."
									: 'No airdrops available.'}
							</p>
						</div>
					) : (
						<>
							<div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-2'}>
								{filteredAirdrops.map((airdrop) => {
									const isActive = !isDistributionPassed(airdrop.distributionTime);
									return (
										<a
											key={airdrop._id}
											href={`/airdrop/${airdrop.poolAddress}`}
											className="relative group block"
										>
											<div className="absolute -inset-0.5 bg-[#6fc7ba]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
											<div
												className={`relative p-5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-[#6fc7ba]/30 transition-all ${
													viewMode === 'list' ? 'flex items-center gap-4' : 'h-full flex flex-col'
												}`}
											>
												{/* Logo */}
												<div className={viewMode === 'list' ? '' : 'flex items-center gap-3 mb-3'}>
													<div className="w-12 h-12 rounded-full bg-[#6fc7ba]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
														{airdrop.logo ? (
															<img
																src={airdrop.logo}
																alt={airdrop.tokenSymbol}
																className="w-full h-full object-cover"
															/>
														) : (
															<span className="text-[#6fc7ba] font-bold text-lg">
																{airdrop.tokenSymbol?.slice(0, 2)}
															</span>
														)}
													</div>
												</div>

												<div className={viewMode === 'list' ? 'flex-1 min-w-0 flex items-center gap-6' : ''}>
													{viewMode === 'grid' && (
														<div className="flex-1 min-w-0 mb-3">
															<h3 className="text-white font-semibold truncate">{airdrop.tokenName}</h3>
															<span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">
																{airdrop.tokenSymbol}
															</span>
														</div>
													)}

													{viewMode === 'list' && (
														<div className="min-w-0">
															<h3 className="text-white font-semibold truncate">{airdrop.tokenName}</h3>
															<span className="px-2 py-0.5 rounded bg-[#6fc7ba]/20 text-[#6fc7ba] text-xs font-bold">
																{airdrop.tokenSymbol}
															</span>
														</div>
													)}

													{viewMode === 'grid' && airdrop.description && (
														<p className="text-xs text-gray-500 mb-3 line-clamp-2">{airdrop.description}</p>
													)}

													{/* Stats */}
													<div
														className={`flex items-center gap-4 ${
															viewMode === 'list' ? '' : 'mb-3'
														} text-xs text-gray-400`}
													>
														<span className="flex items-center gap-1">
															<Coins className="w-3 h-3" />
															{formatNumber(airdrop.totalAmount)}
														</span>
														<span className="flex items-center gap-1">
															<Users className="w-3 h-3" />
															{airdrop.maxUsers} max
														</span>
														<span
															className={`flex items-center gap-1 ${
																airdrop.isCancelled
																	? 'text-red-400'
																	: isActive
																	? 'text-[#6fc7ba]'
																	: 'text-green-400'
															}`}
														>
															{airdrop.isCancelled ? (
																<XCircle className="w-3 h-3" />
															) : (
																<Clock className="w-3 h-3" />
															)}
															{airdrop.isCancelled ? 'Cancelled' : timeUntil(airdrop.distributionTime)}
														</span>
													</div>

													{viewMode === 'grid' && (
														<div className="mt-auto flex items-center justify-end">
															{airdrop.isCancelled ? (
																<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
																	Cancelled
																</span>
															) : (
																<span
																	className={`px-2 py-0.5 rounded-full text-xs font-bold ${
																		isActive
																			? 'bg-[#6fc7ba]/20 text-[#6fc7ba]'
																			: 'bg-green-500/20 text-green-400'
																	}`}
																>
																	{isActive ? 'Active' : 'Claim'}
																</span>
															)}
														</div>
													)}

													{viewMode === 'list' && (
														<>
															{airdrop.isCancelled ? (
																<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 flex-shrink-0">
																	Cancelled
																</span>
															) : (
																<span
																	className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
																		isActive
																			? 'bg-[#6fc7ba]/20 text-[#6fc7ba]'
																			: 'bg-green-500/20 text-green-400'
																	}`}
																>
																	{isActive ? 'Active' : 'Claim'}
																</span>
															)}
														</>
													)}
												</div>
											</div>
										</a>
									);
								})}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-8 flex items-center justify-center gap-2">
									<button
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
										className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
									>
										<ArrowLeft className="h-4 w-4" />
										Prev
									</button>
									<span className="px-3 py-2 text-sm text-gray-400">
										{currentPage} / {totalPages}
									</span>
									<button
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage >= totalPages}
										className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-[#6fc7ba]/30 hover:bg-[#6fc7ba]/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
									>
										Next
										<ArrowRight className="h-4 w-4" />
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
	);
}