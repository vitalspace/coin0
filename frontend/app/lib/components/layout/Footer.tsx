'use client';

import Link from 'next/link';
import { X, PlayCircle, GitBranch } from 'lucide-react';

export default function Footer() {
    return(
        <footer className="relative bg-black border-t border-white/5">
	<div className="absolute inset-0 bg-linear-to-t from-[#6fc7ba]/5 to-transparent pointer-events-none"></div>
	
	<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div className="grid md:grid-cols-4 gap-12">
			<div className="md:col-span-2 space-y-6">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-[#6fc7ba]/20 border border-[#6fc7ba]/40 flex items-center justify-center group-hover:bg-[#6fc7ba]/30 transition-colors">
          <img src="/initia.png" alt="Coin0" className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-white group-hover:text-[#6fc7ba] transition-colors">Coin0</span>
      </Link>
				<p className="text-gray-400 max-w-sm leading-relaxed">
					Create your memecoin in minutes without code. Deploy on Kaspa and start building your community today.
				</p>
				<div className="flex items-center gap-4">
					<Link href="/" aria-label="Follow us on Twitter" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#6fc7ba] hover:border-[#6fc7ba]/40 hover:bg-[#6fc7ba]/10 transition-all">
						<X size={20} />
					</Link>
					<Link href="/" aria-label="Watch our videos on YouTube" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#6fc7ba] hover:border-[#6fc7ba]/40 hover:bg-[#6fc7ba]/10 transition-all">
						<PlayCircle size={20} />
					</Link>
					<Link href="/" aria-label="Visit our GitHub repository" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#6fc7ba] hover:border-[#6fc7ba]/40 hover:bg-[#6fc7ba]/10 transition-all">
						<GitBranch size={20} />
					</Link>
				</div>
			</div>

			<div>
				<h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Product</h4>
				<ul className="space-y-4">
					<li><Link href="/create-coin" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Create Token</Link></li>
					<li><Link href="/tokens" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Explore Tokens</Link></li>
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Documentation</Link></li>
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Pricing</Link></li>
				</ul>
			</div>

			<div>
				<h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Resources</h4>
				<ul className="space-y-4">
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Help Center</Link></li>
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Blog</Link></li>
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Community</Link></li>
					<li><Link href="/" className="text-gray-400 hover:text-[#6fc7ba] transition-colors">Contact</Link></li>
				</ul>
			</div>
		</div>

		<div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
			<p className="text-sm text-gray-500">
				© 2026 Coin0. All rights reserved. Powered by <span className="text-[#6fc7ba]">Kaspa</span>.
			</p>
			<div className="flex items-center gap-6 text-sm text-gray-500">
				<Link href="/" className="hover:text-[#6fc7ba] transition-colors">Privacy Policy</Link>
				<Link href="/" className="hover:text-[#6fc7ba] transition-colors">Terms of Service</Link>
			</div>
		</div>
	</div>
</footer>

    )
}