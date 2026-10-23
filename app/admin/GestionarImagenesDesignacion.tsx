"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type AccionImagen = "sustituir" | "ocultar" | "eliminar";

type Props = { accion: AccionImagen; onClose: () => void };
type Imagen = {
  id: number;
  jornada: number;
  orden_imagen: number;
  imagen_url: string;
  visible: boolean;
};

const BUCKET = "designaciones";
const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const TITULOS: Record<AccionImagen, string> = {
  sustituir: "🔄 Sustituir imagen",
  ocultar: "🚫 Ocultar o publicar imagen",
  eliminar: "🗑️ Eliminar imagen",
};

// No se debe borrar un archivo alojado fuera de nuestro bucket de Supabase.
function rutaEnBucket(url: string): string | null {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith("/")) return null;
  if (url.includes("..") || url.includes("?") || url.includes("#") || url.includes("\\")) return null;
  return url;
}

function urlImagen(imagen: Imagen): string {
  if (/^https?:\/\//i.test(imagen.imagen_url)) return imagen.imagen_url;
  return supabase.storage.from(BUCKET).getPublicUrl(imagen.imagen_url).data.publicUrl;
}

async function comprobarAdmin() {
  const { data: autenticacion, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !autenticacion.user) throw new Error("La sesión ha caducado. Entra de nuevo como administrador.");
  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", autenticacion.user.id)
    .single();
  if (errorPerfil || perfil?.rol !== "admin") throw new Error("Solo el administrador puede gestionar imágenes.");
}

// Si otra fila también referencia el archivo, no se toca el almacenamiento.
async function limpiarArchivoAntiguo(url: string): Promise<string | null> {
  const ruta = rutaEnBucket(url);
  if (!ruta) return null;
  const { data, error } = await supabase.from("designaciones")
    .select("id").eq("imagen_url", url).limit(1);
  if (error) return "El registro se actualizó, pero no pude comprobar si el archivo antiguo sigue compartido.";
  if ((data ?? []).length > 0) return null;
  const { error: errorStorage } = await supabase.storage.from(BUCKET).remove([ruta]);
  return errorStorage
    ? `La imagen ya no aparece en Designaciones, pero Supabase no permitió borrar el archivo antiguo: ${errorStorage.message}`
    : null;
}

export default function GestionarImagenesDesignacion({ accion, onClose }: Props) {
  const [jornada, setJornada] = useState(1);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [seleccionId, setSeleccionId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const seleccion = imagenes.find((item) => item.id === seleccionId) ?? null;

  useEffect(() => {
    let activo = true;
    async function consultar() {
      setCargando(true);
      setError("");
      setMensaje("");
      setConfirmar(false);
      setArchivo(null);
      try {
        await comprobarAdmin();
        const { data, error: errorConsulta } = await supabase
          .from("designaciones")
          .select("id,jornada,orden_imagen,imagen_url,visible")
          .eq("jornada", jornada)
          .order("orden_imagen", { ascending: true });
        if (errorConsulta) throw new Error(errorConsulta.message);
        if (!activo) return;
        const filas = (data ?? []) as Imagen[];
        setImagenes(filas);
        setSeleccionId(filas[0]?.id ?? null);
      } catch (e) {
        if (!activo) return;
        setImagenes([]);
        setSeleccionId(null);
        setError(e instanceof Error ? e.message : "No se pudieron consultar las imágenes.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    void consultar();
    return () => { activo = false; };
  }, [jornada]);

  function seleccionarImagen(id: number) {
    setSeleccionId(id);
    setMensaje("");
    setError("");
    setConfirmar(false);
    setArchivo(null);
  }

  async function cambiarVisibilidad() {
    if (!seleccion || ocupado) return;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      await comprobarAdmin();
      const nuevoEstado = !seleccion.visible;
      const { data, error: fallo } = await supabase.from("designaciones")
        .update({ visible: nuevoEstado }).eq("id", seleccion.id).select("id");
      if (fallo) throw new Error(fallo.message);
      if (!data?.length) throw new Error("No se actualizó ninguna imagen. Comprueba los permisos de Supabase.");
      setImagenes((anteriores) => anteriores.map((i) =>
        i.id === seleccion.id ? { ...i, visible: nuevoEstado } : i
      ));
      setMensaje(nuevoEstado ? "✅ Imagen publicada de nuevo." : "✅ Imagen ocultada de la web pública.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la visibilidad.");
    } finally {
      setOcupado(false);
    }
  }

  async function sustituir() {
    if (!seleccion || !archivo || ocupado) return;
    setError("");
    setMensaje("");
    if (!TIPOS.includes(archivo.type)) { setError("Utiliza una imagen JPG, PNG o WEBP."); return; }
    if (archivo.size > 10 * 1024 * 1024) { setError("La fotografía no puede superar 10 MB."); return; }
    setOcupado(true);
    let rutaNueva: string | null = null;
    let actualizado = false;
    try {
      await comprobarAdmin();
      const extension = archivo.type === "image/png" ? "png" : archivo.type === "image/webp" ? "webp" : "jpg";
      rutaNueva = `jornada-${String(jornada).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
      const { error: errorSubida } = await supabase.storage.from(BUCKET)
        .upload(rutaNueva, archivo, { contentType: archivo.type, upsert: false });
      if (errorSubida) throw new Error(`No se pudo subir la fotografía: ${errorSubida.message}`);
      const { data, error: errorActualizacion } = await supabase.from("designaciones")
        .update({ imagen_url: rutaNueva }).eq("id", seleccion.id).select("id");
      if (errorActualizacion) throw new Error(errorActualizacion.message);
      if (!data?.length) throw new Error("No se pudo actualizar la imagen en la base de datos.");
      actualizado = true;
      const antigua = seleccion.imagen_url;
      const nuevaRutaConfirmada = rutaNueva;
      setImagenes((anteriores) => anteriores.map((i) =>
        i.id === seleccion.id ? { ...i, imagen_url: nuevaRutaConfirmada } : i
      ));
      setArchivo(null);
      const aviso = await limpiarArchivoAntiguo(antigua);
      setMensaje(aviso ? `✅ Foto sustituida. ${aviso}` : "✅ Fotografía sustituida correctamente.");
    } catch (e) {
      if (rutaNueva && !actualizado) await supabase.storage.from(BUCKET).remove([rutaNueva]);
      setError(e instanceof Error ? e.message : "No se pudo sustituir la imagen.");
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!seleccion || ocupado || !confirmar) return;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      await comprobarAdmin();
      const { data, error: errorBorrado } = await supabase.from("designaciones")
        .delete().eq("id", seleccion.id).select("id");
      if (errorBorrado) throw new Error(errorBorrado.message);
      if (!data?.length) throw new Error("No se eliminó ninguna fila. Comprueba los permisos de Supabase.");
      const idBorrado = seleccion.id;
      const rutaAnterior = seleccion.imagen_url;
      const restantes = imagenes.filter((i) => i.id !== idBorrado);
      setImagenes(restantes);
      setSeleccionId(restantes[0]?.id ?? null);
      setConfirmar(false);
      const aviso = await limpiarArchivoAntiguo(rutaAnterior);
      setMensaje(aviso ? `✅ Foto retirada de Designaciones. ${aviso}` : "✅ Imagen eliminada de Designaciones.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la fotografía.");
    } finally {
      setOcupado(false);
    }
  }

  function escogerArchivo(e: ChangeEvent<HTMLInputElement>) {
    setArchivo(e.target.files?.[0] ?? null);
    setError("");
    setMensaje("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3">
      <section role="dialog" aria-modal="true" aria-label={TITULOS[accion]}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-5 text-slate-950 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-blue-700">Panel de administración</p>
            <h2 className="mt-2 text-2xl font-black">{TITULOS[accion]}</h2>
            <p className="mt-2 text-sm text-slate-600">Elige la jornada y la foto exacta antes de realizar cambios.</p>
          </div>
          <button type="button" onClick={onClose} disabled={ocupado} aria-label="Cerrar"
            className="rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">✕</button>
        </div>

        <label htmlFor="jornada-gestion" className="mt-5 block text-sm font-bold">Jornada</label>
        <select id="jornada-gestion" value={jornada} disabled={ocupado}
          onChange={(e) => setJornada(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
          {Array.from({ length: 38 }, (_, i) => <option key={i + 1} value={i + 1}>Jornada {i + 1}</option>)}
        </select>

        {cargando ? <p className="mt-6 text-slate-600">Cargando imágenes...</p> : (
          <>
            {imagenes.length === 0 && !error && <p className="mt-6 text-sm text-slate-600">No hay fotografías registradas en esta jornada.</p>}
            <div className="mt-5 grid max-h-64 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {imagenes.map((item) => (
                <button type="button" key={item.id} disabled={ocupado}
                  onClick={() => seleccionarImagen(item.id)}
                  className={`rounded-xl border-2 p-2 text-left transition disabled:opacity-50 ${seleccionId === item.id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}
                  aria-pressed={seleccionId === item.id}>
                  <img src={urlImagen(item)} alt={`Imagen ${item.orden_imagen}, jornada ${item.jornada}`}
                    className="h-24 w-full rounded-lg bg-slate-50 object-contain" />
                  <span className="mt-2 block text-xs font-bold">Foto {item.orden_imagen} · {item.visible ? "Publicada" : "Oculta"}</span>
                </button>
              ))}
            </div>

            {seleccion && (
              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <p className="mb-3 text-sm font-bold">Seleccionada: jornada {jornada}, foto {seleccion.orden_imagen}</p>
                <img src={urlImagen(seleccion)} alt="Vista previa de la fotografía seleccionada"
                  className="max-h-56 w-full rounded-xl bg-slate-50 object-contain" />
                {accion === "ocultar" && (
                  <button type="button" onClick={() => void cambiarVisibilidad()} disabled={ocupado}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-40">
                    {ocupado ? "Guardando..." : seleccion.visible ? "Ocultar esta fotografía" : "Publicar de nuevo esta fotografía"}
                  </button>
                )}
                {accion === "sustituir" && (
                  <>
                    <label htmlFor="archivo-reemplazo" className="mt-4 block text-sm font-bold">Nueva fotografía (JPG, PNG o WEBP, máximo 10 MB)</label>
                    <input id="archivo-reemplazo" key={seleccion.id} type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={escogerArchivo} disabled={ocupado}
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" />
                    <button type="button" onClick={() => void sustituir()} disabled={!archivo || ocupado}
                      className="mt-4 w-full rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-40">
                      {ocupado ? "Sustituyendo..." : "Sustituir solo esta fotografía"}
                    </button>
                  </>
                )}
                {accion === "eliminar" && (
                  confirmar ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-bold text-red-800">¿Eliminar definitivamente esta fotografía? Esta acción no se puede deshacer.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => void eliminar()} disabled={ocupado}
                          className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white disabled:opacity-40">
                          {ocupado ? "Eliminando..." : "Sí, eliminar esta foto"}
                        </button>
                        <button type="button" onClick={() => setConfirmar(false)} disabled={ocupado}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmar(true)} disabled={ocupado}
                      className="mt-4 w-full rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-40">
                      Eliminar foto seleccionada
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        {mensaje && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{mensaje}</p>}
      </section>
    </div>
  );
}
