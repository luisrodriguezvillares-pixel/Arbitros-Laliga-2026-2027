"use client";

import { useEffect, useState } from "react";
import RefereeCard from "../components/RefereeCard";
import RefereeModal from "../components/RefereeModal";
import VarCard from "../components/VarCard";
import VarModal from "../components/VarModal";
import { supabase } from "../../lib/supabase";

type ArbitroCampo = {
  id: number;
  nombre_apellidos: string;
  lugar_nacimiento: string;
  comite: string;
  fecha_nacimiento: string;
  temporadas_primera: number;
  fifa: boolean;
  fifa_desde: number | null;
  silbato: string;
  tarjetas: string;
  lleva_tarjetas: string;
  pitido_final: string;
  foto_url: string;
};

type ArbitroVar = {
  id: string;
  nombre: string;
  lugar_nacimiento: string;
  comite: string;
  fecha_nacimiento: string;
  temporadas_var: number;
  fifa: boolean;
  fifa_desde: number | null;
  foto_url: string;
};

type Pestana = "campo" | "var";

const ARBITROS_STORAGE =
  "https://iuchjgobckaedpsubral.supabase.co/storage/v1/object/public/arbitros";

const VAR_STORAGE =
  "https://iuchjgobckaedpsubral.supabase.co/storage/v1/object/public/var";

export default function ArbitrosPage() {
  
  const [pestana, setPestana] = useState<Pestana>("campo");

  const [arbitrosCampo, setArbitrosCampo] = useState<ArbitroCampo[]>([]);
  const [arbitrosVar, setArbitrosVar] = useState<ArbitroVar[]>([]);

  const [arbitroSeleccionado, setArbitroSeleccionado] =
    useState<ArbitroCampo | null>(null);

  const [varSeleccionado, setVarSeleccionado] =
    useState<ArbitroVar | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError("");

      const [resultadoCampo, resultadoVar] = await Promise.all([
        supabase
          .from("arbitros")
          .select(
            `
            id,
            nombre_apellidos,
            lugar_nacimiento,
            comite,
            fecha_nacimiento,
            temporadas_primera,
            fifa,
            fifa_desde,
            silbato,
            tarjetas,
            lleva_tarjetas,
            pitido_final,
            foto_url
            `
          )
          .order("nombre_apellidos", { ascending: true }),

        supabase
          .from("arbitros_var")
          .select(
            `
            id,
            nombre,
            lugar_nacimiento,
            comite,
            fecha_nacimiento,
            temporadas_var,
            fifa,
            fifa_desde,
            foto_url
            `
          )
          .order("nombre", { ascending: true }),
      ]);

      if (resultadoCampo.error) {
        setError(
          `No se pudieron cargar los árbitros: ${resultadoCampo.error.message}`
        );
      } else if (resultadoVar.error) {
        setError(
          `No se pudieron cargar los VAR: ${resultadoVar.error.message}`
        );
      } else {
        setArbitrosCampo(resultadoCampo.data ?? []);
        console.log("FOTOS VAR SUPABASE:", resultadoVar.data);
        
        setArbitrosVar(
          (resultadoVar.data ?? []).map((arbitro) => {
    const nombreNormalizado = arbitro.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const esFifaEspecial =
      nombreNormalizado.includes("muniz ruiz") ||
      nombreNormalizado.includes("cuadra fernandez");

    return {
      ...arbitro,
      fifa: arbitro.fifa || esFifaEspecial,
    };
  })
);
      }

      setCargando(false);
    }

    cargarDatos();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">
            Temporada 2026/2027
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
  ÁRBITROS
</h1>

          
  <p className="mt-3 text-lg font-semibold text-slate-500">
  LaLiga EA Sports · Primera División
</p>
  
        </header>

        <div className="mt-10 flex justify-center">
  <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">

    <button
      type="button"
      onClick={() => setPestana("campo")}
      className={`
        rounded-xl px-7 py-3
        text-sm font-black uppercase tracking-wide
        transition-all duration-300
        ${
          pestana === "campo"
            ? "bg-blue-700 text-white shadow-lg"
            : "text-slate-600 hover:bg-slate-100"
        }
      `}
    >
      🟨🟥 Árbitros Principales
    </button>

    <button
      type="button"
      onClick={() => setPestana("var")}
      className={`
        ml-2 rounded-xl px-7 py-3
        text-sm font-black uppercase tracking-wide
        transition-all duration-300
        ${
          pestana === "var"
            ? "bg-emerald-600 text-white shadow-lg"
            : "text-slate-600 hover:bg-slate-100"
        }
      `}
    >
      🖥️ Árbitros VAR
    </button>

  </div>
</div>

        {cargando && (
          <p className="mt-10 font-bold text-slate-600">
            Cargando árbitros...
          </p>
        )}

        {error && (
          <div className="mt-10 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
            {error}
          </div>
        )}

        {!cargando && !error && pestana === "campo" && (
          <section className="mt-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Primera División
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Árbitros Principales
                </h2>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                {arbitrosCampo.length} árbitros
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {arbitrosCampo.map((arbitro) => (
                <RefereeCard
                  key={arbitro.id}
                  nombre={arbitro.nombre_apellidos}
                  comite={arbitro.comite}
                  fechaNacimiento={arbitro.fecha_nacimiento}
                  fifa={arbitro.fifa}
                  fotoUrl={`/referees/principales/${arbitro.foto_url}`}
                  onClick={() => setArbitroSeleccionado(arbitro)}
                />
              ))}
            </div>
          </section>
        )}

        {!cargando && !error && pestana === "var" && (
          <section className="mt-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                  Sala VOR
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Árbitros VAR
                </h2>
              </div>

              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                {arbitrosVar.length} VAR
              </span>
            </div>

<div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {arbitrosVar.map((arbitroVar) => (
    <VarCard
      key={arbitroVar.id}
      nombre={arbitroVar.nombre}
      comite={arbitroVar.comite}
      fechaNacimiento={arbitroVar.fecha_nacimiento}
      temporadasVar={arbitroVar.temporadas_var}
      fifa={arbitroVar.fifa}
      fifaDesde={arbitroVar.fifa_desde}
      fotoUrl={`/referees/var/${arbitroVar.foto_url}`}
      onClick={() => {
        setArbitroSeleccionado(null);
        setVarSeleccionado(arbitroVar);
      }}
    />
  ))}
</div>
          </section>
        )}
      </div>

      {arbitroSeleccionado && (
        <RefereeModal
          arbitro={arbitroSeleccionado}
          fotoUrl={`/referees/principales/${arbitroSeleccionado.foto_url}`}
          onClose={() => setArbitroSeleccionado(null)}
        />
      )}

      {varSeleccionado !== null && (
        <VarModal
          key={varSeleccionado.id}
          arbitroVar={varSeleccionado}
          fotoUrl={`/referees/var/${varSeleccionado.foto_url}?v=3`}
          onClose={() => setVarSeleccionado(null)}
        />
      )}
    </main>
  );
}