"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Designacion = {
  id: number;
  jornada: number;
  orden_imagen: number;
  imagen_url: string;
  visible: boolean;
};

type Jornada = {
  numero: number;
  imagenes: Designacion[];
};

const STORAGE_URL =
  "https://iuchjgobckaedpsubral.supabase.co/storage/v1/object/public/designaciones";

export default function DesignacionesPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([]);
  const [numeroJornada, setNumeroJornada] = useState(1);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDesignaciones() {
      setCargando(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("designaciones")
        .select(
          "id, jornada, orden_imagen, imagen_url, visible"
        )
        .eq("visible", true)
        .order("jornada", { ascending: true })
        .order("orden_imagen", { ascending: true });

      if (supabaseError) {
        setError(supabaseError.message);
        setDesignaciones([]);
        setCargando(false);
        return;
      }

      const datos = data ?? [];

      setDesignaciones(datos);

      if (datos.length > 0) {
        const ultimaJornada = Math.max(
          ...datos.map((designacion) => designacion.jornada)
        );

        setNumeroJornada(ultimaJornada);
      }

      setCargando(false);
    }

    cargarDesignaciones();
  }, []);

  const jornadas = useMemo<Jornada[]>(() => {
    return Array.from({ length: 38 }, (_, indice) => {
      const numero = indice + 1;

      return {
        numero,
        imagenes: designaciones.filter(
          (designacion) => designacion.jornada === numero
        ),
      };
    });
  }, [designaciones]);

  const jornadaActual =
    jornadas.find(
      (jornada) => jornada.numero === numeroJornada
    ) ?? jornadas[0];

  const imagenActual =
    jornadaActual.imagenes[indiceImagen] ?? null;

  function seleccionarJornada(numero: number) {
    setNumeroJornada(numero);
    setIndiceImagen(0);
  }

  function imagenAnterior() {
    setIndiceImagen((indiceActual) =>
      Math.max(indiceActual - 1, 0)
    );
  }

  function imagenSiguiente() {
    setIndiceImagen((indiceActual) =>
      Math.min(
        indiceActual + 1,
        jornadaActual.imagenes.length - 1
      )
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-5 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute -right-32 top-[520px] h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #0f172a 0, #0f172a 1px, transparent 1px, transparent 24px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-7 py-9 text-white shadow-[0_24px_65px_rgba(15,23,42,0.28)] md:px-10 md:py-11">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" />

          <div className="pointer-events-none absolute bottom-0 right-16 h-32 w-72 -skew-x-12 bg-blue-500/10" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-2xl backdrop-blur">
                📅📋
              </span>

              <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-300">
                Temporada 2026/2027
              </p>
            </div>

            <h1 className="mt-6 text-4xl font-black uppercase md:text-6xl">
              Designaciones arbitrales
            </h1>

            <p className="mt-4 text-lg font-medium text-slate-300">
              Comité Técnico de Árbitros · LaLiga EA Sports
            </p>
          </div>
        </header>

        {cargando && (
          <p className="mt-10 text-center font-bold text-slate-600">
            Cargando designaciones...
          </p>
        )}

        {error && (
          <div className="mt-10 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
            No se pudieron cargar las designaciones: {error}
          </div>
        )}

        {!cargando && !error && (
          <>
            <section className="mt-10 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
              <div className="relative flex items-center justify-between overflow-hidden border-b border-blue-900/20 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 px-6 py-6 text-white md:px-8">
                <div className="pointer-events-none absolute right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border-[18px] border-white/5" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                    Designaciones oficiales
                  </p>

                  <h2 className="mt-1 text-3xl font-black text-white">
                    Jornada {jornadaActual.numero}
                  </h2>
                </div>

                {jornadaActual.imagenes.length > 0 && (
                  <div className="relative rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                    Imagen {indiceImagen + 1} de{" "}
                    {jornadaActual.imagenes.length}
                  </div>
                )}
              </div>

              <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 p-4 md:p-8">
                {imagenActual ? (
                  <img
                    src={`${STORAGE_URL}/${imagenActual.imagen_url}`}
                    alt={`Designación de la jornada ${jornadaActual.numero}, imagen ${
                      indiceImagen + 1
                    }`}
                    className="max-h-[75vh] max-w-full object-contain"
                  />
                ) : (
                  <div className="px-6 py-20 text-center">
                    <div className="text-6xl">📅</div>

                    <p className="mt-5 text-2xl font-black text-slate-900">
                      Aún no hay designaciones
                    </p>

                    <p className="mt-3 text-slate-500">
                      Las imágenes de la Jornada{" "}
                      {jornadaActual.numero} aparecerán aquí cuando
                      sean publicadas.
                    </p>
                  </div>
                )}
              </div>

              {jornadaActual.imagenes.length > 1 && (
                <div className="border-t border-slate-200 px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={indiceImagen === 0}
                      onClick={imagenAnterior}
                      className="rounded-full px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ← Imagen anterior
                    </button>

                    <div className="flex gap-2">
                      {jornadaActual.imagenes.map(
                        (_, posicion) => (
                          <button
                            key={posicion}
                            type="button"
                            aria-label={`Ver imagen ${
                              posicion + 1
                            }`}
                            onClick={() =>
                              setIndiceImagen(posicion)
                            }
                            className={`h-3 w-3 rounded-full transition ${
                              posicion === indiceImagen
                                ? "bg-blue-700"
                                : "bg-slate-300 hover:bg-slate-400"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        indiceImagen ===
                        jornadaActual.imagenes.length - 1
                      }
                      onClick={imagenSiguiente}
                      className="rounded-full px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Imagen siguiente →
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="mt-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                Seleccionar
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Cambiar de jornada
              </h2>

              <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {jornadas.map((jornada) => {
                  const seleccionada =
                    jornada.numero === numeroJornada;

                  const tieneImagenes =
                    jornada.imagenes.length > 0;

                  return (
                    <button
                      key={jornada.numero}
                      type="button"
                      onClick={() =>
                        seleccionarJornada(jornada.numero)
                      }
                      className={`
                        relative rounded-2xl border px-3 py-4
                        text-center transition-all duration-200
                        ${
                          seleccionada
                            ? "border-blue-700 bg-blue-700 text-white shadow-lg"
                            : "border-slate-200 bg-white text-slate-900 hover:-translate-y-1 hover:border-blue-400"
                        }
                      `}
                    >
                      <span className="text-xs font-black uppercase tracking-wider opacity-70">
                        J
                      </span>

                      <span className="ml-1 text-lg font-black">
                        {jornada.numero}
                      </span>

                      <span
                        className={`
                          absolute right-2 top-2 h-2 w-2 rounded-full
                          ${
                            tieneImagenes
                              ? "bg-emerald-400"
                              : seleccionada
                              ? "bg-white/40"
                              : "bg-slate-300"
                          }
                        `}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}