import { PlaneTakeoff, Menu, UserCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PublicHeader } from "./PublicHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navbar Pública */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 bg-surface-bg w-full">
        {children}
      </main>

      {/* Footer Público */}
      {/* El nuevo Footer ahora se renderiza dinámicamente desde page.tsx */}
    </div>
  );
}
