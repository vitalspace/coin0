interface Props {
  creationFee: string;
}

export default function TokenHeader({ creationFee }: Props) {
  return (
    <div className="text-center mb-8 space-y-3 mt-6">
      <div className="inline-flex">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#6fc7ba]/30 backdrop-blur-sm">
          <img src="/initia.png" alt="Initia" className="w-4 h-4" />
          <span className="text-xs font-semibold text-[#6fc7ba] tracking-wide">
            Initia Network
          </span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold">
        <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
          Create your
        </span>
        <span className="text-[#6fc7ba]"> token</span>
      </h1>
      <p className="text-gray-400 text-base">Deploy your token on the Initia Blockchain</p>
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-gray-500">Creation fee:</span>
        <span className="text-[#6fc7ba] font-bold">{creationFee} Initia</span>
      </div>
    </div>
  );
}