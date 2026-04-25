export default function Background() {
  return (
    <>
      <div className="absolute inset-0 bg-linear-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </>
  );
}
