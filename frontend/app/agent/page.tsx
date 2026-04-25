'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from '@/app/lib/components/agent/ChatMessage';
import { useWallet, CHAIN_ID } from '@/app/lib/services/wallet.service';
import axiosInstance from '@/app/lib/services/axios';
import { evmAirdropService, getNewPoolAddress } from '@/app/lib/services/airdrop.service';
import { stakingService, getNewStakingPoolAddress } from '@/app/lib/services/staking.service';
import { createMemecoinTx, FACTORY_ADDRESS, getNewTokenAddress } from '@/app/lib/services/coin.factory.service';
import { createToken, createAirdropApi, createStakingPoolApi } from '@/app/lib/services/api.service';
import { Loader2, Send, Trash2, Wallet } from 'lucide-react';
import { parseUnits, getAddress } from 'viem';

const AIRDROP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as `0x${string}`;
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string | null;
  airdropAddress?: string | null;
}

interface PendingAction {
  action: string;
  [key: string]: any;
}

const quickActions = [
  { label: 'Help', message: 'help' },
  { label: 'Stake 10 INIT', message: 'Stake 10 INIT in a staking pool' },
  { label: 'Claim Rewards', message: 'Claim my staking rewards' },
  { label: 'List Pools', message: 'Show me available staking pools' },
  { label: 'Create Airdrop', message: 'Create an airdrop of 1000 tokens' },
  { label: 'Claim Airdrop', message: 'Claim my airdrop' }
];

const actionableIntents = [
  'create_airdrop', 'confirm_airdrop', 'airdrop_details',
  'create_pool', 'confirm_pool', 'pool_details',
  'stake', 'stake_init', 'select_pool', 'confirm_stake',
  'claim_rewards', 'claim_staking_rewards',
  'claim_airdrop', 'register_airdrop',
  'create_token'
];

function checkShouldShowSign(intent: string, metadata: any, responseText: string): boolean {
  if (metadata?.readyToSign) return true;
  if (!actionableIntents.includes(intent)) return false;
  return (
    responseText.includes('firmar') ||
    responseText.includes('Confirmas') ||
    responseText.includes('sign') ||
    responseText.includes('Firma')
  );
}

export default function AgentPage() {
  const { address, initiaAddress, connected, executeTx } = useWallet();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<any>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  const clearConversation = useCallback(async () => {
    if (!address) return;
    try {
      await axiosInstance.delete('/agent/conversations', { data: { userAddress: address } });
      setMessages([]);
      setPendingAction(null);
      setCurrentMetadata(null);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [address]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 50);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    async function loadConversation() {
      if (!address) return;
      try {
        const response = await axiosInstance.get(`/agent/conversations?address=${address}`);
        if (response.data.conversation?.messages) {
          setMessages(response.data.conversation.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            action: m.action
          })));
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }
    if (connected && address) {
      loadConversation();
    }
  }, [connected, address]);

  const sendMessage = useCallback(async (msg: string) => {
    const message = msg.trim();
    if (!message || !address || isLoading) return;

    setIsLoading(true);
    setInputMessage('');

    setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);

    try {
      const response = await axiosInstance.post('/agent/chat', {
        message,
        userAddress: address
      });

      const { response: agentResponse, intent, metadata } = response.data;

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: agentResponse, timestamp: new Date(), action: intent }
      ]);

      setCurrentMetadata(metadata);

      if (checkShouldShowSign(intent, metadata, agentResponse)) {
        setPendingAction({ action: intent, ...metadata });
      } else {
        setPendingAction(null);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isLoading]);

  const signTransaction = useCallback(async () => {
    if (!pendingAction || isSigning || !address || !initiaAddress) return;

    setIsSigning(true);

    try {
      let result: any = null;

      if (
        pendingAction.action === 'confirm_airdrop' ||
        pendingAction.action === 'airdrop_details' ||
        pendingAction.action === 'create_airdrop'
      ) {
        let mintAddress = pendingAction.mintAddress;
        let tokenSymbol = pendingAction.tokenSymbol || 'TKN';

        if (!mintAddress) {
          try {
            const tokenResponse = await axiosInstance.get(`/tokens?owner=${address}`);
            const tokens = tokenResponse.data.tokens || [];

            let foundToken = tokens.find(
              (t: any) => t.symbol?.toUpperCase() === tokenSymbol.toUpperCase()
            );

            if (!foundToken && tokens.length > 0) {
              foundToken = tokens[0];
              tokenSymbol = foundToken.symbol;
            }

            if (foundToken?.contractAddress) {
              mintAddress = foundToken.contractAddress;
            }
          } catch (err) {
            console.error('Error fetching tokens:', err);
          }
        }

        if (!mintAddress) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'No token found. Create a token first before creating an airdrop.',
              timestamp: new Date(),
              action: null
            }
          ]);
          setPendingAction(null);
          return;
        }

        const totalAmount = parseFloat(pendingAction.amount || '1000');
        const maxUsers = pendingAction.maxUsers || 10;

        const now = Math.floor(Date.now() / 1000);
        const minTime = now + 7200;
        const distributionTime = Math.max(pendingAction.distributionTime || 0, minTime);

        const counter = await evmAirdropService.getPoolCounter(address);

        const { approveCalldata, createCalldata } = await evmAirdropService.createAirdropCalldata(
          mintAddress,
          totalAmount,
          maxUsers,
          distributionTime,
          counter,
          AIRDROP_CONTRACT_ADDRESS
        );

        const txHash = await executeTx({
          chainId: CHAIN_ID,
          messages: [
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: getAddress(mintAddress),
                input: approveCalldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: AIRDROP_CONTRACT_ADDRESS,
                input: createCalldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
          ],
        });

          if (txHash) {
          const poolPDA = await getNewPoolAddress();

          if (poolPDA) {
            const airdropDescription =
              pendingAction.description ||
              `Don't miss this exclusive airdrop of ${totalAmount} ${tokenSymbol || 'tokens'}! Claim your share before they run out.`;

            try {
              await createAirdropApi({
                txSignature: txHash,
                poolAddress: poolPDA,
                mintAddress: mintAddress,
                creatorAddress: address,
                tokenName: pendingAction.tokenSymbol || 'Token',
                tokenSymbol: pendingAction.tokenSymbol || 'TKN',
                totalAmount: String(totalAmount),
                maxUsers: maxUsers,
                distributionTime: new Date(distributionTime * 1000).toISOString(),
                description: airdropDescription
              });
            } catch (apiErr: any) {
              if (apiErr?.response?.status !== 409) {
                console.error('Error saving airdrop to DB:', apiErr);
              }
            }

            result = { success: true, signature: txHash, poolAddress: poolPDA };
          }
        }
      } else if (
        pendingAction.action === 'confirm_pool' ||
        pendingAction.action === 'pool_details' ||
        pendingAction.action === 'create_pool'
      ) {
        let mintAddress = pendingAction.mintAddress;
        let tokenSymbol = pendingAction.tokenSymbol || 'TKN';

        if (!mintAddress) {
          try {
            const tokenResponse = await axiosInstance.get(`/tokens?owner=${address}`);
            const tokens = tokenResponse.data.tokens || [];

            let foundToken = tokens.find(
              (t: any) => t.symbol?.toUpperCase() === tokenSymbol.toUpperCase()
            );

            if (!foundToken && tokens.length > 0) {
              foundToken = tokens[0];
              tokenSymbol = foundToken.symbol;
            }

            if (foundToken?.contractAddress) {
              mintAddress = foundToken.contractAddress;
            }
          } catch (err) {
            console.error('Error fetching tokens:', err);
          }
        }

        if (!mintAddress) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'No token found. Create a token first before creating a staking pool.',
              timestamp: new Date(),
              action: null
            }
          ]);
          setPendingAction(null);
          return;
        }

        const rewardAmount = parseFloat(pendingAction.rewardAmount || '1000');
        const lockDays = pendingAction.lockDays || 30;
        const lockSeconds = lockDays * 86400;
        const multiplier = parseFloat(pendingAction.multiplier || '1.5');
        const multiplierBps = Math.round(multiplier * 10000);

        const counter = await stakingService.getNextPoolCounter(address);
        const initialCount = await stakingService.getStakingPoolsCount();

        const createPoolCalldata = await stakingService.getCreatePoolCalldata(
          mintAddress,
          rewardAmount,
          lockSeconds,
          multiplier,
          counter
        );

        const txHash = await executeTx({
          chainId: CHAIN_ID,
          messages: [
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: STAKING_CONTRACT_ADDRESS,
                input: createPoolCalldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
          ],
        });

        if (txHash) {
          const poolAddress = await getNewStakingPoolAddress(initialCount, txHash);

          if (poolAddress) {
            const poolDescription =
              pendingAction.description ||
              `Stake INIT and earn up to ${multiplier}x rewards. Grow your holdings!`;

            try {
              await createStakingPoolApi({
                txSignature: txHash,
                poolAddress: poolAddress,
                mintAddress: mintAddress,
                rewardMintAddress: mintAddress,
                creatorAddress: address,
                tokenName: pendingAction.tokenSymbol || 'Token',
                tokenSymbol: pendingAction.tokenSymbol || 'TKN',
                rewardAmount: String(rewardAmount),
                lockSeconds: lockSeconds,
                multiplierBps: multiplierBps,
                description: poolDescription
              });
            } catch (apiErr: any) {
              if (apiErr?.response?.status !== 409) {
                console.error('Error saving pool to DB:', apiErr);
              }
            }

            result = { success: true, signature: txHash, poolAddress };
          }
        }
      } else if (
        pendingAction.action === 'stake' ||
        pendingAction.action === 'stake_init' ||
        pendingAction.action === 'select_pool' ||
        pendingAction.action === 'confirm_stake'
      ) {
        const stakeAmount = parseFloat(pendingAction.amount || '10');
        let poolAddress = pendingAction.poolAddress || currentMetadata?.poolAddress;

        if (!poolAddress) {
          const lastMsg = messagesRef.current.filter((m) => m.role === 'assistant').pop();
          if (lastMsg?.content) {
            const addrMatch = lastMsg.content.match(/Address:\s*([A-Za-z0-9]{32,})/);
            if (addrMatch) {
              poolAddress = addrMatch[1];
            }
          }
        }

        if (!poolAddress) {
          try {
            const poolsResponse = await axiosInstance.get('/staking-pools?limit=1');
            const pools = poolsResponse.data.pools || [];
            if (pools.length > 0) {
              poolAddress = pools[0].poolAddress;
            }
          } catch (err) {
            console.error('Error fetching pools:', err);
          }
        }

        if (!poolAddress) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'No staking pool found. Create one first.',
              timestamp: new Date(),
              action: null
            }
          ]);
          setPendingAction(null);
          return;
        }

        const existingStake = await stakingService.getStakeInfo(poolAddress, address);
        if (existingStake) {
          const stakeAmt = parseFloat(existingStake.amount) / 1e18;
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `You already have an active stake of ${stakeAmt} INIT in this pool. You cannot create another stake in the same pool. Use the Staking page to view or claim your stake.`,
              timestamp: new Date(),
              action: null
            }
          ]);
          setPendingAction(null);
          return;
        }

        const stakeCalldata = await stakingService.getStakeCalldata(poolAddress, stakeAmount);

        const txHash = await executeTx({
          chainId: CHAIN_ID,
          messages: [
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: STAKING_CONTRACT_ADDRESS,
                input: stakeCalldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
          ],
        });

        if (txHash) {
          result = { success: true, signature: txHash };
        }
      } else if (pendingAction.action === 'create_token') {
        const tokenName = pendingAction.name || 'Token';
        const tokenSymbol = pendingAction.symbol || 'TKN';
        const tokenSupply = pendingAction.supply || 1000000;
        const tokenLogo = pendingAction.logo || '';

        const supplyInWei = parseUnits(String(tokenSupply), 18);

        const calldata = await createMemecoinTx({
          name: tokenName,
          symbol: tokenSymbol,
          initialAddress: initiaAddress,
          initialSupply: supplyInWei,
        });

        const txHash = await executeTx({
          chainId: CHAIN_ID,
          messages: [
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: FACTORY_ADDRESS,
                input: calldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
          ],
        });

          if (txHash) {
          const deployedAddress = await getNewTokenAddress();

          try {
            await createToken({
              name: tokenName,
              symbol: tokenSymbol,
              owner: address,
              supply: String(tokenSupply),
              txHash: txHash,
              contractAddress: deployedAddress || txHash,
              chainName: 'Initia',
              logo: tokenLogo || undefined,
            });
          } catch (apiErr: any) {
            if (apiErr?.response?.status !== 409) {
              console.error('Error saving token to DB:', apiErr);
            }
          }

          result = { success: true, signature: txHash, tokenAddress: deployedAddress };
        }
      } else if (
        pendingAction.action === 'claim_rewards' ||
        pendingAction.action === 'claim_staking_rewards'
      ) {
        let poolAddress = pendingAction.poolAddress || currentMetadata?.poolAddress;

        if (!poolAddress) {
          try {
            const poolsResponse = await axiosInstance.get('/staking-pools?limit=1');
            const pools = poolsResponse.data.pools || [];
            if (pools.length > 0) {
              poolAddress = pools[0].poolAddress;
            }
          } catch (err) {
            console.error('Error fetching pools:', err);
          }
        }

        if (!poolAddress) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'No staking pool found to claim rewards.',
              timestamp: new Date(),
              action: null
            }
          ]);
          setPendingAction(null);
          return;
        }

        const claimCalldata = await stakingService.getClaimCalldata(poolAddress);

        const txHash = await executeTx({
          chainId: CHAIN_ID,
          messages: [
            {
              typeUrl: '/minievm.evm.v1.MsgCall',
              value: {
                sender: initiaAddress,
                contract_addr: STAKING_CONTRACT_ADDRESS,
                input: claimCalldata,
                value: '0',
                access_list: [],
                auth_list: [],
              },
            },
          ],
        });

        if (txHash) {
          result = { success: true, signature: txHash };
        }
      }

      if (result && result.success) {
        const airdropLink = result.poolAddress
          ? '\n\n[View Airdrop](/airdrop/' + result.poolAddress + ')'
          : '';
        const poolLink = result.poolAddress && pendingAction.action !== 'create_airdrop'
          ? '\n\n[View Pool](/stake/' + result.poolAddress + ')'
          : '';
        const tokenLink = result.tokenAddress
          ? '\n\n[View Token](/mytoken/' + result.tokenAddress + ')'
          : '';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Transaction completed successfully!\n\n' +
              '• Hash: ' +
              result.signature?.slice(0, 10) +
              '...' +
              result.signature?.slice(-8) +
              tokenLink +
              airdropLink +
              poolLink +
              '\n\nNeed anything else?',
            timestamp: new Date(),
            action: null,
            airdropAddress: result.poolAddress || null
          }
        ]);

        await axiosInstance.post('/agent/execute', {
          userAddress: address,
          action: pendingAction.action,
          txSignature: result.signature,
          poolAddress: pendingAction.pool?.poolAddress,
          airdropAddress: pendingAction.airdrop?.poolAddress
        });
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error signing transaction: ${result?.error || 'Unknown error'}\n\nWant to try again?`,
            timestamp: new Date(),
            action: null
          }
        ]);
      }
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message || 'Could not sign the transaction'}\n\nWant to try again?`,
          timestamp: new Date(),
          action: null
        }
      ]);
    } finally {
      setIsSigning(false);
      setPendingAction(null);
    }
  }, [pendingAction, isSigning, address, initiaAddress, currentMetadata, executeTx]);

  const handleKeydown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputMessage);
    }
  }, [sendMessage, inputMessage]);

  if (!connected) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-black pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6fc7ba]/10 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-16 pb-4">
          <div className="mb-8 space-y-3 text-center">
            <div className="inline-flex">
              <div className="flex items-center gap-2 rounded-full border border-[#6fc7ba]/30 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
                <img src="/initia.png" alt="Initia" className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide text-[#6fc7ba]">Initia Network</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">AI</span>
              <span className="text-[#6fc7ba]"> Agent</span>
            </h1>
            <p className="text-base text-gray-400">Chat with your DeFi assistant</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <p className="text-lg text-gray-400">Connect your wallet to use the AI Agent</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6fc7ba]/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-16 pb-4">
        <div className="mb-8 space-y-3 text-center">
          <div className="inline-flex">
            <div className="flex items-center gap-2 rounded-full border border-[#6fc7ba]/30 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
              <img src="/initia.png" alt="Initia" className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wide text-[#6fc7ba]">Initia Network</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">AI</span>
            <span className="text-[#6fc7ba]"> Agent</span>
          </h1>
          <p className="text-base text-gray-400">Chat with your DeFi assistant</p>
        </div>

        <div
          className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
          style={{ height: 700 }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
            <p className="text-sm text-gray-400">{messages.length} messages</p>
            <button
              onClick={clearConversation}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-all hover:border-red-400/30 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div
            ref={chatContainerRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto scroll-smooth p-6"
          >
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-6 text-gray-400">How can I help you today? Try one of these:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      className="rounded-xl border border-[#6fc7ba]/20 bg-[#6fc7ba]/10 px-4 py-2 text-[#6fc7ba] transition-all hover:border-[#6fc7ba]/40 hover:bg-[#6fc7ba]/20"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  action={message.action}
                  airdropAddress={message.airdropAddress}
                />
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#6fc7ba]/10">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6fc7ba]" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-gray-400">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            {pendingAction && (
              <div className="mb-3 rounded-xl border border-[#6fc7ba]/20 bg-[#6fc7ba]/10 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6fc7ba]">Pending transaction</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {pendingAction.action === 'confirm_airdrop' || pendingAction.action === 'airdrop_details' || pendingAction.action === 'create_airdrop'
                        ? `Create airdrop of ${pendingAction.amount || 'tokens'}`
                        : pendingAction.action === 'confirm_pool' || pendingAction.action === 'pool_details' || pendingAction.action === 'create_pool'
                        ? 'Create staking pool'
                        : pendingAction.action === 'stake' || pendingAction.action === 'stake_init'
                        ? `Stake ${pendingAction.amount || 'INIT'}`
                        : pendingAction.action === 'claim_rewards' || pendingAction.action === 'claim_staking_rewards'
                        ? 'Claim rewards'
                        : pendingAction.action === 'claim_airdrop'
                        ? 'Claim airdrop'
                        : pendingAction.action === 'register_airdrop'
                        ? 'Register for airdrop'
                        : pendingAction.action === 'create_token'
                        ? `Create token ${pendingAction.symbol || ''}`
                        : pendingAction.action}
                    </p>
                  </div>
                  <button
                    onClick={signTransaction}
                    disabled={isSigning}
                    className="flex items-center gap-2 rounded-xl bg-[#6fc7ba] px-4 py-2 font-medium text-black transition-all hover:bg-[#5db8a8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSigning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span>Sign with Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeydown}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-[#6fc7ba]/50 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading}
                className="rounded-xl bg-[#6fc7ba] px-4 py-3 font-medium text-black transition-all hover:bg-[#5db8a8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
