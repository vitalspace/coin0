'use client';

import Link from 'next/link';
import { ArrowRight, Shield, CircleCheck, Clock } from 'lucide-react';

export default function Cta () {
    return(
        <section className="relative py-24 px-4 overflow-hidden">
	<div className="absolute inset-0 bg-linear-to-b from-black via-[#6fc7ba]/10 to-black"></div>
	<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6fc7ba]/10 rounded-full blur-3xl"></div>
	
	<div className="relative max-w-4xl mx-auto text-center space-y-8">
		<div className="inline-flex">
			<div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/50 border border-[#6fc7ba]/50 backdrop-blur-sm shadow-[0_0_30px_rgba(111,199,186,0.2)]">
				<span className="relative flex h-2.5 w-2.5">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6fc7ba] opacity-75"></span>
					<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6fc7ba]"></span>
				</span>
				<span className="text-sm font-semibold text-[#6fc7ba] tracking-wide uppercase">Ready to launch?</span>
			</div>
		</div>

		<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
			<span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
				Start creating your
			</span>
			<br />
			<span className="text-[#6fc7ba]">
				token today
			</span>
		</h2>

		<p className="text-xl text-gray-400 max-w-2xl mx-auto">
			Join thousands of creators who have launched their tokens on Initia.
			No coding required, just your creativity.
		</p>

    <div className="pt-4">
      <Link href="/create-coin" className="group relative inline-flex items-center gap-3 px-12 py-6 font-bold transition-all duration-300 rounded-full overflow-hidden hover:scale-105 shadow-[0_0_50px_rgba(111,199,186,0.3)] hover:shadow-[0_0_70px_rgba(111,199,186,0.5)]">
        <div className="absolute inset-0 bg-[#6fc7ba] transition-all duration-500 group-hover:bg-[#5db8a5]"></div>
        <div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/30 to-transparent rounded-t-full"></div>
        <span className="relative flex items-center gap-3 text-black text-xl">
          <span className="drop-shadow-sm tracking-wide font-extrabold">Launch your token</span>
          <div className="relative flex items-center justify-center w-8 h-8 bg-black/20 rounded-full group-hover:bg-black/30 transition-all duration-300 group-hover:scale-110">
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </span>
      </Link>
    </div>

		<div className="flex items-center justify-center gap-8 pt-8 text-gray-500">
			<div className="flex items-center gap-2">
				<Shield className="w-5 h-5 text-[#6fc7ba]" />
				<span className="text-sm">Secure deployment</span>
			</div>
			<div className="flex items-center gap-2">
				<CircleCheck className="w-5 h-5 text-[#6fc7ba]" />
				<span className="text-sm">No coding needed</span>
			</div>
			<div className="flex items-center gap-2">
				<Clock className="w-5 h-5 text-[#6fc7ba]" />
				<span className="text-sm">Under 5 minutes</span>
			</div>
		</div>
	</div>
</section>

    )
}