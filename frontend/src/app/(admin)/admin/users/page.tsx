"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { UserPlus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserItem {
  id: number;
  nombre: string;
  nombre_sistema: string | null;
  email: string;
  telefono: string | null;
  rol: "admin" | "vendedor";
  agencia_nombre: string | null;
  comision_porcentaje: number;
}

interface FormState {
  nombre: string;
  nombre_sistema: string;
  email: string;
  telefono: string;
  rol: "admin" | "vendedor";
  agencia_nombre: string;
  comision_porcentaje: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  nombre_sistema: "",
  email: "",
  telefono: "",
  rol: "vendedor",
  agencia_nombre: "",
  comision_porcentaje: "0",
  password: "",
};

export default function UsersManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchApi("/users/")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(u: UserItem) {
    setEditing(u);
    setForm({
      nombre: u.nombre,
      nombre_sistema: u.nombre_sistema ?? "",
      email: u.email,
      telefono: u.telefono ?? "",
      rol: u.rol,
      agencia_nombre: u.agencia_nombre ?? "",
      comision_porcentaje: String(u.comision_porcentaje),
      password: "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleDelete(u: UserItem) {
    if (!confirm(`¿Eliminar a ${u.nombre} (${u.email})?`)) return;
    try {
      await fetchApi(`/users/${u.id}`, { method: "DELETE" });
      load();
    } catch (e: any) {
      alert(e.message || "Error al eliminar el usuario.");
    }
  }

  async function handleSave() {
    setError("");
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setError("La contraseña es obligatoria al crear un usuario.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        nombre: form.nombre,
        nombre_sistema: form.nombre_sistema || null,
        email: form.email,
        telefono: form.telefono || null,
        rol: form.rol,
        agencia_nombre: form.agencia_nombre || null,
        comision_porcentaje: parseFloat(form.comision_porcentaje) || 0,
      };
      if (form.password.trim()) body.password = form.password;

      if (editing) {
        await fetchApi(`/users/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await fetchApi("/users/", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e.message || "Error al guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  const rolBadge = (rol: string) => rol === "admin"
    ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Admin</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Vendedor</span>;

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agencias y Vendedores</h1>
          <p className="text-gray-500 mt-1 text-sm">ABM de usuarios que pueden loguearse al sistema.</p>
        </div>
        <Button onClick={openNew} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2">
          <UserPlus className="w-4 h-4" /> Nuevo usuario
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No hay usuarios registrados.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Nombre", "Email", "Rol", "Agencia", "Comisión %", "Teléfono", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.nombre}
                    {u.nombre_sistema && <span className="block text-xs text-gray-400 font-normal">{u.nombre_sistema}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">{rolBadge(u.rol)}</td>
                  <td className="px-4 py-3 text-gray-600">{u.agencia_nombre || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{u.comision_porcentaje}%</td>
                  <td className="px-4 py-3 text-gray-600">{u.telefono || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#1D5D8C] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre completo *</label>
                  <input
                    type="text" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre en sistema</label>
                  <input
                    type="text" value={form.nombre_sistema}
                    placeholder="Ej: VEND JUAN PEREZ"
                    onChange={(e) => setForm({ ...form, nombre_sistema: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Email *</label>
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  {editing ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}
                </label>
                <input
                  type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "vendedor" })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C] bg-white"
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Teléfono</label>
                  <input
                    type="tel" value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Agencia</label>
                  <input
                    type="text" value={form.agencia_nombre}
                    onChange={(e) => setForm({ ...form, agencia_nombre: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Comisión %</label>
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={form.comision_porcentaje}
                    onChange={(e) => setForm({ ...form, comision_porcentaje: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#1D5D8C]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#1D5D8C] hover:bg-[#164a70] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
