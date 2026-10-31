"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { referees } from "../data/referees";
import { matches } from "../data/matches";

type Vista = "general" | "luis-rodriguez-villares" | "rodrigo-hilla-blanc";

type Perfil = {
  nombre: string;
  rol: "admin" | "valorador";
};

type Orden = "media" | "puntos";

type AccionRelevante = {
  minuto?: string;
  accion?: string;
  valor?: number;
  decision?: "correcta" | "incorrecta";
};

type ValoracionDB = {
  id?: number;
  match_id: string;
  referee_id: string | null;
  valorador_id: string | null;
  valorador_nombre: string | null;
  criterios: Record<string, number> | null;
  decisiones_clave: AccionRelevante[] | null;
  nota_final: number | null;
  updated_at?: string | null;
};

type PartidoCalculado = {
  matchId: string;
  nota: number;
  jornada: number | null;
  nombrePartido: string;
};

type FilaRanking = {
  refereeId: string;
  nombre: string;
  partidos: PartidoCalculado[];
  partidosArbitrados: number;
  media: number | null;
  puntos: number;
};

const ARBITROS_PRINCIPALES = [
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

const nombresValoradores: Record<Vista, string> = {
  general: "General",
  "luis-rodriguez-villares": "Luis Rodríguez Villares",
  "rodrigo-hilla-blanc": "Rodrigo Hilla Blanc",
};

function limitarNota(nota: number) {
  return Math.max(0, Math.min(10, nota));
}

/*
  IMPORTANTE:
  La clasificación NO depende del nota_final antiguo que pueda existir
  en Supabase.

  Recalculamos la nota a partir de los criterios guardados.
  Así, aunque una valoración antigua tuviera una fórmula anterior,
  Rankings utiliza siempre la fórmula actual.
*/
function calcularNota(valoracion: ValoracionDB) {
  const c = valoracion.criterios ?? {};

  let nota =
    6 +
    (c.control ?? 0) +
    (c.colocacion ?? 0) +
    (c.buen_control ?? 0) * 0.3 -
    (c.mal_control ?? 0) * 0.3 +
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
    (c.saque_puerta_correcto ?? 0) * 0.05 -
    (c.saque_puerta_incorrecto ?? 0) * 0.20 +
    (c.corner_correcto ?? 0) * 0.05 -
    (c.corner_incorrecto ?? 0) * 0.20 +
    (c.saque_banda_correcto ?? 0) * 0.05 -
    (c.saque_banda_incorrecto ?? 0) * 0.20 +
    (c.fuera_juego_correcto ?? 0) * 0.10 -
    (c.fuera_juego_incorrecto ?? 0) * 0.20 +
    (c.buena_intervencion_var ?? 0) * 0.25 -
    (c.mala_intervencion_var ?? 0) * 0.25 +
    (c.buena_decision_revision ?? 0) * 0.5 +
    (c.anadido_correcto ?? 0) * 0.25 -
    (c.anadido_incorrecto ?? 0) * 0.25;

  const ajusteAcciones = (valoracion.decisiones_clave ?? []).reduce(
    (total, accion) => total + (accion.decision === "incorrecta" ? -1 : 1) * Math.abs(Number(accion.valor ?? 0)),
    0
  );

  nota += ajusteAcciones;

  return limitarNota(nota);
}

function obtenerDatosPartido(matchId: string) {
  const partido = matches.find((item) => item.id === matchId);

  if (!partido) {
    return {
      jornada: null,
      nombre: matchId,
    };
  }

  return {
    jornada: partido.matchday ?? null,
    nombre: `${partido.homeTeam} – ${partido.awayTeam}`,
  };
}

function formatoNota(valor: number | null) {
  if (valor === null) return "—";

  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RankingsPage() {
  const [vista, setVista] = useState<Vista>("general");
  const [orden, setOrden] = useState<Orden>("media");

const [perfil, setPerfil] = useState<Perfil | null>(null);

const puedeEliminar =
  perfil?.rol === "admin" || perfil?.rol === "valorador";

  const [valoraciones, setValoraciones] = useState<ValoracionDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

useEffect(() => {
  async function cargarPerfil() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setPerfil(null);
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", session.user.id)
      .single();

    if (error || !data) {
      setPerfil(null);
      return;
    }

    setPerfil(data as Perfil);
  }

  cargarPerfil();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    cargarPerfil();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  /*
    ============================
    CARGA INICIAL DESDE SUPABASE
    ============================
  */
  useEffect(() => {
    async function cargarValoraciones() {
      setCargando(true);
      setErrorCarga(null);

      const { data, error } = await supabase
        .from("valoraciones")
        .select(
          `
          id,
          match_id,
          referee_id,
          valorador_id,
          valorador_nombre,
          criterios,
          decisiones_clave,
          nota_final,
          updated_at
          `
        );

      if (error) {
        console.error("Error cargando rankings:", error);
        setErrorCarga(error.message);
        setCargando(false);
        return;
      }

      setValoraciones((data ?? []) as ValoracionDB[]);
      setCargando(false);
    }

    cargarValoraciones();
  }, []);

  /*
    ===================
    ACTUALIZACIÓN DIRECTA
    ===================

    Si Luis o Rodrigo modifican una valoración,
    el ranking se recalcula sin recargar la página.
  */
  useEffect(() => {
    const canal = supabase
      .channel("rankings-valoraciones-directo")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "valoraciones",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const nueva = payload.new as ValoracionDB;

            setValoraciones((actuales) => {
              const existe = actuales.some(
                (item) =>
                  item.match_id === nueva.match_id &&
                  item.valorador_id === nueva.valorador_id
              );

              if (existe) {
                return actuales.map((item) =>
                  item.match_id === nueva.match_id &&
                  item.valorador_id === nueva.valorador_id
                    ? nueva
                    : item
                );
              }

              return [...actuales, nueva];
            });

            return;
          }

          if (payload.eventType === "UPDATE") {
            const nueva = payload.new as ValoracionDB;

            setValoraciones((actuales) =>
              actuales.map((item) =>
                item.match_id === nueva.match_id &&
                item.valorador_id === nueva.valorador_id
                  ? nueva
                  : item
              )
            );

            return;
          }

          if (payload.eventType === "DELETE") {
            const eliminada = payload.old as Partial<ValoracionDB>;

            setValoraciones((actuales) =>
              actuales.filter((item) => {
                if (eliminada.id !== undefined && item.id !== undefined) {
                  return item.id !== eliminada.id;
                }

                return !(
                  item.match_id === eliminada.match_id &&
                  item.valorador_id === eliminada.valorador_id
                );
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  /*
    ===============================
    CONSTRUIR LA TABLA DEL RANKING
    ===============================
  */
  const filas = useMemo<FilaRanking[]>(() => {
    /*
      Primero agrupamos todas las valoraciones por:

      árbitro -> partido -> valoraciones

      Ejemplo:
      Munuera
        Alavés-Getafe
          Luis
          Rodrigo
        Real Madrid-Sevilla
          Luis
    */

    const mapa = new Map<
      string,
      Map<string, ValoracionDB[]>
    >();

    valoraciones.forEach((valoracion) => {
      const refereeId = valoracion.referee_id;

      if (!refereeId) return;
      if (!ARBITROS_PRINCIPALES.includes(refereeId)) return;

      if (!mapa.has(refereeId)) {
        mapa.set(refereeId, new Map());
      }

      const partidosArbitro = mapa.get(refereeId)!;

      if (!partidosArbitro.has(valoracion.match_id)) {
        partidosArbitro.set(valoracion.match_id, []);
      }

      partidosArbitro
        .get(valoracion.match_id)!
        .push(valoracion);
    });

    const resultado: FilaRanking[] = ARBITROS_PRINCIPALES.map(
      (refereeId) => {
        const arbitro = referees.find(
          (referee) => referee.id === refereeId
        );

        const partidosArbitro = mapa.get(refereeId);

        const partidos: PartidoCalculado[] = [];

        if (partidosArbitro) {
          partidosArbitro.forEach(
            (valoracionesPartido, matchId) => {
              let notaPartido: number | null = null;

              /*
                ==========================
                VISTA GENERAL
                ==========================

                - Si solo valoró uno -> usamos esa nota.
                - Si valoraron los dos -> media de ambos.
                - El partido cuenta UNA sola vez.
              */
              if (vista === "general") {
                const notas = valoracionesPartido
                  .filter(
                    (valoracion) =>
                      valoracion.valorador_id ===
                        "luis-rodriguez-villares" ||
                      valoracion.valorador_id ===
                        "rodrigo-hilla-blanc"
                  )
                  .map(calcularNota);

                if (notas.length > 0) {
                  notaPartido =
                    notas.reduce(
                      (total, nota) => total + nota,
                      0
                    ) / notas.length;
                }
              } else {
                /*
                  ==========================
                  VISTA LUIS / RODRIGO
                  ==========================
                */
                const valoracion = valoracionesPartido.find(
                  (item) => item.valorador_id === vista
                );

                if (valoracion) {
                  notaPartido = calcularNota(valoracion);
                }
              }

              if (notaPartido === null) return;

              const datosPartido =
                obtenerDatosPartido(matchId);

              partidos.push({
                matchId,
                nota: notaPartido,
                jornada: datosPartido.jornada,
                nombrePartido: datosPartido.nombre,
              });
            }
          );
        }

        /*
          Los partidos se colocan cronológicamente por jornada.
        */
        partidos.sort((a, b) => {
          if (a.jornada === null && b.jornada === null) {
            return a.nombrePartido.localeCompare(
              b.nombrePartido
            );
          }

          if (a.jornada === null) return 1;
          if (b.jornada === null) return -1;

          return a.jornada - b.jornada;
        });

        const puntos = partidos.reduce(
          (total, partido) => total + partido.nota,
          0
        );

        const media =
          partidos.length > 0
            ? puntos / partidos.length
            : null;

        return {
          refereeId,
          nombre: arbitro?.name ?? refereeId,
          partidos,
          partidosArbitrados: partidos.length,
          media,
          puntos,
        };
      }
    );

    /*
      Orden por defecto:
      MEDIA de mayor a menor.

      Si pulsas Puntos acumulados:
      PA de mayor a menor.

      Los árbitros sin valoración quedan abajo.
    */
    resultado.sort((a, b) => {
      if (orden === "puntos") {
        if (
          a.partidosArbitrados === 0 &&
          b.partidosArbitrados > 0
        ) {
          return 1;
        }

        if (
          b.partidosArbitrados === 0 &&
          a.partidosArbitrados > 0
        ) {
          return -1;
        }

        if (b.puntos !== a.puntos) {
          return b.puntos - a.puntos;
        }
      } else {
        if (a.media === null && b.media !== null) return 1;
        if (b.media === null && a.media !== null) return -1;

        if (
          a.media !== null &&
          b.media !== null &&
          b.media !== a.media
        ) {
          return b.media - a.media;
        }
      }

      /*
        Desempate:
        más partidos valorados primero.
      */
      if (
        b.partidosArbitrados !== a.partidosArbitrados
      ) {
        return (
          b.partidosArbitrados -
          a.partidosArbitrados
        );
      }

      return a.nombre.localeCompare(b.nombre);
    });

    return resultado;
  }, [valoraciones, vista, orden]);

  /*
    Número máximo de columnas Partido 1, Partido 2...
    necesarias en este momento.
  */
  const maxPartidos = useMemo(() => {
    return Math.max(
      0,
      ...filas.map((fila) => fila.partidos.length)
    );
  }, [filas]);

async function eliminarValoracion(
  matchId: string,
  valoradorId: "luis-rodriguez-villares" | "rodrigo-hilla-blanc"
) {
  if (!puedeEliminar) return;

  const nombre =
    valoradorId === "luis-rodriguez-villares"
      ? "Luis Rodríguez Villares"
      : "Rodrigo Hilla Blanc";

  const confirmar = window.confirm(
    `¿Seguro que quieres eliminar la valoración de ${nombre} para este partido?`
  );

  if (!confirmar) return;

  const { data, error } = await supabase
    .from("valoraciones")
    .delete()
    .eq("match_id", matchId)
    .eq("valorador_id", valoradorId)
.select("id, match_id, valorador_id");

  if (error) {
    console.error("Error eliminando valoración:", error);
    window.alert("No se pudo eliminar la valoración.");
    return;
  }

  setValoraciones((actuales) =>
    actuales.filter(
      (item) =>
        !(
          item.match_id === matchId &&
          item.valorador_id === valoradorId
        )
    )
  );
}

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-[1800px]">

        {/* CABECERA */}
        <header>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">
            LaLiga EA Sports 2026/2027
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Ranking de árbitros
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Clasificación automática según las valoraciones
            registradas durante la temporada.
          </p>
        </header>

        {/* VISTA */}
        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Valoraciones
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {(
              [
                "general",
                "luis-rodriguez-villares",
                "rodrigo-hilla-blanc",
              ] as Vista[]
            ).map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setVista(opcion)}
                className={`rounded-2xl px-5 py-3 font-black transition ${
                  vista === opcion
                    ? "bg-blue-600 text-white shadow-lg"
                    : "border border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                {nombresValoradores[opcion]}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Ordenar por
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setOrden("media")}
                className={`rounded-2xl px-5 py-3 font-black transition ${
                  orden === "media"
                    ? "bg-emerald-600 text-white"
                    : "border border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                Valoración media
              </button>

              <button
                type="button"
                onClick={() => setOrden("puntos")}
                className={`rounded-2xl px-5 py-3 font-black transition ${
                  orden === "puntos"
                    ? "bg-amber-500 text-slate-950"
                    : "border border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                Puntos acumulados
              </button>
            </div>
          </div>
        </section>

        {/* INDICADOR DE VISTA */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-300">
            {nombresValoradores[vista]}
          </span>

          <span className="rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-slate-400">
            Orden:{" "}
            {orden === "media"
              ? "Valoración media"
              : "Puntos acumulados"}
          </span>

          {!cargando && !errorCarga && (
            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
              ● Actualización automática
            </span>
          )}
        </div>

        {cargando && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="font-black text-slate-300">
              Cargando valoraciones...
            </p>
          </div>
        )}

        {errorCarga && (
          <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-black text-red-300">
              Error cargando rankings: {errorCarga}
            </p>
          </div>
        )}

        {/* TABLA */}
        {!cargando && !errorCarga && (
          <section className="mt-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-blue-950">
                    <th className="sticky left-0 z-20 min-w-[65px] bg-blue-950 px-4 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-blue-200">
                      Pos.
                    </th>

                    <th className="sticky left-[65px] z-20 min-w-[290px] bg-blue-950 px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-blue-200">
                      Árbitro
                    </th>

                    <th className="min-w-[170px] px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-blue-200">
                      Partidos arbitrados
                    </th>

                    <th className="min-w-[170px] px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-blue-200">
                      Valoración media
                    </th>

                    <th className="min-w-[180px] px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-blue-200">
                      Puntos acumulados
                    </th>

                    {Array.from({
                      length: maxPartidos,
                    }).map((_, index) => (
                      <th
                        key={index}
                        className="min-w-[180px] px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-blue-200"
                      >
                        Partido {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filas.map((fila, index) => (
                    <tr
                      key={fila.refereeId}
                      className="border-t border-white/10 transition hover:bg-white/[0.04]"
                    >
                      {/* POSICIÓN */}
                      <td className="sticky left-0 z-10 bg-slate-950 px-4 py-4">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                            index === 0
                              ? "bg-yellow-400 text-slate-950"
                              : index === 1
                              ? "bg-slate-300 text-slate-950"
                              : index === 2
                              ? "bg-amber-700 text-white"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      {/* ÁRBITRO */}
                      <td className="sticky left-[65px] z-10 bg-slate-950 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-white/5">
  <img
    src={`/referees/principales/${fila.refereeId}.png`}
    alt={fila.nombre}
    className="h-full w-full object-contain"
  />
</div>

                          <span className="font-black text-white">
                            {fila.nombre}
                          </span>
                        </div>
                      </td>

                      {/* PARTIDOS */}
                      <td className="px-5 py-4 text-center text-lg font-black text-slate-300">
                        {fila.partidosArbitrados}
                      </td>

                      {/* MEDIA */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`text-xl font-black ${
                            fila.media === null
                              ? "text-slate-600"
                              : fila.media >= 8
                              ? "text-emerald-300"
                              : fila.media >= 6
                              ? "text-blue-300"
                              : "text-red-300"
                          }`}
                        >
                          {formatoNota(fila.media)}
                        </span>
                      </td>

                      {/* PA */}
                      <td className="px-5 py-4 text-center">
                        <span className="text-xl font-black text-amber-300">
                          {fila.partidosArbitrados > 0
                            ? formatoNota(fila.puntos)
                            : "—"}
                        </span>
                      </td>

                      {/* PARTIDOS INDIVIDUALES */}
                      {Array.from({
                        length: maxPartidos,
                      }).map((_, partidoIndex) => {
                        const partido =
                          fila.partidos[partidoIndex];

                        return (
                          <td
                            key={partidoIndex}
                            className="px-4 py-3 text-center"
                          >
                            {partido ? (
                              <div
                                title={`${partido.nombrePartido}${
                                  partido.jornada !== null
                                    ? ` · Jornada ${partido.jornada}`
                                    : ""
                                }`}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                              >
                                <p className="text-lg font-black text-white">
                                  {formatoNota(partido.nota)}
                                </p>

                                {partido.jornada !== null && (
                                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                                    J{partido.jornada}
                                  </p>
                                )}
{puedeEliminar && vista !== "general" && (
  <button
    type="button"
    onClick={() =>
      eliminarValoracion(
        partido.matchId,
        vista
      )
    }
    className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-300 transition hover:bg-red-500/20"
  >
    Eliminar
  </button>
)}

                              </div>
                            ) : (
                              <span className="text-slate-700">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EXPLICACIÓN GENERAL */}
        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            Funcionamiento
          </p>

          <div className="mt-3 grid gap-4 text-sm leading-6 text-slate-400 md:grid-cols-2">
            <p>
              <strong className="text-white">
                General:
              </strong>{" "}
              si Luis y Rodrigo valoran el mismo partido,
              ese partido utiliza la media de ambas notas.
              Si solo existe una valoración, se utiliza esa.
            </p>

            <p>
              <strong className="text-white">
                Puntos acumulados:
              </strong>{" "}
              suma de las notas obtenidas por el árbitro en
              todos sus partidos valorados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}