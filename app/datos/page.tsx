"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { matches } from "../data/matches";
import { referees } from "../data/referees";
import { supabase } from "../../lib/supabase";

type Designacion = { match_id: string; referee_id: string | null };
type Valoracion = {
  match_id: string;
  referee_id: string | null;
  valorador_id: string | null;
  criterios: Record<string, number> | null;
};
type Metricas = { amarillas: number; rojas: number; penaltis: number };
type Orden = "partidos" | "amarillas" | "mediaAmarillas" | "rojas" | "mediaRojas" | "penaltis" | "mediaPenaltis";

const principales = [
  "adrian-cordero-vega", "alejandro-hernandez-hernandez", "alejandro-quintero-gonzalez",
  "carlos-muniz-munoz", "cesar-soto-grado", "francisco-jose-hernandez-maeso",
  "isidro-diaz-de-mera-escuderos", "javier-alberola-rojas", "jesus-gil-manzano",
  "jon-ander-gonzalez-esteban", "jose-luis-munuera-montero", "jose-maria-sanchez-martinez",
  "juan-martinez-munuera", "luis-bestard-servera", "manuel-jesus-orellana-cid",
  "mateo-busquets-ferrer", "miguel-angel-ortiz-arias", "miguel-sesma-espinosa",
  "ricardo-de-burgos-bengoetxea", "victor-garcia-verdura",
];
const valoradoresPermitidos = new Set(["luis-rodriguez-villares", "rodrigo-hilla-blanc"]);
const cero = (): Metricas => ({ amarillas: 0, rojas: 0, penaltis: 0 });
const numero = (valor: unknown) => Math.max(0, Number.isFinite(Number(valor)) ? Number(valor) : 0);
function metricas(criterios: Record<string, number> | null): Metricas {
  const c = criterios ?? {};
  return {
    amarillas: numero(c.amarilla_correcta) + numero(c.amarilla_incorrecta),
    rojas: numero(c.roja_correcta) + numero(c.roja_incorrecta),
    penaltis: numero(c.penalti_correcto) + numero(c.penalti_incorrecto),
  };
}
function fechaLocal(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
const formato = (n: number | null) => n === null ? "—" : n.toLocaleString("es-ES", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function DatosPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([]);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [orden, setOrden] = useState<Orden>("partidos");
   const [pestana, setPestana] = useState<"general" | Exclude<Orden, "partidos">>("general");
  const [seleccionado, setSeleccionado] = useState<string>(principales[0]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const [d, v] = await Promise.all([
        supabase.from("designaciones_arbitrales").select("match_id, referee_id"),
        supabase.from("valoraciones").select("match_id, referee_id, valorador_id, criterios"),
      ]);
      if (!activo) return;
      if (d.error || v.error) {
        setError(d.error?.message ?? v.error?.message ?? "Error consultando datos");
      } else {
        setDesignaciones((d.data ?? []) as Designacion[]);
        setValoraciones((v.data ?? []) as Valoracion[]);
      }
      setCargando(false);
    }
    void cargar();
    return () => { activo = false; };
  }, []);

  const filas = useMemo(() => {
    const porPartido = new Map(designaciones.map(d => [d.match_id, d.referee_id]));
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

    return principales.map(id => {
      const asignados = matches.filter(m => (porPartido.get(m.id) ?? m.refereeId) === id);
      // Una designación pasada no acredita por sí sola que se haya arbitrado: se presenta como tal.
      const pasados = asignados.filter(m => m.scheduledDate < fechaHoy && m.status !== "postponed");
      const futuros = asignados.filter(m => m.scheduledDate >= fechaHoy && m.status !== "postponed");
      const registros = new Map<string, Valoracion[]>();
      for (const v of valoraciones) {
        if (!valoradoresPermitidos.has(v.valorador_id ?? "")) continue;
        const partido = matches.find(m => m.id === v.match_id);
        if (!partido || partido.scheduledDate >= fechaHoy || partido.status === "postponed") continue;
        if ((porPartido.get(v.match_id) ?? v.referee_id ?? partido.refereeId) !== id) continue;
        const arr = registros.get(v.match_id) ?? [];
        // Dos valoradores en un partido no equivalen a dos partidos ni al doble de tarjetas.
        if (!arr.some(x => x.valorador_id === v.valorador_id)) arr.push(v);
        registros.set(v.match_id, arr);
      }
      const totales = cero();
      for (const grupo of registros.values()) {
        for (const clave of ["amarillas", "rojas", "penaltis"] as const) {
          totales[clave] += grupo.reduce((s, v) => s + metricas(v.criterios)[clave], 0) / grupo.length;
        }
      }
      const evaluados = registros.size;
      const media = (v: number) => evaluados ? v / evaluados : null;
      return {
        id, nombre: referees.find(r => r.id === id)?.name ?? id,
        pasados: pasados.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
        futuros: futuros.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
        evaluados, ...totales,
        mediaAmarillas: media(totales.amarillas), mediaRojas: media(totales.rojas), mediaPenaltis: media(totales.penaltis),
      };
    });
  }, [designaciones, valoraciones]);

  const ordenados = useMemo(() => [...filas]
    .filter(f => f.nombre.toLocaleLowerCase("es").includes(busqueda.toLocaleLowerCase("es")))
    .sort((a, b) => {
      const av = orden === "partidos" ? a.pasados.length : (a[orden] ?? -1);
      const bv = orden === "partidos" ? b.pasados.length : (b[orden] ?? -1);
      return bv - av || a.nombre.localeCompare(b.nombre, "es");
    }), [filas, orden, busqueda]);
  const actual = filas.find(f => f.id === seleccionado);
  const columnas: { key: Orden; label: string }[] = [
    { key: "partidos", label: "Partidos" },
    { key: "amarillas", label: "Tarjetas Amarillas" },
    { key: "rojas", label: "Tarjetas Rojas" },
    { key: "mediaAmarillas", label: "Media Amarillas" },
    { key: "mediaRojas", label: "Media Rojas" },
    { key: "penaltis", label: "Penaltis" },
    { key: "mediaPenaltis", label: "Media Penaltis" },
  ];

  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">LaLiga EA Sports · 2026/2027</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">Datos arbitrales</h1>
      <p className="mt-4 max-w-3xl text-slate-300">Rankings por tarjetas, penaltis y partidos asignados. Selecciona un árbitro para ver sus jornadas y todos sus encuentros.</p>
      {cargando ? <p className="mt-10">Cargando estadísticas…</p> : error ? <div role="alert" className="mt-8 rounded-xl border border-red-500 p-5 text-red-200">No se han podido cargar los datos: {error}</div> : <>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-end gap-5">
            <label className="flex min-w-52 flex-1 flex-col gap-2 text-sm font-bold">Buscar árbitro<input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del árbitro" className="rounded-xl border border-white/20 bg-slate-900 p-3 text-white" /></label>
            <label className="flex min-w-52 flex-col gap-2 text-sm font-bold">Ordenar ranking<select value={orden} onChange={e => setOrden(e.target.value as Orden)} className="rounded-xl border border-white/20 bg-slate-900 p-3 text-white">{columnas.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
          </div>
          {/* Pestañas de estadísticas */}
           <nav className="mt-5 flex flex-wrap gap-2" aria-label="Categorías de estadísticas">
             {([
               ["general", "General"],
               ["amarillas", "🟨 Tarjetas amarillas"],
               ["rojas", "🟥 Tarjetas rojas"],
               ["mediaAmarillas", "Media amarillas"],
               ["mediaRojas", "Media rojas"],
               ["penaltis", "⚽ Penaltis"],
               ["mediaPenaltis", "Media penaltis"],
             ] as const).map(([clave, titulo]) => (
               <button key={clave} type="button"
                 aria-pressed={pestana === clave}
                 onClick={() => { setPestana(clave); setOrden(clave === "general" ? "partidos" : clave); }}
                 className={`rounded-full border px-4 py-2 text-sm font-bold transition ${pestana === clave ? "border-sky-300 bg-sky-400/20 text-sky-100 shadow-sm shadow-sky-400/20" : "border-white/20 bg-white/5 text-slate-300 hover:border-sky-400/50 hover:text-white"}`}>
                 {titulo}
               </button>
             ))}
           </nav>
           <style>{pestana === "general" ? "" : `#tabla-datos-pestanas th:not(:first-child):not(:nth-child(${({ amarillas: 3, rojas: 4, mediaAmarillas: 5, mediaRojas: 6, penaltis: 7, mediaPenaltis: 8 } as const)[pestana]})), #tabla-datos-pestanas td:not(:first-child):not(:nth-child(${({ amarillas: 3, rojas: 4, mediaAmarillas: 5, mediaRojas: 6, penaltis: 7, mediaPenaltis: 8 } as const)[pestana]})) { display: none; }`}</style>
           <div className="mt-5 overflow-x-auto"><table id="tabla-datos-pestanas" className="min-w-[860px] w-full text-left text-sm"><thead><tr className="border-b border-white/15 text-slate-300"><th className="p-3">Árbitro</th>{columnas.map(c => <th className="p-3 text-right" key={c.key}><button type="button" onClick={() => setOrden(c.key)} aria-label={`Ordenar por ${c.label}`} aria-pressed={orden === c.key} className={`whitespace-normal text-right font-extrabold transition hover:brightness-125 hover:no-underline ${c.key === "amarillas" || c.key === "mediaAmarillas" ? "text-amber-300" : c.key === "rojas" || c.key === "mediaRojas" ? "text-rose-400" : c.key === "penaltis" || c.key === "mediaPenaltis" ? "text-white" : "text-cyan-200"} ${orden === c.key ? "font-black" : ""}`}>{c.key === "partidos" ? "Partidos" : c.key === "amarillas" ? <>Tarjetas<br />Amarillas</> : c.key === "rojas" ? <>Tarjetas<br />Rojas</> : c.key === "mediaAmarillas" ? <>Media<br />Amarillas</> : c.key === "mediaRojas" ? <>Media<br />Rojas</> : c.key === "penaltis" ? "Penaltis" : <>Media<br />Penaltis</>}</button></th>)}</tr></thead><tbody>{ordenados.map(f => {
            // Evita presentar como estadísticas reales el registro vacío de De Burgos.
            // No altera ni elimina ningún registro en Supabase.
            const sinDatosDeBurgos = f.id === "ricardo-de-burgos-bengoetxea" &&
              f.amarillas === 0 && f.rojas === 0 && f.penaltis === 0;
            const conDatos = f.evaluados > 0 && !sinDatosDeBurgos;
            return <tr key={f.id} className={`border-b border-white/10 transition-colors ${seleccionado === f.id ? "bg-sky-400/20 ring-1 ring-inset ring-sky-300/40" : "hover:bg-white/5"}`}>
              <td className="p-3"><button type="button" className={`text-left font-bold transition hover:no-underline ${seleccionado === f.id ? "text-sky-200" : "text-cyan-200 hover:text-cyan-100"}`} onClick={() => { setSeleccionado(f.id); document.getElementById("ficha-arbitro")?.scrollIntoView({ behavior: "smooth" }); }}>{f.nombre}</button></td>
              <td className="p-3 text-right font-semibold text-slate-200">{f.pasados.length}</td>
              <td className="p-3 text-right font-bold text-amber-300">{formato(conDatos ? f.amarillas : null)}</td>
              <td className="p-3 text-right font-bold text-rose-400">{formato(conDatos ? f.rojas : null)}</td>
              <td className="p-3 text-right font-bold text-amber-300">{formato(conDatos ? f.mediaAmarillas : null)}</td>
              <td className="p-3 text-right font-bold text-rose-400">{formato(conDatos ? f.mediaRojas : null)}</td>
              <td className="p-3 text-right font-bold text-white">{formato(conDatos ? f.penaltis : null)}</td>
              <td className="p-3 text-right font-bold text-white">{formato(conDatos ? f.mediaPenaltis : null)}</td>
            </tr>;
          })}</tbody></table></div>
          <p className="mt-4 text-xs leading-6 text-slate-400">Partidos: designaciones cuya fecha ya pasó (pendientes de verificar como disputados). Tarjetas y penaltis: promedios de los registros de Luis y Rodrigo por partido; no se duplican si ambos valoran. Las medias se calculan por partido valorado, no por todas las designaciones. «—» significa que no hay datos. Si las valoraciones registran decisiones correctas/incorrectas, esas cifras reflejan acciones anotadas, no necesariamente todas las tarjetas o penaltis reales.</p>
        </div>
        <section id="ficha-arbitro" className="mt-8 scroll-mt-5 rounded-2xl border border-blue-500/25 bg-white/5 p-6">
          <h2 className="text-2xl font-black">{actual?.nombre ?? "Árbitro"}</h2>
          {actual && <>
            <div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-slate-900 p-4"><p className="text-slate-400">Partidos asignados con fecha pasada</p><p className="mt-1 text-3xl font-black">{actual.pasados.length}</p></div><div className="rounded-xl bg-slate-900 p-4"><p className="text-slate-400">Designaciones próximas</p><p className="mt-1 text-3xl font-black">{actual.futuros.length}</p></div><div className="rounded-xl bg-slate-900 p-4"><p className="text-slate-400">Partidos con valoración</p><p className="mt-1 text-3xl font-black">{actual.evaluados}</p></div></div>
            <h3 className="mt-8 text-xl font-black">Jornadas y partidos con fecha pasada</h3>
            <div className="mt-4 space-y-3">{actual.pasados.length ? actual.pasados.map(m => <Link key={m.id} href={`/partidos/${encodeURIComponent(m.id)}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900 p-4 transition hover:border-blue-400"><span><strong>Jornada {m.matchday}</strong> · {m.homeTeam} – {m.awayTeam}</span><span className="text-sm text-blue-300">{fechaLocal(m.scheduledDate)} · Ver partido →</span></Link>) : <p className="text-slate-400">No constan partidos asignados con fecha pasada.</p>}</div>
            <h3 className="mt-8 text-xl font-black">Próximas designaciones</h3><div className="mt-4 space-y-3">{actual.futuros.length ? actual.futuros.map(m => <Link key={m.id} href={`/partidos/${encodeURIComponent(m.id)}`} className="block rounded-xl border border-white/10 bg-slate-900 p-4 hover:border-blue-400">Jornada {m.matchday} · {m.homeTeam} – {m.awayTeam} · {fechaLocal(m.scheduledDate)} →</Link>) : <p className="text-slate-400">No constan próximas designaciones.</p>}</div>
          </>}
        </section>
      </>}
    </div>
  </main>;
}
