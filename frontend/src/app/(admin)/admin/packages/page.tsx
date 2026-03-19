"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { Pencil, Trash2, Plus, ListFilter } from "lucide-react";

interface Paquete {
  id: number;
  destino?: { nombre: string };
  categoria?: { nombre: string };
  fecha_salida?: string;
  tipo_salidas: string;
  duracion_noches: number;
  hotel_detalles?: { hotel?: { nombre: string } }[];
  precio_base: number;
  moneda: string;
}

function formatFecha(p: Paquete) {
  if (p.tipo_salidas === "DIARIAS") return "—";
  if (!p.fecha_salida) return "—";
  const [y, m, d] = p.fecha_salida.split("-");
  return `${d}/${m}/${y}`;
}

function formatPrecio(p: Paquete) {
  const sym = p.moneda === "ARS" ? "$" : "U$D ";
  return `${sym}${Number(p.precio_base).toLocaleString("es-AR")}`;
}

export default function PackagesAdminPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDestino, setFiltroDestino] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const load = () => {
    setLoading(true);
    fetchApi("/packages/")
      .then(setPaquetes)
      .catch(() => setPaquetes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const destinos = useMemo(() => {
    const nombres = paquetes.map((p) => p.destino?.nombre).filter(Boolean) as string[];
    return Array.from(new Set(nombres));
  }, [paquetes]);

  const filtered = useMemo(() => {
    return paquetes.filter((p) => {
      if (filtroDestino && p.destino?.nombre !== filtroDestino) return false;
      if (filtroFechaDesde && p.fecha_salida && p.fecha_salida < filtroFechaDesde) return false;
      if (filtroFechaHasta && p.fecha_salida && p.fecha_salida > filtroFechaHasta) return false;
      return true;
    });
  }, [paquetes, filtroDestino, filtroFechaDesde, filtroFechaHasta]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este paquete?")) return;
    await fetchApi(`/packages/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 md:p-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-black text-gray-900">Paquetes</h1>
        <a
          href="/admin/packages/new"
          className="flex items-center gap-1 text-[#1D5D8C] font-semibold text-base hover:underline"
        >
          Agregar paquete <Plus className="w-4 h-4" />
        </a>
      </div>

      {/* Filtros */}
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destino</label>
          <select
            value={filtroDestino}
            onChange={(e) => setFiltroDestino(e.target.value)}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#1D5D8C]"
          >
            <option value="">Todos los destinos</option>
            {destinos.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha de salida</label>
          <input
            type="date"
            value={filtroFechaDesde}
            onChange={(e) => setFiltroFechaDesde(e.target.value)}
            placeholder="Todas las fechas"
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#1D5D8C]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha de salida</label>
          <input
            type="date"
            value={filtroFechaHasta}
            onChange={(e) => setFiltroFechaHasta(e.target.value)}
            placeholder="Todas las fechas"
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#1D5D8C]"
          />
        </div>

        <button
          onClick={() => { setFiltroDestino(""); setFiltroFechaDesde(""); setFiltroFechaHasta(""); }}
          className="h-9 px-3 flex items-center gap-1 text-gray-500 hover:text-[#1D5D8C] transition-colors"
          title="Limpiar filtros"
        >
          <ListFilter className="w-5 h-5" />
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#1D5D8C] text-white">
            <tr>
              <th className="px-5 py-4 text-left font-bold text-base">Destino</th>
              <th className="px-5 py-4 text-left font-bold text-base">Fecha de salida</th>
              <th className="px-5 py-4 text-left font-bold text-base">Noches</th>
              <th className="px-5 py-4 text-left font-bold text-base">Hotel</th>
              <th className="px-5 py-4 text-left font-bold text-base">Precio</th>
              <th className="px-5 py-4 text-center font-bold text-base">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 text-base">Cargando...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 text-base">No hay paquetes.</td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-gray-800 text-base">
                  {p.destino?.nombre ?? "—"}
                </td>
                <td className="px-5 py-4 text-gray-600 text-base">{formatFecha(p)}</td>
                <td className="px-5 py-4 text-gray-600 text-base">
                  {p.duracion_noches} {p.duracion_noches === 1 ? "noche" : "noches"}
                </td>
                <td className="px-5 py-4 text-gray-600 text-base">
                  {p.hotel_detalles?.[0]?.hotel?.nombre ?? "—"}
                </td>
                <td className="px-5 py-4 font-bold text-gray-800 text-base">{formatPrecio(p)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href={`/admin/packages/${p.id}/edit`}
                      className="text-gray-400 hover:text-[#1D5D8C] transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
