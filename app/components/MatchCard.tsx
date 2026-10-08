"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

type MatchStatus = "No empezado" | "En directo" | "Finalizado";

type MatchCardProps = {
  homeTeam: string;
  awayTeam: string;
  homeBadge: string;
  awayBadge: string;
  stadium: string;
  date: string;
  time: string;
  referee: string;
  varReferee: string;
  refereePhoto: string;
  varRefereePhoto: string;
  status: MatchStatus;
  jornada?: string;
};

export default function MatchCard({
  homeTeam,
  awayTeam,
  homeBadge,
  awayBadge,
  stadium,
  date,
  time,
  referee,
  varReferee,
  refereePhoto,
  varRefereePhoto,
  status,
  jornada = "Jornada 1",
}: MatchCardProps) {
  const [ratingOpen, setRatingOpen] = useState(false);

  const kitSelectorUrl =
    `/kit-selector?local=${encodeURIComponent(homeTeam)}` +
    `&visitante=${encodeURIComponent(awayTeam)}` +
    `&fecha=${encodeURIComponent(date)}` +
    `&hora=${encodeURIComponent(time)}` +
    `&estadio=${encodeURIComponent(stadium)}` +
    `&arbitro=${encodeURIComponent(referee)}` +
    `&var=${encodeURIComponent(varReferee)}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
      <div className="relative px-6 py-6 sm:px-8">
        {/* Cabecera */}
       <div className="mt-6 text-center">
  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
    {date}
  </p>
</div>

        {/* Equipos y hora */}
        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          {/* Equipo local */}
<div className="flex flex-col items-center">
  <p className="text-xl font-bold text-white text-center">
    {homeTeam}
  </p>

<div className="mt-5 flex h-32 w-32 items-center justify-center rounded-3xl bg-white/95 p-4 shadow-xl">    <img
      src={homeBadge}
      alt={`Escudo de ${homeTeam}`}
      className="h-full w-full object-contain"
    />
  </div>
</div>

          {/* Hora */}
          <div className="flex min-w-24 flex-col items-center justify-center">
            

            <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">
              {time}
            </span>

            
          </div>

          {/* Equipo visitante */}
<div className="flex flex-col items-center">
  <p className="text-xl font-bold text-white text-center">
    {awayTeam}
  </p>

<div className="mt-5 flex h-32 w-32 items-center justify-center rounded-3xl bg-white/95 p-4 shadow-xl">    <img
      src={awayBadge}
      alt={`Escudo de ${awayTeam}`}
      className="h-full w-full object-contain"
    />
  </div>
</div>

        </div>

        {/* Estadio */}
        <div className="mt-8 border-t border-white/10 pt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Estadio
          </p>

          <p className="mt-1 text-base font-semibold text-gray-200">
            {stadium}
          </p>
        </div>

        {/* Equipo arbitral */}
<div className="mt-6 grid gap-4 sm:grid-cols-2">
  {/* Árbitro */}
  <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 text-center transition hover:border-blue-500/40">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
      Árbitro
    </p>

    <div className="mt-4 flex justify-center">
      <img
        src={refereePhoto}
        alt={referee}
className="h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg"      />
    </div>

    <p className="mt-3 text-base font-bold text-white">
      {referee}
    </p>
  </div>

  {/* VAR */}
  <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 text-center transition hover:border-blue-500/40">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
      VAR
    </p>

    <div className="mt-4 flex justify-center">
      <img
        src={varRefereePhoto}
        alt={varReferee}
        className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
      />
    </div>

    <p className="mt-3 text-base font-bold text-white">
      {varReferee}
    </p>
  </div>
</div>

        {/* Botones */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setRatingOpen((current) => !current)}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            {ratingOpen ? "Cerrar valoración" : "Valorar partido"}
          </button>

          <button
  type="button"
  disabled
  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-bold text-gray-500 cursor-not-allowed"
>
  Ver equipaciones (próximamente)
</button>
        </div>

        {/* Panel desplegable provisional */}
        {ratingOpen && (
          <div className="mt-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Valoración del partido
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Aquí aparecerán los criterios de valoración.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRatingOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}