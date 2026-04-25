'use client';

import { useWalletStore } from './evm.service';
import { encodeFunctionData, decodeEventLog, getAddress, parseEther, formatEther } from 'viem';
import { AccAddress } from '@initia/initia.js';
import { publicClient, toEvmAddress } from './coin.factory.service';
import { useWallet } from './wallet.service';
import stakingAbi from '../abis/staking.json';

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}` || '0xA75FfBfc61a4173f3100abe66d05473AD5e59784';
const EVM_CHAIN_ID = 3599095684429094;

export const getPoolAddressFromTx = async (txHash: string, maxWait = 15000): Promise<{ poolAddress: string | null; success: boolean }> => {
	const start = Date.now();
	while (Date.now() - start < maxWait) {
		try {
			const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
			
			if (receipt.status === 'reverted') {
				return { poolAddress: null, success: false };
			}
			
			for (const log of receipt.logs) {
				if (log.address.toLowerCase() === STAKING_ADDRESS.toLowerCase()) {
					try {
						const parsed = decodeEventLog({
							abi: stakingAbi,
							data: log.data,
							topics: log.topics,
						});
						if (parsed.eventName === 'StakingPoolCreated') {
							return { poolAddress: parsed.args.pool as string, success: true };
						}
					} catch {
						continue;
					}
				}
			}
			return { poolAddress: null, success: receipt.status === 'reverted' };
		} catch {
			await new Promise(r => setTimeout(r, 2000));
		}
	}
	return { poolAddress: null, success: false };
};

export interface PoolInfo {
	creator: string;
	mint: string;
	rewardMint: string;
	vault: string;
	totalStaked: string;
	totalRewards: string;
	rewardsClaimed: string;
	lockSeconds: number;
	multiplier: number;
	counter: number;
}

export interface StakeInfo {
	user: string;
	pool: string;
	amount: string;
	endTime: number;
	claimed: boolean;
}

export interface StakingResult {
	success: boolean;
	hash?: string;
	poolAddress?: string;
	error?: string;
}

export async function getNewStakingPoolAddress(
  initialCount: number,
  txHash?: string
): Promise<string | null> {
  console.log(`[getNewStakingPoolAddress] Starting with initialCount: ${initialCount}, txHash: ${txHash}`);
  
  try {
    // Intentar obtener del receipt de la transacción primero
    if (txHash && txHash.startsWith('0x')) {
      console.log('[getNewStakingPoolAddress] Attempting to get pool address from transaction receipt...');
      const { poolAddress, success } = await getPoolAddressFromTx(txHash, 20000); // Aumentar timeout a 20s
      if (success && poolAddress) {
        console.log('[getNewStakingPoolAddress] Successfully got pool address from receipt:', poolAddress);
        return poolAddress;
      } else {
        console.log('[getNewStakingPoolAddress] Failed to get pool address from receipt, will use fallback');
      }
    }

    // Fallback: esperar a que el contador aumente y obtener la última pool
    console.log('[getNewStakingPoolAddress] Starting fallback polling mechanism...');
    for (let attempt = 0; attempt < 10; attempt++) { // Aumentar intentos a 10
      const waitTime = (attempt + 1) * 2000; // Tiempo de espera progresivo: 2s, 4s, 6s...
      console.log(`[getNewStakingPoolAddress] Attempt ${attempt + 1}/10: waiting ${waitTime}ms...`);
      await new Promise(r => setTimeout(r, waitTime));

      const newCount = await stakingService.getStakingPoolsCount();
      console.log(`[getNewStakingPoolAddress] New pool count: ${newCount}, initial: ${initialCount}`);

      if (newCount > initialCount) {
        const poolIndex = newCount - 1;
        console.log(`[getNewStakingPoolAddress] Pool count increased! Getting pool at index ${poolIndex}...`);
        const poolAddr = await stakingService.getPoolAddress(poolIndex);
        console.log(`[getNewStakingPoolAddress] Pool address result: ${poolAddr}`);
        
        if (poolAddr && poolAddr !== '0x0000000000000000000000000000000000000000') {
          console.log('[getNewStakingPoolAddress] Successfully got pool address from fallback:', poolAddr);
          return poolAddr;
        }
      } else {
        console.log('[getNewStakingPoolAddress] Pool count unchanged, continuing...');
      }
    }

    console.log('[getNewStakingPoolAddress] All attempts failed, returning null');
    return null;
  } catch (error) {
    console.error('[getNewStakingPoolAddress] Error:', error);
    return null;
  }
}

export { STAKING_ADDRESS };

const ERC20_ABI = [
	{
		name: 'approve',
		type: 'function',
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
	},
	{
		name: 'allowance',
		type: 'function',
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
		],
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
] as const;

class StakingService {
	async getStakingPoolsCount(): Promise<number> {
		try {
			const count = await publicClient.readContract({
				address: STAKING_ADDRESS,
				abi: stakingAbi,
				functionName: 'stakingPoolsCount',
				args: [],
			});
			const num = Number(count);
			return isNaN(num) ? 0 : num;
		} catch (e) {
			console.error('[getStakingPoolsCount] Error:', e);
			return 0;
		}
	}

  async getStakingPool(index: number): Promise<PoolInfo | null> {
    try {
      const pool = await publicClient.readContract({
        address: STAKING_ADDRESS,
        abi: stakingAbi,
        functionName: 'stakingPools',
        args: [BigInt(index)],
      });
      
      // Access by index since the contract returns positional values
      const creator = pool[0];
      const rewardMint = pool[1];
      const vault = pool[2];
      const totalStaked = pool[3];
      const totalRewards = pool[4];
      const rewardsClaimed = pool[5];
      const lockSeconds = pool[6];
      const multiplier = pool[7];
      const counter = pool[8];
      
      if (!creator || creator === '0x0000000000000000000000000000000000000000') {
        return null;
      }
      return {
        creator: creator,
        mint: rewardMint,
        rewardMint: rewardMint,
        vault: vault,
        totalStaked: totalStaked.toString(),
        totalRewards: totalRewards.toString(),
        rewardsClaimed: rewardsClaimed.toString(),
        lockSeconds: Number(lockSeconds),
        multiplier: Number(multiplier),
        counter: Number(counter),
      };
    } catch {
      return null;
    }
  }

	async getStakeInfo(poolAddress: string, userAddress: string): Promise<StakeInfo | null> {
		try {
			const stake = await publicClient.readContract({
				address: STAKING_ADDRESS,
				abi: stakingAbi,
				functionName: 'stakes',
				args: [getAddress(poolAddress), getAddress(userAddress)],
			});
			console.log('[getStakeInfo] Raw result from contract:', stake);
			
			const userAddr = stake.userAddr || stake[0];
			const poolAddr = stake.poolAddr || stake[1];
			const amount = stake.amount || stake[2];
			const endTime = stake.endTime || stake[3];
			const claimed = stake.claimed || stake[4];
			
			if (!userAddr || userAddr === '0x0000000000000000000000000000000000000000') {
				return null;
			}
			return {
				user: userAddr,
				pool: poolAddr,
				amount: amount.toString(),
				endTime: Number(endTime),
				claimed: claimed,
			};
		} catch (e) {
			console.error('[getStakeInfo] Error:', e);
			return null;
		}
	}

  async getPoolAddress(index: number): Promise<string | null> {
    try {
      const address = await publicClient.readContract({
        address: STAKING_ADDRESS,
        abi: stakingAbi,
        functionName: 'getPool',
        args: [BigInt(index)],
      });
      return address;
    } catch (e) {
      console.error('[getPoolAddress] Error:', e);
      return null;
    }
  }

  async getPoolsByCreator(creatorAddress: string): Promise<{ publicKey: string; counter: number }[]> {
    try {
      const pools: { publicKey: string; counter: number }[] = [];
      const totalCount = await this.getStakingPoolsCount();

      for (let i = 0; i < totalCount; i++) {
        const pool = await this.getStakingPool(i);
        if (pool && pool.creator.toLowerCase() === creatorAddress.toLowerCase()) {
          const poolAddr = await this.getPoolAddress(i);
          if (poolAddr) {
            pools.push({ publicKey: poolAddr, counter: pool.counter });
          }
        }
      }
      return pools;
    } catch {
      return [];
    }
  }

  async getNextPoolCounter(creatorAddress: string): Promise<number> {
    try {
      const creatorPools = await this.getPoolsByCreator(creatorAddress);
      if (creatorPools.length === 0) {
        return 0;
      }
      // Find the highest counter and add 1
      const maxCounter = Math.max(...creatorPools.map(p => p.counter));
      return maxCounter + 1;
    } catch {
      return 0;
    }
  }

	async getAllPools(page: number = 1, limit: number = 10): Promise<{ pools: PoolInfo[]; totalPages: number; currentPage: number }> {
		const pools: PoolInfo[] = [];
		const totalCount = await this.getStakingPoolsCount();
		const totalPages = Math.ceil(totalCount / limit);
		const startIndex = (page - 1) * limit;

		for (let i = startIndex; i < Math.min(startIndex + limit, totalCount); i++) {
			const pool = await this.getStakingPool(i);
			if (pool) {
				pools.push(pool);
			}
		}

		return {
			pools,
			totalPages: Math.max(1, totalPages),
			currentPage: page,
		};
	}

	async getPoolInfoFromAddress(poolAddress: string): Promise<PoolInfo | null> {
		try {
			const totalCount = await this.getStakingPoolsCount();
			for (let i = 0; i < totalCount; i++) {
				const poolAddr = await this.getPoolAddress(i);
				if (poolAddr && poolAddr.toLowerCase() === poolAddress.toLowerCase()) {
					return await this.getStakingPool(i);
				}
			}
			return null;
		} catch {
			return null;
		}
	}

	async getTokenDecimals(tokenAddress: string): Promise<number> {
		try {
			const decimals = await publicClient.readContract({
				address: getAddress(tokenAddress),
				abi: [
					{
						name: 'decimals',
						type: 'function',
						inputs: [],
						outputs: [{ name: '', type: 'uint8' }],
					},
				],
				functionName: 'decimals',
				args: [],
			});
			return Number(decimals);
		} catch {
			return 18;
		}
	}

	async calculateReward(poolInfo: PoolInfo, stakeAmount: bigint): Promise<string> {
		if (poolInfo.totalStaked === '0') return '0';
		
		const totalStaked = BigInt(poolInfo.totalStaked);
		const totalRewards = BigInt(poolInfo.totalRewards);
		const rewardsClaimed = BigInt(poolInfo.rewardsClaimed);
		const multiplier = BigInt(poolInfo.multiplier);

		const userShare = (stakeAmount * BigInt(1e6)) / totalStaked;
		const remainingRewards = totalRewards - rewardsClaimed;
		const calculatedReward = (userShare * remainingRewards) / BigInt(1e6);
		const withMultiplier = (calculatedReward * multiplier) / BigInt(10000);

		return withMultiplier.toString();
	}

	async getPoolsByToken(mintAddress: string): Promise<{ publicKey: string }[]> {
		try {
			const pools: { publicKey: string }[] = [];
			const totalCount = await this.getStakingPoolsCount();
			
			let mintEvmAddress: string;
			try {
				mintEvmAddress = toEvmAddress(mintAddress).toLowerCase();
			} catch {
				return [];
			}

			for (let i = 0; i < totalCount; i++) {
				const pool = await this.getStakingPool(i);
				const poolAddr = await this.getPoolAddress(i);
				if (pool && poolAddr && pool.rewardMint.toLowerCase() === mintEvmAddress) {
					pools.push({ publicKey: poolAddr });
				}
			}
			return pools;
		} catch {
			return [];
		}
	}

  async getCreatePoolCalldata(
    rewardMintAddress: string,
    rewardAmount: number,
    lockSeconds: number,
    multiplier: number,
    counter: number
  ): Promise<string> {
    const lockSecs = BigInt(lockSeconds);
    const multBps = BigInt(Math.round(multiplier * 10000));
    const rewardAmt = parseEther(String(rewardAmount));

    const calldata = encodeFunctionData({
      abi: stakingAbi,
      functionName: 'createStakingPool',
      args: [
        getAddress(rewardMintAddress),
        rewardAmt,
        lockSecs,
        multBps,
        BigInt(counter)
      ],
    });
    return calldata;
  }

	async getStakeCalldata(poolAddress: string, amount: number): Promise<string> {
		// INIT uses 9 decimals, not 18
		const amountWei = BigInt(Math.round(amount * 1e9)).toString();
		
		const calldata = encodeFunctionData({
			abi: stakingAbi,
			functionName: 'stake',
			args: [
				getAddress(poolAddress),
				amountWei
			],
		});
		return calldata;
	}

	async getClaimCalldata(poolAddress: string): Promise<string> {
		const calldata = encodeFunctionData({
			abi: stakingAbi,
			functionName: 'claim',
			args: [getAddress(poolAddress)],
		});
		return calldata;
	}

	async createPool(
		_mintAddress: string,
		_rewardMintAddress: string,
		_rewardAmount: number,
		_lockSeconds: number,
		_multiplier: number
	): Promise<StakingResult> {
		return { success: false, error: 'Use executeTx with getCreatePoolCalldata' };
	}

	async stake(_poolAddress: string, _amount: number): Promise<StakingResult> {
		return { success: false, error: 'Use executeTx with getStakeCalldata' };
	}

	async claim(_poolAddress: string): Promise<StakingResult> {
		return { success: false, error: 'Use executeTx with getClaimCalldata' };
	}

	isContractDeployed(): boolean {
		return STAKING_ADDRESS !== '0x0000000000000000000000000000000000000000';
	}
}

export const stakingService = new StakingService();