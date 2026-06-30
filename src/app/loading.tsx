import { GooeyLoader } from "@/components/ui/loader-10";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-sans">
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay z-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-0" />
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        <GooeyLoader />
      </div>
    </div>
  );
}
