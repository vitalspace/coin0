'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Menu, Plus, Ghost, Wallet, LogOut, Wallet2 } from 'lucide-react';
import { useWallet } from '@/app/lib/services/wallet.service';
import ToastContainer from './ToastContainer';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tokens', label: 'Explore Tokens' },
  { href: '/airdrops', label: 'Airdrops' },
  { href: '/stakes', label: 'Staking' },
  { href: '/agent', label: 'Agent' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { address, connected, truncatedAddress, connect, openWallet } = useWallet();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    // For InterwovenKit, we just reset the state
    // The actual disconnect is handled by the provider
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-black backdrop-blur-xl border-b border-white/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#6fc7ba]/20 border border-[#6fc7ba]/40 flex items-center justify-center group-hover:bg-[#6fc7ba]/30 transition-colors">
              <img src="/initia.png" alt="Coin0" className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-[#6fc7ba] transition-colors">Coin0</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-[#6fc7ba] transition-colors relative group"
              >
                {link.label}
                {link.label === 'Airdrops' && (
                  <span className="absolute -top-2 -right-6 px-1 py-0.5 text-[9px] font-bold text-black bg-orange-400 rounded animate-pulse">
                    HOT
                  </span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6fc7ba] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {connected ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Initia Wallet
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">Wallet</span>
                  <span className="text-xs text-[#6fc7ba] font-mono">{truncatedAddress || formatAddress(address || '')}</span>
                </div>
                <button onClick={openWallet} className="ml-1 p-2 text-gray-400 hover:text-[#6fc7ba] transition-colors" title="Wallet">
                  <Wallet2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-4 py-2 text-sm font-medium text-[#6fc7ba] border border-[#6fc7ba]/40 rounded-full hover:bg-[#6fc7ba]/10 transition-colors"
              >
                Connect Wallet
              </button>
            )}

            <Link
              href="/create-coin"
              className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-black rounded-full overflow-hidden hover:scale-110 transition-transform duration-200 shadow-[0_0_20px_rgba(111,199,186,0.6),0_0_40px_rgba(111,199,186,0.3)] animate-pulse"
              style={{ background: '#6fc7ba' }}
            >
              <span className="relative flex items-center gap-2 drop-shadow-sm">
                <Plus className="w-5 h-5" />
                Create Token
              </span>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-300 hover:text-[#6fc7ba] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {connected ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Initia Wallet
                  </span>
                  <div className="text-center">
                    <span className="text-xs text-gray-400">Wallet: </span>
                    <span className="text-xs text-[#6fc7ba] font-mono">{truncatedAddress || formatAddress(address || '')}</span>
                  </div>
                  <button
                    onClick={openWallet}
                    className="mt-2 px-4 py-2 text-xs font-medium text-[#6fc7ba] border border-[#6fc7ba]/40 rounded-full hover:bg-[#6fc7ba]/10 transition-colors"
                  >
                    Open Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-[#6fc7ba] border border-[#6fc7ba]/40 rounded-full hover:bg-[#6fc7ba]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              )}

              <Link
                href="/create-coin"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-3 text-sm font-semibold text-black bg-[#6fc7ba] rounded-full hover:bg-[#5db8a5] transition-colors"
              >
                Create Token
              </Link>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </nav>
  );
}