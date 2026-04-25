'use client';

import { useState } from 'react';
import { useWallet } from '../../services/wallet.service';
import { CHAIN_ID } from '../../services/wallet.service';
import { toast } from '../../stores/toastStore';
import { createAirdropApi, generateDescription, type Token } from '../../services/api.service';
import { evmAirdropService, type AirdropResult, getNewPoolAddress } from '../../services/airdrop.service';
import { Gift, Loader2, ExternalLink, Sparkles, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
	token: any;
	tokenBalance: any;
	address: string;
	fetchOnChainData?: () => Promise<void>;
}

export default function AirdropTab({ token, tokenBalance, address, fetchOnChainData }: Props) {
  const { address: walletAddress, initiaAddress, connected, executeTx, openWallet } = useWallet();

  const [totalAmount, setTotalAmount] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [distributionDate, setDistributionDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<AirdropResult | null>(null);

  const formatNumber = (num: string | number) => {
    const str = typeof num === 'string' ? num : num.toString();
    const parsed = parseFloat(str);
    if (isNaN(parsed)) return str;

    // For very large numbers, use exponential notation
    if (parsed >= 1e12) {
      return parsed.toExponential(2);
    }

    // For large numbers, format with commas
    if (parsed >= 1e6) {
      return parsed.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
    }

    // For smaller numbers, show up to 6 decimals
    return parsed.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0
    });
  };

  const handleGenerateDescription = async () => {
    if (!token) return;
    setIsGeneratingDesc(true);
    try {
      const res = await generateDescription({
        type: 'airdrop',
        tokenName: (token as any).name,
        tokenSymbol: (token as any).symbol,
        amount: totalAmount ? String(totalAmount) : undefined
      });
      if (res.success && res.description) {
        setDescription(res.description);
      } else {
        toast.error(res.message || 'Failed to generate');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleCreate = async () => {
    if (!address || !totalAmount || !maxUsers || !distributionDate || !walletAddress) return;
    const ts = Math.floor(distributionDate.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    if (ts <= now + 300) {
      toast.error('Distribution must be at least 5 min in future');
      return;
    }

    setIsCreating(true);
    setResult(null);
    try {
      const AIRDROP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || '';
      const counter = await evmAirdropService.getPoolCounter(walletAddress);

      // Get calldatas for both approve and create transactions
      const calldatas = await evmAirdropService.createAirdropCalldata(
        address,
        parseFloat(totalAmount),
        parseInt(maxUsers),
        ts,
        counter,
        AIRDROP_CONTRACT_ADDRESS
      );

      const approveTxHash = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contract_addr: address as `0x${string}`, // Token contract address
              input: calldatas.approveCalldata as `0x${string}`,
              value: "0",
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (!approveTxHash) {
        throw new Error("Token approval failed");
      }

      // Second transaction: create airdrop
      const createTxHash = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contract_addr: AIRDROP_CONTRACT_ADDRESS as `0x${string}`,
              input: calldatas.createCalldata as `0x${string}`,
              value: "0",
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (!createTxHash) {
        throw new Error("Airdrop creation failed");
      }

      // Get the actual pool address by counting pools before/after transaction
      let poolAddress = await getNewPoolAddress();
      if (!poolAddress) {
        console.warn("Could not get pool address from counting method, using tx hash as fallback");
        poolAddress = createTxHash; // Fallback to tx hash
      }

      try {
        console.log('Saving airdrop to backend:', {
          txSignature: createTxHash,
          poolAddress: poolAddress,
          mintAddress: address,
          creatorAddress: walletAddress,
          tokenName: (token as any).name,
          tokenSymbol: (token as any).symbol,
          totalAmount: String(totalAmount),
          maxUsers: Number(maxUsers),
          distributionTime: new Date(ts * 1000).toISOString(),
          description: description || undefined,
          logo: (token as any).logo || undefined
        });

        const apiResponse = await createAirdropApi({
          txSignature: createTxHash,
          poolAddress: poolAddress,
          mintAddress: address,
          creatorAddress: walletAddress,
          tokenName: (token as any).name,
          tokenSymbol: (token as any).symbol,
          totalAmount: String(totalAmount),
          maxUsers: Number(maxUsers),
          distributionTime: new Date(ts * 1000).toISOString(),
          description: description || undefined,
          logo: (token as any).logo || undefined
        });

        console.log('Airdrop saved to backend successfully:', apiResponse);
      } catch (apiErr: any) {
        console.error('Error saving airdrop to backend:', apiErr);
        if (apiErr?.response?.status === 409) {
          console.log('Airdrop already exists in backend, continuing...');
          // Airdrop already exists, continue
        } else {
          throw apiErr;
        }
      }

      setResult({ success: true, hash: createTxHash, poolAddress });
      toast.success('Airdrop created!');

      // Refresh token balance after successful transaction
      if (fetchOnChainData) {
        await fetchOnChainData();
      }

      setTotalAmount('');
      setMaxUsers('');
      setDistributionDate(null);
      setDescription('');
    } catch (error: any) {
      console.error("Create airdrop error:", error);
      const errorMessage = error?.message || "Transaction failed";
      setResult({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
      <h3 className="mb-2 text-lg font-semibold text-white">Create Airdrop</h3>
      <p className="mb-6 text-sm text-gray-400">
        Deposit tokens into a vault. Users can join and claim an equal share.
      </p>

      {!connected ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center text-yellow-400">
          Connect your wallet
        </div>
      ) : (
        <>
          {tokenBalance && (
            <div className="mb-6 rounded-xl border border-[#6fc7ba]/20 bg-[#6fc7ba]/5 p-4">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-xl font-bold text-white">
                {formatNumber(tokenBalance.uiAmount)}
                {(token as any)?.symbol}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Total Tokens</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="1000"
                step="any"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Max Users</label>
              <input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="100"
                step="1"
                min="1"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {totalAmount && maxUsers && parseFloat(maxUsers) > 0
                  ? `Each user gets ~${(parseFloat(totalAmount) / parseFloat(maxUsers)).toFixed(2)} ${(token as any)?.symbol}`
                  : 'Equal share per user'
                }
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Distribution Date</label>
              <div className="relative">
                <DatePicker
                  selected={distributionDate}
                  onChange={(date: Date | null) => setDistributionDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={new Date()}
                  placeholderText="Select distribution date and time"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
                  wrapperClassName="w-full"
                  popperClassName="react-datepicker-popper"
                  calendarClassName="react-datepicker-calendar"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Description <span className="text-gray-600">(optional)</span></label>
                <button
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="flex items-center gap-1.5 text-xs text-[#6fc7ba] hover:text-[#5db8a5] disabled:opacity-50 transition-colors"
                >
                  {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate with AI
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why are you giving away tokens?"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating || !totalAmount || !maxUsers || !distributionDate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6fc7ba] px-6 py-3 font-bold text-black transition-all hover:bg-[#5db8a5] disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Gift className="h-5 w-5" /> Create Airdrop
                </>
              )}
            </button>
          </div>

          {result && (
            <div className={`mt-6 rounded-xl p-4 ${result.success ? 'border border-green-500/30 bg-green-500/10' : 'border border-red-500/30 bg-red-500/10'}`}>
              {result.success ? (
                <>
                  <p className="font-medium text-green-400">Airdrop created!</p>
                  {result.poolAddress && (
                    <a
                      href={`/airdrop/${result.poolAddress}`}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </>
              ) : (
                <p className="font-medium text-red-400">{result.error}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Note: Custom styles for react-datepicker can be added to globals.css if needed