"use client";

import { PublicHeader } from "@/app/(public)/PublicHeader";
import { CallToActionBanner } from "@/components/home/CallToActionBanner";
import { Footer } from "@/components/home/Footer";

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Same video hero header as cartelera */}
      <div className="relative h-[180px] md:h-[220px] bg-gray-900 overflow-hidden flex-shrink-0">
        <video
          src="/resources/hero.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/30" />
        <PublicHeader />
      </div>

      <main className="flex-1 bg-white w-full">
        {children}
      </main>

      <CallToActionBanner />
      <Footer />
    </div>
  );
}
