'use client';

import  Link  from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Coins, Send, Gift, Lock, Loader2 } from 'lucide-react';
import { getTokenByAddress, type Token } from '../../lib/services/api.service';
import { evmTokenService, type TokenBalance, type TokenInfo, useWalletStore } from '../../lib/services/evm.service';
import { useWallet } from '../../lib/services/wallet.service';
import { toEvmAddress } from '../../lib/services/coin.factory.service';
import InfoTab from '../../lib/components/mytoken/InfoTab';
import SendTab from '../../lib/components/mytoken/SendTab';
import AirdropTab from '../../lib/components/mytoken/AirdropTab';
import StakeTab from '../../lib/components/mytoken/StakeTab';

type TabType = 'info' | 'send' | 'airdrop' | 'stake';

export default function TokenPage() {
 	const router = useRouter();
 	const params = useParams();
	const rawAddress = params?.id;
	const address = typeof rawAddress === 'string' ? rawAddress : Array.isArray(rawAddress) ? rawAddress[0] : undefined;

	const [token, setToken] = useState<Token | null>(null);
	const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabType>('info');

	const walletAddress = useWalletStore((state) => state.address);
	const { address: initiaAddress, connected, connect } = useWallet();
	const setWalletAddress = useWalletStore((state) => state.setAddress);

	useEffect(() => {
		if (connected && initiaAddress) {
			const evmAddr = toEvmAddress(initiaAddress);
			setWalletAddress(evmAddr);
		}
	}, [connected, initiaAddress, setWalletAddress]);

	useEffect(() => {
		if (!address) {
			setLoading(false);
			return;
		}
		
		let cancelled = false;
		
		async function fetchData() {
			if (!address) return;
			try {
				const response = await getTokenByAddress(address);
				if (!cancelled) {
					setToken(response.token);
				}
			} catch (err: any) {
				if (!cancelled) {
					setError(err.message || err.response?.data?.error || 'Failed to load token');
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}
		
		fetchData();
		
		return () => {
			cancelled = true;
		};
	}, [address]);

	useEffect(() => {
		if (address && walletAddress) {
			fetchOnChainData();
		}
	}, [address, walletAddress]);

	const retryFetch = () => {
		if (address) {
			setLoading(true);
			setError(null);
			getTokenByAddress(address)
				.then((response) => {
					setToken(response.token);
				})
				.catch((err: any) => {
					setError(err.message || err.response?.data?.error || 'Failed to load token');
				})
				.finally(() => {
					setLoading(false);
				});
		}
	};

	const fetchOnChainData = async () => {
		if (!address || !walletAddress) return;
		try {
			const [balance, info] = await Promise.all([
				evmTokenService.getBalance(address, walletAddress),
				evmTokenService.getTokenInfo(address)
			]);
			setTokenBalance(balance);
			setTokenInfo(info);
		} catch {
			setTokenBalance(null);
			setTokenInfo(null);
		}
	};

	const isOwner = token ? walletAddress === token.owner : false;

	if (loading) {
		return (
			<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />
				<div className="relative max-w-4xl mx-auto px-4 pt-24 min-h-[70vh] flex items-center justify-center">
					<Loader2 className="animate-spin h-12 w-12 text-[#6fc7ba]" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />
				<div className="relative max-w-4xl mx-auto px-4 pt-24 text-center">
					<p className="text-red-400 text-lg">{error}</p>
				<button
					onClick={retryFetch}
					className="mt-4 px-6 py-2 bg-[#6fc7ba]/20 hover:bg-[#6fc7ba]/30 border border-[#6fc7ba]/50 rounded-lg text-[#6fc7ba]"
				>
					Try Again
				</button>
				</div>
			</div>
		);
	}

	if (!token || !address) return null;

	return (
		<div className="min-h-screen bg-black relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />

			<div className="relative max-w-4xl mx-auto px-4 pt-24">
				<Link
					href="/profile"
					className="inline-flex items-center gap-2 text-gray-400 hover:text-[#6fc7ba] transition-colors mb-6"
				>
					<ArrowLeft className="w-5 h-5" />
					<span>Back to Profile</span>
				</Link>

				<div className="flex items-center gap-4 mb-8">
					<div className="w-20 h-20 rounded-2xl bg-[#6fc7ba]/10 flex items-center justify-center border-2 border-[#6fc7ba]/30 overflow-hidden">
						{token.logo ? (
							<img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
						) : (
							<span className="text-[#6fc7ba] font-bold text-2xl">
								{token.symbol?.slice(0, 2)}
							</span>
						)}
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-white">{token.name}</h1>
						<span className="px-2 py-0.5 rounded-full bg-[#6fc7ba]/20 text-[#6fc7ba] text-sm font-bold">
							{token.symbol}
						</span>
					</div>
				</div>

				{!connected && (
					<div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-center">
						<button onClick={connect} className="underline hover:text-yellow-300">
							Connect wallet to see balance
						</button>
					</div>
				)}

				<div className="flex gap-2 mb-6 flex-wrap">
					<button
						onClick={() => setActiveTab('info')}
						className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
							activeTab === 'info'
								? 'bg-[#6fc7ba] text-black'
								: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
						}`}
					>
						<span className="flex items-center gap-2">
							<Coins className="w-5 h-5" />Info
						</span>
					</button>
					<button
						onClick={() => setActiveTab('send')}
						className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
							activeTab === 'send'
								? 'bg-[#6fc7ba] text-black'
								: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
						}`}
					>
						<span className="flex items-center gap-2">
							<Send className="w-5 h-5" />Send
						</span>
					</button>
					<button
						onClick={() => setActiveTab('airdrop')}
						className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
							activeTab === 'airdrop'
								? 'bg-[#6fc7ba] text-black'
								: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
						}`}
					>
						<span className="flex items-center gap-2">
							<Gift className="w-5 h-5" />Airdrop
						</span>
					</button>
					<button
						onClick={() => setActiveTab('stake')}
						className={`cursor-pointer px-5 py-3 rounded-xl font-medium transition-all ${
							activeTab === 'stake'
								? 'bg-[#6fc7ba] text-black'
								: 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/10'
						}`}
					>
						<span className="flex items-center gap-2">
							<Lock className="w-5 h-5" />Stake
						</span>
					</button>
				</div>

				{activeTab === 'info' && (
					<InfoTab
						token={token}
						activeTab={activeTab}
						tokenBalance={tokenBalance}
						mintInfo={tokenInfo}
						address={address!}
						fetchOnChainData={fetchOnChainData}
					/>
				)}
				{activeTab === 'send' && (
					<SendTab
						tokenBalance={tokenBalance}
						address={address!}
						symbol={token.symbol}
						fetchOnChainData={fetchOnChainData}
					/>
				)}
				{activeTab === 'airdrop' && (
					<AirdropTab
						token={token}
						tokenBalance={tokenBalance}
						address={address!}
						fetchOnChainData={fetchOnChainData}
					/>
				)}
				{activeTab === 'stake' && (
					<StakeTab token={token} tokenBalance={tokenBalance} address={address!} isOwner={isOwner} />
				)}
			</div>
		</div>
	);
}