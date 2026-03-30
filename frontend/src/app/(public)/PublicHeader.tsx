"use client";

import { Menu, UserCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function PublicHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { isAuthenticated, role } = useAuth();

  const headerClasses = `absolute top-0 w-full z-50 py-4 ${isHome ? 'md:hidden' : ''}`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center p-0 overflow-hidden shadow-xl border-[3px] border-brand-primary relative">
             <Image src="/resources/logo.png" alt="Alexis EVT Logo" fill sizes="120px" className="object-cover" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/"><span className="bg-sky-200 hover:bg-sky-300 text-gray-900 px-6 py-2.5 rounded-xl font-bold transition-colors">Inicio</span></Link>
          <Link href="/cartelera"><span className="bg-sky-200 hover:bg-sky-300 text-gray-900 px-6 py-2.5 rounded-xl font-bold transition-colors">Cartelera</span></Link>
          <Link href="/quienes-somos"><span className="bg-sky-200 hover:bg-sky-300 text-gray-900 px-6 py-2.5 rounded-xl font-bold transition-colors">¿Quiénes somos?</span></Link>
          <Link href="/contacto"><span className="bg-sky-200 hover:bg-sky-300 text-gray-900 px-6 py-2.5 rounded-xl font-bold transition-colors">Contacto</span></Link>
        </nav>

        <div className="flex items-center">
          {isAuthenticated ? (
            role === "admin" ? (
              <Link href="/admin">
                <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 py-5 hidden md:flex text-md shadow-md gap-2">
                  <UserCircle className="w-5 h-5" /> Panel de control
                </Button>
              </Link>
            ) : role === "vendedor" ? (
              <Link href="/mi-cuenta">
                <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 py-5 hidden md:flex text-md shadow-md gap-2">
                  <UserCircle className="w-5 h-5" /> Mi cuenta
                </Button>
              </Link>
            ) : null
          ) : (
            <Link href="/admin/login">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 py-5 hidden md:flex text-md shadow-md">
                 Iniciar sesión <UserCircle className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 ml-4">
            <Menu className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </header>
  );
}
