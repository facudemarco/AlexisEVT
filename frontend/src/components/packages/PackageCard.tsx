import Image from "next/image";
import { Calendar, Sun, Moon, Utensils, Building2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Hotel {
  id: number;
  nombre: string;
  estrellas?: number;
  ubicacion?: string;
}

interface Package {
  id: number;
  destino: { nombre: string };
  categoria: { nombre: string };
  titulo_subtitulo: string;
  fecha_salida: string;
  fecha_regreso: string;
  duracion_dias: number;
  duracion_noches: number;
  precio_base: number;
  estado: boolean;
  imagen_url?: string;
  regimen?: string;
  gastos_reserva: number;
  salidas_diarias: boolean;
  hoteles: Hotel[];
}

export function PackageCard({ pkg }: { pkg: Package }) {
  // Format dates or use "Salidas diarias"
  const formattedDate = pkg.salidas_diarias
    ? "Salidas diarias"
    : format(new Date(pkg.fecha_salida), "dd/MM/yyyy");

  // Format currency
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);

  // Default fallback image if none provided
  const bgImage = pkg.imagen_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";

  return (
    <div className="group relative w-full rounded-2xl overflow-hidden shadow-lg h-[400px] flex flex-col justify-end">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={pkg.destino?.nombre || "Destino"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Full overlay mask as defined in the Figma to make text readable */}
        <div className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 md:p-6 flex flex-col justify-end text-white h-full">
        {/* Title Section */}
        <div className="mb-2">
          <h3 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-0.5 leading-tight">
            {pkg.destino?.nombre}
          </h3>
          <p className="text-[16px] md:text-[18px] font-bold opacity-90 border-b border-white/50 pb-2 mb-4 w-fit pr-8">
            {pkg.titulo_subtitulo}
          </p>
        </div>

        {/* Details Flex Grid */}
        <div className="flex text-[13px] md:text-[14px] mb-6 font-medium">
          <div className="flex-1 space-y-3 pr-4 border-r border-white/40">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-90" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 opacity-90" />
              <span>{pkg.regimen || "No incluye comidas"}</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-[2px] opacity-90">
                <Sun className="w-[14px] h-[14px] bg-transparent z-10" />
                <Moon className="w-[14px] h-[14px] bg-transparent" />
              </div>
              <span>
                {pkg.duracion_dias} días, {pkg.duracion_noches} noche
                {pkg.duracion_noches !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 opacity-90" />
              <span className="truncate">
                {pkg.hoteles && pkg.hoteles.length > 0
                  ? pkg.hoteles[0].nombre
                  : "Alojamiento no especificado"}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="text-[32px] md:text-[38px] font-bold leading-none tracking-tight">
              {formatPrice(pkg.precio_base).replace('$', '$ ')}.-
            </div>
            {pkg.gastos_reserva > 0 && (
              <div className="text-[11px] font-semibold opacity-90 mt-1.5 ml-1">
                + {formatPrice(pkg.gastos_reserva).replace('$', '$ ')} de gastos de reserva
              </div>
            )}
          </div>
          
          <Link href={`/paquetes/${pkg.id}`}>
            <button className="bg-[#1D5D8C] hover:bg-[#164a70] text-white px-5 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm md:text-md transition-colors shadow-md">
              Ver más...
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
