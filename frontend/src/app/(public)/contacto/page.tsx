"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero con video ─────────────────────────────────────────────────── */}
      <section className="relative h-[480px] md:h-[560px] bg-gray-900 overflow-hidden flex-shrink-0">
        <video
          src="/resources/login-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Título bottom-left */}
        <div className="absolute bottom-10 left-8 md:left-16 z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg">
            Contáctanos
          </h1>
        </div>

        {/* Links bottom-right */}
        <div className="absolute bottom-10 right-8 md:right-16 z-10 flex flex-col items-end gap-2 font-bold text-white text-lg drop-shadow">
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/quienes-somos" className="hover:underline">¿Quiénes somos?</Link>
        </div>
      </section>

      {/* ── Formulario ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-16 px-4 md:px-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-10">
          Envíanos un correo y te contestaremos lo antes posible
        </h2>

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 relative overflow-visible">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              required
              value={form.nombre}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-lg border border-[#1D5D8C]/30 bg-[#EEF4FA] placeholder:text-[#1D5D8C]/60 text-gray-800 outline-none focus:border-[#1D5D8C] transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-lg border border-[#1D5D8C]/30 bg-[#EEF4FA] placeholder:text-[#1D5D8C]/60 text-gray-800 outline-none focus:border-[#1D5D8C] transition-colors"
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Número de teléfono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-lg border border-[#1D5D8C]/30 bg-[#EEF4FA] placeholder:text-[#1D5D8C]/60 text-gray-800 outline-none focus:border-[#1D5D8C] transition-colors"
            />
            <textarea
              name="mensaje"
              placeholder="Mensaje"
              required
              rows={5}
              value={form.mensaje}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#1D5D8C]/30 bg-[#EEF4FA] placeholder:text-[#1D5D8C]/60 text-gray-800 outline-none focus:border-[#1D5D8C] transition-colors resize-none"
            />

            {status === "success" && (
              <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-center font-medium">
                ¡Mensaje enviado! Te responderemos a la brevedad.
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-center font-medium">
                Ocurrió un error al enviar. Intentá de nuevo más tarde.
              </p>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1D5D8C] hover:bg-[#164a70] text-white font-semibold px-16 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar"}
              </button>
            </div>
          </form>

          {/* Avión decorativo — bottom-left de la card */}
          <div className="absolute -bottom-8 -left-6 w-32 pointer-events-none">
            <Image
              src="/resources/contacto-avion.png"
              alt=""
              width={130}
              height={80}
              className="object-contain"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
