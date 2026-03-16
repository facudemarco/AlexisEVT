import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function CallToActionBanner() {
  // Número de WhatsApp (Formato internacional sin el "+")
  const whatsappNumber = "5491121721486"; 
  const defaultMessage = encodeURIComponent("¡Hola! Me gustaría recibir información sobre viajes y turismo.");

  return (
    <section className="bg-[#2B8199] w-full py-8 px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 z-30 relative">
      <h2 className="text-white text-2xl md:text-3xl font-medium text-center md:text-left">
        Tu próxima aventura empieza acá...
      </h2>
      
      <Link 
        href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#5FD068] hover:bg-[#4EBA57] text-white rounded-full px-12 py-3 flex items-center gap-3 transition-colors duration-300 drop-shadow-md group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
        <span className="font-semibold text-[1.1rem]">Enviar Whatsapp</span>
      </Link>
    </section>
  );
}
