"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";

export function HeroSection() {
  const { isAuthenticated, role, nombre } = useAuth();

  return (
    <section className="relative h-[650px] flex items-center bg-gray-900 overflow-hidden px-8 md:px-24">
      <video
        src="/resources/hero.mp4"
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Top Right: login / mi cuenta */}
      <div className="hidden md:block absolute top-8 right-8 md:top-12 md:right-12 z-20">
        {isAuthenticated && role === "vendedor" ? (
          <Link href="/mi-cuenta">
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-md shadow-lg flex items-center gap-2">
              Mi cuenta <User className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/admin/login">
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-md shadow-lg flex items-center gap-2">
              Iniciar sesión <User className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Center/Left Content */}
      <div className="relative z-20 text-left w-full max-w-3xl mt-16 md:mt-0">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight tracking-tight">
          Descubrí tu <br /> próxima aventura
        </h1>
        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-6 px-8 rounded-lg text-lg mt-2 shadow-lg w-fit">
          Ver opciones
        </Button>
      </div>

      {/* Bottom Left: Logo */}
      <div className="hidden md:block absolute bottom-8 left-8 md:bottom-12 md:left-24 z-20">
        <div className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
          <Image src="/resources/logo.png" alt="Alexis EVT Logo" fill sizes="120px" priority className="object-cover scale-110 mix-blend-multiply" />
        </div>
      </div>

      {/* Bottom Right: Links + optional username */}
      <div className="hidden md:flex absolute bottom-6 right-8 md:bottom-12 md:right-12 z-20 flex-col items-end gap-3 font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-4">
        {isAuthenticated && nombre && (
          <span className="text-base font-bold text-white/90 tracking-wide">{nombre} — Vendedor/a</span>
        )}
        <Link href="/cartelera" className="text-lg md:text-xl hover:text-gray-200 transition-colors tracking-wide bg-black/20 px-3 py-1 rounded-md backdrop-blur-sm border border-transparent hover:border-white/20">Cartelera</Link>
        <Link href="/quienes-somos" className="text-lg md:text-xl hover:text-gray-200 transition-colors tracking-wide bg-black/20 px-3 py-1 rounded-md backdrop-blur-sm border border-transparent hover:border-white/20">¿Quiénes somos?</Link>
        <Link href="/contacto" className="text-lg md:text-xl hover:text-gray-200 transition-colors tracking-wide bg-black/20 px-3 py-1 rounded-md backdrop-blur-sm border border-transparent hover:border-white/20">Contacto</Link>
      </div>
    </section>
  );
}
