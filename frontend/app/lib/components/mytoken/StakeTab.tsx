'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet, CHAIN_ID } from '../../services/wallet.service';
import { toast } from '../../stores/toastStore';
import { createStakingPoolApi, generateDescription, type Token } from '../../services/api.service';
import { stakingService, STAKING_ADDRESS, getNewStakingPoolAddress } from '../../services/staking.service';
import { toEvmAddress, toInitiaAddress } from '../../services/coin.factory.service';
import { encodeFunctionData, parseEther } from 'viem';
import { Plus, Loader2, ExternalLink, Sparkles } from 'lucide-react';

const EXPLORER_URL = 'https://explorer.coin0.xyz';

interface Props {
  token: Token | null;
  tokenBalance: any;
  address: string;
  isOwner: boolean;
}

export default function StakeTab({ token, tokenBalance, address, isOwner }: Props) {
  const { connected, address: walletAddress, initiaAddress, executeTx, openWallet } = useWallet();

  const [poolRewardAmount, setPoolRewardAmount] = useState('');
  const [poolLockDays, setPoolLockDays] = useState('');
  const [poolMultiplier, setPoolMultiplier] = useState('1.5');
  const [poolDescription, setPoolDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [createPoolResult, setCreatePoolResult] = useState<{
    success: boolean;
    signature?: string;
    poolAddress?: string;
    error?: string;
  } | null>(null);

  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [stakeResult, setStakeResult] = useState<{
    success: boolean;
    signature?: string;
    error?: string;
  } | null>(null);

  const handleGenerateDescription = async () => {
    if (!token) return;
    setIsGeneratingDesc(true);
    try {
      const res = await generateDescription({
        type: 'staking',
        tokenName: (token as any).name,
        tokenSymbol: (token as any).symbol,
        lockDays: poolLockDays ? parseInt(poolLockDays) : undefined,
        multiplier: poolMultiplier || undefined,
      });
      if (res.success && res.description) {
        setPoolDescription(res.description);
      } else {
        toast.error(res.message || 'Failed to generate');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate';
      toast.error(message);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleCreatePool = async () => {
    if (!address || !poolRewardAmount || !poolLockDays) {
      toast.error('Missing required fields');
      return;
    }
    if (!initiaAddress || initiaAddress.trim() === '') {
      openWallet();
      toast.error('Please connect your wallet first');
      return;
    }
    const rewardAmountNum = parseFloat(poolRewardAmount);
    if (isNaN(rewardAmountNum) || rewardAmountNum <= 0) {
      toast.error('Please enter a valid reward amount');
      return;
    }

    setIsCreatingPool(true);
    setCreatePoolResult(null);

    try {
      const lockSeconds = parseInt(poolLockDays) * 86400;
      const multiplierBps = Math.round(parseFloat(poolMultiplier) * 10000);

      // Capturar sender UNA SOLA VEZ antes de cualquier await
      const senderAddr = initiaAddress.trim();

      let evmAddress: string;
      try {
        evmAddress = toEvmAddress(address);
      } catch {
        throw new Error('Invalid token address format');
      }
      if (!evmAddress || evmAddress === '0x') {
        throw new Error('Token contract not found on EVM');
      }

      // Convertir ambas direcciones de contrato a bech32 (init1...)
      const contractInitiaAddr = toInitiaAddress(evmAddress);
      const stakingInitiaAddr  = toInitiaAddress(STAKING_ADDRESS);

      console.log('[CreatePool] Addresses:', {
        senderAddr,
        contractInitiaAddr,
        stakingInitiaAddr,
        evmAddress,
        STAKING_ADDRESS,
      });

      const stakingContractEvmAddr = STAKING_ADDRESS.toLowerCase() as `0x${string}`;
      const contractEvmAddr = evmAddress.toLowerCase() as `0x${string}`;

const counter = await stakingService.getNextPoolCounter(walletAddress || '');

    const initialPoolCount = await stakingService.getStakingPoolsCount();
    console.log('[CreatePool] initialPoolCount before tx:', initialPoolCount);

    const approveCalldata = encodeFunctionData({
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [STAKING_ADDRESS, parseEther(rewardAmountNum.toString())],
      });

      console.log('[CreatePool] Sending approve tx...', {
        sender: senderAddr,
        contract_addr: contractInitiaAddr,
      });

      const approveResult = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: '/minievm.evm.v1.MsgCall',
            value: {
              sender: senderAddr,
              contract_addr: contractInitiaAddr,
              input: approveCalldata as `0x${string}`,
              value: '0',
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (!approveResult) {
        throw new Error('Token approval failed');
      }

      console.log('[CreatePool] Approve OK, building createPool calldata...', {
        rewardMint: evmAddress,
        amount: rewardAmountNum,
        lockSeconds,
        multiplierBps,
        counter,
      });

      const createPoolCalldata = await stakingService.getCreatePoolCalldata(
        evmAddress,
        rewardAmountNum,
        lockSeconds,
        multiplierBps,
        counter
      );

      console.log('[CreatePool] Sending createPool tx...', {
        sender: senderAddr,
        contract_addr: stakingContractEvmAddr,
        calldata: createPoolCalldata,
      });

      const txHash = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: '/minievm.evm.v1.MsgCall',
            value: {
              sender: senderAddr,
              contract_addr: stakingContractEvmAddr,
              input: createPoolCalldata as `0x${string}`,
              value: '0',
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (!txHash) {
        throw new Error('Pool creation failed');
      }

      console.log('[CreatePool] createPool txHash:', txHash);

      const poolAddress = await getNewStakingPoolAddress(initialPoolCount, txHash);
      console.log('[CreatePool] poolAddress result:', poolAddress);

      if (!poolAddress) {
        throw new Error('Failed to retrieve pool address');
      }

      try {
        await createStakingPoolApi({
          txSignature: txHash,
          poolAddress: poolAddress,
          mintAddress: address,
          rewardMintAddress: address,
          creatorAddress: walletAddress || '',
          tokenName: (token as any).name,
          tokenSymbol: (token as any).symbol,
          rewardAmount: String(poolRewardAmount),
          lockSeconds,
          multiplierBps,
          counter,
          logo: (token as any).logo || undefined,
          description: poolDescription || undefined,
        });
      } catch (apiErr: unknown) {
        // Ignorar 409 (pool ya existe)
        if ((apiErr as any)?.response?.status !== 409) {
          throw apiErr;
        }
      }

      setCreatePoolResult({ success: true, signature: txHash, poolAddress });
      toast.success('Staking pool created!');
      setPoolRewardAmount('');
      setPoolLockDays('');
      setPoolMultiplier('1.5');
      setPoolDescription('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create pool';
      setCreatePoolResult({ success: false, error: message });
      toast.error(message);
    } finally {
      setIsCreatingPool(false);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeAmount) {
      toast.error('Missing required fields');
      return;
    }
    // Guard igual que handleCreatePool
    if (!initiaAddress || initiaAddress.trim() === '') {
      openWallet();
      toast.error('Please connect your wallet first');
      return;
    }
    const stakeAmountNum = parseFloat(stakeAmount);
    if (isNaN(stakeAmountNum) || stakeAmountNum <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    // Capturar sender UNA SOLA VEZ antes de cualquier await
    const senderAddr = initiaAddress.trim();

    setIsStaking(true);
    setStakeResult(null);

    try {
      const pools = await stakingService.getPoolsByToken(address);
      if (pools.length === 0) {
        setStakeResult({ success: false, error: 'No staking pools found for this token.' });
        toast.error('No staking pools found for this token.');
        return;
      }

      const poolAddress = pools[0].publicKey;

      let evmAddress: string;
      try {
        evmAddress = toEvmAddress(address);
      } catch {
        throw new Error('Invalid token address format');
      }

      // Convertir direcciones de contrato a bech32 (init1...)
      const tokenInitiaAddr   = toInitiaAddress(evmAddress);
      const stakingInitiaAddr = toInitiaAddress(STAKING_ADDRESS);

      const approveCalldata = encodeFunctionData({
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'approve',
        // Mantener como bigint — NO convertir a string
        args: [STAKING_ADDRESS, parseEther(stakeAmountNum.toString())],
      });

      const stakeCalldata = await stakingService.getStakeCalldata(poolAddress, stakeAmountNum);

      console.log('[Stake] Sending tx...', {
        sender: senderAddr,
        tokenInitiaAddr,
        stakingInitiaAddr,
      });

      const txHash = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: '/minievm.evm.v1.MsgCall',
            value: {
              sender: senderAddr,
              contract_addr: tokenInitiaAddr,
              input: approveCalldata as `0x${string}`,
              value: '0',
              access_list: [],
              auth_list: [],
            },
          },
          {
            typeUrl: '/minievm.evm.v1.MsgCall',
            value: {
              sender: senderAddr,
              contract_addr: stakingInitiaAddr,
              input: stakeCalldata as `0x${string}`,
              value: '0',
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (txHash) {
        setStakeResult({ success: true, signature: txHash });
        toast.success('Staked!');
      } else {
        setStakeResult({ success: false, error: 'Transaction rejected' });
        toast.error('Transaction rejected');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to stake';
      setStakeResult({ success: false, error: message });
      toast.error(message);
    } finally {
      setIsStaking(false);
    }
  };


  return (
    <div className="space-y-6">
        <div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Create Staking Pool</h3>
                <p className="text-sm text-gray-400">Users deposit Init to earn your tokens as rewards</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reward Amount ({(token as any)?.symbol})</label>
                <input
                  type="number"
                  value={poolRewardAmount}
                  onChange={(e) => setPoolRewardAmount(e.target.value)}
                  placeholder="1000"
                  step="any"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Lock Period (days)</label>
                <input
                  type="number"
                  value={poolLockDays}
                  onChange={(e) => setPoolLockDays(e.target.value)}
                  placeholder="7"
                  step="1"
                  min="1"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Multiplier</label>
                <input
                  type="number"
                  value={poolMultiplier}
                  onChange={(e) => setPoolMultiplier(e.target.value)}
                  placeholder="1.5"
                  step="0.1"
                  min="1"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-400">Description <span className="text-gray-600">(optional)</span></label>
                  <button onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="flex items-center gap-1.5 text-xs text-[#6fc7ba] hover:text-[#5db8a5] disabled:opacity-50 transition-colors">
                    {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={poolDescription}
                  onChange={(e) => setPoolDescription(e.target.value)}
                  placeholder="Stake tokens to earn rewards..."
                  rows={3}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none resize-none"
                />
              </div>
              <button onClick={handleCreatePool} disabled={isCreatingPool || !poolRewardAmount || !poolLockDays || !connected} className="w-full px-6 py-3 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isCreatingPool ? <><Loader2 className="animate-spin h-5 w-5" /> Creating...</> : <><Plus className="w-5 h-5" /> Create Pool</>}
              </button>
              {createPoolResult && (
                <div className={`p-4 rounded-xl ${createPoolResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  {createPoolResult.success ? (
                    <>
                      <p className="text-green-400 font-medium">Pool created!</p>
                      {createPoolResult.poolAddress && (
                        <Link href={`/stake/${createPoolResult.poolAddress}`} className="mt-2 inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline">
                          View <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <p className="text-red-400 font-medium">{createPoolResult.error}</p>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    );
}