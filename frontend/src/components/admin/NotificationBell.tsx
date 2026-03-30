"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notificacion {
  id: number;
  reserva_id: number | null;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

const TIPO_STYLES: Record<string, string> = {
  aprobada:   "bg-green-100 border-green-300 text-green-800",
  rechazada:  "bg-red-100   border-red-300   text-red-800",
  pendiente:  "bg-yellow-100 border-yellow-300 text-yellow-800",
  cancelacion:"bg-orange-100 border-orange-300 text-orange-800",
};

const TIPO_DOT: Record<string, string> = {
  aprobada:    "bg-green-500",
  rechazada:   "bg-red-500",
  pendiente:   "bg-yellow-400",
  cancelacion: "bg-orange-400",
};

function fmtRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return "ahora";
  if (min < 60)  return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function NotificationBell() {
  const [notifs, setNotifs]       = useState<Notificacion[]>([]);
  const [unread, setUnread]       = useState(0);
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const panelRef                  = useRef<HTMLDivElement>(null);
  const bellRef                   = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  async function fetchNotifs() {
    try {
      const data = await fetchApi("/notifications/");
      setNotifs(data);
      setUnread(data.filter((n: Notificacion) => !n.leida).length);
    } catch { /* silenciar si no hay permisos */ }
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // poll cada 30s
    return () => clearInterval(interval);
  }, []);

  const updatePos = useCallback(() => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  // Versión throttled para eventos frecuentes (scroll/resize)
  const updatePosThrottled = useCallback(() => {
    requestAnimationFrame(() => updatePos());
  }, [updatePos]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      window.addEventListener("scroll", updatePosThrottled, { passive: true, capture: true });
      window.addEventListener("resize", updatePosThrottled, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", updatePosThrottled, true);
      window.removeEventListener("resize", updatePosThrottled);
    };
  }, [open, updatePos, updatePosThrottled]);

  async function markAllRead() {
    setLoading(true);
    try {
      await fetchApi("/notifications/mark-all-read", { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: number) {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch { /* silenciar */ }
  }

  const dropdown = open ? (
    <div
      ref={panelRef}
      style={{ position: "absolute", top: dropdownPos.top, right: dropdownPos.right }}
      className="w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-sm">Notificaciones</span>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-semibold text-[#1D5D8C] hover:underline disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">Sin notificaciones</p>
        ) : (
          notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.leida && markRead(n.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 flex gap-3 items-start",
                !n.leida && "bg-blue-50/40"
              )}
            >
              <span className={cn(
                "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                n.leida ? "bg-gray-300" : (TIPO_DOT[n.tipo] ?? "bg-[#1D5D8C]")
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-snug",
                  n.leida ? "text-gray-500" : "text-gray-800 font-medium"
                )}>
                  {n.mensaje}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtRelative(n.fecha_creacion)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => {
          updatePos();
          setOpen((o) => !o);
        }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-white" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown portaled to body to escape overflow:hidden */}
      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </>
  );
}
