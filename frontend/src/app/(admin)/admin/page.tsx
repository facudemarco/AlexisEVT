"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { fetchApi } from "@/lib/api";
import { Package, FileText, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reserva {
  id: number;
  cliente_nombre?: string;
  cliente_email?: string;
  pasajeros_adultos: number;
  pasajeros_menores: number;
  precio_total: number;
  fecha_creacion: string;
  paquete?: {
    titulo_subtitulo: string;
    fecha_salida?: string;
    destino?: { nombre: string };
  };
}

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { nombre } = useAuth();
  const [tab, setTab] = useState<"resumen" | "pendientes">("resumen");
  const [paquetesCount, setPaquetesCount] = useState<number | null>(null);
  const [pendientes, setPendientes] = useState<Reserva[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);

  useEffect(() => {
    fetchApi("/packages/").then((data) => setPaquetesCount(data.length)).catch(() => setPaquetesCount(0));
  }, []);

  useEffect(() => {
    if (tab === "pendientes" && pendientes.length === 0) {
      setLoadingPendientes(true);
      fetchApi("/bookings/?estado=Pendiente")
        .then((data) => setPendientes(data))
        .catch(() => setPendientes([]))
        .finally(() => setLoadingPendientes(false));
    }
  }, [tab]);

  return (
    <div className="p-8 relative min-h-full flex flex-col">
      {/* Saludo y título */}
      <p className="text-gray-600 text-lg mb-1">Hola! 👋 {nombre}</p>
      <h1 className="text-5xl font-black text-gray-900 mb-8">Dashboard</h1>

      {/* Tabs */}
      <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-6 self-start gap-0.5">
        {(["resumen", "pendientes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
              tab === t ? "bg-white shadow text-[#1D5D8C]" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {t === "resumen" ? "Resumen" : "Pendientes"}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {/* Paquetes activos */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-8 py-7 shadow-sm">
            <div className="flex items-center gap-4 text-[#1D5D8C]">
              <div className="w-12 h-12 bg-[#1D5D8C] rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-[#1D5D8C]">Paquetes activos</span>
            </div>
            <div className="w-14 h-14 bg-[#1D5D8C] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-white">{paquetesCount ?? "—"}</span>
            </div>
          </div>

          {/* Reservas pendientes */}
          <Link href="/admin/bookings?estado=Pendiente">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-8 py-7 shadow-sm hover:border-[#1D5D8C]/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-4 text-[#1D5D8C]">
                <div className="w-12 h-12 bg-[#1D5D8C] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-[#1D5D8C]">Reservas pendientes</span>
              </div>
              <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-black text-white">{pendientes.length > 0 ? pendientes.length : "—"}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {tab === "pendientes" && (
        <div className="w-full max-w-2xl">
          {loadingPendientes ? (
            <div className="flex items-center gap-3 text-gray-400 py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando reservas pendientes...</span>
            </div>
          ) : pendientes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 shadow-sm">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No hay reservas pendientes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  {pendientes.length} reserva{pendientes.length !== 1 ? "s" : ""} pendiente{pendientes.length !== 1 ? "s" : ""}
                </span>
                <Link href="/admin/bookings" className="text-xs text-[#1D5D8C] font-semibold hover:underline">
                  Ver todas →
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {pendientes.map((r) => (
                  <li key={r.id}>
                    <Link
                      href="/admin/bookings"
                      className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {r.cliente_nombre || "Sin nombre"}{" "}
                          <span className="text-gray-400 font-normal text-xs">#{r.id}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.paquete?.destino?.nombre ?? "—"} · Salida {fmt(r.paquete?.fecha_salida)} · {r.pasajeros_adultos + r.pasajeros_menores} pasajero{r.pasajeros_adultos + r.pasajeros_menores !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <span className="text-sm font-bold text-[#1D5D8C]">
                          ${r.precio_total?.toLocaleString("es-AR")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
