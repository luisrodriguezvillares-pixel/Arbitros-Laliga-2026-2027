"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type EstadoAcceso = "comprobando" | "admin" | "denegado";

export default function AdminPage() {
  const [estado, setEstado] = useState<EstadoAcceso>("comprobando");

  useEffect(() => {
    async function comprobarAdministrador() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setEstado("denegado");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", session.user.id)
        .single();

      if (error || data?.rol !== "admin") {
        setEstado("denegado");
        return;
      }

      setEstado("admin");
    }

    comprobarAdministrador();
  }, []);

  if (estado === "comprobando") {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-16">
        <p className="text-center font-bold text-slate-600">
          Comprobando permisos...
        </p>
      </main>
    );
  }

  if (estado === "denegado") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <section className="max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🔒</div>

          <h1 className="mt-5 text-3xl font-black text-slate-950">
            Acceso restringido
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Esta página solo está disponible para el administrador.
          </p>

          <Link
            href="/"
            className="mt-7 inline-block rounded-2xl bg-blue-700 px-6 py-3 font-black text-white"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-8 py-10 text-white shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
            Acceso privado
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Panel de administración
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Gestiona el contenido y los permisos de Árbitros LaLiga
            2026/2027.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/designaciones"
            className="group rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl">📅</span>
              <span className="text-3xl text-blue-700 transition group-hover:translate-x-2">
                →
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-black text-slate-950">
              Gestionar designaciones
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Subir, sustituir, eliminar, ocultar y publicar imágenes
              de las 38 jornadas.
            </p>

            <div className="mt-7 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">
                📤 Subir
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">
                🔄 Sustituir
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">
                🚫 Ocultar
              </span>

              <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">
                🗑️ Eliminar
              </span>
            </div>
          </Link>

          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-8">
            <span className="text-5xl">⭐</span>

            <h2 className="mt-8 text-3xl font-black text-slate-950">
              Valoraciones
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Esta herramienta se añadirá cuando construyamos la sección
              de valoraciones.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}