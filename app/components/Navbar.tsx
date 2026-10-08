"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { supabase } from "../../lib/supabase";

type Perfil = {
  nombre: string;
  rol: "admin" | "valorador";
};

const enlaces = [
  { href: "/", icono: "🏠", texto: "Inicio" },
  { href: "/arbitros", icono: "👨‍⚖️", texto: "Árbitros" },
  { href: "/designaciones", icono: "📅", texto: "Designaciones" },
  { href: "/partidos", icono: "⚽", texto: "Partidos" },
  { href: "/valoraciones", icono: "⭐", texto: "Valoraciones" },
  { href: "/rankings", icono: "🏆", texto: "Rankings" },
  { href: "/datos", icono: "📊", texto: "Datos" },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  async function cargarPerfil(userId: string) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setPerfil(null);
      return;
    }

    setPerfil(data as Perfil);
  }

  useEffect(() => {
    async function comprobarSesion() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await cargarPerfil(session.user.id);
      } else {
        setPerfil(null);
      }
    }

    comprobarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) {
        cargarPerfil(session.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setPerfil(null);
    setMenuAbierto(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl text-white transition hover:border-blue-400 hover:text-blue-300"
            >
              ☰
            </button>

            <Link href="/">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">
                LALIGA EA SPORTS
              </p>

              <p className="mt-1 text-xl font-black text-white">
                Árbitros 2026/2027
              </p>
            </Link>
          </div>

          {perfil ? (
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/20"
            >
              👤 {perfil.nombre}
              {perfil.rol === "admin" ? " 👑" : " ⭐"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginAbierto(true)}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-white transition hover:border-blue-400"
            >
              🔐 Acceso
            </button>
          )}
        </div>
      </header>

      {menuAbierto && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[86%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                  Navegación
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Árbitros LaLiga
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-700"
              >
                ×
              </button>
            </div>

            {perfil && (
              <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                <p className="font-black text-slate-950">
                  {perfil.nombre}
                </p>

                <p className="mt-1 text-sm font-bold text-blue-700">
                  {perfil.rol === "admin"
                    ? "Administrador 👑"
                    : "Valorador ⭐"}
                </p>
              </div>
            )}

            <nav className="mt-6 space-y-2">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-4 rounded-2xl px-4 py-4 font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="text-2xl">{enlace.icono}</span>
                  <span>{enlace.texto}</span>
                </Link>
              ))}

              {perfil?.rol === "admin" && (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <p className="mb-2 px-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Administración
                  </p>

                  <div className="space-y-2">
  <Link
    href="/admin"
    onClick={() => setMenuAbierto(false)}
    className="flex items-center gap-4 rounded-2xl bg-blue-700 px-4 py-4 font-black text-white transition hover:bg-blue-800"
  >
    <span className="text-2xl">👑</span>
    <span>Panel de administración</span>
  </Link>

  <Link
    href="/admin/designaciones"
    onClick={() => setMenuAbierto(false)}
    className="flex items-center gap-4 rounded-2xl bg-slate-900 px-4 py-4 font-black text-white transition hover:bg-slate-800"
  >
    <span className="text-2xl">⚽</span>

    <div>
      <p>Designar árbitros</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-400">
        Árbitro principal y VAR
      </p>
    </div>
  </Link>
</div>
                </div>
              )}
            </nav>

            {perfil && (
              <button
                type="button"
                onClick={cerrarSesion}
                className="mt-8 w-full rounded-2xl bg-slate-100 px-4 py-4 text-left font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}

      {loginAbierto && (
        <LoginModal
          onClose={() => setLoginAbierto(false)}
          onLoginCorrecto={() => setLoginAbierto(false)}
        />
      )}
    </>
  );
}