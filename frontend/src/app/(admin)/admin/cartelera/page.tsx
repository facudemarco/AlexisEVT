"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Pencil, Trash2, Plus, ListFilter, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Cartel {
  id: number;
  nombre: string;
  periodo: string;
  imagen_url: string;
}

const PERIODOS_PREDEFINIDOS = [
  "MiniTurismo",
  "Argentina",
  "Brasil",
  "Internacional",
];

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace("/api/v1", "");
function resolveImgUrl(url: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

export default function CarteleraAdminPage() {
  const [carteles, setCarteles] = useState<Cartel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<Cartel | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [periodo, setPeriodo] = useState(PERIODOS_PREDEFINIDOS[0]);
  const [imagenUrl, setImagenUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetchApi("/cartelera/")
      .then(setCarteles)
      .catch(() => setCarteles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!filtroPeriodo) return carteles;
    return carteles.filter((c) => c.periodo === filtroPeriodo);
  }, [carteles, filtroPeriodo]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cartel permanentemente?")) return;
    try {
      await fetchApi(`/cartelera/${id}`, { method: "DELETE" });
      load();
    } catch (e: any) {
      alert(e.message || "Error al eliminar el cartel.");
    }
  };

  const openModal = (cartel?: Cartel) => {
    if (cartel) {
      setIsEditing(cartel);
      setNombre(cartel.nombre);
      setPeriodo(cartel.periodo);
      setImagenUrl(cartel.imagen_url);
    } else {
      setIsEditing(null);
      setNombre("");
      setPeriodo(PERIODOS_PREDEFINIDOS[0]);
      setImagenUrl("");
    }
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1];
      const res = await fetch(`${apiBase}/uploads/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Fallo al subir imagen");
      const data = await res.json();
      setImagenUrl(data.url);
    } catch (err: any) {
      alert(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!nombre || !periodo || !imagenUrl) {
      alert("Por favor completa todos los campos (Nombre, Período e Imagen).");
      return;
    }
    setSaving(true);
    try {
      const body = { nombre, periodo, imagen_url: imagenUrl };
      if (isEditing) {
        await fetchApi(`/cartelera/${isEditing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await fetchApi(`/cartelera/`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      alert(e.message || "Error al guardar el cartel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-white relative">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-gray-900">Cartelera</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 text-[#1D5D8C] font-bold text-base hover:text-[#174B72] transition-colors"
        >
          Agregar Cartel <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-2 w-full max-w-[240px] mb-8">
        <label className="text-sm font-semibold text-gray-900">Periodo</label>
        <select
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="h-10 px-3 pr-8 rounded bg-[#BCE0F5]/40 border-none text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D5D8C]"
        >
          <option value="">Todos los periodos</option>
          {PERIODOS_PREDEFINIDOS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 overflow-hidden flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1D5D8C] text-white">
            <tr>
              <th className="px-6 py-4 font-bold text-base w-[100px]">Imagen</th>
              <th className="px-6 py-4 font-bold text-base">Período</th>
              <th className="px-6 py-4 font-bold text-base text-right w-[150px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400 text-base">Cargando carteles...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-700 text-base font-medium">No hay carteles subidos.</td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <div className="w-20 h-28 bg-gray-100 rounded shadow-sm border border-gray-200 relative overflow-hidden flex-shrink-0">
                    <Image
                      src={resolveImgUrl(c.imagen_url)}
                      alt={c.nombre}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-xl text-gray-900">{c.periodo}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openModal(c)}
                      className="text-gray-900 hover:text-[#1D5D8C] transition-colors p-2"
                      aria-label="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-gray-900 hover:text-red-600 transition-colors p-2"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#1D5D8C] border-b-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Editar Cartel" : "Agregar Cartel"}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6">

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#BCE0F5] focus:ring-2 focus:ring-[#BCE0F5]/50 transition-colors text-base"
                />
              </div>

              <div className="flex flex-col gap-2">
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#BCE0F5] focus:ring-2 focus:ring-[#BCE0F5]/50 transition-colors text-base appearance-none"
                >
                  {PERIODOS_PREDEFINIDOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                <div className="flex items-center gap-0 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-gray-200 px-4 py-3 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center min-w-[120px] h-full"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Elegir archivo"}
                  </button>
                  <div className="flex-1 px-4 py-3 text-sm text-gray-500 bg-white">
                    {imagenUrl ? (
                      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <ImageIcon className="w-4 h-4 flex-shrink-0 text-green-600" />
                        <span className="truncate">{imagenUrl.split('/').pop()}</span>
                      </div>
                    ) : (
                      "No se subió ningún archivo"
                    )}
                  </div>
                </div>

                {imagenUrl && (
                  <div className="mt-2 w-full h-32 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={resolveImgUrl(imagenUrl)} alt="Preview" fill className="object-contain" unoptimized />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded text-gray-900 font-semibold border border-gray-800 hover:bg-gray-100 transition-colors"
                disabled={saving || uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading || !nombre || !imagenUrl}
                className="px-6 py-2.5 rounded bg-[#1D5D8C] text-white font-semibold hover:bg-[#174B72] transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : (isEditing ? "Guardar" : "Agregar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
