"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { matches } from "../data/matches";
import { teams } from "../data/teams";

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

  if (!slug) {
    return undefined;
  }

  return teams.find((team) => team.slug === slug);
}

/*
  Algunos PNG del PowerPoint contienen margen interior.
  Aquí igualamos su tamaño VISUAL sin modificar el archivo original.
*/
function getCrestScale(slug?: string) {
  const scales: Record<string, number> = {
    "getafe-cf": 1.15,
  };
  
  if (!slug) {
    return 1;
  }

  return scales[slug] ?? 1;
}

function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00`));
}

export default function PartidosPage() {
  const [currentMatchday, setCurrentMatchday] = useState(1);

  const currentMatches = useMemo(() => {
    return matches
      .filter((match) => match.matchday === currentMatchday)
      .sort((firstMatch, secondMatch) => {
        const firstDateTime =
          `${firstMatch.scheduledDate}T${firstMatch.kickoffTime ?? "23:59"}`;

        const secondDateTime =
          `${secondMatch.scheduledDate}T${secondMatch.kickoffTime ?? "23:59"}`;

        return firstDateTime.localeCompare(secondDateTime);
      });
  }, [currentMatchday]);

  function goToPreviousMatchday() {
    setCurrentMatchday((current) => Math.max(1, current - 1));
  }

  function goToNextMatchday() {
    setCurrentMatchday((current) => Math.min(38, current + 1));
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* CABECERA */}
        <header>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
            LaLiga EA Sports 2026/2027
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Partidos
          </h1>

          <p className="mt-3 text-lg font-semibold text-slate-500">
            Calendario completo de la temporada
          </p>
        </header>

        {/* SELECTOR DE JORNADAS */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={goToPreviousMatchday}
              disabled={currentMatchday === 1}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←
            </button>

            <div className="flex flex-1 gap-2 overflow-x-auto py-1">
              {Array.from({ length: 38 }, (_, index) => index + 1).map(
                (matchday) => (
                  <button
                    key={matchday}
                    type="button"
                    onClick={() => setCurrentMatchday(matchday)}
                    className={`min-w-12 rounded-xl px-4 py-3 text-sm font-black transition-all duration-200 ${
                      currentMatchday === matchday
                        ? "bg-blue-700 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    J{matchday}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={goToNextMatchday}
              disabled={currentMatchday === 38}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              →
            </button>

          </div>
        </section>

        {/* INFORMACIÓN DE JORNADA */}
        <section className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Jornada seleccionada
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              Jornada {currentMatchday}
            </h2>
          </div>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            {currentMatches.length} partidos
          </span>
        </section>

        {/* PARTIDOS */}
        <section
          key={currentMatchday}
          className="mt-6 grid gap-6 md:grid-cols-2"
        >
          {currentMatches.map((match) => {
            const homeTeam = getTeamData(match.homeTeam);
            const awayTeam = getTeamData(match.awayTeam);

            return (
              <article
                key={match.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >

                <div className="p-6">

                  {/* JORNADA + ESTADO */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Jornada {match.matchday}
                      </p>

                      <p className="mt-2 text-sm font-bold capitalize text-slate-600">
                        {formatMatchDate(match.scheduledDate)}
                      </p>
                    </div>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-700">
                      No empezado
                    </span>
                  </div>

                  {/* EQUIPOS */}
                  <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

                    {/* LOCAL */}
                    <div className="flex min-w-0 flex-col items-center text-center">

                      <p className="min-h-12 text-lg font-black leading-tight text-slate-950">
                        {match.homeTeam}
                      </p>

                      <div className="mt-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2">

                        {homeTeam?.crest ? (
                          <img
                            src={homeTeam.crest}
                            alt={`Escudo de ${match.homeTeam}`}
                            className="h-full w-full object-contain"
                            style={{
                              transform: `scale(${getCrestScale(
                                homeTeam.slug
                              )})`,
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            Sin escudo
                          </span>
                        )}

                      </div>
                    </div>

                    {/* HORA */}
                    <div className="min-w-24 text-center">
                      <p className="text-3xl font-black tabular-nums text-slate-950">
                        {match.kickoffTime ?? ""}
                      </p>
                    </div>

                    {/* VISITANTE */}
                    <div className="flex min-w-0 flex-col items-center text-center">

                      <p className="min-h-12 text-lg font-black leading-tight text-slate-950">
                        {match.awayTeam}
                      </p>

                      <div className="mt-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2">

                        {awayTeam?.crest ? (
                          <img
                            src={awayTeam.crest}
                            alt={`Escudo de ${match.awayTeam}`}
                            className="h-full w-full object-contain"
                            style={{
                              transform: `scale(${getCrestScale(
                                awayTeam.slug
                              )})`,
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            Sin escudo
                          </span>
                        )}

                      </div>
                    </div>

                  </div>

                  {/* ESTADIO */}
                  <div className="mt-7 border-t border-slate-100 pt-5 text-center">

                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Estadio
                    </p>

                    <p className="mt-1 font-bold text-slate-700">
                      {homeTeam?.stadium ?? "Estadio pendiente"}
                    </p>

                  </div>
                </div>

                {/* FOTO DEL ESTADIO COMPLETA */}
                {homeTeam?.stadiumImage && (
                  <div className="border-t border-slate-100 bg-slate-100 p-3">

                    <img
                      src={homeTeam.stadiumImage}
                      alt={homeTeam.stadium}
                      className="mx-auto max-h-72 w-full object-contain"
                    />

                  </div>
                )}

                {/* BOTÓN */}
                <div className="p-6 pt-5">

                  <Link
  href={`/partidos/${match.id}`}
  className="block w-full rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition group-hover:bg-blue-700"
>
  Ver partido
</Link> 
                </div>

              </article>
            );
          })}
        </section>

      </div>
    </main>
  );
}