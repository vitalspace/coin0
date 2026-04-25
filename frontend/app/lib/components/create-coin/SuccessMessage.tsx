'use client';

import { useState } from 'react';
import { CheckCircle, ExternalLink, Settings } from 'lucide-react';

interface Props {
  contractAddress: string;
  explorerUrl: string | null;
  walletAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  tokenLogo?: string;
}

export default function TokenSuccess({ 
  contractAddress, 
  explorerUrl, 
  walletAddress,
  tokenSymbol = "TOKEN",
  tokenName = "Token",
  tokenDecimals = 18,
  tokenLogo,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleAddToken = async () => {
    if (!window.ethereum) {
      const tokenInfo = `Contract: ${contractAddress}\nSymbol: ${tokenSymbol}\nDecimals: ${tokenDecimals}`;
      await navigator.clipboard.writeText(tokenInfo);
      setError("Copied to clipboard! Add manually in your wallet");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            ...(tokenLogo && { image: tokenLogo }),
          },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Unauthorized')) {
        setError("Please approve the request in your wallet");
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="p-4 rounded-lg bg-[#6fc7ba]/10 border border-[#6fc7ba]/30 text-[#6fc7ba] text-sm">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle size={16} />
        <span className="font-medium">Token created successfully!</span>
      </div>

      <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono break-all">
        <span className="text-gray-400">Contract: </span>
        <span className="text-[#6fc7ba]">{contractAddress}</span>
      </div>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-[#6fc7ba] hover:underline"
        >
          View on Explorer
          <ExternalLink size={11} />
        </a>
      )}

{contractAddress && walletAddress && (
    <a
      href={`/mytoken/${contractAddress}`}
      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#6fc7ba] text-black font-medium rounded-lg text-sm hover:bg-[#5db8a5] transition-all"
    >
      <Settings size={16} />
      Manage Token
    </a>
  )}
    </div>
  );
}