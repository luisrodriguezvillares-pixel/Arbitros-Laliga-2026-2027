"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { matches } from "../../data/matches";
import { referees } from "../../data/referees";
import { supabase } from "../../../lib/supabase";

type Designacion = {
  match_id: string;
  referee_id: string | null;
  var_referee_id: string | null;
};

type SearchableRefereeSelectProps = {
  label: string;
  value: string;
  options: typeof referees;
  accent: "blue" | "green";
  onChange: (id: string | null) => void;
};

const principalRefereeIds = [
  "adrian-cordero-vega",
  "alejandro-hernandez-hernandez",
  "alejandro-quintero-gonzalez",
  "carlos-muniz-munoz",
  "cesar-soto-grado",
  "francisco-jose-hernandez-maeso",
  "isidro-diaz-de-mera-escuderos",
  "javier-alberola-rojas",
  "jesus-gil-manzano",
  "jon-ander-gonzalez-esteban",
  "jose-luis-munuera-montero",
  "jose-maria-sanchez-martinez",
  "juan-martinez-munuera",
  "luis-bestard-servera",
  "manuel-jesus-orellana-cid",
  "mateo-busquets-ferrer",
  "miguel-angel-ortiz-arias",
  "miguel-sesma-espinosa",
  "ricardo-de-burgos-bengoetxea",
  "victor-garcia-verdura",
];

const varRefereeIds = [
  "valentin-pizarro-gomez",
  "ruben-avalos-barrera",
  "raul-martin-gonzalez-frances",
  "luis-mario-milla-alvendiz",
  "juan-luis-pulido-santana",
  "jose-antonio-lopez-toca",
  "jorge-figueroa-vazquez",
  "javier-iglesias-villanueva",
  "ivan-caparros-hernandez",
  "guillermo-cuadra-fernandez",
  "david-galvez-rascon",
  "daniel-jesus-trujillo-suarez",
  "alvaro-moreno-aragon",
  "alejandro-muniz-ruiz",
  "carlos-del-cerro-grande",
];

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDate(date: string) {
  return date.split("-").reverse().join("-");
}

function SearchableRefereeSelect({
  label,
  value,
  options,
  accent,
  onChange,
}: SearchableRefereeSelectProps) {
  const selected = options.find((referee) => referee.id === value);

  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = options.find((referee) => referee.id === value);
    setQuery(current?.name ?? "");
  }, [value, options]);

  const filtered = useMemo(() => {
    const cleanQuery = normalizeText(query);

    if (!cleanQuery) return options;

    return options.filter((referee) =>
      normalizeText(referee.name).includes(cleanQuery)
    );
  }, [query, options]);

  const blue = accent === "blue";

  function seleccionar(id: string, name: string) {
    setQuery(name);
    setOpen(false);
    onChange(id);
  }

  return (
    <div className="relative">
      <label
        className={`mb-2 block text-sm font-black ${
          blue ? "text-blue-300" : "text-emerald-300"
        }`}
      >
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Escribe un nombre..."
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filtered.length > 0) {
              event.preventDefault();
              seleccionar(filtered[0].id, filtered[0].name);
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className={`w-full rounded-2xl border bg-slate-900 px-4 py-3 pr-12 font-bold text-white outline-none transition ${
            blue
              ? "border-blue-500/30 focus:border-blue-400"
              : "border-emerald-500/30 focus:border-emerald-400"
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-lg font-black text-slate-400 hover:text-white"
            aria-label="Quitar designación"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl">
          {filtered.length > 0 ? (
            filtered.map((referee, index) => (
              <button
                key={referee.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => seleccionar(referee.id, referee.name)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-white/10 ${
                  index === 0 ? "bg-white/5" : ""
                }`}
              >
                <span className="font-bold text-white">
                  {referee.name}
                </span>

                {index === 0 && query && (
                  <span className="text-xs font-bold text-slate-500">
                    ↵ Enter
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-slate-500">
              No se encontró ningún árbitro.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDesignacionesPage() {
  const [designaciones, setDesignaciones] = useState<
    Record<string, Designacion>
  >({});

  const [estado, setEstado] = useState("Cargando...");
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(1);

  const arbitrosPrincipales = useMemo(
    () =>
      referees.filter((referee) =>
        principalRefereeIds.includes(referee.id)
      ),
    []
  );

  const arbitrosVAR = useMemo(
    () =>
      referees.filter((referee) =>
        varRefereeIds.includes(referee.id)
      ),
    []
  );

  const jornadas = useMemo(() => {
    const ordenOriginal = new Map(
      matches.map((match, index) => [match.id, index])
    );

    const grouped = new Map<number, typeof matches>();

    matches.forEach((match) => {
      const partidos = grouped.get(match.matchday) ?? [];
      grouped.set(match.matchday, [...partidos, match]);
    });

    return Array.from(grouped.entries())
      .sort(([jornadaA], [jornadaB]) => jornadaA - jornadaB)
      .map(([jornada, partidos]) => [
        jornada,
        [...partidos].sort((a, b) => {
          const fecha = a.scheduledDate.localeCompare(b.scheduledDate);
          if (fecha !== 0) return fecha;

          if (a.kickoffTime && b.kickoffTime) {
            const hora = a.kickoffTime.localeCompare(b.kickoffTime);
            if (hora !== 0) return hora;
          } else if (a.kickoffTime && !b.kickoffTime) {
            return -1;
          } else if (!a.kickoffTime && b.kickoffTime) {
            return 1;
          }

          return (
            (ordenOriginal.get(a.id) ?? 0) -
            (ordenOriginal.get(b.id) ?? 0)
          );
        }),
      ] as const);
  }, []);

  const jornadaActual = jornadas.find(
    ([jornada]) => jornada === jornadaSeleccionada
  );

  useEffect(() => {
    async function cargarDesignaciones() {
      const { data, error } = await supabase
        .from("designaciones_arbitrales")
        .select("match_id, referee_id, var_referee_id");

      if (error) {
        console.error("Error cargando designaciones:", error);
        setEstado("Error al cargar");
        return;
      }

      const mapa: Record<string, Designacion> = {};

      (data ?? []).forEach((item) => {
        mapa[item.match_id] = item;
      });

      setDesignaciones(mapa);
      setEstado("Listo ✓");
    }

    cargarDesignaciones();
  }, []);

  async function guardarDesignacion(
    matchId: string,
    refereeId: string | null,
    varRefereeId: string | null
  ) {
    setEstado("Guardando...");

    setDesignaciones((actual) => ({
      ...actual,
      [matchId]: {
        match_id: matchId,
        referee_id: refereeId,
        var_referee_id: varRefereeId,
      },
    }));

    const { error } = await supabase
      .from("designaciones_arbitrales")
      .upsert(
        {
          match_id: matchId,
          referee_id: refereeId,
          var_referee_id: varRefereeId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "match_id",
        }
      );

    if (error) {
  console.error("Error guardando designación:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  setEstado(`Error: ${error.message}`);
  return;
}

    setEstado("Guardado ✓");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* CABECERA */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
              Administración
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Designaciones arbitrales
            </h1>

            <p className="mt-3 text-slate-400">
              Asigna árbitro principal y VAR por jornada.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:bg-white/10"
          >
            ← Administración
          </Link>
        </div>

        {/* ESTADO */}
        <div className="mt-6">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${
              estado === "Guardado ✓" || estado === "Listo ✓"
                ? "bg-emerald-500/15 text-emerald-300"
                : estado === "Guardando..."
                ? "bg-amber-500/15 text-amber-300"
                : estado.startsWith("Error")
                ? "bg-red-500/15 text-red-300"
                : "bg-white/5 text-slate-300"
            }`}
          >
            {estado}
          </span>
        </div>

        {/* LEYENDA */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4">
            <p className="font-black text-blue-300">
              Árbitro principal
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Solo aparecen los árbitros principales disponibles.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <p className="font-black text-emerald-300">
              VAR
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Solo aparecen los árbitros VAR disponibles.
            </p>
          </div>
        </div>

        {/* SELECTOR DE JORNADA */}
        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            Jornada para designar
          </p>

          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              {jornadas.map(([jornada]) => (
                <button
                  key={jornada}
                  type="button"
                  onClick={() => setJornadaSeleccionada(jornada)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-black transition ${
                    jornadaSeleccionada === jornada
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                      : "border border-white/10 bg-slate-900 text-slate-300 hover:border-blue-400/40 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-label={`Seleccionar jornada ${jornada}`}
                >
                  {jornada}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* JORNADAS */}
        <div className="mt-6 space-y-10">
          {jornadaActual && (() => {
            const [jornada, partidos] = jornadaActual;

            return (
            <section
              key={jornada}
              className="overflow-visible rounded-[32px] border border-white/10 bg-white/[0.03]"
            >
              {/* CABECERA JORNADA */}
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                  LaLiga EA Sports
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  Jornada {jornada}
                </h2>
              </div>

              {/* PARTIDOS */}
              <div className="grid gap-5 p-5">
                {partidos.map((match) => {
                  const designacion = designaciones[match.id];

                  const refereeId =
                    designacion?.referee_id ??
                    match.refereeId ??
                    "";

                  const varRefereeId =
                    designacion?.var_referee_id ??
                    match.varRefereeId ??
                    "";

                  return (
                    <article
                      key={match.id}
                      className="rounded-[26px] border border-white/10 bg-slate-950/70 p-6"
                    >
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-2xl font-black">
                            {match.homeTeam} – {match.awayTeam}
                          </h3>

                          <p className="mt-2 text-sm font-bold text-slate-400">
                            {formatDate(match.scheduledDate)} ·{" "}
                            {match.kickoffTime ?? "Hora pendiente"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {/* PRINCIPAL */}
                        <SearchableRefereeSelect
                          label="Árbitro principal"
                          value={refereeId}
                          options={arbitrosPrincipales}
                          accent="blue"
                          onChange={(nuevoRefereeId) =>
                            guardarDesignacion(
                              match.id,
                              nuevoRefereeId,
                              varRefereeId || null
                            )
                          }
                        />

                        {/* VAR */}
                        <SearchableRefereeSelect
                          label="VAR"
                          value={varRefereeId}
                          options={arbitrosVAR}
                          accent="green"
                          onChange={(nuevoVarId) =>
                            guardarDesignacion(
                              match.id,
                              refereeId || null,
                              nuevoVarId
                            )
                          }
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
            );
          })()}
        </div>
      </div>
    </main>
  );
}