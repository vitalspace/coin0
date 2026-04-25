'use client';

import { useWalletStore, ERC20_ABI } from './evm.service';
import { encodeFunctionData, decodeEventLog } from 'viem';
import { publicClient } from './coin.factory.service';

export interface AirdropPoolInfo {
	creator: string;
	mint: string;
	vault: string;
	totalAmount: string;
	maxUsers: string;
	distributionTime: string;
	joinedCount: string;
	isCancelled: boolean;
	counter: number;
}

export interface UserRegistrationInfo {
	user: string;
	airdropPool: string;
	claimed: boolean;
}

export interface AirdropResult {
	success: boolean;
	hash?: string;
	poolAddress?: string;
	error?: string;
}

// ABI completo para todas las operaciones
const AIRDROP_ABI = [
	{
		name: 'airdropPools',
		type: 'function',
		inputs: [{ name: 'index', type: 'uint256' }],
		outputs: [
			{ name: 'creator', type: 'address' },
			{ name: 'mint', type: 'address' },
			{ name: 'vault', type: 'address' },
			{ name: 'totalAmount', type: 'uint256' },
			{ name: 'maxUsers', type: 'uint256' },
			{ name: 'distributionTime', type: 'uint256' },
			{ name: 'joinedCount', type: 'uint256' },
			{ name: 'isCancelled', type: 'bool' },
			{ name: 'counter', type: 'uint256' }
		],
		stateMutability: 'view'
	},
	{
		name: 'cancel',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'claim',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'createAirdrop',
		type: 'function',
		inputs: [
			{ name: 'mint', type: 'address' },
			{ name: 'totalAmount', type: 'uint256' },
			{ name: 'maxUsers', type: 'uint256' },
			{ name: 'distributionTime', type: 'uint256' },
			{ name: 'counter', type: 'uint256' }
		],
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'register',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	},
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
	},
	{
		name: 'getPoolCount',
		type: 'function',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		name: 'getPool',
		type: 'function',
		inputs: [{ name: 'index', type: 'uint256' }],
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'view'
	}
] as const;

// ABI simplificado para operaciones de escritura (evita conflictos de tipos)
const AIRDROP_WRITE_ABI = [
	{
		name: 'cancel',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'claim',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'createAirdrop',
		type: 'function',
		inputs: [
			{ name: 'mint', type: 'address' },
			{ name: 'totalAmount', type: 'uint256' },
			{ name: 'maxUsers', type: 'uint256' },
			{ name: 'distributionTime', type: 'uint256' },
			{ name: 'counter', type: 'uint256' }
		],
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'nonpayable'
	},
	{
		name: 'register',
		type: 'function',
		inputs: [{ name: 'airdropPool', type: 'address' }],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable'
	}
] as const;

async function getPoolCount(): Promise<bigint> {
	const result = await publicClient.readContract({
		address: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS! as `0x${string}`,
		abi: AIRDROP_ABI,
		functionName: 'getPoolCount',
		args: []
	});

	return result as bigint;
}

async function getPool(index: bigint): Promise<string> {
	const result = await publicClient.readContract({
		address: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS! as `0x${string}`,
		abi: AIRDROP_ABI,
		functionName: 'getPool',
		args: [index]
	});

	return result as string;
}

export async function getNewPoolAddress(): Promise<string | null> {
	try {
		console.log("=== getNewPoolAddress (counting method) ===");

		const initialCount = await getPoolCount();
		console.log("Initial pool count:", initialCount);

		// Wait for transaction to be processed
		await new Promise(resolve => setTimeout(resolve, 3000));

		const newCount = await getPoolCount();
		console.log("New pool count:", newCount);

		if (newCount > initialCount) {
			const poolsAdded = Number(newCount - initialCount);
			console.log("Pools added:", poolsAdded);

			for (let i = 0; i < poolsAdded; i++) {
				const index = initialCount + BigInt(i);
				const poolAddr = await getPool(index);
				console.log(`Pool at index ${index}:`, poolAddr);
				if (poolAddr && poolAddr !== '0x0000000000000000000000000000000000000000') {
					return poolAddr;
				}
			}
		}

		if (newCount > 0n) {
			const latestPool = await getPool(newCount - 1n);
			console.log("Latest pool fallback:", latestPool);
			if (latestPool && latestPool !== '0x0000000000000000000000000000000000000000') {
				return latestPool;
			}
		}

		return null;
	} catch (error) {
		console.error("Error getting pool address:", error);
		return null;
	}
}



export interface CreateAirdropCalldata {
	approveCalldata: string;
	createCalldata: string;
	tokenAddress: string;
	totalAmount: bigint;
}

class EVMAirdropService {
	async getPoolCounter(creatorAddress: string): Promise<number> {
		return 0;
	}

	async createAirdropCalldata(
		tokenAddress: string,
		totalAmount: number,
		maxUsers: number,
		distributionTime: number,
		counter: number,
		airdropContractAddress: string
	): Promise<CreateAirdropCalldata> {
		try {
			// For now, assume 18 decimals. In a real implementation, you'd fetch this from the token contract
			const decimals = 18;
			const rawAmount = BigInt(Math.round(totalAmount * Math.pow(10, decimals)));

			// Create approve calldata
			const approveCalldata = encodeFunctionData({
				abi: ERC20_ABI,
				functionName: 'approve',
				args: [airdropContractAddress as `0x${string}`, rawAmount]
			});

			// Create airdrop calldata
			const createCalldata = encodeFunctionData({
				abi: AIRDROP_WRITE_ABI,
				functionName: 'createAirdrop',
				args: [
					tokenAddress as `0x${string}`,
					rawAmount,
					BigInt(maxUsers),
					BigInt(distributionTime),
					BigInt(counter)
				]
			});

			return {
				approveCalldata,
				createCalldata,
				tokenAddress,
				totalAmount: rawAmount
			};
		} catch (err: any) {
			throw new Error(err.message || 'Failed to create airdrop calldata');
		}
	}

	async getRegisterCalldata(airdropPoolAddress: string): Promise<string> {
		return encodeFunctionData({
			abi: AIRDROP_WRITE_ABI,
			functionName: 'register',
			args: [airdropPoolAddress as `0x${string}`]
		});
	}

	async getClaimCalldata(airdropPoolAddress: string): Promise<string> {
		return encodeFunctionData({
			abi: AIRDROP_WRITE_ABI,
			functionName: 'claim',
			args: [airdropPoolAddress as `0x${string}`]
		});
	}

	async getCancelCalldata(airdropPoolAddress: string): Promise<string> {
		return encodeFunctionData({
			abi: AIRDROP_WRITE_ABI,
			functionName: 'cancel',
			args: [airdropPoolAddress as `0x${string}`]
		});
	}

	// Note: Reading functions can be implemented using publicClient if needed
	// For now, these are placeholders as the frontend might get this data from the backend
}

export const evmAirdropService = new EVMAirdropService();