import Image from "next/image";

export const revalidate = 0;

interface Cartel {
  id: number;
  nombre: string;
  periodo: string;
  imagen_url: string;
}

const PERIODOS_ORDER = ["MiniTurismo", "Argentina", "Brasil", "Internacional"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const MEDIA_BASE = API_BASE.replace("/api/v1", "");

function resolveImageUrl(url: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${MEDIA_BASE}${url}`;
}

async function getCarteles(): Promise<Cartel[]> {
  try {
    const res = await fetch(`${API_BASE}/cartelera/`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");
    return (await res.json()) as Cartel[];
  } catch {
    return [];
  }
}

export default async function CarteleraPage() {
  const carteles = await getCarteles();

  const grouped: Record<string, Cartel[]> = {};
  for (const p of PERIODOS_ORDER) grouped[p] = [];
  carteles.forEach((c) => {
    if (!grouped[c.periodo]) grouped[c.periodo] = [];
    grouped[c.periodo].push(c);
  });

  const activePeriods = Object.keys(grouped)
    .filter((p) => grouped[p].length > 0)
    .sort((a, b) => {
      const ai = PERIODOS_ORDER.indexOf(a);
      const bi = PERIODOS_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

  return (
    /* This page is rendered inside (public)/layout.tsx which wraps with PublicHeader + Footer */
    <div className="relative w-full min-h-screen bg-white">
      {/* Background hero image: full-page, low opacity, watermark effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/resources/hero_cartelera.png"
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
        />
      </div>

      {/* Content on top of background */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-16">

        {/* Page title - left aligned */}
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900">Cartelera</h1>
        </div>

        {activePeriods.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">
            Aún no hay carteles publicados.
          </div>
        )}

        {activePeriods.map((periodo, index) => (
          <div key={periodo} className="w-full flex flex-col items-center gap-8">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1D5D8C] uppercase tracking-wider text-center"
              style={{ fontFamily: "serif", fontStyle: "italic" }}
            >
              {periodo}
            </h2>

            <div className="w-full flex flex-col items-center gap-12">
              {grouped[periodo].map((cartel) => (
                <div
                  key={cartel.id}
                  className="relative w-full max-w-md aspect-[3/4] overflow-hidden rounded-md shadow-lg"
                >
                  <Image
                    src={resolveImageUrl(cartel.imagen_url)}
                    alt={cartel.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {index < activePeriods.length - 1 && (
              <div className="w-full max-w-3xl h-[1px] bg-gray-700 mt-8 opacity-70" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
