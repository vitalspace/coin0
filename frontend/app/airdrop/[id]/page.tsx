'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../lib/services/wallet.service';
import { toast } from '../../lib/stores/toastStore';
import { getAirdropByPoolAddress, cancelAirdropApi, getTokenByAddress, type Airdrop } from '../../lib/services/api.service';
import { evmAirdropService, type UserRegistrationInfo } from '../../lib/services/airdrop.service';
import Guardian from '../../lib/components/layout/Guardian';
import {
	ArrowLeft,
	Gift,
	Clock,
	Loader2,
	ExternalLink,
	Check,
	XCircle
} from 'lucide-react';

const EXPLORER_URL = 'https://explorer.coin0.xyz';
const CHAIN_ID = 'coin0xyz';
const AIRDROP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || '';

export default function AirdropPage() {
 	const params = useParams();
 	const poolAddress = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
	
	if (!poolAddress) {
		return (
			<Guardian>
				<div className="min-h-screen bg-black flex items-center justify-center">
					<p className="text-gray-400">Invalid airdrop address</p>
				</div>
			</Guardian>
		);
	}
	const { address: walletAddress, connected, executeTx, openWallet, initiaAddress } = useWallet();

	const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
	const [userRegistration, setUserRegistration] = useState<UserRegistrationInfo | null>(null);
	const [tokenLogo, setTokenLogo] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isRegistering, setIsRegistering] = useState(false);
	const [isClaiming, setIsClaiming] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	const [registerResult, setRegisterResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);
	const [claimResult, setClaimResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		if (poolAddress) {
			fetchData();
			const interval = setInterval(() => {
				setNow(Date.now());
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [poolAddress]);

	useEffect(() => {
		if (poolAddress && walletAddress) {
			fetchUserRegistration();
		}
	}, [poolAddress, walletAddress]);

	const fetchData = async () => {
		if (!poolAddress) return;
		setLoading(true);
		setError(null);
		try {
			const response = await getAirdropByPoolAddress(poolAddress);
			setAirdrop(response.airdrop);

			try {
				const tokenRes = await getTokenByAddress(response.airdrop.mintAddress);
				setTokenLogo(tokenRes.token?.logo || null);
			} catch {
				setTokenLogo(null);
			}
		} catch (err: any) {
			setError(err.message || 'Failed to load airdrop');
		} finally {
			setLoading(false);
		}
	};

	const fetchUserRegistration = async () => {
		if (!poolAddress || !walletAddress) return;
		try {
			const { publicClient } = await import('../../lib/services/coin.factory.service');
			const AIRDROP_ABI = [
				{
					name: 'userRegistrations',
					type: 'function',
					inputs: [
						{ name: 'poolAddress', type: 'address' },
						{ name: 'user', type: 'address' }
					],
					outputs: [
						{ name: 'userAddr', type: 'address' },
						{ name: 'airdropPool', type: 'address' },
						{ name: 'claimed', type: 'bool' }
					],
					stateMutability: 'view'
				}
			] as const;

			const result = await publicClient.readContract({
				address: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS! as `0x${string}`,
				abi: AIRDROP_ABI,
				functionName: 'userRegistrations',
				args: [poolAddress as `0x${string}`, walletAddress as `0x${string}`]
			});

			setUserRegistration({
				user: (result as unknown as [string, string, boolean])[0],
				airdropPool: (result as unknown as [string, string, boolean])[1],
				claimed: (result as unknown as [string, string, boolean])[2]
			});
		} catch (err) {
			console.error('Failed to fetch user registration:', err);
			setUserRegistration(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatNumber = (num: string | number) => {
		const n = typeof num === 'string' ? parseFloat(num) : num;
		return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	};

	const isDistributionPassed = () => {
		if (!airdrop) return false;
		return new Date(airdrop.distributionTime).getTime() <= now;
	};

	const timeUntil = () => {
		if (!airdrop) return '';
		const diff = new Date(airdrop.distributionTime).getTime() - now;
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

	const perUserAmount = () => {
		if (!airdrop || !airdrop.totalAmount || !airdrop.maxUsers) return '0';
		const decimals = 18;
		const total = parseFloat(airdrop.totalAmount) / Math.pow(10, decimals);
		const joined = airdrop.maxUsers;
		return (total / joined).toFixed(2);
	};

 	const handleRegister = async () => {
		if (!poolAddress || !initiaAddress) return;
		setIsRegistering(true);
		setRegisterResult(null);
		try {
			const calldata = await evmAirdropService.getRegisterCalldata(poolAddress);
			const result = await executeTx({
				chainId: CHAIN_ID,
				messages: [
					{
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contractAddr: AIRDROP_CONTRACT_ADDRESS,
              input: calldata as `0x${string}`,
              value: "0",
              accessList: [],
              authList: [],
            },
          },
        ],
      });
			if (result) {
				setRegisterResult({ success: true, signature: result });
				toast.success('Successfully registered for airdrop!');
				await fetchUserRegistration();
			} else {
				setRegisterResult({ success: false, error: 'Transaction rejected' });
			}
		} catch (err: any) {
			setRegisterResult({ success: false, error: err.message });
			toast.error(err.message || 'Registration failed');
		} finally {
			setIsRegistering(false);
		}
	};

  const handleCancel = async () => {
		if (!poolAddress || !airdrop || !initiaAddress) return;
		setIsCancelling(true);
		try {
			const calldata = await evmAirdropService.getCancelCalldata(poolAddress);
			const result = await executeTx({
				chainId: CHAIN_ID,
				messages: [
					{
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contractAddr: AIRDROP_CONTRACT_ADDRESS,
              input: calldata as `0x${string}`,
              value: "0",
              accessList: [],
              authList: [],
            },
          },
        ],
      });
			if (result) {
				console.log('On-chain cancel succeeded, updating backend...');
				try {
					await cancelAirdropApi(poolAddress);
				} catch (apiErr: any) {
					console.error('Failed to update cancel status in backend:', apiErr?.response?.data || apiErr.message);
					toast.error('On-chain cancel succeeded but backend update failed. The airdrop may need to be refreshed.');
				}
				toast.success('Airdrop cancelled. Tokens returned to your wallet.');
				await fetchData();
			}
		} catch (err: any) {
			toast.error(err.message || 'Cancel failed');
		} finally {
			setIsCancelling(false);
		}
	};

  const handleClaim = async () => {
		if (!poolAddress || !initiaAddress) return;
		setIsClaiming(true);
		setClaimResult(null);
		try {
			const calldata = await evmAirdropService.getClaimCalldata(poolAddress);
			const result = await executeTx({
				chainId: CHAIN_ID,
				messages: [
					{
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contractAddr: AIRDROP_CONTRACT_ADDRESS,
              input: calldata as `0x${string}`,
              value: "0",
              accessList: [],
              authList: [],
            },
          },
        ],
      });
			if (result) {
				setClaimResult({ success: true, signature: result });
				toast.success('Successfully claimed airdrop tokens!');
				await fetchUserRegistration();
			} else {
				setClaimResult({ success: false, error: 'Transaction rejected' });
			}
		} catch (err: any) {
			setClaimResult({ success: false, error: err.message });
			toast.error(err.message || 'Claim failed');
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<Guardian>
			<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
				<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

				<div className="relative max-w-4xl mx-auto px-4 pt-24">
					<Link href="/airdrops" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#6fc7ba] transition-colors mb-6">
						<ArrowLeft className="w-5 h-5" />
						<span>Back to Airdrops</span>
					</Link>

					{loading ? (
						<div className="flex items-center justify-center min-h-[70vh]">
							<Loader2 className="animate-spin h-12 w-12 text-[#6fc7ba]" />
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-red-400 text-lg">{error}</p>
							<button onClick={fetchData} className="mt-4 px-6 py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-[#6fc7ba]">
								Try Again
							</button>
						</div>
					) : airdrop ? (
						<>
							<div className="text-center mb-10 space-y-3">
								<div className="inline-flex">
									<div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
										<img src="/initia.png" alt="Initia" className="w-4 h-4" />
										<span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">Initia Network</span>
									</div>
								</div>
								{tokenLogo && (
									<div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6fc7ba]/30 shadow-lg shadow-[#6fc7ba]/10">
										<img src={tokenLogo} alt={airdrop.tokenSymbol} className="w-full h-full object-cover" />
									</div>
								)}
								<h1 className="text-3xl sm:text-4xl font-bold">
									<span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
										{airdrop.tokenName}
									</span>
									<span className="text-[#6fc7ba]"> Airdrop</span>
								</h1>
<div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#6fc7ba]/20 text-[#6fc7ba] text-sm font-bold">{airdrop.tokenSymbol}</span>
              {airdrop.isCancelled ? (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">Cancelled</span>
              ) : isDistributionPassed() ? (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">Ready to claim</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#6fc7ba]/20 text-[#6fc7ba] text-sm font-bold font-mono">{timeUntil()}</span>
              )}
            </div>
            {walletAddress?.toLowerCase() === airdrop.creatorAddress?.toLowerCase() && !airdrop.isCancelled && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-4 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold mx-auto"
              >
                {isCancelling ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="w-4 h-4" />}
                Cancel Airdrop & Reclaim Tokens
              </button>
            )}
							</div>

							{airdrop.description && (
								<div className="bg-white/[0.02] rounded-2xl border border-white/10 p-5 mb-6">
									<p className="text-sm text-gray-300 leading-relaxed">{airdrop.description}</p>
								</div>
							)}

							<div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6 mb-6">
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									<div className="p-4 rounded-xl bg-[#6fc7ba]/5 border border-[#6fc7ba]/20">
										<p className="text-sm text-gray-400 mb-1">Total Amount</p>
										<p className="text-xl font-bold text-white">{formatNumber(airdrop.totalAmount)}</p>
									</div>
									<div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
										<p className="text-sm text-gray-400 mb-1">Max Users</p>
										<p className="text-xl font-bold text-white">{airdrop.maxUsers}</p>
									</div>
									<div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
										<p className="text-sm text-gray-400 mb-1">Per User</p>
										<p className="text-xl font-bold text-[#6fc7ba]">~{perUserAmount()}</p>
									</div>
								</div>

								<div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-[#6fc7ba]" />
										<span className="text-sm text-gray-400">Distribution:</span>
										<span className="text-white font-medium">{formatDate(airdrop.distributionTime)}</span>
									</div>
									<div className="mt-2 flex items-center gap-2">
										{isDistributionPassed() ? (
											<span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">Ready to claim</span>
										) : (
											<span className="px-3 py-1 rounded-full bg-[#6fc7ba]/20 text-[#6fc7ba] text-sm font-bold font-mono">{timeUntil()}</span>
										)}
									</div>
								</div>

								<div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
									<p className="text-sm text-gray-400 mb-1">Pool Address</p>
									<div className="flex items-center gap-2">
										<p className="text-sm font-mono text-white break-all flex-1">{airdrop.poolAddress}</p>
										<div onClick={() => window.open(`${EXPLORER_URL}/account/${airdrop.poolAddress}`, '_blank')} className="px-3 py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-[#6fc7ba] transition-all cursor-pointer">
											<ExternalLink className="w-4 h-4" />
										</div>
									</div>
								</div>
							</div>

							{!connected ? (
								<div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center">
									Connect your wallet to participate
								</div>
							) : userRegistration?.claimed ? (
								<div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/30 text-center">
									<Check className="w-12 h-12 mx-auto text-green-400 mb-3" />
									<p className="text-green-400 font-bold text-lg">Already Claimed!</p>
									<p className="text-gray-400 text-sm mt-1">You have already claimed your tokens from this airdrop.</p>
								</div>
							) : userRegistration && airdrop.isCancelled ? (
								<div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center">
									<XCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
									<p className="text-red-400 font-bold text-lg">Airdrop Cancelled</p>
									<p className="text-gray-400 text-sm mt-1">You were registered, but this airdrop has been cancelled by the creator.</p>
								</div>
) : userRegistration && !isDistributionPassed() ? (
								walletAddress?.toLowerCase() === airdrop.creatorAddress?.toLowerCase() ? (
									<div className="p-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-center">
										<Check className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
										<p className="text-yellow-400 font-bold text-lg">You created this airdrop</p>
										<p className="text-gray-400 text-sm mt-1">
											You cannot participate in your own airdrop.
										</p>
									</div>
								) : (
									<div className="p-6 rounded-3xl bg-[#6fc7ba]/10 border border-[#6fc7ba]/30 text-center">
										<Check className="w-12 h-12 mx-auto text-[#6fc7ba] mb-3" />
										<p className="text-[#6fc7ba] font-bold text-lg">Registered!</p>
										<p className="text-gray-400 text-sm mt-1">
											You're in! Tokens will be distributed on {formatDate(airdrop.distributionTime)}.
										</p>
										<p className="text-gray-400 text-sm mt-1">
											Your share: ~{perUserAmount()} {airdrop.tokenSymbol}
										</p>
									</div>
								)
							) : userRegistration && isDistributionPassed() ? (
								walletAddress?.toLowerCase() === airdrop.creatorAddress?.toLowerCase() ? (
									<div className="p-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-center">
										<Check className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
										<p className="text-yellow-400 font-bold text-lg">You created this airdrop</p>
										<p className="text-gray-400 text-sm mt-1">
											You cannot participate in your own airdrop.
										</p>
									</div>
								) : (
									<>
										<button
											onClick={handleClaim}
											disabled={isClaiming}
											className="w-full px-6 py-4 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
										>
											{isClaiming ? (
												<><Loader2 className="animate-spin h-5 w-5" />Claiming...</>
											) : (
												<><Gift className="w-5 h-5" />Claim ~{perUserAmount()} {airdrop.tokenSymbol}</>
											)}
										</button>
										{claimResult && (
											<div className={`mt-4 p-4 rounded-xl ${claimResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
												{claimResult.success ? (
													<><p className="text-green-400 font-medium">Tokens claimed!</p>
													{claimResult.signature && (													<div onClick={() => window.open(`${EXPLORER_URL}/tx/${claimResult.signature}`, '_blank')} className="inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline mt-2 cursor-pointer">View Transaction <ExternalLink className="w-4 h-4" /></div>)}
													</>
												) : (
													<><p className="text-red-400 font-medium">Claim Failed</p><p className="text-sm text-gray-400 mt-1">{claimResult.error}</p></>
												)}
											</div>
										)}
									</>
								)
							) : airdrop.isCancelled ? (
								<div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center">
									<XCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
									<p className="text-red-400 font-bold text-lg">Airdrop Cancelled</p>
									<p className="text-gray-400 text-sm mt-1">This airdrop has been cancelled by the creator. Tokens have been returned.</p>
								</div>
							) : (
								<>
									<button
										onClick={handleRegister}
										disabled={isRegistering}
										className="w-full px-6 py-4 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
									>
										{isRegistering ? (
											<><Loader2 className="animate-spin h-5 w-5" />Registering...</>
										) : (
											<><Gift className="w-5 h-5" />Join Airdrop</>
										)}
									</button>
									{registerResult && (
										<div className={`mt-4 p-4 rounded-xl ${registerResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
											{registerResult.success ? (
												<><p className="text-green-400 font-medium">Registered successfully!</p>
												{registerResult.signature && (												<div onClick={() => window.open(`${EXPLORER_URL}/tx/${registerResult.signature}`, '_blank')} className="inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline mt-2 cursor-pointer">View Transaction <ExternalLink className="w-4 h-4" /></div>)}
												</>
											) : (
												<><p className="text-red-400 font-medium">Registration Failed</p><p className="text-sm text-gray-400 mt-1">{registerResult.error}</p></>
											)}
										</div>
									)}
								</>
)}
          </>
        ) : null}
				</div>
			</div>
		</Guardian>
	);
}
