"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowUp, MessageCircle } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-white text-black w-full relative z-40 border-t-8 border-[#2B8199] pt-12 pb-6 px-4 md:px-16 overflow-hidden">
      
      {/* Contenedor Principal en 4 o 5 Columnas Flex */}
      <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row justify-between lg:items-start gap-12 lg:gap-8 relative pb-16">
        
        {/* Columna 1: Logo */}
        <div className="flex justify-center lg:justify-start lg:w-[15%]">
          <div className="relative w-40 h-40">
            <Image
              src="/resources/logo.png"
              alt="Alexis EVT Logo"
              fill
              sizes="160px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Separador vertical desktop */}
        <div className="hidden lg:block w-[1px] bg-black/50 mx-2 self-stretch min-h-[150px] relative">
           <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
           <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
        </div>

        {/* Columna 2: Opciones de Viajes */}
        <div id="viajes" className="flex flex-col items-center lg:items-start lg:w-[20%] text-center lg:text-left">
          <h3 className="flex items-center gap-3 font-bold text-[1.2rem] mb-6 whitespace-nowrap">
             <Image src="/resources/opciones-viajes.svg" alt="Opciones de viajes" width={28} height={28} className="object-contain" />
             Opciones de viajes
          </h3>
          <ul className="space-y-4 text-[1rem]">
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <Link href="/categorias/miniturismo" className="hover:underline">
                MiniTurismo
              </Link>
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <Link href="/categorias/argentina" className="hover:underline">
                Argentina
              </Link>
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <Link href="/categorias/brasil" className="hover:underline">
                Brasil
              </Link>
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <Link href="/categorias/otros-internacionales" className="hover:underline">
                Otros Internacionales
              </Link>
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <Link href="/categorias/elegi-donde-viajar" className="hover:underline">
                Elegí dónde viajar
              </Link>
            </li>
          </ul>
        </div>

        {/* Separador vertical desktop */}
        <div className="hidden lg:block w-[1px] bg-black/50 mx-2 self-stretch min-h-[150px] relative">
           <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
           <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
        </div>

        {/* Columna 3: Canales de Comunicación */}
        <div id="contacto" className="flex flex-col items-center lg:items-start lg:w-[35%] text-center lg:text-left">
           <h3 className="flex items-center justify-center lg:justify-start gap-3 font-bold text-[1.2rem] mb-4">
             <Image src="/resources/canales-comunicacion.svg" alt="Canales de comunicación" width={28} height={28} className="object-contain" />
             Canales de comunicación
          </h3>
          <p className="mb-6 text-[1rem]">Ponete en contacto con nosotros via...</p>
          <ul className="space-y-4 text-[1rem]">
            <li className="flex items-center justify-center lg:justify-start gap-2 group">
               <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
               Whatsapp (11-2172-1486)
               {/* Usamos un ícono customizado de whatsapp simple o podemos usar mensaje como fallback */}
               <a href="https://wa.me/541121721486" target="_blank" rel="noopener noreferrer">
                 <MessageCircle className="w-5 h-5 ml-2 cursor-pointer transition-transform group-hover:scale-110" />
               </a>
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              Email - comercial.alexisevt@gmail.com
                {/* Usamos un ícono customizado de mail simple o podemos usar mensaje como fallback */}
                <a href="mailto:comercial.alexisevt@gmail.com">
                  <Mail className="w-5 h-5 ml-2 cursor-pointer transition-transform group-hover:scale-110" />
                </a>
            </li>
          </ul>
        </div>

        {/* Separador vertical desktop */}
        <div className="hidden lg:block w-[1px] bg-black/50 mx-2 self-stretch min-h-[150px] relative">
           <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
           <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-black"></div>
        </div>

        {/* Columna 4: Mapa del Sitio */}
        <div className="flex flex-col items-center lg:items-start lg:w-[15%] text-center lg:text-left">
          <h3 className="flex items-center gap-3 font-bold text-[1.2rem] mb-6">
             <Image src="/resources/mapa-sitio.svg" alt="Mapa del sitio" width={28} height={28} className="object-contain" />
             Mapa del sitio
          </h3>
          <nav className="flex flex-col space-y-4 w-full">
            <button onClick={scrollToTop} className="text-left underline underline-offset-4 hover:text-gray-600 transition-colors">Inicio</button>
            <Link href="/quienes-somos" className="underline underline-offset-4 hover:text-gray-600 transition-colors">¿Quienes somos?</Link>
            <Link href="/contacto" className="underline underline-offset-4 hover:text-gray-600 transition-colors">Contacto</Link>
            <Link href="/cartelera" className="underline underline-offset-4 hover:text-gray-600 transition-colors">Cartelera</Link>
          </nav>
        </div>

        {/* Columna 5: Redes y Flecha Arriba */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-6 lg:gap-4 lg:w-[10%]">
          {/* Botón flecha arriba */}
          <button 
             onClick={scrollToTop}
             className="w-10 h-10 bg-black text-white hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors mb-2"
             aria-label="Volver arriba"
          >
             <ArrowUp className="w-6 h-6 stroke-[3]" />
          </button>
          
          {/* Instagram Avatar G */}
          <Link href="https://www.instagram.com/alexis_evt/" className="w-10 h-10 overflow-hidden rounded-full hover:scale-110 transition-transform relative">
             <Image 
               src="/resources/instagram.svg"
               alt="Instagram"
               fill
               className="object-contain"
             />
          </Link>

          {/* Facebook */}
           <Link href="https://www.facebook.com/profile.php?id=100084720687325" className="w-10 h-10 overflow-hidden rounded-full hover:scale-110 transition-transform relative">
             <Image 
               src="/resources/facebook.svg"
               alt="Facebook"
               fill
               className="object-contain"
             />
          </Link>
        </div>

      </div>

      {/* CopyRight / Desarrollado por */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between text-[0.85rem] font-medium border-t border-black/10 pt-4 mt-8">
        <p>Todos los derechos reservados 2026 ® AlexisEVT</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          Desarrollado por: 
          <Link href="https://iwebtecnology.com" target="_blank" className="relative block w-24 h-8">
            <Image 
              src="/resources/iweb.svg"
              alt="Desarrollado por iWEB"
              fill
              className="object-contain"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
