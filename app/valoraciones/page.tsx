"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { matches } from "../data/matches";
import { teams } from "../data/teams";
import { getRefereeById } from "../data/referees";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

type Perfil = {
  nombre: string;
  rol: "admin" | "valorador";
};

const valoradores = [
  {
    id: "luis-rodriguez-villares",
    nombre: "Luis Rodríguez Villares",
  },
  {
    id: "rodrigo-hilla-blanc",
    nombre: "Rodrigo Hilla Blanc",
  },
];

function ValoracionesContent() {
  const searchParams = useSearchParams();

const [perfil, setPerfil] = useState<Perfil | null>(null);
const [sesionComprobada, setSesionComprobada] = useState(false);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(1);

const puedeValorar =
  perfil?.rol === "admin" || perfil?.rol === "valorador";

useEffect(() => {
  async function comprobarAcceso() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setPerfil(null);
      setSesionComprobada(true);
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", session.user.id)
      .single();

    if (error || !data) {
      setPerfil(null);
    } else {
      setPerfil(data as Perfil);
    }

    setSesionComprobada(true);
  }

  comprobarAcceso();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    comprobarAcceso();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const matchId = searchParams.get("partido");

  const match = matches.find((item) => item.id === matchId);
const [estadoGuardado, setEstadoGuardado] = useState("Cargando...");
const [datosCargados, setDatosCargados] = useState(false);

  const [criterios, setCriterios] = useState<Record<string, number>>({});

const notaBase = 6;

const notaCalculada =
  notaBase +

  // CONTROL Y COLOCACIÓN
  (criterios.control ?? 0) +
  (criterios.colocacion ?? 0) +

  // TARJETAS
  (criterios.amarilla_correcta ?? 0) * 0.75 -
  (criterios.amarilla_incorrecta ?? 0) * 0.75 +

  (criterios.roja_correcta ?? 0) * 1.5 -
  (criterios.roja_incorrecta ?? 0) * 1.5 +

  // PENALTIS
  (criterios.penalti_correcto ?? 0) * 1.25 -
  (criterios.penalti_incorrecto ?? 0) * 1.25 +

  // FALTAS Y VENTAJAS
  (criterios.falta_correcta ?? 0) * 0.25 -
  (criterios.falta_incorrecta ?? 0) * 0.25 +
  (criterios.falta_peligrosa_correcta ?? 0) * 0.5 -
  (criterios.falta_peligrosa_incorrecta ?? 0) * 0.5 +

  (criterios.ventaja_bien_aplicada ?? 0) * 0.25 -
  (criterios.ventaja_mal_aplicada ?? 0) * 0.25 +

  // BALÓN PARADO
  (criterios.saque_puerta_correcto ?? 0) * 0.15 -
  (criterios.saque_puerta_incorrecto ?? 0) * 0.15 +

  (criterios.corner_correcto ?? 0) * 0.15 -
  (criterios.corner_incorrecto ?? 0) * 0.15 +

  (criterios.saque_banda_correcto ?? 0) * 0.15 -
  (criterios.saque_banda_incorrecto ?? 0) * 0.15 +

  // TIEMPO AÑADIDO
  (criterios.anadido_correcto ?? 0) * 0.25 -
  (criterios.anadido_incorrecto ?? 0) * 0.25;

  const [comentario, setComentario] = useState("");
  const [accionesRelevantes, setAccionesRelevantes] = useState<
  {
    minuto: string;
    accion: string;
    valor: number;
    decision: "correcta" | "incorrecta";
  }[]
>([]);
const valorAccionesRelevantes = accionesRelevantes.reduce(
  (total, accion) => total + Number(accion.valor ?? 0),
  0
);

const notaEnDirecto = Math.max(
  0,
  Math.min(10, notaCalculada + valorAccionesRelevantes)
).toFixed(2);

  const [estado, setEstado] =
    useState<"borrador" | "directo">("borrador");
  const [valoradorSeleccionado, setValoradorSeleccionado] =
  useState<string | null>(null);

const [minutoAccion, setMinutoAccion] = useState("");
const [textoAccion, setTextoAccion] = useState("");
const [valorAccion, setValorAccion] = useState("");
const [valoracionAccion, setValoracionAccion] =
  useState<"correcta" | "incorrecta">("correcta");

const [acciones, setAcciones] = useState<
  {
    minuto: string;
    texto: string;
    valor: number;
    valoracion: "correcta" | "incorrecta";
  }[]
>([]);

  const [otraValoracion, setOtraValoracion] = useState<{
  valorador_nombre: string | null;
  criterios: Record<string, number>;
  comentario: string;
  decisiones_clave: {
    minuto: string;
    accion: string;
    valor: number;
    decision: "correcta" | "incorrecta";
  }[];
  nota_final: number | null;
} | null>(null);

const [verOtraCompleta, setVerOtraCompleta] = useState(false);
async function eliminarValoracionActual() {
  if (!match || !valoradorSeleccionado) return;

  const confirmar = window.confirm(
    "¿Seguro que quieres eliminar esta valoración? Esta acción no se puede deshacer."
  );

  if (!confirmar) return;

  setEstadoGuardado("Eliminando...");

  const { error } = await supabase
    .from("valoraciones")
    .delete()
    .eq("match_id", match.id)
    .eq("valorador_id", valoradorSeleccionado);

  if (error) {
    console.error("Error eliminando valoración:", error);
    setEstadoGuardado("Error al eliminar");
    return;
  }

  setCriterios({});
  setComentario("");
  setAccionesRelevantes([]);
  setEstado("borrador");
  setDatosCargados(true);
  setEstadoGuardado("Valoración eliminada ✓");
}

const homeTeam = match
  ? teams.find(
      (team) => team.slug === teamSlugByMatchName[match.homeTeam]
    )
  : undefined;
  const [refereeId, setRefereeId] = useState<string | null>(
  match?.refereeId ?? null
);

const [varRefereeId, setVarRefereeId] = useState<string | null>(
  match?.varRefereeId ?? null
);

useEffect(() => {
  if (!match) return;

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

useEffect(() => {
  if (!match || !valoradorSeleccionado) return;

  const currentMatch = match;

  async function cargarValoracion() {
    setDatosCargados(false);
    setEstadoGuardado("Cargando...");

    const { data, error } = await supabase
      .from("valoraciones")
      .select("criterios, comentario, estado, nota_final, decisiones_clave")
      .eq("match_id", currentMatch.id)
      .eq("valorador_id", valoradorSeleccionado)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error cargando valoración:", error);
      setEstadoGuardado("Error al cargar");
      setDatosCargados(false);
      return;
    }

    if (data) {
      setCriterios(data.criterios ?? {});
      setComentario(data.comentario ?? "");
setAccionesRelevantes(data.decisiones_clave ?? []);
setEstado(data.estado ?? "borrador");
    } else {
  setCriterios({});
  setComentario("");
  setAccionesRelevantes([]);
  setEstado("borrador");
}

    setDatosCargados(true);
    setEstadoGuardado("Guardado ✓");
  }

  cargarValoracion();
}, [match, valoradorSeleccionado]);

useEffect(() => {
  if (!match) return;

  const currentMatch = match;
  if (!valoradorSeleccionado) return;
  const otroValoradorId =
    valoradorSeleccionado === "luis-rodriguez-villares"
      ? "rodrigo-hilla-blanc"
      : "luis-rodriguez-villares";

  async function cargarOtraValoracion() {
    const { data, error } = await supabase

  .from("valoraciones")

.select("valorador_id, valorador_nombre, criterios, comentario, decisiones_clave, nota_final")
  .eq("match_id", currentMatch.id)

  .eq("valorador_id", otroValoradorId)

  .limit(1)

  .maybeSingle();

    if (error) {
      console.error("Error cargando la otra valoración:", error);
      return;
    }

    setOtraValoracion(
      data
        ? {
            valorador_nombre: data.valorador_nombre ?? null,
            criterios: data.criterios ?? {},
            comentario: data.comentario ?? "",
            decisiones_clave: data.decisiones_clave ?? [],
            nota_final:
  data.criterios && Object.keys(data.criterios).length > 0
    ? Math.max(
        0,
        Math.min(
          10,
          6 +
            (data.criterios.control ?? 0) +
            (data.criterios.colocacion ?? 0) +

            (data.criterios.amarilla_correcta ?? 0) * 0.75 -
            (data.criterios.amarilla_incorrecta ?? 0) * 0.75 +

            (data.criterios.roja_correcta ?? 0) * 1.5 -
            (data.criterios.roja_incorrecta ?? 0) * 1.5 +

            (data.criterios.penalti_correcto ?? 0) * 1.25 -
            (data.criterios.penalti_incorrecto ?? 0) * 1.25 +

            (data.criterios.falta_correcta ?? 0) * 0.25 -
            (data.criterios.falta_incorrecta ?? 0) * 0.25 +
             (data.criterios.falta_peligrosa_correcta ?? 0) * 0.5 -
             (data.criterios.falta_peligrosa_incorrecta ?? 0) * 0.5 +

            (data.criterios.ventaja_bien_aplicada ?? 0) * 0.25 -
            (data.criterios.ventaja_mal_aplicada ?? 0) * 0.25 +

            (data.criterios.saque_puerta_correcto ?? 0) * 0.15 -
            (data.criterios.saque_puerta_incorrecto ?? 0) * 0.15 +

            (data.criterios.corner_correcto ?? 0) * 0.15 -
            (data.criterios.corner_incorrecto ?? 0) * 0.15 +

            (data.criterios.saque_banda_correcto ?? 0) * 0.15 -
            (data.criterios.saque_banda_incorrecto ?? 0) * 0.15 +

            (data.criterios.anadido_correcto ?? 0) * 0.25 -
            (data.criterios.anadido_incorrecto ?? 0) * 0.25 +

            (data.decisiones_clave ?? []).reduce(
              (total: number, accion: { valor?: number }) =>
                total + Number(accion.valor ?? 0),
              0
            )
        )
      )
    : null,
          }
        : null
    );
  }

  cargarOtraValoracion();
}, [match, valoradorSeleccionado]);

useEffect(() => {
  if (!match) return;

  const currentMatch = match;
  if (!valoradorSeleccionado) return;
  const otroValoradorId =
    valoradorSeleccionado === "luis-rodriguez-villares"
      ? "rodrigo-hilla-blanc"
      : "luis-rodriguez-villares";

  const canal = supabase
    .channel(`valoracion-directo-${currentMatch.id}-${otroValoradorId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "valoraciones",
        filter: `match_id=eq.${currentMatch.id}`,
      },
      (payload) => {
        const nueva = payload.new as {
          valorador_id?: string;
          valorador_nombre?: string | null;
          criterios?: Record<string, number>;
          comentario?: string;
          nota_final?: number | null;
          decisiones_clave?: {
  minuto: string;
  accion: string;
  valor: number;
  decision: "correcta" | "incorrecta";
}[];
        };

        if (nueva.valorador_id !== otroValoradorId) return;

        const c = nueva.criterios ?? {};

const notaOtro =
  Object.keys(c).length > 0
    ? Math.max(
        0,
        Math.min(
          10,
          6 +
            (c.control ?? 0) +
            (c.colocacion ?? 0) +

            (c.amarilla_correcta ?? 0) * 0.75 -
            (c.amarilla_incorrecta ?? 0) * 0.75 +

            (c.roja_correcta ?? 0) * 1.5 -
            (c.roja_incorrecta ?? 0) * 1.5 +

            (c.penalti_correcto ?? 0) * 1.25 -
            (c.penalti_incorrecto ?? 0) * 1.25 +

            (c.falta_correcta ?? 0) * 0.25 -
            (c.falta_incorrecta ?? 0) * 0.25 +
             (c.falta_peligrosa_correcta ?? 0) * 0.5 -
             (c.falta_peligrosa_incorrecta ?? 0) * 0.5 +

            (c.ventaja_bien_aplicada ?? 0) * 0.25 -
            (c.ventaja_mal_aplicada ?? 0) * 0.25 +

            (c.saque_puerta_correcto ?? 0) * 0.15 -
            (c.saque_puerta_incorrecto ?? 0) * 0.15 +

            (c.corner_correcto ?? 0) * 0.15 -
            (c.corner_incorrecto ?? 0) * 0.15 +

            (c.saque_banda_correcto ?? 0) * 0.15 -
            (c.saque_banda_incorrecto ?? 0) * 0.15 +

            (c.anadido_correcto ?? 0) * 0.25 -
            (c.anadido_incorrecto ?? 0) * 0.25 +

            (nueva.decisiones_clave ?? []).reduce(
              (total: number, accion: { valor?: number }) =>
                total + Number(accion.valor ?? 0),
              0
            )
        )
      )
    : null;
setOtraValoracion({
  valorador_nombre: nueva.valorador_nombre ?? null,
  criterios: c,
  comentario: nueva.comentario ?? "",
decisiones_clave: nueva.decisiones_clave ?? [],
nota_final: notaOtro,
});
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(canal);
  };
}, [match, valoradorSeleccionado]);

  
  useEffect(() => {
  if (!match || !valoradorSeleccionado || !datosCargados || !sesionComprobada || !puedeValorar) return;
  
  const timeout = setTimeout(async () => {
    setEstadoGuardado("Guardando...");

    const notaFinal = Number(notaEnDirecto);

    const { error } = await supabase
      .from("valoraciones")
      .upsert(
        {
          match_id: match.id,
          valorador_id: valoradorSeleccionado,
valorador_nombre:
  valoradores.find((v) => v.id === valoradorSeleccionado)?.nombre ?? null,
          referee_id: refereeId,
          var_referee_id: varRefereeId,
          estado: estado,
          nota_final: notaFinal,
          criterios: criterios,
          decisiones_clave: accionesRelevantes,
          comentario: comentario,
          updated_at: new Date().toISOString(),
          
        },
        {
  onConflict: "match_id,valorador_id",
}
      );

    if (error) {
      console.error("Error autoguardado:", error);
      setEstadoGuardado("Error al guardar");
    } else {
      setEstadoGuardado("Guardado ✓");
    }
  }, 700);

  return () => clearTimeout(timeout);
}, [
  match,
  criterios,
  comentario,
  estado,
  accionesRelevantes,
  datosCargados,
  valoradorSeleccionado,
  refereeId,
    varRefereeId,
  sesionComprobada,
  puedeValorar,
]);
  if (!sesionComprobada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <p className="text-lg font-black text-slate-300">Comprobando acceso...</p>
      </main>
    );
  }

  if (!puedeValorar) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <section className="w-full max-w-xl rounded-[32px] border border-red-400/20 bg-white/5 p-8 text-center shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
            Área privada
          </p>
          <h1 className="mt-3 text-3xl font-black">Valoraciones arbitrales</h1>
          <p className="mt-4 font-semibold leading-7 text-slate-300">
            Las valoraciones son privadas y solo pueden consultarlas los valoradores autorizados.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-500"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  if (!valoradorSeleccionado) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <section className="mx-auto max-w-xl rounded-[28px] border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-blue-300">Valoraciones</p>
          <h1 className="mt-4 text-3xl font-black">¿Quién va a valorar?</h1>
          <p className="mt-3 text-slate-300">Elige tu nombre antes de acceder al partido. Tu valoración se guardará por separado.</p>
          <div className="mt-8 grid gap-4">
            {valoradores.map((valorador) => (
              <button
                key={valorador.id}
                type="button"
                onClick={() => {
                  setDatosCargados(false);
                  setCriterios({});
                  setComentario("");
                  setAccionesRelevantes([]);
                  setEstado("borrador");
                  setValoradorSeleccionado(valorador.id);
                }}
                className="rounded-2xl border border-blue-400/30 bg-blue-600/20 px-6 py-5 text-lg font-black text-white transition hover:bg-blue-600/40"
              >
                {valorador.nombre} →
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (!match) {
    const partidosDeJornada = matches
      .filter((partido) => partido.matchday === jornadaSeleccionada)
      .sort((a, b) => `${a.scheduledDate}T${a.kickoffTime ?? "23:59"}`.localeCompare(`${b.scheduledDate}T${b.kickoffTime ?? "23:59"}`));
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-black">Valoraciones arbitrales</h1>
          <p className="mt-3 text-slate-300">Selecciona una jornada y después el partido que quieras valorar.</p>
          <label htmlFor="jornada-valoraciones" className="mt-8 block font-bold">Jornada</label>
          <select id="jornada-valoraciones" value={jornadaSeleccionada} onChange={(e) => setJornadaSeleccionada(Number(e.target.value))} className="mt-2 w-full max-w-xs rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-white">
            {Array.from({ length: 38 }, (_, index) => index + 1).map((numero) => <option key={numero} value={numero}>Jornada {numero}</option>)}
          </select>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {partidosDeJornada.map((partido) => (
              <Link key={partido.id} href={`/valoraciones?partido=${encodeURIComponent(partido.id)}`} className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:border-blue-400 hover:bg-white/10">
                <span className="text-sm font-bold text-blue-300">Jornada {partido.matchday} · {partido.scheduledDate} · {partido.kickoffTime ?? "Hora pendiente"}</span>
                <span className="mt-2 block text-lg font-black">{partido.homeTeam} – {partido.awayTeam}</span>
                <span className="mt-3 block text-sm font-bold text-blue-300">Valorar partido →</span>
              </Link>
            ))}
            {partidosDeJornada.length === 0 && <p className="text-slate-300">No hay partidos cargados para esta jornada.</p>}
          </div>
        </div>
      </main>
    );
  }
  return (
<main
  className="min-h-screen bg-slate-950 bg-cover bg-center bg-fixed px-5 py-10 text-white sm:px-8"
  style={{
    backgroundImage: homeTeam?.stadiumImage
      ? `linear-gradient(rgba(2, 6, 23, 0.76), rgba(2, 6, 23, 0.88)), url("${homeTeam.stadiumImage}")`
      : undefined,
  }}
>      <div className="mx-auto max-w-7xl">
        {/* CABECERA */}
        <header>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">
            LaLiga EA Sports 2026/2027
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Valoraciones arbitrales
          </h1>
          <div className="mt-4">
  <button
    type="button"
    onClick={eliminarValoracionActual}
    className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/20"
  >
    Eliminar valoración
  </button>
</div>

<div className="mt-6">
  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
    Valorador
  </p>

  <div className="inline-flex rounded-2xl border border-blue-400/30 bg-blue-600/20 px-5 py-3 text-sm font-black text-blue-100">
    {valoradores.find((v) => v.id === valoradorSeleccionado)?.nombre}
  </div>
</div>

{/* VALORACIÓN DEL OTRO VALORADOR */}
<section className="mt-6 rounded-[26px] border border-emerald-400/20 bg-emerald-500/10 p-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
        Valoración del otro valorador
      </p>

      {otraValoracion ? (
        <>
          <h2 className="mt-2 text-lg font-black text-white">
            {otraValoracion.valorador_nombre ?? "Valorador"}
          </h2>

          <div className="mt-3 flex items-end gap-3">
            <span className="text-sm font-black uppercase tracking-[0.15em] text-slate-400">
              Nota actual
            </span>

            <span className="text-4xl font-black leading-none text-emerald-300">
              {otraValoracion.nota_final !== null
                ? otraValoracion.nota_final.toFixed(2)
                : "—"}
            </span>

            <span className="text-xl font-black text-slate-300">
              / 10
            </span>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm font-bold text-slate-400">
          El otro valorador todavía no ha iniciado su valoración.
        </p>
      )}
    </div>

    <button
  type="button"
  disabled={!otraValoracion}
  onClick={() => setVerOtraCompleta((actual) => !actual)}
  className="rounded-2xl border border-emerald-400/30 bg-black/20 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
>
  {verOtraCompleta
    ? "Ocultar valoración completa"
    : "Ver valoración completa del otro valorador"}
</button>
  </div>

{verOtraCompleta && otraValoracion && (
  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Object.entries(otraValoracion.criterios).map(([key, valor]) => (
      <div
        key={key}
        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
      >
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
          {key.replaceAll("_", " ")}
        </p>

        <p className="mt-1 text-xl font-black text-white">
          {valor}
        </p>
      </div>
    ))}

{otraValoracion.decisiones_clave.length > 0 && (
  <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-4">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
      Acciones relevantes
    </p>

    <div className="mt-3 grid gap-2">
      {otraValoracion.decisiones_clave.map((item, index) => (
        <div
          key={`${item.minuto}-${index}`}
          className="grid gap-2 rounded-xl bg-white/5 px-3 py-3 sm:grid-cols-[80px_1fr_100px]"
        >
          <span className="font-black text-amber-300">
            {item.minuto || "—"}
          </span>

          <span className="font-bold text-white">
            {item.accion}
          </span>

          <span
            className={`font-black ${
              item.valor > 0
                ? "text-emerald-300"
                : item.valor < 0
                ? "text-red-300"
                : "text-slate-300"
            }`}
          >
            {item.valor > 0 ? "+" : ""}
            {item.valor.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

    {otraValoracion.comentario && (
      <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
          Comentario
        </p>

        <p className="mt-2 text-slate-200">
          {otraValoracion.comentario}
        </p>
      </div>
    )}
  </div>
)}
</section>

<div className="mt-4 flex items-center gap-3">
  <span
    className={`h-2.5 w-2.5 rounded-full ${
      estadoGuardado === "Guardado ✓"
        ? "bg-emerald-400"
        : estadoGuardado === "Guardando..."
        ? "bg-amber-400"
        : "bg-red-500"
    }`}
  />

  <span className="text-sm font-bold text-slate-300">
    {estadoGuardado}
  </span>
</div>

<div className="mt-4 rounded-[28px] border border-blue-400/30 bg-blue-500/10 p-5">
  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
    Nota en directo
  </p>

  <p className="mt-2 text-5xl font-black text-white">
    {notaEnDirecto} / 10
  </p>
</div>

          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-slate-300">
            Analiza cada actuación arbitral de forma ordenada, criterio por criterio.
          </p>
        </header>

        {/* RESUMEN DEL PARTIDO */}
        <section className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Partido
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-sm font-bold text-slate-400">
                Equipo local
              </p>

              <p className="mt-2 text-xl font-black">
  {match?.homeTeam ?? "Pendiente"}
</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-sm font-bold text-slate-400">
                Fecha y hora
              </p>

              <p className="mt-2 text-xl font-black">
  {match
  ? `${match.scheduledDate.split("-").reverse().join("-")} · ${
      match.kickoffTime ?? "Hora pendiente"
    }`
  : "Pendiente"}
</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-sm font-bold text-slate-400">
                Equipo visitante
              </p>

              <p className="mt-2 text-xl font-black">
  {match?.awayTeam ?? "Pendiente"}
</p>
            </div>
          </div>
        </section>

        {/* ÁRBITROS */}
<section className="mt-6 grid gap-6 lg:grid-cols-2">

  {/* ÁRBITRO PRINCIPAL */}
  <article className="rounded-[32px] border-2 border-blue-500/50 bg-blue-950/30 p-6 shadow-xl">
    <p className="inline-flex rounded-full bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
  Árbitro principal
</p>
    {referee ? (
      <div className="mt-5 flex items-center gap-5">
        <div className="flex h-28 w-28 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-slate-900">
          <img
            src={`/referees/principales/${referee.id}.png`}
            alt={referee.name}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <h2 className="text-2xl font-black">
            {referee.name}
          </h2>
        </div>
      </div>
    ) : (
      <h2 className="mt-2 text-2xl font-black">
        Pendiente de designación
      </h2>
    )}
  </article>

  {/* VAR */}
  <article className="rounded-[32px] border-2 border-emerald-500/50 bg-emerald-950/30 p-6 shadow-xl">
    <p className="inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
  VAR
</p>

    {varReferee ? (
      <div className="mt-5 flex items-center gap-5">
        <div className="flex h-28 w-28 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-slate-900">
          <img
            src={`/referees/var/${varReferee.id}.png`}
            alt={varReferee.name}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <h2 className="text-2xl font-black">
            {varReferee.name}
          </h2>
        </div>
      </div>
    ) : (
      <h2 className="mt-2 text-2xl font-black">
        Pendiente de designación
      </h2>
    )}
  </article>

</section>

        {/* CRITERIOS */}
        <section className="mt-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
              Valoración
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Criterios del partido
            </h2>
          </div>

          <div className="mt-6 grid gap-6">

  {/* CONTROL Y COLOCACIÓN */}
<div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
  <h3 className="text-lg font-black text-blue-300">
    Control y colocación
  </h3>

  {[
    ["Control", "control"],
    ["Colocación", "colocacion"],
  ].map(([label, key]) => (
    <div key={key} className="mt-5">
      <p className="mb-3 font-black text-white">{label}</p>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2">
          {[-0.5, -0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5].map(
            (valor) => (
              <button
                key={valor}
                type="button"
                onClick={() =>
                  setCriterios((actual) => ({
                    ...actual,
                    [key]: valor,
                  }))
                }
                className={`min-w-[64px] rounded-xl border px-3 py-3 text-sm font-black transition ${
                  (criterios[key] ?? 0) === valor
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {valor > 0 ? "+" : ""}
                {valor === 0 ? "0" : valor.toFixed(1).replace(".", ",")}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  ))}
</div>

  {/* TARJETAS */}
<div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
  <h3 className="text-lg font-black text-yellow-300">
    Tarjetas
  </h3>

  <div className="mt-5 grid gap-5 lg:grid-cols-2">

    {/* TARJETAS AMARILLAS */}
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
      <p className="mb-3 text-base font-black uppercase tracking-[0.16em] text-yellow-400">
  Tarjetas amarillas
</p>

      <div className="grid gap-3">
        {[
          ["amarilla_correcta", "Tarjeta amarilla correcta"],
          ["amarilla_incorrecta", "Tarjeta amarilla incorrecta"],
        ].map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
          >
            <span className="font-bold text-white">
  {label}
</span>

            <input
              type="number"
              min="0"
              value={criterios[key] ?? 0}
              onChange={(e) =>
                setCriterios((actual) => ({
                  ...actual,
                  [key]: Number(e.target.value),
                }))
              }
              className="w-20 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center font-black"
            />
          </div>
        ))}
      </div>
    </div>

    {/* TARJETAS ROJAS */}
    <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
      <p className="mb-3 text-base font-black uppercase tracking-[0.16em] text-red-400">
  Tarjetas rojas
</p>

      <div className="grid gap-3">
        {[
          ["roja_correcta", "Tarjeta roja correcta"],
          ["roja_incorrecta", "Tarjeta roja incorrecta"],
        ].map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
          >
            <span className="font-bold text-white">
  {label}
</span>

            <input
              type="number"
              min="0"
              value={criterios[key] ?? 0}
              onChange={(e) =>
                setCriterios((actual) => ({
                  ...actual,
                  [key]: Number(e.target.value),
                }))
              }
              className="w-20 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center font-black"
            />
          </div>
        ))}
      </div>
    </div>

  </div>
</div>

  {/* PENALTIS */}
<div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
  <h3 className="text-lg font-black text-orange-300">
    Penaltis
  </h3>

  <div className="mt-4 grid gap-3 sm:grid-cols-2">
    {[
  ["penalti_correcto", "Penalti bien señalado"],
  ["penalti_incorrecto", "Penalti mal señalado / no señalado"],
].map(([key, label]) => (
      <div
        key={key}
        className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4"
      >
        <span className="font-bold">{label}</span>

        <input
          type="number"
          min="0"
          value={criterios[key] ?? 0}
          onChange={(e) =>
            setCriterios((actual) => ({
              ...actual,
              [key]: Number(e.target.value),
            }))
          }
          className="w-20 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center font-black"
        />
      </div>
    ))}
  </div>
</div>

  
  {/* FALTAS, VENTAJA Y BALÓN PARADO */}
<div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
  <h3 className="text-lg font-black text-cyan-300">
    Faltas y ventaja
  </h3>

  <div className="mt-4 grid gap-3 sm:grid-cols-2">
    {[
  ["falta_correcta", "Falta bien pitada"],
  ["falta_incorrecta", "Falta mal pitada / no pitada"],
  ["falta_peligrosa_correcta", "Falta peligrosa bien pitada (+0,5)"],
  ["falta_peligrosa_incorrecta", "Falta peligrosa mal pitada / no pitada (-0,5)"],
  ["ventaja_bien_aplicada", "Ventaja bien aplicada"],
  ["ventaja_mal_aplicada", "Ventaja mal aplicada"],
].map(([key, label]) => (
      <div
        key={key}
        className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4"
      >
        <span className="font-bold">{label}</span>

        <input
          type="number"
          min="0"
          value={criterios[key] ?? 0}
          onChange={(e) =>
            setCriterios((actual) => ({
              ...actual,
              [key]: Number(e.target.value),
            }))
          }
          className="w-20 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center font-black"
        />
      </div>
    ))}
  </div>

  <div className="mt-6 border-t border-white/10 pt-5">
    <h4 className="font-black text-white">
      Balón parado
    </h4>

    <p className="mt-1 text-xs font-bold text-slate-400">
      Saque de puerta · Córner · Saque de banda
    </p>

    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      {[
        [
          "Saque de puerta",
          "saque_puerta_correcto",
          "saque_puerta_incorrecto",
        ],
        [
          "Córner",
          "corner_correcto",
          "corner_incorrecto",
        ],
        [
          "Saque de banda",
          "saque_banda_correcto",
          "saque_banda_incorrecto",
        ],
      ].map(([label, keyCorrecto, keyIncorrecto]) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="font-black text-white">{label}</p>

          <div className="mt-3 grid gap-3">
            <label className="flex items-center justify-between gap-3 text-sm font-bold text-emerald-300">
              Correcto

              <input
                type="number"
                min="0"
                value={criterios[keyCorrecto] ?? 0}
                onChange={(e) =>
                  setCriterios((actual) => ({
                    ...actual,
                    [keyCorrecto]: Number(e.target.value),
                  }))
                }
                className="w-16 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-center font-black text-white"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-sm font-bold text-red-300">
              Mal pitado / no pitado

              <input
                type="number"
                min="0"
                value={criterios[keyIncorrecto] ?? 0}
                onChange={(e) =>
                  setCriterios((actual) => ({
                    ...actual,
                    [keyIncorrecto]: Number(e.target.value),
                  }))
                }
                className="w-16 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-center font-black text-white"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  {/* TIEMPO AÑADIDO */}
  <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
    <h3 className="text-lg font-black text-purple-300">
      Tiempo añadido
    </h3>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {[
        ["anadido_correcto", "Añadido correcto"],
        ["anadido_incorrecto", "Añadido incorrecto"],
      ].map(([key, label]) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
        >
          <span className="font-bold">{label}</span>

          <input
            type="number"
            min="0"
            value={criterios[key] ?? 0}
            onChange={(e) =>
              setCriterios((actual) => ({
                ...actual,
                [key]: Number(e.target.value),
              }))
            }
            className="w-20 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center font-black"
          />
        </div>
      ))}
    </div>
  </div>

</div>
        </section>

        {/* DECISIONES CLAVE */}
        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Decisiones clave
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Acciones relevantes
          </h2>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
  <div className="grid gap-4 md:grid-cols-[110px_1fr_150px_160px_auto]">
    <input
      type="text"
      placeholder="Minuto"
      id="accion-minuto"
      className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold text-white outline-none"
    />

    <input
      type="text"
      placeholder="Acción / jugada"
      id="accion-texto"
      className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold text-white outline-none"
    />

<input
  type="number"
  step="0.05"
  placeholder="Valor"
  id="accion-valor"
  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold text-white outline-none"
/>

    <select
      id="accion-decision"
      className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold text-white outline-none"
      defaultValue="correcta"
    >
      <option value="correcta">Correcta</option>
      <option value="incorrecta">Incorrecta</option>
    </select>

    <button
      type="button"
      onClick={() => {
        const minutoInput = document.getElementById(
          "accion-minuto"
        ) as HTMLInputElement;

        const accionInput = document.getElementById(
          "accion-texto"
        ) as HTMLInputElement;

        const decisionInput = document.getElementById(
          "accion-decision"
        ) as HTMLSelectElement;

        const valorInput = document.getElementById(
  "accion-valor"
) as HTMLInputElement;

        if (!accionInput.value.trim()) return;

        setAccionesRelevantes((actual) => [
          ...actual,
          {
  minuto: minutoInput.value,
  accion: accionInput.value,
  valor: Number(valorInput.value || 0),
  decision: decisionInput.value as "correcta" | "incorrecta",
},
        ]);

        minutoInput.value = "";
        accionInput.value = "";
        valorInput.value = "";
      }}
      className="rounded-2xl bg-blue-600 px-6 py-3 font-black text-white shadow-lg transition hover:bg-blue-500"
    >
      Añadir
    </button>
  </div>

  {accionesRelevantes.length > 0 && (
    <div className="mt-6 grid gap-3">
      {accionesRelevantes.map((item, index) => (
        <div
          key={`${item.minuto}-${index}`}
          className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[90px_1fr_110px_130px_auto] md:items-center"
        >
          <p className="font-black text-amber-300">
            {item.minuto || "—"}
          </p>

          <p className="font-bold text-white">
            {item.accion}
          </p>

          <p
  className={`text-lg font-black ${
    item.valor > 0
      ? "text-emerald-300"
      : item.valor < 0
      ? "text-red-300"
      : "text-slate-300"
  }`}
>
  {item.valor > 0 ? "+" : ""}
  {item.valor.toFixed(2)}
</p>
          
          <p
            className={`font-black ${
              item.decision === "correcta"
                ? "text-emerald-300"
                : "text-red-300"
            }`}
          >
            {item.decision === "correcta"
              ? "Correcta"
              : "Incorrecta"}
          </p>

          <button
            type="button"
            onClick={() =>
              setAccionesRelevantes((actual) =>
                actual.filter((_, i) => i !== index)
              )
            }
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-black text-red-300"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )}
</div>
        </section>
      
      {/* LEYENDA DE EVALUACIÓN */}
<section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6">
  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
    Criterio de valoración
  </p>

  <h2 className="mt-2 text-3xl font-black">
    Leyenda de evaluación
  </h2>

  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
    {[
  ["Control", "−0,50 a +0,50", "11 opciones"],
  ["Colocación", "−0,50 a +0,50", "11 opciones"],
  ["Tarjeta amarilla", "+0,75", "−0,75"],
  ["Tarjeta roja", "+1,50", "−1,50"],
  ["Penalti", "+1,25", "−1,25"],
  ["Falta", "+0,25", "−0,25"],
  ["Ventaja", "+0,25", "−0,25"],
  ["Saque de puerta / córner / saque de banda", "+0,15", "−0,15"],
  ["Tiempo añadido", "+0,25", "−0,25"],
].map(([accion, acierto, error]) => (
      <div
        key={accion}
        className="grid grid-cols-3 border-b border-white/10 px-4 py-4 last:border-b-0"
      >
        <span className="font-bold text-white">{accion}</span>

        <span className="text-center font-black text-emerald-400">
          {acierto}
        </span>

        <span className="text-center font-black text-red-400">
          {error}
        </span>
      </div>
    ))}
  </div>

  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
  <p className="font-black text-emerald-300">
    📺 Criterio de intervención VAR
  </p>

  <p className="mt-2 leading-7 text-slate-300">
    Si el VAR interviene y acierta cambiando la decisión: 0 puntos.
  </p>

  <p className="mt-3 leading-7 text-slate-300">
    Si el VAR falla cuando la decisión inicial del árbitro era correcta:
    −1,50 puntos.
  </p>

  <p className="mt-3 leading-7 text-slate-300">
    Si la decisión era incorrecta y continúa siendo incorrecta aun después
    de haber visto o revisado la acción: −1,50 puntos.
  </p>

  <p className="mt-3 text-sm font-bold text-slate-400">
    La intervención VAR se introduce dentro de la valoración por escrito /
    detallada, no mediante botones independientes.
  </p>
</div>
</section>

        {/* NOTA FINAL */}
        <section className="mt-10 rounded-[32px] border border-blue-400/20 bg-blue-500/10 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Resultado
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Nota final
              </h2>
            </div>

           <p className="text-5xl font-black">
  {notaEnDirecto} / 10
</p>
          </div>
        </section>

      </div>
    </main>
  );
}
export default function ValoracionesPage() {
  return (
    <Suspense fallback={<div>Cargando valoraciones...</div>}>
      <ValoracionesContent />
    </Suspense>
  );
}
