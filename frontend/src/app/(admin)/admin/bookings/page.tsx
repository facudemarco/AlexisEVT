"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Users,
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
    periodo?: string;
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
  Pendiente: "bg-yellow-400 text-white",
  Aprobada:  "bg-green-500 text-white",
  Rechazada: "bg-red-500 text-white",
};

function StatusBadge({ status }: { status: ReservaStatus }) {
  return (
    <span className={cn("inline-flex items-center justify-center px-4 py-1 rounded-md text-sm font-bold", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  // Si ya tiene T (es ISO DateTime), lo parseamos directo.
  // Si no (es YYYY-MM-DD), le agregamos T00:00:00 para evitar desfasaje de zona horaria local.
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");

  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none h-10 rounded-lg border-2 border-gray-200 bg-white px-3 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors cursor-pointer"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

type ModalView = "detail" | "reject" | "cancel" | "revert";

function DetailModal({ reserva, onClose, onUpdate }: {
  reserva: Reserva;
  onClose: () => void;
  onUpdate: (updated: Reserva) => void;
}) {
  const [view, setView] = useState<ModalView>("detail");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function changeStatus(estado: string, motivoText?: string) {
    setSaving(true);
    try {
      const updated = await fetchApi(`/bookings/${reserva.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ estado, motivo: motivoText ?? undefined }),
      });
      onUpdate(updated);
      const statusText = estado === "Aprobada" ? "confirmada" : estado.toLowerCase();
      showToast(`Reserva #${reserva.id} ${statusText} con éxito`);
      setTimeout(() => onClose(), 1500);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al actualizar estado");
    } finally {
      setSaving(false);
    }
  }

  const p = reserva.paquete;
  const destino = p?.destino?.nombre ?? "—";
  const hotel = p?.hotel_detalles?.[0]?.hotel?.nombre ?? "—";
  const isAprobada = reserva.estado_reserva === "Aprobada";
  const isPendiente = reserva.estado_reserva === "Pendiente";
  const isRechazada = reserva.estado_reserva === "Rechazada";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900">Reserva</h2>
            <StatusBadge status={reserva.estado_reserva} />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === "detail" && (
            <>
              {/* Two-column: Cliente | Paquete */}
              <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
                {/* Datos del cliente */}
                <div className="px-5 py-4 space-y-1">
                  <p className="text-sm font-bold text-gray-900 mb-2">Datos del Cliente</p>
                  <p className="font-semibold text-gray-800">{reserva.cliente_nombre || "—"}</p>
                  {reserva.cliente_email && (
                    <p className="text-sm text-gray-500">{reserva.cliente_email}</p>
                  )}
                  {reserva.cliente_telefono && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span>📞</span> {reserva.cliente_telefono}
                    </p>
                  )}
                </div>

                {/* Datos del paquete */}
                <div className="px-5 py-4 space-y-0.5">
                  <p className="text-sm font-bold text-gray-900 mb-2">Datos del paquete</p>
                  <p className="font-semibold text-gray-800">{destino}</p>
                  {(p?.fecha_salida || p?.fecha_regreso) && (
                    <p className="text-sm text-gray-600">
                      {fmt(p?.fecha_salida)} al {fmt(p?.fecha_regreso)}
                    </p>
                  )}
                  {(p?.duracion_dias || p?.duracion_noches) && (
                    <p className="text-sm text-gray-600">
                      {String(p?.duracion_dias ?? "—").padStart(2, "0")} días, {String(p?.duracion_noches ?? "—").padStart(2, "0")} noches
                    </p>
                  )}
                  {hotel !== "—" && (
                    <p className="text-sm text-gray-600">Hotel {hotel}</p>
                  )}
                  <p className="text-sm font-bold text-gray-800">
                    ${reserva.precio_total?.toLocaleString("es-AR")}.-
                  </p>
                </div>
              </div>

              {/* Pasajeros */}
              {reserva.pasajeros.length > 0 && (
                <div className="px-5 py-4 border-b border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-3">Datos de los pasajeros</p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {["Nombre", "Apellido", "DNI", "Fecha nac.", "Teléfono"].map((h, i) => (
                            <th key={h} className={cn(
                              "px-3 py-2 text-left text-xs font-bold text-gray-700 border-b border-gray-200",
                              i > 0 && "border-l border-gray-200"
                            )}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reserva.pasajeros.map((pas, idx) => (
                          <tr key={pas.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                            <td className="px-3 py-2 border-b border-gray-200 text-gray-800">{pas.nombre}</td>
                            <td className="px-3 py-2 border-b border-l border-gray-200 text-gray-700">{pas.apellido}</td>
                            <td className="px-3 py-2 border-b border-l border-gray-200 text-gray-600">{pas.dni || "—"}</td>
                            <td className="px-3 py-2 border-b border-l border-gray-200 text-gray-600">{fmt(pas.fecha_nacimiento)}</td>
                            <td className="px-3 py-2 border-b border-l border-gray-200 text-gray-600">{pas.telefono || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Motivo rechazo */}
              {reserva.motivo_rechazo && (
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Motivo de rechazo/cancelación</p>
                    <p className="text-sm text-red-800">{reserva.motivo_rechazo}</p>
                  </div>
                </div>
              )}


            </>
          )}

          {/* Sub-view: rechazar */}
          {(view === "reject" || view === "cancel") && (
            <div className="px-5 py-4 space-y-4">
              <button
                onClick={() => setView("detail")}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {view === "cancel" ? "Cancelar reserva aprobada" : "Rechazar reserva"} #{reserva.id}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {view === "cancel"
                    ? "Se notificará al vendedor con el motivo de cancelación."
                    : "Ingresá el motivo de rechazo. El vendedor podrá verlo en el detalle."}
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

          {/* Sub-view: volver a pendiente */}
          {view === "revert" && (
            <div className="px-5 py-4 space-y-4">
              <button
                onClick={() => setView("detail")}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Pasar reserva #{reserva.id} a Pendiente
                </h3>
                <p className="text-sm text-gray-500">
                  La reserva volverá al estado Pendiente y se notificará al vendedor.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {view === "detail" && (
            <>
              {isPendiente && (
                <>
                  <button
                    onClick={() => setView("reject")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => changeStatus("Aprobada")}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Confirmar
                  </button>
                </>
              )}

              {isAprobada && (
                <>
                  <button
                    onClick={() => setView("cancel")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => setView("revert")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-white font-bold text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Pendiente
                  </button>
                </>
              )}

              {isRechazada && (
                <>
                  <button
                    onClick={() => changeStatus("Pendiente")}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-white font-bold text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Pasar a Pendiente
                  </button>
                  <button
                    onClick={() => changeStatus("Aprobada")}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Confirmar
                  </button>
                </>
              )}
            </>
          )}

          {(view === "reject" || view === "cancel") && (
            <button
              onClick={() => changeStatus("Rechazada", motivo.trim())}
              disabled={saving || !motivo.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {view === "cancel" ? "Confirmar cancelación" : "Confirmar rechazo"}
            </button>
          )}

          {view === "revert" && (
            <button
              onClick={() => changeStatus("Pendiente")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-white font-bold text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirmar
            </button>
          )}
        </div>

        {/* Floating Toast */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-bold text-sm">{toast}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Booking Modal ─────────────────────────────────────────────────────

interface PaqueteOption { id: number; titulo_subtitulo: string; precio_base: number; precio_adicional: number; moneda: string; }
interface VendedorOption { id: number; nombre: string; nombre_sistema?: string; }
interface PaxForm { nombre: string; apellido: string; dni: string; fecha_nacimiento: string; telefono: string; }
const emptyPax = (): PaxForm => ({ nombre: "", apellido: "", dni: "", fecha_nacimiento: "", telefono: "" });

function CreateBookingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [paquetes, setPaquetes] = useState<PaqueteOption[]>([]);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);

  const [paqueteId, setPaqueteId] = useState("");
  const [vendedorId, setVendedorId] = useState("particular");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [adultos, setAdultos] = useState(1);
  const [menores, setMenores] = useState(0);
  const [pasajeros, setPasajeros] = useState<PaxForm[]>([emptyPax()]);
  const [expanded, setExpanded] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchApi("/packages/"),
      fetchApi("/users/?rol=vendedor"),
    ]).then(([pkgs, vends]) => {
      setPaquetes(pkgs);
      setVendedores(vends);
    }).catch(() => {}).finally(() => setLoadingOpts(false));
  }, []);

  const totalPax = adultos + menores;
  const selectedPkg = paquetes.find((p) => String(p.id) === paqueteId);
  const precioTotal = selectedPkg
    ? (selectedPkg.precio_base + (selectedPkg.precio_adicional ?? 0)) * adultos + selectedPkg.precio_base * menores
    : 0;

  function syncPaxCount(newTotal: number) {
    setPasajeros((prev) => {
      if (newTotal > prev.length) return [...prev, ...Array(newTotal - prev.length).fill(null).map(emptyPax)];
      return prev.slice(0, newTotal);
    });
  }

  function updatePax(idx: number, field: keyof PaxForm, value: string) {
    setPasajeros((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleSave() {
    if (!paqueteId) { setError("Seleccioná un paquete."); return; }
    if (!clienteNombre.trim()) { setError("Ingresá el nombre del cliente."); return; }
    for (let i = 0; i < pasajeros.length; i++) {
      const p = pasajeros[i];
      if (!p.nombre.trim() || !p.apellido.trim()) { setError(`Completá nombre y apellido del pasajero ${i + 1}.`); setExpanded(i); return; }
      if (!p.dni.trim()) { setError(`Ingresá el DNI del pasajero ${i + 1}.`); setExpanded(i); return; }
    }
    setError(""); setSaving(true);
    try {
      const body: Record<string, unknown> = {
        paquete_id: parseInt(paqueteId),
        cliente_nombre: clienteNombre.trim(),
        cliente_email: clienteEmail.trim() || undefined,
        cliente_telefono: clienteTelefono.trim() || undefined,
        pasajeros_adultos: adultos,
        pasajeros_menores: menores,
        precio_total: precioTotal,
        pasajeros: pasajeros.map((p) => ({
          nombre: p.nombre, apellido: p.apellido,
          dni: p.dni || undefined,
          fecha_nacimiento: p.fecha_nacimiento || undefined,
          telefono: p.telefono || undefined,
        })),
      };
      if (vendedorId !== "particular") body.vendedor_id = parseInt(vendedorId);
      await fetchApi("/bookings/", { method: "POST", body: JSON.stringify(body) });
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear la reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-black text-gray-900">Nueva reserva</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loadingOpts ? (
            <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : (
            <>
              {/* Paquete */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Paquete *</label>
                <select
                  value={paqueteId}
                  onChange={(e) => setPaqueteId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors appearance-none"
                >
                  <option value="">Seleccionar paquete...</option>
                  {paquetes.map((p) => (
                    <option key={p.id} value={p.id}>{p.titulo_subtitulo}</option>
                  ))}
                </select>
                {selectedPkg && (
                  <p className="text-xs text-gray-500 mt-1">
                    Precio base: ${selectedPkg.precio_base.toLocaleString("es-AR")} {selectedPkg.moneda}
                  </p>
                )}
              </div>

              {/* Vendedor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Vendedor</label>
                <select
                  value={vendedorId}
                  onChange={(e) => setVendedorId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors appearance-none"
                >
                  <option value="particular">Particular (sin vendedor asignado)</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre_sistema || v.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del cliente *</label>
                  <input value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Nombre y apellido" className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#1D5D8C] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                  <input value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} placeholder="email@ejemplo.com" type="email" className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#1D5D8C] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Teléfono</label>
                  <input value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} placeholder="11-1234-5678" type="tel" className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#1D5D8C] transition-colors" />
                </div>
              </div>

              {/* Pasajeros */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Adultos</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { const v = Math.max(1, adultos - 1); setAdultos(v); syncPaxCount(v + menores); }} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">−</button>
                    <span className="font-bold text-gray-800 w-4 text-center">{adultos}</span>
                    <button onClick={() => { const v = adultos + 1; setAdultos(v); syncPaxCount(v + menores); }} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Menores</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { const v = Math.max(0, menores - 1); setMenores(v); syncPaxCount(adultos + v); }} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">−</button>
                    <span className="font-bold text-gray-800 w-4 text-center">{menores}</span>
                    <button onClick={() => { const v = menores + 1; setMenores(v); syncPaxCount(adultos + v); }} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">+</button>
                  </div>
                </div>
              </div>

              {selectedPkg && (
                <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Users className="w-4 h-4" />{totalPax} pasajero{totalPax !== 1 ? "s" : ""}</span>
                  <span className="text-base font-black text-[#1D5D8C]">${precioTotal.toLocaleString("es-AR")} {selectedPkg.moneda}</span>
                </div>
              )}

              {/* Formularios de pasajeros */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Datos de los pasajeros</p>
                <div className="space-y-2 rounded-xl border border-gray-200 overflow-hidden">
                  {pasajeros.map((pax, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0">
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <span>
                          Pasajero {idx + 1} {idx < adultos ? "(Adulto)" : "(Menor)"}
                          {pax.nombre && pax.apellido && <span className="font-normal text-gray-500 ml-2">— {pax.nombre} {pax.apellido}</span>}
                        </span>
                        {expanded === idx ? <ChevronLeft className="w-4 h-4 rotate-90 text-gray-400" /> : <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-400" />}
                      </button>
                      {expanded === idx && (
                        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                          <input placeholder="Nombre *" value={pax.nombre} onChange={(e) => updatePax(idx, "nombre", e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1D5D8C]" />
                          <input placeholder="Apellido *" value={pax.apellido} onChange={(e) => updatePax(idx, "apellido", e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1D5D8C]" />
                          <input placeholder="DNI *" value={pax.dni} onChange={(e) => updatePax(idx, "dni", e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1D5D8C] col-span-2" />
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Fecha de nacimiento</label>
                            <input type="date" value={pax.fecha_nacimiento} onChange={(e) => updatePax(idx, "fecha_nacimiento", e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1D5D8C] text-gray-700" />
                          </div>
                          <input placeholder="Teléfono" value={pax.telefono} onChange={(e) => updatePax(idx, "telefono", e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1D5D8C] col-span-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">La reserva se creará en estado <span className="font-semibold text-green-600">Aprobada</span> automáticamente.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loadingOpts}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D5D8C] text-white font-bold text-sm hover:bg-[#164a70] transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Crear reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [reservas, setReservas]     = useState<Reserva[]>([]);
  const [destinos, setDestinos]     = useState<Destino[]>([]);
  const [loading, setLoading]       = useState(true);

  const [filterCliente, setFilterCliente]         = useState("");
  const [filterDestino, setFilterDestino]         = useState("");
  const [filterEstado, setFilterEstado]           = useState("");
  const [filterPeriodo, setFilterPeriodo]         = useState("");
  const [filterReservaId, setFilterReservaId]     = useState("");
  const [filterFechaSalida, setFilterFechaSalida] = useState("");

  const [sortBy, setSortBy] = useState<string>("fecha_creacion");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<Reserva | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [data, destsData] = await Promise.all([
        fetchApi("/bookings/"),
        fetchApi("/config/destinos/"),
      ]);
      setReservas(data);
      setDestinos(destsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const clienteOptions = useMemo(() => {
    const names = reservas.map((r) => r.cliente_nombre ?? "").filter(Boolean);
    return [...new Set(names)].sort();
  }, [reservas]);

  const periodoOptions = useMemo(() => {
    const periods = reservas.map((r) => r.paquete?.titulo_subtitulo).filter(Boolean); // Actually looking at schemas, 'periodo' is a field
    // Let's re-check the type or use whatever field identifies period.
    // In backend/app/schemas/package.py there is a 'periodo' field.
    // Let's assume it's available in the paquete object. (Wait, I should check if it's there).
    // If not, I'll use the title or category.
    const p = reservas.map((r: any) => r.paquete?.periodo).filter(Boolean);
    return [...new Set(p)].sort();
  }, [reservas]);

  const filtered = useMemo(() => {
    let result = reservas.filter((r) => {
      const searchId = filterReservaId.replace("#", "").trim();
      if (searchId && !String(r.id).includes(searchId)) return false;
      if (filterCliente && r.cliente_nombre !== filterCliente) return false;
      if (filterEstado && r.estado_reserva !== filterEstado) return false;
      if (filterDestino && String(r.paquete?.destino?.id ?? "") !== filterDestino) return false;
      if (filterPeriodo && r.paquete?.periodo !== filterPeriodo) return false;
      if (filterFechaSalida && r.paquete?.fecha_salida !== filterFechaSalida) return false;
      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortBy) {
        case "id": valA = a.id; valB = b.id; break;
        case "cliente": valA = a.cliente_nombre?.toLowerCase(); valB = b.cliente_nombre?.toLowerCase(); break;
        case "destino": valA = a.paquete?.destino?.nombre?.toLowerCase(); valB = b.paquete?.destino?.nombre?.toLowerCase(); break;
        case "salida":  valA = a.paquete?.fecha_salida; valB = b.paquete?.fecha_salida; break;
        case "pasajeros": valA = a.pasajeros_adultos + a.pasajeros_menores; valB = b.pasajeros_adultos + b.pasajeros_menores; break;
        case "estado": valA = a.estado_reserva; valB = b.estado_reserva; break;
        case "fecha_creacion": valA = a.fecha_creacion; valB = b.fecha_creacion; break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [reservas, filterCliente, filterEstado, filterDestino, filterPeriodo, filterFechaSalida, sortBy, sortOrder, filterReservaId]);

  function handleUpdate(updated: Reserva) {
    setReservas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  const hasFilters = filterCliente || filterDestino || filterEstado || filterPeriodo || filterFechaSalida || filterReservaId;

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Reservas</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D5D8C] text-white font-bold text-sm hover:bg-[#164a70] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-5 items-end">
        <FilterSelect label="Cliente" value={filterCliente} onChange={setFilterCliente}>
          <option value="">Todos los clientes</option>
          {clienteOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </FilterSelect>

        <FilterSelect label="Destino" value={filterDestino} onChange={setFilterDestino}>
          <option value="">Todos</option>
          {destinos.map((d) => <option key={d.id} value={String(d.id)}>{d.nombre}</option>)}
        </FilterSelect>

        <FilterSelect label="Estado" value={filterEstado} onChange={setFilterEstado}>
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </FilterSelect>

        <FilterSelect label="Período" value={filterPeriodo} onChange={setFilterPeriodo}>
          <option value="">Todos</option>
          {periodoOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </FilterSelect>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nro Reserva</label>
          <input
            type="text"
            placeholder="Ej: 125"
            value={filterReservaId}
            onChange={(e) => setFilterReservaId(e.target.value)}
            className="h-10 rounded-lg border-2 border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors w-32"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Fecha de salida</label>
          <input
            type="date"
            value={filterFechaSalida}
            onChange={(e) => setFilterFechaSalida(e.target.value)}
            className="h-10 rounded-lg border-2 border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#1D5D8C] transition-colors"
          />
        </div>

        {(hasFilters || filterReservaId) && (
          <button
            onClick={() => {
              setFilterCliente("");
              setFilterDestino("");
              setFilterEstado("");
              setFilterPeriodo("");
              setFilterReservaId("");
              setFilterFechaSalida("");
            }}
            className="h-10 self-end px-3 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D5D8C]" />
          <p className="text-sm">Cargando reservas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-20">
          <Package className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-medium">No hay reservas con estos filtros.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm border-collapse min-w-[900px] lg:min-w-0">
            <thead>
              <tr className="bg-gray-50 uppercase tracking-tighter text-[11px]">
                {[
                  { id: "id", label: "ID", width: "w-16" },
                  { id: "fecha_creacion", label: "Alta", width: "w-28" },
                  { id: "cliente", label: "Cliente", width: "" },
                  { id: "destino", label: "Destino", width: "" },
                  { id: "salida", label: "Salida", width: "w-28" },
                  { id: "pasajeros", label: "Pasajeros", width: "w-20" },
                  { id: "estado", label: "Estado", width: "w-32" },
                  { id: "actions", label: "", width: "w-10" },
                ].map((col, i) => (
                  <th
                    key={col.id}
                    onClick={() => {
                      if (col.id === "actions") return;
                      if (sortBy === col.id) {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy(col.id);
                        setSortOrder("asc");
                      }
                    }}
                    className={cn(
                      "px-3 py-3 text-left font-bold text-gray-500 border-b border-gray-200",
                      col.width,
                      col.id !== "actions" && "cursor-pointer hover:bg-gray-100 transition-colors",
                      i > 0 && "border-l border-gray-100",
                      (col.id === "pasajeros" || col.id === "estado") && "text-center"
                    )}
                  >
                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                      {col.label}
                      {col.id !== "actions" && (
                        <div className="flex flex-col text-gray-300">
                          {sortBy === col.id ? (
                            sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#1D5D8C]" /> : <ArrowDown className="w-3 h-3 text-[#1D5D8C]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-blue-50/50",
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  )}
                >
                  <td className="px-3 py-3 border-b border-gray-200 text-[#1D5D8C] font-bold">
                    #{r.id}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 text-gray-600 font-medium whitespace-nowrap">
                    {fmt(r.fecha_creacion)}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 font-bold text-gray-900">
                    {r.cliente_nombre || "—"}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 text-gray-700">
                    {r.paquete?.destino?.nombre ?? "—"}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 text-gray-700 whitespace-nowrap">
                    {fmt(r.paquete?.fecha_salida)}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 text-center text-gray-700 font-medium whitespace-nowrap">
                    {r.pasajeros_adultos + r.pasajeros_menores}
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 text-center">
                    <StatusBadge status={r.estado_reserva} />
                  </td>
                  <td className="px-3 py-3 border-b border-l border-gray-100 w-10 text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Mostrando {filtered.length} de {reservas.length} reservas
        </p>
      )}

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

      {showCreate && (
        <CreateBookingModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
