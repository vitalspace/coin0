'use client';

import { useWallet } from '../../services/wallet.service';
import { Wallet } from 'lucide-react';

interface GuardianProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  subtitle?: string;
  networkLabel?: string;
}

export default function Guardian({ 
  children, 
  fallback,
  title = "Welcome",
  subtitle = "Connect your wallet to access this page and manage your account.",
  networkLabel = "Initia Network"
}: GuardianProps) {
  const { connected, connect } = useWallet();

  if (!connected) {
    return (
      fallback || (
        <div className="min-h-screen bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-[#6fc7ba]/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-center justify-center text-center px-4 min-h-screen">
            <div className="max-w-md mx-auto">
              <div className="inline-flex mb-6">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
                  <img src="/initia.png" alt="Initia" className="w-4 h-4" />
                  <span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">{networkLabel}</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
              
              <p className="text-gray-400 mb-8">
                {subtitle}
              </p>

              <div className="relative inline-block">
                <button
                  onClick={connect}
                  className="cursor-pointer group relative inline-flex items-center gap-3 px-8 py-4 bg-[#6fc7ba] text-black font-bold rounded-full hover:bg-[#5bb9a8] transition-all hover:scale-105"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                  <div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}