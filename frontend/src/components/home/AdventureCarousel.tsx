"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const carouselItems = [
  {
    title: "San Martin de los Andes",
    image: "/resources/sanmartin.png",
  },
  {
    title: "Rio de Janeiro",
    image: "/resources/rio.png",
  },
  {
    title: "Buzios",
    image: "/resources/buzios.png",
  },
  {
    title: "Cataratas del Iguazú",
    image: "/resources/cataratas.png",
  },
  {
    title: "Mendoza",
    image: "/resources/mendoza.png",
  },
  {
    title: "Cuba",
    image: "/resources/cuba.png",
  },
];

export function AdventureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <section className="py-24 bg-[#EFEFEF] relative z-30 flex flex-col items-center w-full px-4 md:px-12">
      <div className="flex flex-col items-center w-full max-w-[1200px] mx-auto">
        <h4 className="text-[0.85rem] md:text-[1rem] tracking-[0.15em] font-black text-center mb-4 text-gray-900 uppercase">
          Tu próxima aventura
        </h4>
        <h2 className="text-3xl md:text-5xl font-black text-[#1B5E86] mb-12 text-center tracking-wide">
          {carouselItems[currentIndex].title}
        </h2>

        {/* Carousel Container */}
        <div className="relative w-full h-[300px] md:h-[500px] rounded-2xl md:rounded-[2rem] overflow-hidden drop-shadow-lg group bg-gray-200">
          {/* Images (Stacked for Fade Effect) */}
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Controls Overlay (Left) */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 stroke-[2.5] drop-shadow-md" />
          </button>

          {/* Controls Overlay (Right) */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 stroke-[2.5] drop-shadow-md" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {carouselItems.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all duration-1000 shadow-sm ${
                  currentIndex === slideIndex
                    ? "bg-[#1B5E86] scale-110"
                    : "bg-white/80 hover:bg-white"
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
