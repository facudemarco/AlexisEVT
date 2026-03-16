"use client";

import Image from "next/image";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Estructura de datos requerida para las reseñas
export interface Review {
  id: string;
  authorName: string;
  avatarUrl: string;
  rating: number; // 1 a 5
  text: string;
}

interface ReviewsSectionProps {
  // Cuando tengas los datos reales de la BD/API, puedes pasarlos aquí.
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  // Estado para llevar el control de cuáles IDs están expandidos
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Lógica de filtrado: Obtener sólo las valoraciones más altas (5 estrellas) y tomar un máximo de 6 para la grilla 3x2.
  const topReviews = reviews
    .filter((review) => review.rating >= 5)
    .slice(0, 6);

  const MAX_CHARS = 120; // Límite para considerar la tarjeta "corta" y requerir expansión

  return (
    <section className="py-24 bg-[#F8F9FA] relative z-30 flex flex-col items-center w-full px-6 md:px-16">
      <div className="max-w-[1200px] w-full mx-auto">
        <h2 className="text-[1.2rem] md:text-[1.5rem] tracking-[0.1em] font-black text-center mb-20 text-[#111827] uppercase">
          Algunas de nuestras reseñas
        </h2>

        {/* Grilla 3x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {topReviews.map((review) => {
            const isExpanded = expandedIds.has(review.id);
            const needsExpansion = review.text.length > MAX_CHARS;
            
            // Si está expandido o no necesita expansión, mostramos todo. Si no, cortamos y agregamos elipsis.
            const displayText = isExpanded || !needsExpansion 
              ? review.text 
              : `${review.text.substring(0, MAX_CHARS)}...`;

            return (
              <div
                key={review.id}
                className="relative bg-[#389EB9] rounded-sm px-8 pt-12 pb-8 flex flex-col items-center text-center drop-shadow-md border border-[#2B8199] transition-all duration-300"
              >
                {/* Avatar superpuesto (Absolute) */}
                <div className="absolute -top-10 w-20 h-20 rounded-full border-[3px] border-[#389EB9] bg-gray-300 overflow-hidden shadow-sm">
                  <Image
                    src={review.avatarUrl}
                    alt={`Avatar de ${review.authorName}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Estrellas */}
                <div className="flex space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-[#FFB800] text-[#FFB800]"
                          : "fill-transparent text-[#FFB800]"
                      }`}
                    />
                  ))}
                </div>

                {/* Nombre */}
                <h3 className="text-white font-bold text-[1.15rem] mb-3">
                  {review.authorName}
                </h3>

                {/* Texto de la reseña recortado/expandido */}
                <div className="flex flex-col items-center w-full">
                  <p className="text-white/90 text-[0.9rem] leading-[1.6] mb-2 transition-all duration-300">
                    &quot;{displayText}&quot;
                  </p>
                  
                  {/* Botón interactivo de Leer más/menos (Sólo se muestra si supera el límite) */}
                  {needsExpansion && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="mt-2 text-white/80 hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Leer menos <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Leer más <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
