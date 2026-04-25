'use client';

import { useState } from 'react';
import { useWallet } from '../../services/wallet.service';
import { toast } from '../../stores/toastStore';
import { type TokenBalance, type TransferResult } from '../../services/evm.service';
import { encodeFunctionData, getAddress } from 'viem';
import { toInitiaAddress } from '../../services/coin.factory.service';
import { Send, Loader2, ExternalLink } from 'lucide-react';

const EVM_EXPLORER_URL = 'https://explorer.coin0.xyz';

const ERC20_ABI = [
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

interface Props {
  tokenBalance: TokenBalance | null;
  address: string;
  symbol: string;
  fetchOnChainData: () => void;
}

export default function SendTab({ tokenBalance, address, symbol, fetchOnChainData }: Props) {
  const { initiaAddress, connected, executeTx, openWallet } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);

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

  // Quick fund function for testing wallets
  const fundTestWallet = async () => {
    const testWallet = '0x71970DA41478661012a432C1fC423a666eE65E20';
    const amount = '1000'; // Fund with 1000 tokens for testing

    if (!tokenBalance || parseFloat(tokenBalance.uiAmount) < parseFloat(amount)) {
      toast.error('Not enough balance to fund test wallet');
      return;
    }

    setRecipient(testWallet);
    setAmount(amount);
    await handleSend();
  };

  const handleSend = async () => {
    if (!connected || !initiaAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!recipient || !amount) {
      toast.error('Please fill all fields');
      return;
    }
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      toast.error('Invalid EVM address');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Invalid amount');
      return;
    }
    if (tokenBalance && parseFloat(tokenBalance.uiAmount) < amt) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSending(true);
    setResult(null);
    try {
      const decimals = tokenBalance?.decimals || 18;
      const rawAmount = BigInt(Math.round(amt * Math.pow(10, decimals)));

      const calldata = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [getAddress(recipient), rawAmount],
      });

      const txHashResult = await executeTx({
        messages: [
          {
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress,
              contract_addr: address.toLowerCase() as `0x${string}`,
              input: calldata,
              value: "0",
              access_list: [],
              auth_list: [],
            },
          },
        ],
      });

      if (!txHashResult) {
        throw new Error("Transaction was not completed");
      }

      setResult({ success: true, hash: txHashResult as string });
      toast.success('Tokens sent!');
      fetchOnChainData();
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Send failed';
      setResult({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Send Tokens</h3>

      {!connected ? (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center">
          Connect your wallet
        </div>
      ) : (
        <>
          {tokenBalance && (
            <div className="mb-6 p-4 rounded-xl bg-[#6fc7ba]/5 border border-[#6fc7ba]/20">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-xl font-bold text-white">
                {formatNumber(tokenBalance.uiAmount)} {symbol}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="send-recipient" className="block text-sm text-gray-400 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                id="send-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="send-amount" className="block text-sm text-gray-400 mb-2">
                Amount
              </label>
              <input
                type="number"
                id="send-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#6fc7ba]/50 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={isSending || !recipient || !amount}
                className="flex-1 px-6 py-3 bg-[#6fc7ba] hover:bg-[#5db8a5] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Tokens
                  </>
                )}
              </button>
              <button
                onClick={fundTestWallet}
                disabled={isSending || !tokenBalance || parseFloat(tokenBalance.uiAmount) < 1000}
                className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                title="Fund test wallet 0x719...E65E20 with 1000 tokens"
              >
                Fund Test
              </button>
            </div>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-xl ${result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {result.success ? (
                <>
                  <p className="text-green-400 font-medium">Tokens sent!</p>
                  {result.hash && (
                    <a
                      href={`${EVM_EXPLORER_URL}/tx/${result.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#6fc7ba] hover:underline mt-2"
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-red-400 font-medium">{result.error}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}