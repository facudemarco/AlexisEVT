import Image from "next/image";
import { Check } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
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

/* Left column icons (features at index 0 and 2) */
const leftIcons = [features[0], features[2]];
/* Right column icons (features at index 1 and 3) */
const rightIcons = [features[1], features[3]];

function FeatureCard({
  feature,
  trianglePosition,
}: {
  feature: Feature;
  trianglePosition: "tr" | "br";
}) {
  return (
    <div className="bg-white border border-[#D5D8DC] px-8 py-10 md:px-12 md:py-14 relative drop-shadow-sm w-full h-full flex flex-col">
      {/* Decorative Triangle Corner */}
      <div
        className={`absolute w-14 h-14 md:w-16 md:h-16 bg-[#1B5E86] right-[-1px] ${
          trianglePosition === "tr"
            ? "top-[-1px] clip-triangle-tr"
            : "bottom-[-1px] clip-triangle-br"
        }`}
      />

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
  );
}

function IconCell({ feature }: { feature: Feature }) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <Image
          src={feature.icon}
          alt={feature.title}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 bg-[#EFEFEF] relative z-30 flex flex-col items-center w-full px-6 md:px-16">
      {/*
        xl+: 3-column grid → [left-icons] [2-col cards] [right-icons]
        md–lg: 2-column cards only (icons hidden)
        mobile: single-column cards
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[auto_1fr_1fr_auto] gap-6 md:gap-x-10 xl:gap-x-8 md:gap-y-6 max-w-[1400px] mx-auto w-full">
        {/* ── Row 1 ── */}

        {/* Left icon (xl+ only) */}
        <div className="hidden xl:flex items-center justify-center row-start-1 col-start-1 pr-2">
          <IconCell feature={leftIcons[0]} />
        </div>

        {/* Card: Asesoría personalizada */}
        <div className="xl:col-start-2">
          <FeatureCard feature={features[0]} trianglePosition="tr" />
        </div>

        {/* Card: Asistencia médica */}
        <div className="xl:col-start-3">
          <FeatureCard feature={features[1]} trianglePosition="tr" />
        </div>

        {/* Right icon (xl+ only) */}
        <div className="hidden xl:flex items-center justify-center row-start-1 col-start-4 pl-2">
          <IconCell feature={rightIcons[0]} />
        </div>

        {/* ── Row 2 ── */}

        {/* Left icon (xl+ only) */}
        <div className="hidden xl:flex items-center justify-center xl:row-start-2 col-start-1 pr-2">
          <IconCell feature={leftIcons[1]} />
        </div>

        {/* Card: Información detallada */}
        <div className="xl:col-start-2">
          <FeatureCard feature={features[2]} trianglePosition="br" />
        </div>

        {/* Card: Pagos flexibles */}
        <div className="xl:col-start-3">
          <FeatureCard feature={features[3]} trianglePosition="br" />
        </div>

        {/* Right icon (xl+ only) */}
        <div className="hidden xl:flex items-center justify-center xl:row-start-2 col-start-4 pl-2">
          <IconCell feature={rightIcons[1]} />
        </div>
      </div>
    </section>
  );
}
