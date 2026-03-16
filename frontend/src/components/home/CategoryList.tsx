import Image from "next/image";

const categories = [
  {
    title: "Miniturismo",
    image: "/resources/miniturismo.png",
  },
  {
    title: "Argentina",
    image: "/resources/argentina.png",
  },
  {
    title: "Brasil",
    image: "/resources/brasil.png",
  },
  {
    title: "Otros Internacionales",
    image: "/resources/internacionales.png",
  },
];

export function CategoryList() {
  return (
    <section className="py-20 -mt-16 relative z-30 flex flex-col items-center w-full">
      <div className="bg-white/95 backdrop-blur-sm w-full py-16 px-4 md:px-12 shadow-sm rounded-t-[30px]">
        <h2 className="text-xl md:text-2xl tracking-[0.1em] font-black text-center mb-10 text-gray-900 uppercase">
          Todas nuestras opciones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group cursor-pointer relative h-[220px] md:h-[260px] w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg transition-transform hover:-translate-y-2"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
