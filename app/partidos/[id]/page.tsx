"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { matches } from "../../data/matches";
import { teams } from "../../data/teams";
import { getRefereeById } from "../../data/referees";
import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import RefereeModal from "../../components/RefereeModal";
import VarModal from "../../components/VarModal";

const teamSlugByMatchName: Record<string, string> = {
  "Deportivo Alavés": "deportivo-alaves",
  "Getafe CF": "getafe-cf",
  "Atlético de Madrid": "atletico-de-madrid",
  "Málaga CF": "malaga-cf",
  "RC Celta": "celta",
  "CA Osasuna": "ca-osasuna",
  "RC Deportivo": "rc-deportivo",
  "Elche CF": "elche-cf",
  "RCD Espanyol de Barcelona": "rcd-espanyol-de-barcelona",
  "Levante UD": "levante-ud",
  "FC Barcelona": "fc-barcelona",
  "Athletic Club": "athletic-club",
  "R. Racing Club": "r-racing-club",
  "Villarreal CF": "villarreal-cf",
  "Real Madrid": "real-madrid",
  "Real Sociedad": "real-sociedad",
  "Sevilla FC": "sevilla-fc",
  "Rayo Vallecano": "rayo-vallecano",
  "Valencia CF": "valencia-cf",
  "Real Betis": "real-betis",
};

function getTeamData(teamName: string) {
  const slug = teamSlugByMatchName[teamName];

  if (!slug) return undefined;

  return teams.find((team) => team.slug === slug);
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

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

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();

  const match = matches.find((item) => item.id === params.id);

  const [arbitroSeleccionado, setArbitroSeleccionado] =
  useState<ArbitroCampo | null>(null);

  const [varSeleccionado, setVarSeleccionado] =
  useState<ArbitroVar | null>(null);

  if (!match) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-xl font-black">Partido no encontrado</p>
      </main>
    );
  }

    const homeTeam = getTeamData(match.homeTeam);
  const awayTeam = getTeamData(match.awayTeam);

  const [refereeId, setRefereeId] = useState<string | null>(
    match.refereeId ?? null
  );

  const [varRefereeId, setVarRefereeId] = useState<string | null>(
    match.varRefereeId ?? null
  );

  useEffect(() => {
    const currentMatch = match;

    async function cargarDesignacion() {
      const { data, error } = await supabase
        .from("designaciones_arbitrales")
        .select("referee_id, var_referee_id")
        .eq("match_id", currentMatch.id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando designación:", error);
        return;
      }

      if (data) {
        setRefereeId(data.referee_id ?? null);
        setVarRefereeId(data.var_referee_id ?? null);
      }
    }

    cargarDesignacion();
  }, [match]);

  const referee = getRefereeById(refereeId);
  const varReferee = getRefereeById(varRefereeId);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* CABECERA */}
      <section className="relative min-h-[560px] overflow-hidden">
        {homeTeam?.stadiumImage && (
          <img
            src={homeTeam.stadiumImage}
            alt={homeTeam.stadium}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/partidos"
            className="inline-flex items-center rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            ← Volver a partidos
          </Link>

          {/* JORNADA Y FECHA */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                LaLiga EA Sports · Jornada {match.matchday}
              </p>

              <p className="mt-2 text-lg font-semibold capitalize text-slate-200">
                {formatFullDate(match.scheduledDate)}
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-black uppercase tracking-wide backdrop-blur">
              No empezado
            </span>
          </div>

          {/* EQUIPOS */}
          <div className="mt-14 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
            {/* LOCAL */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/95 p-4 shadow-2xl sm:h-40 sm:w-40">
                {homeTeam?.crest && (
                  <img
                    src={homeTeam.crest}
                    alt={`Escudo de ${match.homeTeam}`}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <h1 className="mt-5 text-xl font-black sm:text-3xl">
                {match.homeTeam}
              </h1>
            </div>

            {/* HORA */}
            <div className="text-center">
              <p className="text-4xl font-black tabular-nums sm:text-6xl">
                {match.kickoffTime ?? "—"}
              </p>

              <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                Hora
              </p>
            </div>

            {/* VISITANTE */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/95 p-4 shadow-2xl sm:h-40 sm:w-40">
                {awayTeam?.crest && (
                  <img
                    src={awayTeam.crest}
                    alt={`Escudo de ${match.awayTeam}`}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <h1 className="mt-5 text-xl font-black sm:text-3xl">
                {match.awayTeam}
              </h1>
            </div>
          </div>

          {/* ESTADIO */}
          <div className="mt-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
              Estadio
            </p>

            <p className="mt-2 text-2xl font-black">
              {homeTeam?.stadium ?? "Estadio pendiente"}
            </p>
          </div>

          {/* ÁRBITRO Y VAR */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-10">
            {/* ÁRBITRO PRINCIPAL */}
            <button
              type="button"
              disabled={!referee}
              onClick={async () => {
  if (!referee) return;

  const { data, error } = await supabase
    .from("arbitros")
    .select(`
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
    `)
    .ilike("foto_url", `${referee.id}.%`)
    .maybeSingle();

  if (error) {
    console.error("Error cargando ficha del árbitro:", error);
    return;
  }

  if (data) {
    setArbitroSeleccionado(data);
  }
}}
              className="group flex flex-col items-center text-center disabled:cursor-default"
            >
              <p className="rounded-full bg-blue-700 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                Árbitro principal
              </p>

              {referee ? (
                <>
                  <div className="mt-4 w-fit overflow-hidden rounded-[28px] border-2 border-blue-400 bg-blue-950/50 shadow-2xl transition group-hover:-translate-y-1">
                    <img
                      src={`/referees/principales/${referee.id}.png`}
                      alt={referee.name}
                      className="h-52 w-auto max-w-[240px] object-contain"
                    />
                  </div>

                  <p className="mt-4 max-w-[260px] text-xl font-black">
                    {referee.name}
                  </p>
                </>
              ) : (
                <p className="mt-6 text-sm font-bold text-slate-400">
                  Pendiente de designación
                </p>
              )}
            </button>

            {/* VAR */}
            <button
              type="button"
              disabled={!varReferee}
              onClick={async () => {
  if (!varReferee) return;

  const { data, error } = await supabase
    .from("arbitros_var")
    .select(`
      id,
      nombre,
      lugar_nacimiento,
      comite,
      fecha_nacimiento,
      temporadas_var,
      fifa,
      fifa_desde,
      foto_url
    `)
    .ilike("foto_url", `${varReferee.id}.%`)
    .maybeSingle();

  if (error) {
    console.error("Error cargando ficha VAR:", error);
    return;
  }

  if (data) {
    setVarSeleccionado(data);
  }
}}
              className="group flex flex-col items-center text-center disabled:cursor-default"
            >
              <p className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                VAR
              </p>

              {varReferee ? (
                <>
                  <div className="mt-4 w-fit overflow-hidden rounded-[28px] border-2 border-emerald-400 bg-emerald-950/50 shadow-2xl transition group-hover:-translate-y-1">
                    <img
                      src={`/referees/var/${varReferee.id}.png`}
                      alt={varReferee.name}
                      className="h-52 w-auto max-w-[240px] object-contain"
                    />
                  </div>

                  <p className="mt-4 max-w-[260px] text-xl font-black">
                    {varReferee.name}
                  </p>
                </>
              ) : (
                <p className="mt-6 text-sm font-bold text-slate-400">
                  Pendiente de designación
                </p>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* OPCIONES */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href={`/valoraciones?partido=${encodeURIComponent(match.id)}`}
            className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/10"
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Análisis arbitral
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Valorar partido
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Accede a los criterios de valoración del encuentro.
            </p>

            <span className="mt-7 inline-flex font-black text-blue-300">
              Abrir valoración →
            </span>
          </Link>

          <Link
            href={`/kit-selector?partido=${encodeURIComponent(match.id)}`}
            className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/10"
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Equipaciones
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Kit Selector
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Selecciona las equipaciones del encuentro.
            </p>

            <span className="mt-7 inline-flex font-black text-blue-300">
              Ver equipaciones →
            </span>
          </Link>
        </div>
      </section>

      {/* FICHA COMPLETA DEL ÁRBITRO */}
{arbitroSeleccionado && (
  <RefereeModal
    arbitro={arbitroSeleccionado}
    fotoUrl={`/referees/principales/${arbitroSeleccionado.foto_url}`}
    onClose={() => setArbitroSeleccionado(null)}
  />
)}

{/* FICHA COMPLETA DEL VAR */}
{varSeleccionado && (
  <VarModal
    arbitroVar={varSeleccionado}
    fotoUrl={`/referees/var/${varSeleccionado.foto_url}`}
    onClose={() => setVarSeleccionado(null)}
  />
)}
    </main>
  );
}