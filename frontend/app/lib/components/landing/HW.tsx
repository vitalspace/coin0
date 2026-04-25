import { Circle, Pen, Rocket, ArrowRight } from 'lucide-react';

export default function HW () {
    return(
        <section className="relative py-24 px-4 bg-black overflow-hidden">
	<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#6fc7ba]/5 rounded-full blur-3xl"></div>
	
	<div className="relative max-w-6xl mx-auto">
		<div className="text-center mb-16 space-y-4">
			<div className="inline-flex">
				<div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
					<span className="text-sm font-semibold text-[#6fc7ba] tracking-wide uppercase">How it works</span>
				</div>
			</div>
			<h2 className="text-4xl sm:text-5xl font-bold">
				<span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
					Create your token in 
				</span>
				<span> </span>
				<span className="text-[#6fc7ba]">
					 3 simple steps
				</span>
			</h2>
		</div>

		<div className="grid md:grid-cols-3 gap-6">
			<div className="group relative">
				<div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
				<div className="relative h-full p-8 rounded-2xl bg-white/2 border border-white/10 backdrop-blur-sm hover:bg-white/4 hover:border-[#6fc7ba]/40 transition-all duration-300">
					<div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-[#6fc7ba]/20 border border-[#6fc7ba]/40">
						<span className="text-xl font-bold text-[#6fc7ba]">01</span>
					</div>
					<div className="mb-4 text-[#6fc7ba]">
						<Circle className="w-8 h-8" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">Choose your token</h3>
					<p className="text-gray-400 leading-relaxed">
						Select Initia as your blockchain and configure basic token parameters like name and symbol.
					</p>
				</div>
			</div>

			<div className="group relative">
				<div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
				<div className="relative h-full p-8 rounded-2xl bg-white/2 border border-white/10 backdrop-blur-sm hover:bg-white/4 hover:border-[#6fc7ba]/40 transition-all duration-300">
					<div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-[#6fc7ba]/20 border border-[#6fc7ba]/40">
						<span className="text-xl font-bold text-[#6fc7ba]">02</span>
					</div>
					<div className="mb-4 text-[#6fc7ba]">
						<Pen className="w-8 h-8" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">Customize</h3>
					<p className="text-gray-400 leading-relaxed">
						Set your token's details, upload an image, and configure supply. No coding required at all.
					</p>
				</div>
			</div>

			<div className="group relative">
				<div className="absolute -inset-0.5 bg-[#6fc7ba] rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
				<div className="relative h-full p-8 rounded-2xl bg-white/2 border border-white/10 backdrop-blur-sm hover:bg-white/4 hover:border-[#6fc7ba]/40 transition-all duration-300">
					<div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-[#6fc7ba]/20 border border-[#6fc7ba]/40">
						<span className="text-xl font-bold text-[#6fc7ba]">03</span>
					</div>
					<div className="mb-4 text-[#6fc7ba]">
						<Rocket className="w-8 h-8" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">Launch</h3>
					<p className="text-gray-400 leading-relaxed">
						Deploy your token with one click and start building your community immediately.
					</p>
				</div>
			</div>
		</div>

		<div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2">
			<ArrowRight className="w-10 h-10 text-[#6fc7ba]/30" />
		</div>
		<div className="hidden md:block absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2">
			<ArrowRight className="w-10 h-10 text-[#6fc7ba]/30" />
		</div>
	</div>
</section>

    )
}