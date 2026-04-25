'use client';

import { create } from 'zustand';
import { getAddress } from 'viem';
import { publicClient } from './coin.factory.service';

export interface TokenBalance {
	amount: string;
	decimals: number;
	uiAmount: string;
}

export interface TokenInfo {
	symbol: string;
	name: string;
	decimals: number;
	totalSupply: string;
}

export interface TransferResult {
	success: boolean;
	hash?: string;
	error?: string;
}

interface WalletState {
	address: string | null;
	chainId: number | null;
	isConnected: boolean;
	setAddress: (address: string | null) => void;
	setChainId: (chainId: number | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
	address: null,
	chainId: null,
	isConnected: false,
	setAddress: (address) => set({ address, isConnected: !!address }),
	setChainId: (chainId) => set({ chainId })
}));

const ERC20_ABI = [
	{
		name: 'balanceOf',
		type: 'function',
		inputs: [{ name: 'owner', type: 'address' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'decimals',
		type: 'function',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }],
	},
	{
		name: 'symbol',
		type: 'function',
		inputs: [],
		outputs: [{ name: '', type: 'string' }],
	},
	{
		name: 'name',
		type: 'function',
		inputs: [],
		outputs: [{ name: '', type: 'string' }],
	},
	{
		name: 'totalSupply',
		type: 'function',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'transfer',
		type: 'function',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
	},
	{
		name: 'approve',
		type: 'function',
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
	},
] as const;

export { ERC20_ABI };

class EVMTokenService {
	async getBalance(tokenAddress: string, walletAddress: string): Promise<TokenBalance> {
		try {
			const [amount, decimals] = await Promise.all([
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'balanceOf',
					args: [getAddress(walletAddress)],
				}),
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'decimals',
					args: [],
				}) as Promise<number>,
			]);

			const amountStr = String(amount);
			const decimalsNum = decimals;

			console.log('[getBalance] raw wei:', amountStr, 'decimals:', decimalsNum);

			const amountBigInt = BigInt(amountStr);
			const divisor = BigInt(10 ** decimalsNum);
			const wholePart = amountBigInt / divisor;
			const remainder = amountBigInt % divisor;

			let uiAmount: string;
			if (remainder === 0n) {
				uiAmount = wholePart.toString();
			} else {
				const remainderStr = remainder.toString().padStart(decimalsNum, '0').replace(/0+$/, '');
				uiAmount = `${wholePart}.${remainderStr}`;
			}

			console.log('[getBalance] tokens (uiAmount):', uiAmount);
			return { amount: amountStr, decimals: decimalsNum, uiAmount };
		} catch (err) {
			console.error('[getBalance] error:', err);
			return { amount: '0', decimals: 18, uiAmount: '0' };
		}
	}

	async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
		try {
			const [symbol, name, decimals, totalSupply] = await Promise.all([
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'symbol',
					args: [],
				}).catch(() => 'UNKNOWN'),
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'name',
					args: [],
				}).catch(() => 'Unknown Token'),
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'decimals',
					args: [],
				}) as Promise<number>,
				publicClient.readContract({
					address: getAddress(tokenAddress),
					abi: ERC20_ABI,
					functionName: 'totalSupply',
					args: [],
				}).catch(() => 0n),
			]);

			return {
				symbol: String(symbol),
				name: String(name),
				decimals,
				totalSupply: String(totalSupply),
			};
		} catch {
			return { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18, totalSupply: '0' };
		}
	}

	async transfer(tokenAddress: string, toAddress: string, amount: number): Promise<TransferResult> {
		throw new Error('Use wagmi hooks for transactions');
	}

	async transferToken(tokenAddress: string, fromAddress: string, toAddress: string, amount: number): Promise<TransferResult> {
		throw new Error('Use wagmi hooks for transactions');
	}
}

export const evmTokenService = new EVMTokenService();