import { PublicHeader } from "./PublicHeader";
import { CallToActionBanner } from "@/components/home/CallToActionBanner";
import { Footer } from "@/components/home/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <PublicHeader />

      <main className="flex-1 bg-surface-bg w-full">
        {children}
      </main>

      <CallToActionBanner />
      <Footer />
    </div>
  );
}
