"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Pencil, Eye, EyeOff, Loader2 } from "lucide-react";

interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
}

interface Reserva {
  id: number;
  cliente_nombre?: string;
  pasajeros_adultos: number;
  pasajeros_menores: number;
  precio_total: number;
  estado_reserva: string;
  motivo_rechazo?: string;
  fecha_creacion: string;
  paquete?: {
    fecha_salida?: string;
    destino?: { nombre: string };
  };
}

const STATUS_BADGE: Record<string, string> = {
  Pendiente: "bg-yellow-400 text-white",
  Aprobada:  "bg-green-500 text-white",
  Rechazada: "bg-red-500 text-white",
};

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function MiCuentaPage() {
  const { isAuthenticated, role, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"perfil" | "reservas">("perfil");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Motivo modal
  const [motivoId, setMotivoId] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace("/admin/login"); return; }
    fetchApi("/auth/me").then(setProfile).catch(() => {});
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    setLoadingRes(true);
    fetchApi("/bookings/")
      .then(setReservas)
      .catch(() => setReservas([]))
      .finally(() => setLoadingRes(false));
  }, [mounted, isAuthenticated]);

  function openEdit() {
    if (!profile) return;
    setEditNombre(profile.nombre);
    setEditTelefono(profile.telefono ?? "");
    setEditEmail(profile.email);
    setEditPassword("");
    setEditError("");
    setShowModal(true);
  }

  async function handleSave() {
    setEditError("");
    setSaving(true);
    try {
      const body: Record<string, string> = {
        nombre: editNombre,
        email: editEmail,
      };
      if (editTelefono) body.telefono = editTelefono;
      if (editPassword) body.password = editPassword;

      const updated = await fetchApi("/auth/me", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(updated);
      setShowModal(false);
    } catch (err: any) {
      setEditError(err.message || "Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || !isAuthenticated) return null;

  const motivoReserva = motivoId !== null ? reservas.find(r => r.id === motivoId) : null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundImage: "url('/resources/hero_cartelera.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/85 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-20">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi cuenta</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-300 mb-0 mt-4">
          {(["perfil", "reservas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-base font-semibold capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t === "perfil" ? "Perfil" : "Reservas"}
            </button>
          ))}
        </div>

        {/* ── PERFIL TAB ── */}
        {tab === "perfil" && (
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Datos personales</h2>
              <button
                onClick={openEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#1D5D8C] hover:bg-[#164a70] text-white text-sm font-bold rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar datos
              </button>
            </div>

            {!profile ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/80 shadow-sm max-w-2xl">
                {[
                  { label: "Nombre completo", value: profile.nombre },
                  { label: "Teléfono", value: profile.telefono || "—" },
                  { label: "Correo electrónico", value: profile.email },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className={`flex items-center text-sm ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="w-48 px-5 py-4 text-gray-500 font-medium flex-shrink-0">{label}</div>
                    <div className="flex-1 px-5 py-4 text-gray-900 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={logout}
              className="mt-8 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {/* ── RESERVAS TAB ── */}
        {tab === "reservas" && (
          <div className="pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reservas</h2>

            {loadingRes && (
              <div className="flex items-center gap-2 text-gray-400 py-10 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            )}
            {!loadingRes && reservas.length === 0 && (
              <p className="text-gray-400 text-sm py-12 text-center">No tenés reservas registradas todavía.</p>
            )}
            {!loadingRes && reservas.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/80 shadow-sm">
                {reservas.map((r, i) => {
                  const totalPax = r.pasajeros_adultos + r.pasajeros_menores;
                  const destino = r.paquete?.destino?.nombre ?? "—";
                  const fecha = r.paquete?.fecha_salida ? fmt(r.paquete.fecha_salida) : "—";
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center px-5 py-4 gap-4 text-sm ${i < reservas.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="w-52 font-semibold text-gray-900 uppercase truncate flex-shrink-0">
                        {(r.cliente_nombre ?? "SIN NOMBRE").toUpperCase()} <span className="font-normal">×{totalPax}</span>
                      </div>
                      <div className="flex-1 text-gray-700 truncate">{destino}</div>
                      <div className="w-24 text-gray-600 text-center flex-shrink-0">{fecha}</div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${STATUS_BADGE[r.estado_reserva] ?? "bg-gray-200 text-gray-800"}`}>
                          {r.estado_reserva}
                        </span>
                        {r.estado_reserva === "Rechazada" && r.motivo_rechazo && (
                          <button
                            onClick={() => setMotivoId(r.id)}
                            className="text-xs text-[#1D5D8C] hover:underline font-medium whitespace-nowrap"
                          >
                            Ver motivo...
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Editar datos personales</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1D5D8C]"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1D5D8C]"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1D5D8C]"
              />
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1D5D8C] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {editError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#1D5D8C] hover:bg-[#164a70] text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Modificar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOTIVO MODAL ── */}
      {motivoReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setMotivoId(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-3">Motivo de rechazo</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{motivoReserva.motivo_rechazo}</p>
            <button onClick={() => setMotivoId(null)} className="mt-6 w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
