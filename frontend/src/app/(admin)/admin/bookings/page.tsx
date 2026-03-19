"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Users,
  Package,
  UserCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ReservaStatus = "Pendiente" | "Aprobada" | "Rechazada";

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
}

interface Reserva {
  id: number;
  vendedor_id: number;
  paquete_id: number;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  pasajeros_adultos: number;
  pasajeros_menores: number;
  estado_reserva: ReservaStatus;
  motivo_rechazo?: string;
  precio_total: number;
  fecha_creacion: string;
  vendedor?: { id: number; nombre: string; email: string; nombre_sistema?: string };
  paquete?: {
    id: number;
    titulo_subtitulo: string;
    fecha_salida?: string;
    fecha_regreso?: string;
    duracion_dias: number;
    duracion_noches: number;
    precio_base: number;
    moneda?: string;
    destino?: { id: number; nombre: string; sigla?: string };
    hotel_detalles?: { hotel?: { nombre: string }; regimen?: string; cantidad_noches?: number }[];
  };
  pasajeros: Pasajero[];
}

interface Destino {
  id: number;
  nombre: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReservaStatus, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 ring-yellow-300",
  Aprobada: "bg-green-100 text-green-800 ring-green-300",
  Rechazada: "bg-red-100 text-red-800 ring-red-300",
};

function StatusBadge({ status }: { status: ReservaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset uppercase tracking-wide",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 ring-gray-300"
      )}
    >
      {status}
    </span>
  );
}

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  reserva,
  onClose,
  onUpdate,
}: {
  reserva: Reserva;
  onClose: () => void;
  onUpdate: (updated: Reserva) => void;
}) {
  const [view, setView] = useState<"detail" | "reject">("detail");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      const updated = await fetchApi(`/bookings/${reserva.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ estado: "Aprobada" }),
      });
      onUpdate(updated);
      onClose();
    } catch (e: any) {
      alert(e.message || "Error al confirmar");
    } finally {
      setSaving(false);
    }
  }

  async function reject() {
    if (!motivo.trim()) return;
    setSaving(true);
    try {
      const updated = await fetchApi(`/bookings/${reserva.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ estado: "Rechazada", motivo: motivo.trim() }),
      });
      onUpdate(updated);
      onClose();
    } catch (e: any) {
      alert(e.message || "Error al rechazar");
    } finally {
      setSaving(false);
    }
  }

  const p = reserva.paquete;
  const hotel = p?.hotel_detalles?.[0]?.hotel?.nombre ?? "—";
  const destino = p?.destino?.nombre ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900">Reserva #{reserva.id}</h2>
            <StatusBadge status={reserva.estado_reserva} />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {view === "detail" ? (
            <>
              {/* Datos del cliente */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-4 h-4 text-[#1D5D8C]" />
                  <h3 className="text-sm font-bold text-[#1D5D8C] uppercase tracking-wide">Datos del cliente</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Nombre</p>
                    <p className="font-semibold text-gray-800">{reserva.cliente_nombre || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Email</p>
                    <p className="font-semibold text-gray-800">{reserva.cliente_email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Teléfono</p>
                    <p className="font-semibold text-gray-800">{reserva.cliente_telefono || "—"}</p>
                  </div>
                </div>
              </section>

              {/* Datos del paquete */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-[#1D5D8C]" />
                  <h3 className="text-sm font-bold text-[#1D5D8C] uppercase tracking-wide">Datos del paquete</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Destino</p>
                    <p className="font-semibold text-gray-800">{destino}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Salida</p>
                    <p className="font-semibold text-gray-800">{fmt(p?.fecha_salida)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Regreso</p>
                    <p className="font-semibold text-gray-800">{fmt(p?.fecha_regreso)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Duración</p>
                    <p className="font-semibold text-gray-800">
                      {p?.duracion_dias ?? "—"}d / {p?.duracion_noches ?? "—"}n
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Hotel</p>
                    <p className="font-semibold text-gray-800">{hotel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Precio total</p>
                    <p className="font-bold text-[#1D5D8C]">
                      {p?.moneda ?? "ARS"} ${reserva.precio_total?.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </section>

              {/* Pasajeros */}
              {reserva.pasajeros.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#1D5D8C]" />
                    <h3 className="text-sm font-bold text-[#1D5D8C] uppercase tracking-wide">
                      Pasajeros ({reserva.pasajeros_adultos} adulto{reserva.pasajeros_adultos !== 1 ? "s" : ""}
                      {reserva.pasajeros_menores > 0 ? ` + ${reserva.pasajeros_menores} menor${reserva.pasajeros_menores !== 1 ? "es" : ""}` : ""})
                    </h3>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Apellido</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">DNI</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Fec. Nac.</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Teléfono</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reserva.pasajeros.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-800">{p.nombre}</td>
                            <td className="px-3 py-2 text-gray-700">{p.apellido}</td>
                            <td className="px-3 py-2 text-gray-600">{p.dni || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{fmt(p.fecha_nacimiento)}</td>
                            <td className="px-3 py-2 text-gray-600">{p.telefono || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Motivo rechazo si existe */}
              {reserva.motivo_rechazo && (
                <section className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">Motivo de rechazo</p>
                  <p className="text-sm text-red-800">{reserva.motivo_rechazo}</p>
                </section>
              )}
            </>
          ) : (
            /* Reject sub-view */
            <div className="space-y-4">
              <button
                onClick={() => setView("detail")}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Rechazar reserva #{reserva.id}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Ingresá el motivo de rechazo. El vendedor podrá verlo en el detalle de la reserva.
                </p>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo *</label>
                <textarea
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#1D5D8C] transition-colors"
                  rows={4}
                  placeholder="Ej: Falta de cupo, documentación incompleta..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {reserva.estado_reserva === "Pendiente" && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            {view === "detail" ? (
              <>
                <button
                  onClick={() => setView("reject")}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={confirm}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmar
                </button>
              </>
            ) : (
              <button
                onClick={reject}
                disabled={saving || !motivo.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmar rechazo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterEstado, setFilterEstado] = useState<"" | ReservaStatus>("");
  const [filterDestino, setFilterDestino] = useState<number | "">("");

  // Detail modal
  const [selected, setSelected] = useState<Reserva | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEstado) params.set("estado", filterEstado);
      if (filterDestino !== "") params.set("destino_id", String(filterDestino));

      const [data, destsData] = await Promise.all([
        fetchApi(`/bookings/?${params.toString()}`),
        destinos.length === 0 ? fetchApi("/config/destinos/") : Promise.resolve(destinos),
      ]);
      setReservas(data);
      if (destinos.length === 0) setDestinos(destsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado, filterDestino]);

  function handleUpdate(updated: Reserva) {
    setReservas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div className="p-6 md:p-8 h-full flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reservas</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestioná y aprobá las reservas de paquetes.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Estado tabs */}
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {(["", "Pendiente", "Aprobada", "Rechazada"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterEstado(v)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                filterEstado === v
                  ? "bg-white shadow text-[#1D5D8C]"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              {v === "" ? "Todas" : v}
            </button>
          ))}
        </div>

        {/* Destino select */}
        <select
          value={filterDestino}
          onChange={(e) => setFilterDestino(e.target.value === "" ? "" : Number(e.target.value))}
          className="h-9 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors"
        >
          <option value="">Todos los destinos</option>
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D5D8C]" />
            <p className="text-sm">Cargando reservas...</p>
          </div>
        ) : reservas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 py-20">
            <Package className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-medium">No hay reservas con estos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Salida</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Pasajeros</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservas.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-gray-400 text-xs">#{r.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.cliente_nombre || "—"}</p>
                      <p className="text-xs text-gray-400">{r.cliente_email || ""}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {r.paquete?.destino?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmt(r.paquete?.fecha_salida)}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">
                      {r.pasajeros_adultos + r.pasajeros_menores}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={r.estado_reserva} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          reserva={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            handleUpdate(updated);
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
