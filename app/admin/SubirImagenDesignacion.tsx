"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Props = { onClose: () => void };

const BUCKET = "designaciones";
const TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

export default function SubirImagenDesignacion({ onClose }: Props) {
  const [jornada, setJornada] = useState(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [publicada, setPublicada] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function seleccionarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    setArchivo(evento.target.files?.[0] ?? null);
    setPublicada(false);
    setMensaje("");
  }

  async function subirImagen() {
    if (!archivo || subiendo) return;

    if (!TIPOS_VALIDOS.includes(archivo.type)) {
      setMensaje("Selecciona una imagen JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setMensaje("La imagen debe pesar 10 MB o menos.");
      return;
    }

    setSubiendo(true);
    setPublicada(false);
    setMensaje("Comprobando permisos...");

    try {
      const { data: usuario, error: errorUsuario } = await supabase.auth.getUser();
      if (errorUsuario || !usuario.user) {
        throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión como administrador.");
      }
      const { data: perfil, error: errorPerfil } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", usuario.user.id)
        .single();
      if (errorPerfil || perfil?.rol !== "admin") {
        throw new Error("Tu cuenta no tiene permiso de administrador.");
      }

      setMensaje("Preparando la imagen...");
      const { data: existentes, error: errorConsulta } = await supabase
        .from("designaciones")
        .select("orden_imagen")
        .eq("jornada", jornada);
      if (errorConsulta) {
        throw new Error(`No puedo consultar las imágenes: ${errorConsulta.message}`);
      }
      const ultimoOrden = Math.max(0, ...(existentes ?? []).map((fila) => Number(fila.orden_imagen) || 0));

      const extension = archivo.type === "image/png" ? "png" : archivo.type === "image/webp" ? "webp" : "jpg";
      const ruta = `jornada-${String(jornada).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;

      setMensaje("Subiendo la fotografía...");
      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo, {
        contentType: archivo.type,
        upsert: false,
      });
      if (errorSubida) {
        throw new Error(`Supabase no permite subir la foto: ${errorSubida.message}`);
      }

      setMensaje("Publicando en Designaciones...");
      const { error: errorRegistro } = await supabase.from("designaciones").insert({
        jornada,
        orden_imagen: ultimoOrden + 1,
        imagen_url: ruta,
        visible: true,
      });
      if (errorRegistro) {
        // Evita dejar imágenes huérfanas cuando el registro no se puede crear.
        const { error: errorBorrado } = await supabase.storage.from(BUCKET).remove([ruta]);
        const detalle = errorBorrado ? " No se pudo limpiar el archivo del almacenamiento." : "";
        throw new Error(`No se pudo publicar el registro: ${errorRegistro.message}.${detalle}`);
      }

      setPublicada(true);
      setMensaje(`✅ Imagen publicada en la jornada ${jornada}.`);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Ha ocurrido un error al subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-subir-designacion"
        className="w-full max-w-xl rounded-[28px] bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-blue-700">Administración</p>
            <h2 id="titulo-subir-designacion" className="mt-2 text-2xl font-black sm:text-3xl">📤 Subir imagen</h2>
            <p className="mt-2 text-sm text-slate-600">La fotografía aparecerá en la sección Designaciones.</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            disabled={subiendo}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <label htmlFor="jornada-foto-panel" className="mt-7 block font-bold">Jornada</label>
        <select
          id="jornada-foto-panel"
          disabled={subiendo}
          value={jornada}
          onChange={(e) => { setJornada(Number(e.target.value)); setMensaje(""); setPublicada(false); }}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
        >
          {Array.from({ length: 38 }, (_, indice) => (
            <option key={indice + 1} value={indice + 1}>Jornada {indice + 1}</option>
          ))}
        </select>

        <label htmlFor="archivo-foto-panel" className="mt-5 block font-bold">Fotografía (JPG, PNG o WEBP)</label>
        <input
          ref={inputRef}
          id="archivo-foto-panel"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={subiendo}
          onChange={seleccionarArchivo}
          className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        {archivo && <p className="mt-2 break-all text-sm text-slate-600">{archivo.name}</p>}
        <p className="mt-1 text-xs text-slate-500">Tamaño máximo: 10 MB.</p>

        <button
          type="button"
          onClick={() => void subirImagen()}
          disabled={!archivo || subiendo}
          className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {subiendo ? "Subiendo..." : "Subir y publicar fotografía"}
        </button>

        {mensaje && (
          <p role="status" aria-live="polite" className={`mt-4 break-words rounded-xl p-3 text-sm font-semibold ${publicada ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-800"}`}>
            {mensaje}
          </p>
        )}
        {publicada && (
          <Link href="/designaciones" className="mt-4 inline-block font-bold text-blue-700 underline">
            Ver imagen en Designaciones →
          </Link>
        )}
      </section>
    </div>
  );
}
