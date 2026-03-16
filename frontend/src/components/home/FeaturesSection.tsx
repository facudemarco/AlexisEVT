import Image from "next/image";
import { Check } from "lucide-react";

const features = [
  {
    title: "Asesoría personalizada",
    description:
      "Visualiza todos nuestros productos y servicios y comunícate con nosotros para asesorarte con el proceso.",
    icon: "/resources/icon-headset.svg",
  },
  {
    title: "Asistencia médica",
    description:
      "Con asistencia médica vas a poder disfrutar de ese viaje que tanto querés hacer sin preocuparte por algún malestar, asistencia personalizada.",
    icon: "/resources/icon-shield.svg",
  },
  {
    title: "Información detallada",
    description:
      "Recibí la información de tu próximo viaje a detalle, no dejamos dudas sin resolver tanto en la previa como en el desarrollo y desenlace del viaje.",
    icon: "/resources/icon-info.svg",
  },
  {
    title: "Pagos flexibles",
    description:
      "Con solo dar una seña podes ir abonando haciendo pagos parciales hasta pocos días de salir y haciendolo por transferencia es SIN CARGO.",
    icon: "/resources/icon-card.svg",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-[#EFEFEF] relative z-30 flex flex-col items-center w-full px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-16 md:gap-y-6 max-w-[1400px] mx-auto w-full relative">
        {features.map((feature, idx) => {
          // Determine if it's the left or right column
          const isLeft = idx % 2 === 0;
          const isTopRow = idx < 2;

          return (
            <div
              key={idx}
              className="relative flex items-center mb-0"
            >
              {/* Left-side Icon (Headset/Info) */}
              {isLeft && (
                <div className="hidden md:flex absolute -left-28 w-14 h-14 items-center justify-center -translate-x-full">
                  <div className="relative w-12 h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* The Card */}
              <div className="flex-1 bg-white border border-[#D5D8DC] px-8 py-10 md:px-12 md:py-14 relative drop-shadow-sm w-full h-full flex flex-col">
                {/* Decorative Triangle Corners (Top Right and Bottom Right) */}
                {isLeft && isTopRow && (
                  <div className="absolute top-[-1px] right-[-1px] w-14 h-14 md:w-16 md:h-16 bg-[#1B5E86] clip-triangle-tr" />
                )}
                {isLeft && !isTopRow && (
                  <div className="absolute bottom-[-1px] right-[-1px] w-14 h-14 md:w-16 md:h-16 bg-[#1B5E86] clip-triangle-br" />
                )}
                {!isLeft && isTopRow && (
                  <div className="absolute top-[-1px] right-[-1px] w-14 h-14 md:w-16 md:h-16 bg-[#1B5E86] clip-triangle-tr" />
                )}
                {!isLeft && !isTopRow && (
                  <div className="absolute bottom-[-1px] right-[-1px] w-14 h-14 md:w-16 md:h-16 bg-[#1B5E86] clip-triangle-br" />
                )}

                <h3 className="text-[1.5rem] md:text-[1.8rem] leading-none mb-5 font-serif text-[#162D3D]">
                  {feature.title}
                </h3>
                <p className="text-[1rem] text-[#6E7A8A] leading-[1.7] w-full lg:w-[85%] pr-6">
                  {feature.description}
                </p>

                {/* Green Checkmark */}
                <div className="absolute bottom-8 right-8 md:bottom-10 md:right-10 text-[#00C853]">
                  <Check className="w-[1.4rem] h-[1.4rem] stroke-[2.5]" />
                </div>
              </div>

              {/* Right-side Icon (Shield/Card) */}
              {!isLeft && (
                <div className="hidden md:flex absolute -right-28 w-14 h-14 items-center justify-center translate-x-full">
                  <div className="relative w-12 h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
