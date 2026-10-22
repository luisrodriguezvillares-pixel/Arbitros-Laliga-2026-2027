"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Registro = {
  id: number;
  jornada: number;
  orden_imagen: number;
  imagen_url: string;
  visible: boolean;
};

const BUCKET = "designaciones";
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

export default function AdminImagenesPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [comprobando, setComprobando] = useState(true);
  const [jornada, setJornada] = useState(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    const { data, error } = await supabase
      .from("designaciones")
      .select("id,jornada,orden_imagen,imagen_url,visible")
      .order("jornada", { ascending: true })
      .order("orden_imagen", { ascending: true });
    if (error) setMensaje(`Error al leer imágenes: ${error.message}`);
    else setRegistros((data ?? []) as Registro[]);
  }

  useEffect(() => {
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setComprobando(false); return; }
      const { data } = await supabase.from("usuarios").select("rol").eq("id", user.id).single();
      if (data?.rol === "admin") { setAutorizado(true); await cargar(); }
      setComprobando(false);
    }
    void iniciar();
  }, []);

  function escoger(evento: ChangeEvent<HTMLInputElement>) {
    setArchivo(evento.target.files?.[0] ?? null);
    setMensaje("");
  }

  async function subir() {
    if (!archivo || cargando || !autorizado) return;
    if (!TIPOS.includes(archivo.type)) { setMensaje("Selecciona JPG, PNG o WEBP."); return; }
    if (archivo.size > 10 * 1024 * 1024) { setMensaje("La imagen debe pesar 10 MB o menos."); return; }
    setCargando(true);
    setMensaje("Subiendo imagen...");
    const extension = archivo.type === "image/png" ? "png" : archivo.type === "image/webp" ? "webp" : "jpg";
    const ruta = `jornada-${String(jornada).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
    const orden = Math.max(0, ...registros.filter((r) => r.jornada === jornada).map((r) => r.orden_imagen)) + 1;
    const { error: subidaError } = await supabase.storage.from(BUCKET).upload(ruta, archivo, {
      contentType: archivo.type,
      upsert: false,
    });
    if (subidaError) {
      setMensaje(`No se pudo subir: ${subidaError.message}`);
      setCargando(false);
      return;
    }
    const { error: registroError } = await supabase.from("designaciones").insert({
      jornada,
      orden_imagen: orden,
      imagen_url: ruta,
      visible: true,
    });
    if (registroError) {
      await supabase.storage.from(BUCKET).remove([ruta]);
      setMensaje(`Imagen no registrada: ${registroError.message}. Comprueba permisos y columnas de Supabase.`);
      setCargando(false);
      return;
    }
    setMensaje(`✅ Imagen de la jornada ${jornada} publicada correctamente.`);
    setArchivo(null);
    const entrada = document.getElementById("imagen-designacion") as HTMLInputElement | null;
    if (entrada) entrada.value = "";
    await cargar();
    setCargando(false);
  }

  async function cambiarVisibilidad(registro: Registro) {
    if (cargando) return;
    setCargando(true);
    const { error } = await supabase.from("designaciones").update({ visible: !registro.visible }).eq("id", registro.id);
    setMensaje(error ? `Error: ${error.message}` : registro.visible ? "Imagen ocultada." : "Imagen publicada.");
    await cargar();
    setCargando(false);
  }

  if (comprobando) return <main className="p-10">Comprobando permisos...</main>;
  if (!autorizado) return <main className="p-10 font-bold">🔒 Solo el administrador puede subir imágenes.</main>;

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="font-bold text-blue-700">← Panel de administración</Link>
        <h1 className="mt-6 text-3xl font-black">📤 Subir imágenes de designaciones</h1>
        <p className="mt-2 text-slate-600">Estas imágenes aparecerán en la sección pública Designaciones.</p>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <label htmlFor="jornada-designacion" className="block font-bold">Jornada</label>
          <select id="jornada-designacion" value={jornada} onChange={(e) => setJornada(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 p-3">
            {Array.from({ length: 38 }, (_, i) => <option key={i + 1} value={i + 1}>Jornada {i + 1}</option>)}
          </select>
          <label htmlFor="imagen-designacion" className="mt-6 block font-bold">Seleccionar fotografía</label>
          <input id="imagen-designacion" type="file" accept="image/jpeg,image/png,image/webp" onChange={escoger} className="mt-2 block w-full rounded-xl border border-slate-300 p-3" />
          {archivo && <p className="mt-2 text-sm text-slate-600">{archivo.name}</p>}
          <button type="button" disabled={!archivo || cargando} onClick={() => void subir()} className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white disabled:opacity-40">
            {cargando ? "Procesando..." : "Subir y publicar imagen"}
          </button>
          {mensaje && <p role="status" className="mt-4 break-words font-semibold">{mensaje}</p>}
        </section>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Imágenes de la jornada {jornada}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {registros.filter((r) => r.jornada === jornada).map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                <img src={supabase.storage.from(BUCKET).getPublicUrl(r.imagen_url).data.publicUrl} alt={`Designación jornada ${jornada}`} className="h-52 w-full object-contain" />
                <p className="mt-2 text-sm">Imagen {r.orden_imagen} · {r.visible ? "Publicada" : "Oculta"}</p>
                <button type="button" disabled={cargando} onClick={() => void cambiarVisibilidad(r)} className="mt-2 rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:opacity-40">
                  {r.visible ? "Ocultar" : "Publicar"}
                </button>
              </div>
            ))}
            {!registros.some((r) => r.jornada === jornada) && <p className="text-slate-500">Todavía no hay imágenes para esta jornada.</p>}
          </div>
        </section>
        <Link href="/admin/designaciones" className="mt-7 inline-block font-bold text-blue-700">Ir a asignar árbitros y VAR →</Link>
      </div>
    </main>
  );
}
