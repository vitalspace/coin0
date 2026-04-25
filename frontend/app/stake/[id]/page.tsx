'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../lib/services/wallet.service';
import { toast } from '../../lib/stores/toastStore';
import { getStakingPoolByAddress, type StakingPool } from '../../lib/services/api.service';
import { stakingService, STAKING_ADDRESS, type PoolInfo, type StakeInfo } from '../../lib/services/staking.service';
import { toEvmAddress, publicClient } from '../../lib/services/coin.factory.service';
import { ArrowLeft, Lock, Zap, Loader2, ExternalLink, Check } from 'lucide-react';
import Guardian from '../../lib/components/layout/Guardian';

const EXPLORER_URL = 'https://explorer.coin0.xyz';

interface PoolInfoEx extends PoolInfo {
	totalStaked: string;
	totalRewards: string;
	rewardsClaimed: string;
}

export default function StakePage() {
 	const params = useParams();
 	const poolAddress = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
	const CHAIN_ID = 'coin0xyz';

	const { address: walletAddress, initiaAddress, connected, executeTx, openWallet } = useWallet();

	const [stakingPool, setStakingPool] = useState<StakingPool | null>(null);
	const [poolInfo, setPoolInfo] = useState<PoolInfoEx | null>(null);
	const [userStake, setUserStake] = useState<StakeInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [userStakeLoading, setUserStakeLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [initialUserLoadComplete, setInitialUserLoadComplete] = useState(false);
	const [now, setNow] = useState(Date.now());

	const isDataLoading = loading || (!!walletAddress && !!connected && !initialUserLoadComplete);

	const [stakeAmount, setStakeAmount] = useState('');
	const [isStaking, setIsStaking] = useState(false);
	const [isClaiming, setIsClaiming] = useState(false);
	const [stakeResult, setStakeResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);
	const [claimResult, setClaimResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);

	useEffect(() => {
		if (poolAddress) {
			fetchData();
			const interval = setInterval(() => {
				setNow(Date.now());
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [poolAddress]);

	const fetchData = async () => {
		if (!poolAddress) return;
		setLoading(true);
		setError(null);
		try {
			const response = await getStakingPoolByAddress(poolAddress);
			setStakingPool(response.pool);
			const info = await stakingService.getPoolInfoFromAddress(poolAddress);
			if (info) {
				setPoolInfo({
					...info,
					totalStaked: info.totalStaked,
					totalRewards: info.totalRewards,
					rewardsClaimed: info.rewardsClaimed
				});
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load staking pool';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	const fetchUserStake = async () => {
		if (!poolAddress || !walletAddress) {
			setInitialUserLoadComplete(true);
			return null;
		}
		setUserStakeLoading(true);
		try {
			console.log('[StakePage] fetchUserStake - poolAddress:', poolAddress);
			console.log('[StakePage] fetchUserStake - walletAddress:', walletAddress);
			const stake = await stakingService.getStakeInfo(poolAddress, walletAddress);
			setUserStake(stake);
			setInitialUserLoadComplete(true);
			console.log('[StakePage] User stake info:', stake);
			console.log('[StakePage] User already participating:', !!stake && !stake.claimed);
			return stake;
		} finally {
			setUserStakeLoading(false);
		}
	};

	useEffect(() => {
		if (poolAddress) {
			fetchData();
		}
	}, [poolAddress]);

	useEffect(() => {
		if (poolAddress && walletAddress) {
			fetchUserStake();
		}
	}, [poolAddress, walletAddress]);

	useEffect(() => {
		if (!connected && poolAddress && walletAddress) {
			setUserStake(null);
			setInitialUserLoadComplete(false);
		}
	}, [connected, poolAddress, walletAddress]);

	const formatNumber = (num: string | number) => {
		const n = typeof num === 'string' ? parseFloat(num) : num;
		return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	};

	const formatLockTime = (seconds: number) => {
		if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
		return `${Math.floor(seconds / 86400)} days`;
	};

	const formatStakeCountdown = () => {
		if (!userStake || userStake.claimed) return '';
		const diff = (userStake.endTime * 1000) - now;
		if (diff <= 0) return 'Ready to claim';
		const totalSecs = Math.floor(diff / 1000);
		const days = Math.floor(totalSecs / 86400);
		const hours = Math.floor((totalSecs % 86400) / 3600);
		const mins = Math.floor((totalSecs % 3600) / 60);
		const secs = totalSecs % 60;
		if (days > 0) return `${days}d ${hours}h ${mins}m`;
		if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
		if (mins > 0) return `${mins}m ${secs}s`;
		return `${secs}s`;
	};

	const isLockEnded = () => {
		if (!userStake) return false;
		const nowSec = Math.floor(Date.now() / 1000);
		return nowSec >= userStake.endTime;
	};

	const formatMultiplier = (bps: number) => {
		return (bps / 10000).toFixed(1) + 'x';
	};

	const estimateReward = () => {
		if (!poolInfo || !stakeAmount) return '0';
		const userAmount = parseFloat(stakeAmount);
		if (!userAmount) return '0';
		const userLamports = userAmount * 1e9;
		const totalStakedLamports = parseFloat(poolInfo.totalStaked);
		const totalRewards = parseFloat(poolInfo.totalRewards) / 1e6;
		const rewardsClaimed = parseFloat(poolInfo.rewardsClaimed) / 1e6;
		const multiplier = poolInfo.multiplier / 10000;

		const newTotalStaked = totalStakedLamports + userLamports;
		const userShare = userLamports / newTotalStaked;
		const calculatedReward = userShare * totalRewards * multiplier;

		const remainingRewards = totalRewards - rewardsClaimed;
		const reward = Math.min(calculatedReward, remainingRewards);

		return reward.toFixed(2);
	};

	const handleStake = async () => {
		if (!poolAddress || !stakingPool || !stakeAmount) return;
		const amount = parseFloat(stakeAmount);
		if (isNaN(amount) || amount <= 0) {
			toast.error('Invalid amount');
			return;
		}

		if (!walletAddress) {
			openWallet();
			return;
		}

		if (userStake && !userStake.claimed) {
			toast.error('You already have an active stake in this pool');
			return;
		}

		setIsStaking(true);
		setStakeResult(null);

		try {
			const amountWei = BigInt(Math.round(amount * 1e9));
			const stakeCalldata = await stakingService.getStakeCalldata(poolAddress, amount);
			const stakingEvmAddr = toEvmAddress(STAKING_ADDRESS);

			const txHash = await executeTx({
				chainId: CHAIN_ID,
				messages: [
					{
						typeUrl: "/minievm.evm.v1.MsgCall",
						value: {
							sender: initiaAddress,
							contractAddr: stakingEvmAddr,
							input: stakeCalldata as `0x${string}`,
							value: amountWei.toString(),
							accessList: [],
							authList: [],
						},
					},
				],
			});

			setStakeResult({ success: true, signature: txHash });
			toast.success('INIT staked!');
			await fetchUserStake();
			const info = await stakingService.getPoolInfoFromAddress(poolAddress);
			if (info) {
				setPoolInfo({
					...info,
					totalStaked: info.totalStaked,
					totalRewards: info.totalRewards,
					rewardsClaimed: info.rewardsClaimed
				});
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Stake failed';
			
			if (message.includes('Already staked')) {
				toast.error('You already have an active stake in this pool');
				setStakeResult({ success: false, error: 'Already staked' });
				await fetchUserStake();
			} else {
				setStakeResult({ success: false, error: message });
				toast.error(message);
			}
		} finally {
			setIsStaking(false);
		}
	};



	const handleClaim = async () => {
		if (!poolAddress || !stakingPool || !executeTx) return;
		setIsClaiming(true);
		setClaimResult(null);
		try {
			const calldata = await stakingService.getClaimCalldata(poolAddress);
			
			const txHash = await executeTx({
				chainId: CHAIN_ID,
				messages: [
					{
						typeUrl: "/minievm.evm.v1.MsgCall",
						value: {
							sender: initiaAddress,
							contractAddr: toEvmAddress(STAKING_ADDRESS),
							input: calldata as `0x${string}`,
							value: "0",
							accessList: [],
							authList: [],
						},
					},
				],
			});

			setClaimResult({ success: true, signature: txHash });
			toast.success('Rewards claimed!');
			await fetchUserStake();
			const info = await stakingService.getPoolInfoFromAddress(poolAddress);
			if (info) {
				setPoolInfo({
					...info,
					totalStaked: info.totalStaked,
					totalRewards: info.totalRewards,
					rewardsClaimed: info.rewardsClaimed
				});
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Claim failed';
			setClaimResult({ success: false, error: message });
			toast.error(message);
		} finally {
			setIsClaiming(false);
		}
	};

	if (!poolAddress) {
		return (
			<Guardian>
				<div className="min-h-screen bg-black flex items-center justify-center">
					<p className="text-gray-400">Invalid pool address</p>
				</div>
			</Guardian>
		);
	}

	return (
		<Guardian>
			<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
				<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

				<div className="relative max-w-4xl mx-auto px-4 pt-24 pb-8">
					<Link href="/stakes" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#6fc7ba] transition-colors mb-6">
						<ArrowLeft className="w-5 h-5" />
						<span>Back to Staking Pools</span>
					</Link>

					{isDataLoading ? (
						<div className="flex items-center justify-center py-24">
							<Loader2 className="animate-spin h-12 w-12 text-[#6fc7ba]" />
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-red-400 text-lg">{error}</p>
							<button onClick={fetchData} className="mt-4 px-6 py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-[#6fc7ba]">
								Try Again
							</button>
						</div>
					) : stakingPool && (
						<div>
							<div className="text-center mb-10 space-y-3">
								<div className="inline-flex">
									<div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
										<img src="/initia.png" alt="Initia" className="w-4 h-4" />
										<span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">Initia Network</span>
									</div>
								</div>
								{stakingPool.logo && (
									<div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6fc7ba]/30 shadow-lg shadow-[#6fc7ba]/10">
										<img src={stakingPool.logo} alt={stakingPool.tokenSymbol} className="w-full h-full object-cover" />
									</div>
								)}
								<h1 className="text-3xl sm:text-4xl font-bold">
									<span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
										{stakingPool.tokenName}
									</span>
									<span className="text-[#6fc7ba]"> Staking</span>
								</h1>
								<div className="flex items-center justify-center gap-2">
									<span className="px-3 py-1 rounded-full bg-[#6fc7ba]/20 text-[#6fc7ba] text-sm font-bold">
										{stakingPool.tokenSymbol}
									</span>
									<span className="px-3 py-1 rounded-full bg-orange-400/20 text-orange-400 text-sm font-bold flex items-center gap-1">
										<Zap className="w-3 h-3" />
										{formatMultiplier(stakingPool.multiplierBps)}
									</span>
								</div>
							</div>

							<div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6 mb-6">
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
									<div className="p-4 rounded-xl bg-[#6fc7ba]/5 border border-[#6fc7ba]/20">
										<p className="text-sm text-gray-400 mb-1">Reward Pool</p>
										<p className="text-xl font-bold text-white">{formatNumber(stakingPool.rewardAmount)}</p>
									</div>
									<div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
										<p className="text-sm text-gray-400 mb-1">Lock Period</p>
										<p className="text-xl font-bold text-white">{formatLockTime(stakingPool.lockSeconds)}</p>
									</div>
									<div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
										<p className="text-sm text-gray-400 mb-1">Multiplier</p>
										<p className="text-xl font-bold text-orange-400">{formatMultiplier(stakingPool.multiplierBps)}</p>
									</div>
									<div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
										<p className="text-sm text-gray-400 mb-1">Total Staked</p>
										<p className="text-xl font-bold text-white">
											{poolInfo ? formatNumber((parseFloat(poolInfo.totalStaked) / 1e9).toFixed(2)) : '0'} INIT
										</p>
									</div>
								</div>
							</div>

							{!walletAddress ? (
								<div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center">
									Connect your wallet to stake
								</div>
							) : walletAddress?.toLowerCase() === stakingPool?.creatorAddress?.toLowerCase() ? (
								<div className="p-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-center">
									<Lock className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
									<p className="text-yellow-400 font-bold text-lg">You created this staking pool</p>
									<p className="text-gray-400 text-sm mt-1">
										You cannot stake in your own staking pool.
									</p>
								</div>
							) : userStakeLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="animate-spin h-8 w-8 text-[#6fc7ba]" />
								</div>
							) : userStake && !userStake.claimed && isLockEnded() ? (
								<div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6">
									<h3 className="text-lg font-semibold text-white mb-4">Your Stake — Ready to Claim</h3>
									<div className="p-4 rounded-xl bg-[#6fc7ba]/5 border border-[#6fc7ba]/20 mb-4">
										<p className="text-sm text-gray-400">Staked Amount (INIT)</p>
										<p className="text-2xl font-bold text-white">
											{formatNumber((parseFloat(userStake.amount) / 1e9).toFixed(4))} INIT
										</p>
									</div>
									<p className="text-sm text-gray-400 mb-1">Lock ended:</p>
									<p className="text-[#6fc7ba] font-bold mb-3">
										{new Date(userStake.endTime * 1000).toLocaleString()}
									</p>
									<button
										onClick={handleClaim}
										disabled={isClaiming}
										className="w-full px-6 py-3 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
									>
										{isClaiming ? (
											<>
												<Loader2 className="animate-spin h-5 w-5" /> Claiming...
											</>
										) : (
											<>
												<Check className="w-5 h-5" /> Claim Rewards
											</>
										)}
									</button>
									{claimResult && (
										<div
											className={`mt-4 p-4 rounded-xl ${
												claimResult.success
													? 'bg-green-500/10 border border-green-500/30'
													: 'bg-red-500/10 border border-red-500/30'
											}`}
										>
											{claimResult.success ? (
												<>
													<p className="text-green-400 font-medium">Claimed!</p>
													{claimResult.signature && (
														<a
															href={`${EXPLORER_URL}/tx/${claimResult.signature}`}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline mt-2"
														>
															View <ExternalLink className="w-4 h-4" />
														</a>
													)}
												</>
											) : (
												<p className="text-red-400 font-medium">{claimResult.error}</p>
											)}
										</div>
									)}
								</div>
							) : userStake && !userStake.claimed ? (
								<div className="p-6 rounded-3xl bg-[#6fc7ba]/10 border border-[#6fc7ba]/30 text-center">
									<Lock className="w-12 h-12 mx-auto text-[#6fc7ba] mb-3" />
									<p className="text-[#6fc7ba] font-bold text-lg">Already Participating</p>
									<p className="text-gray-400 text-sm mt-1">
										You already have an active stake in this pool.
									</p>
									<p className="text-gray-400 text-sm">
										Staked {formatNumber((parseFloat(userStake.amount) / 1e9).toFixed(4))} INIT
									</p>
									<p className="text-gray-400 text-sm mt-3">
										Lock ends:
									</p>
									<p className="text-[#6fc7ba] font-bold">
										{new Date(userStake.endTime * 1000).toLocaleString()}
									</p>
									<p className="text-[#6fc7ba] font-bold text-2xl mt-2">
										{formatStakeCountdown()}
									</p>
								</div>
							) : (
								<div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6">
									<h3 className="text-lg font-semibold text-white mb-4">Stake INIT</h3>
									<div className="space-y-4">
										<div>
											<label htmlFor="stake-amount" className="block text-sm text-gray-400 mb-2">
												Amount (INIT)
											</label>
											<input
												type="number"
												id="stake-amount"
												value={stakeAmount}
												onChange={(e) => setStakeAmount(e.target.value)}
												placeholder="0.1"
												step="any"
												className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
											/>
											{stakeAmount && parseFloat(stakeAmount) > 0 && (
												<p className="text-xs text-gray-500 mt-1">
													Est. reward: ~0 {stakingPool.tokenSymbol}
												</p>
											)}
										</div>
										<button
											onClick={handleStake}
											disabled={isStaking || !stakeAmount}
											className="w-full px-6 py-3 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
										>
											{isStaking ? (
												<>
													<Loader2 className="animate-spin h-5 w-5" />
													Staking...
												</>
											) : (
												<>
													<Lock className="w-5 h-5" />
													Stake INIT
												</>
											)}
										</button>
										{stakeResult && (
											<div
												className={`mt-4 p-4 rounded-xl ${
													stakeResult.success
														? 'bg-green-500/10 border border-green-500/30'
														: 'bg-red-500/10 border border-red-500/30'
												}`}
											>
												{stakeResult.success ? (
													<>
														<p className="text-green-400 font-medium">Staked!</p>
														{stakeResult.signature && (
															<a
																href={`${EXPLORER_URL}/tx/${stakeResult.signature}`}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline mt-2"
															>
																View <ExternalLink className="w-4 h-4" />
															</a>
														)}
													</>
												) : (
													<p className="text-red-400 font-medium">{stakeResult.error}</p>
												)}
											</div>
										)}
									</div>
								</div>
							)}
							</div>
						)}
				</div>
			</div>
		</Guardian>
	);
}