"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const variantNames: Record<string, string> = {
  local: "Local",
  visitante: "Visitante",
  alternativa: "Alternativa",
  cuarta: "Cuarta",
};

const refereeKits = [
  {
    key: "amarilla",
    label: "Amarillo",
    shirt: "camiseta_amarilla.png",
    socks: "/referee-kits/medias-amarillas.jpeg",
  },
  {
    key: "roja",
    label: "Rojo",
    shirt: "camiseta_roja.png",
    socks: "/referee-kits/medias-rojas.jpeg",
  },
  {
    key: "negra",
    label: "Negro",
    shirt: "camiseta_negra.png",
    socks: "/referee-kits/medias-negras.jpeg",
  },
  {
    key: "turquesa",
    label: "Turquesa",
    shirt: "camiseta_turquesa.png",
    socks: "/referee-kits/medias-turquesas.jpeg",
  },
  {
    key: "azul",
    label: "Azul",
    shirt: "camiseta_azul.png",
    socks: "/referee-kits/medias-azules.jpeg",
  },
];

function getTeamData(teamName: string) {
  const slug = teamSlugByMatchName[teamName];

  if (!slug) return undefined;

  return teams.find((team) => team.slug === slug);
}

export default function KitSelectorPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("partido");

  const match = matches.find((item) => item.id === matchId);

  const homeTeam = match ? getTeamData(match.homeTeam) : undefined;
  const awayTeam = match ? getTeamData(match.awayTeam) : undefined;

  const homeVariants = useMemo(
    () => Object.keys(homeTeam?.kits?.field ?? {}),
    [homeTeam]
  );

  const awayVariants = useMemo(
    () => Object.keys(awayTeam?.kits?.field ?? {}),
    [awayTeam]
  );

  const homeGoalkeeperVariants = useMemo(
    () => Object.keys(homeTeam?.kits?.goalkeeper ?? {}),
    [homeTeam]
  );

  const awayGoalkeeperVariants = useMemo(
    () => Object.keys(awayTeam?.kits?.goalkeeper ?? {}),
    [awayTeam]
  );

  const [selectedHomeVariant, setSelectedHomeVariant] =
    useState<string>("local");

  const [selectedAwayVariant, setSelectedAwayVariant] =
    useState<string>("local");

  const [selectedHomeGoalkeeper, setSelectedHomeGoalkeeper] =
    useState<string>("local");

  const [selectedAwayGoalkeeper, setSelectedAwayGoalkeeper] =
    useState<string>("local");

  const [selectedRefereeKit, setSelectedRefereeKit] =
    useState<string>("amarilla");

  if (!match) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">Kit Selector</h1>

          <p className="mt-4 text-slate-400">
            Selecciona primero un partido.
          </p>
        </div>
      </main>
    );
  }

  const realHomeVariant = homeVariants.includes(selectedHomeVariant)
    ? selectedHomeVariant
    : homeVariants[0];

  const realAwayVariant = awayVariants.includes(selectedAwayVariant)
    ? selectedAwayVariant
    : awayVariants[0];

  const realHomeGoalkeeper = homeGoalkeeperVariants.includes(
    selectedHomeGoalkeeper
  )
    ? selectedHomeGoalkeeper
    : homeGoalkeeperVariants[0];

  const realAwayGoalkeeper = awayGoalkeeperVariants.includes(
    selectedAwayGoalkeeper
  )
    ? selectedAwayGoalkeeper
    : awayGoalkeeperVariants[0];

  const currentRefereeKit =
    refereeKits.find((kit) => kit.key === selectedRefereeKit) ??
    refereeKits[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* ESTADIO */}
      {homeTeam?.stadiumImage && (
        <img
          src={homeTeam.stadiumImage}
          alt={homeTeam.stadium}
          className="fixed inset-0 h-full w-full object-cover"
        />
      )}

      <div className="fixed inset-0 bg-slate-950/65" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/70" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-10 sm:px-8">
        {/* VOLVER */}
        <Link
          href={`/partidos/${match.id}`}
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-2xl font-black text-white shadow-lg backdrop-blur-md transition hover:-translate-x-1 hover:bg-white/15"
          aria-label="Volver al partido"
        >
          ←
        </Link>

        {/* CABECERA */}
        <header>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">
            Kit Selector · Jornada {match.matchday}
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {match.homeTeam} – {match.awayTeam}
              </h1>

              <p className="mt-3 text-lg font-bold text-slate-200">
                {match.kickoffTime ?? "—"} ·{" "}
                {homeTeam?.stadium ?? "Estadio pendiente"}
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-black uppercase tracking-wide backdrop-blur">
              No empezado
            </span>
          </div>
        </header>

        {/* 3 COLUMNAS */}
        <section className="mt-10 grid gap-5 xl:grid-cols-[1fr_0.7fr_1fr]">
          {/* ================= LOCAL ================= */}
          <article className="rounded-[32px] border border-white/15 bg-black/35 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              {homeTeam?.crest && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2">
                  <img
                    src={homeTeam.crest}
                    alt={match.homeTeam}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                  Equipo local
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {match.homeTeam}
                </h2>
              </div>
            </div>

            {/* VARIANTES LOCAL */}
            <div className="mt-6 flex flex-wrap gap-2">
              {homeVariants.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setSelectedHomeVariant(variant)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    realHomeVariant === variant
                      ? "bg-blue-600 text-white"
                      : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {variantNames[variant] ?? variant}
                </button>
              ))}
            </div>

            {/* JUGADORES LOCAL */}
            <div className="mt-6 flex min-h-[450px] items-center justify-center p-5">
              {realHomeVariant ? (
                <div className="flex h-[430px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white p-4 shadow-2xl">
                  <img
                    src={`/kits/${homeTeam?.slug}/${realHomeVariant}.png`}
                    alt={`Equipación ${realHomeVariant} de ${match.homeTeam}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-sm font-bold text-white/30">—</span>
              )}
            </div>

            {/* PORTERO LOCAL */}
            {homeGoalkeeperVariants.length > 0 && (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-green-300">
                  Portero local
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {homeGoalkeeperVariants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedHomeGoalkeeper(variant)}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                        realHomeGoalkeeper === variant
                          ? "bg-green-600 text-white"
                          : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {variantNames[variant] ?? variant}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  {realHomeGoalkeeper && (
                    <div className="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white px-4 py-8 shadow-2xl">
                      <img
                        src={`/kits/${homeTeam?.slug}/portero-${realHomeGoalkeeper}.png`}
                        alt={`Equipación portero ${match.homeTeam}`}
                        className="max-h-[470px] w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>

          {/* ================= ÁRBITRO ================= */}
          <article className="self-start rounded-[32px] border border-yellow-400/30 bg-black/45 p-6 shadow-2xl backdrop-blur-md">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                Equipo arbitral
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Árbitro
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {match.refereeId ?? "Pendiente de designación"}
              </p>
            </div>

            {/* COLORES */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {refereeKits.map((kit) => (
                <button
                  key={kit.key}
                  type="button"
                  onClick={() => setSelectedRefereeKit(kit.key)}
                  className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                    selectedRefereeKit === kit.key
                      ? "bg-yellow-400 text-slate-950"
                      : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {kit.label}
                </button>
              ))}
            </div>

            {/* EQUIPACIÓN ÁRBITRO */}
            <div className="mt-7 flex min-h-[720px] items-center justify-center p-3">
              <div className="flex min-h-[690px] w-full flex-col items-center justify-center overflow-hidden rounded-[28px] bg-white px-4 py-8 shadow-2xl">
                <img
                  src={`/referee-kits/${currentRefereeKit.shirt}`}
                  alt={`Camiseta arbitral ${currentRefereeKit.label}`}
                  className="h-72 w-full -translate-x-2 object-contain"
                />

                <img
  src="/referee-kits/pantalon_negro.png"
  alt="Pantalón arbitral negro"
  className="mt-2 h-40 w-[132%] max-w-none -translate-x-2 object-contain"
/>

                <img
  src={currentRefereeKit.socks}
  alt={`Medias arbitrales ${currentRefereeKit.label}`}
  className="mt-7 h-48 w-full max-w-none -translate-x-2 object-contain"
/>
              </div>
            </div>
          </article>

          {/* ================= VISITANTE ================= */}
          <article className="rounded-[32px] border border-white/15 bg-black/35 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              {awayTeam?.crest && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2">
                  <img
                    src={awayTeam.crest}
                    alt={match.awayTeam}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                  Equipo visitante
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {match.awayTeam}
                </h2>
              </div>
            </div>

            {/* VARIANTES VISITANTE */}
            <div className="mt-6 flex flex-wrap gap-2">
              {awayVariants.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setSelectedAwayVariant(variant)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    realAwayVariant === variant
                      ? "bg-blue-600 text-white"
                      : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {variantNames[variant] ?? variant}
                </button>
              ))}
            </div>

            {/* JUGADORES VISITANTE */}
            <div className="mt-6 flex min-h-[450px] items-center justify-center p-5">
              {realAwayVariant ? (
                <div className="flex h-[430px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white p-4 shadow-2xl">
                  <img
                    src={`/kits/${awayTeam?.slug}/${realAwayVariant}.png`}
                    alt={`Equipación ${realAwayVariant} de ${match.awayTeam}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-sm font-bold text-white/30">—</span>
              )}
            </div>

            {/* PORTERO VISITANTE */}
            {awayGoalkeeperVariants.length > 0 && (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-green-300">
                  Portero visitante
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {awayGoalkeeperVariants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedAwayGoalkeeper(variant)}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                        realAwayGoalkeeper === variant
                          ? "bg-green-600 text-white"
                          : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {variantNames[variant] ?? variant}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  {realAwayGoalkeeper && (
                    <div className="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white px-4 py-8 shadow-2xl">
                      <img
                        src={`/kits/${awayTeam?.slug}/portero-${realAwayGoalkeeper}.png`}
                        alt={`Equipación portero ${match.awayTeam}`}
                        className="max-h-[470px] w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}