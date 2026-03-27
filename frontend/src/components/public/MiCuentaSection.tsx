"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchApi } from "@/lib/api";
import { User, CalendarDays, MapPin, Phone, Mail, Pencil, LogOut } from "lucide-react";

interface Reserva {
  id: number;
  cliente_nombre?: string;
  pasajeros_adultos: number;
  pasajeros_menores: number;
  precio_total: number;
  estado: string;
  motivo_rechazo?: string;
  fecha_creacion: string;
  paquete?: {
    titulo_subtitulo: string;
    fecha_salida?: string;
    destino?: { nombre: string };
  };
}

const STATUS_STYLES: Record<string, string> = {
  Pendiente:  "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Aprobada:   "bg-green-100 text-green-800 border border-green-300",
  Rechazada:  "bg-red-100 text-red-800 border border-red-300",
};

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function MiCuentaSection() {
  const { isAuthenticated, role, nombre, logout } = useAuth();
  const [tab, setTab] = useState<"reservas" | "perfil">("reservas");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || role !== "vendedor") return;
    setLoading(true);
    fetchApi("/bookings/")
      .then(setReservas)
      .catch(() => setReservas([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, role]);

  if (!isAuthenticated || role !== "vendedor") return null;

  return (
    <section id="mi-cuenta" className="relative w-full overflow-hidden bg-white">
      {/* Subtle background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/resources/hero_cartelera.png')" }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1D5D8C] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Bienvenido/a</p>
              <p className="font-bold text-gray-900 text-lg leading-tight">{nombre}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-8 gap-0.5">
          {(["reservas", "perfil"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? "bg-white shadow text-[#1D5D8C]" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t === "reservas" ? "Mis Reservas" : "Perfil"}
            </button>
          ))}
        </div>

        {/* Reservas Tab */}
        {tab === "reservas" && (
          <div className="w-full">
            {loading && (
              <p className="text-gray-400 text-center py-10 text-sm">Cargando reservas...</p>
            )}
            {!loading && reservas.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No tenés reservas registradas.</p>
              </div>
            )}
            {!loading && reservas.length > 0 && (
              <div className="flex flex-col gap-3">
                {reservas.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {r.cliente_nombre || "Sin nombre"}{" "}
                        <span className="text-gray-400 font-normal text-xs">×{r.pasajeros_adultos + r.pasajeros_menores}</span>
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        {r.paquete?.destino?.nombre && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {r.paquete.destino.nombre}
                          </span>
                        )}
                        {r.paquete?.fecha_salida && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {fmt(r.paquete.fecha_salida)}
                          </span>
                        )}
                      </div>
                      {r.estado === "Rechazada" && r.motivo_rechazo && (
                        <p className="text-xs text-red-500 mt-1">Motivo: {r.motivo_rechazo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[r.estado] ?? "bg-gray-100 text-gray-700"}`}>
                        {r.estado}
                      </span>
                      <span className="text-sm font-bold text-[#1D5D8C]">
                        ${r.precio_total?.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Perfil Tab */}
        {tab === "perfil" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm max-w-md">
            <h3 className="font-bold text-gray-900 text-lg mb-6">Mis datos</h3>
            <div className="flex flex-col gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#1D5D8C]" />
                <span>{nombre}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-6">Para actualizar tus datos, contactá al administrador de la agencia.</p>
          </div>
        )}
      </div>
    </section>
  );
}
