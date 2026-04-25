'use client';

import Link  from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Scene from './Scene';

export default function Hero() {
  const router = useRouter();
  return (
    <div className="h-screen relative flex flex-col justify-center px-4 sm:px-8 lg:px-20 z-10">
      <Scene />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
      <div className="inline-flex items-center">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/30 border border-[#6fc7ba]/40 backdrop-blur-sm shadow-[0_0_20px_rgba(111,199,186,0.3)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6fc7ba] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6fc7ba]"></span>
          </span>
          <span className="text-sm font-semibold text-[#6fc7ba] tracking-wide uppercase leading-none">
            Launch your token today
          </span>
        </div>
      </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Create your
              </span>
              <br />
              <span className="text-[#6fc7ba]">memecoin</span>
              <br />
              <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                in minutes
              </span>
            </h1>

            <p className="text-lg text-gray-400 font-light">
              No coding required. Deploy on{" "}
              <span className="text-[#6fc7ba] font-semibold">Initia</span>{" "}
              instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/create-coin"
                className="group relative inline-flex items-center gap-3 px-10 py-5 font-bold transition-all duration-300 rounded-full overflow-hidden hover:scale-105 shadow-[0_0_40px_rgba(111,199,186,0.3)] hover:shadow-[0_0_60px_rgba(111,199,186,0.5)]"
              >
                <div className="absolute inset-0 bg-[#6fc7ba] transition-all duration-500 group-hover:bg-[#5db8a5]"></div>
                <div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/30 to-transparent rounded-t-full"></div>
                <span className="relative flex items-center gap-3 text-black text-lg">
                  <span className="drop-shadow-sm tracking-wide font-extrabold">
                    Create your token
                  </span>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-black/10 rounded-full group-hover:bg-black/20 transition-all duration-300 group-hover:scale-110">
                    <ArrowRight 
                      size={18} 
                      strokeWidth={3}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </div>
                </span>
              </Link>

              <Link
                href="#how-it-works"
                className="group inline-flex items-center justify-center px-8 py-4 font-semibold text-gray-300 transition-all duration-300 rounded-2xl border border-white/10 hover:border-[#6fc7ba]/40 hover:text-white bg-white/2 hover:bg-[#6fc7ba]/5"
              >
                <span className="flex items-center gap-2">
                  Learn more
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </span>
              </Link>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Powered by
              </span>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#6fc7ba]/10 border border-[#6fc7ba]/30">
                <img src="/initia.png" alt="Initia" className="w-6 h-6" />
                <span className="font-semibold text-[#6fc7ba]">Initia</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs text-gray-500">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6fc7ba] animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
