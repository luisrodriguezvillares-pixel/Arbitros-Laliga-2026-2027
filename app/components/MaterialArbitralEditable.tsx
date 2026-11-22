"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type Campo = "silbato" | "tarjetas";

type Ficha = {
  id: number;
  nombre_apellidos: string;
  silbato: string | null;
  tarjetas: string | null;
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export default function MaterialArbitralEditable({
  nombre,
  puedeEditar,
}: {
  nombre: string;
  puedeEditar: boolean;
}) {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [cargando, setCargando] = useState(true);
  const [confirmado, setConfirmado] = useState<
    Record<Campo, boolean>
  >({ silbato: false, tarjetas: false });

  const [editando, setEditando] = useState<Campo | null>(null);
  const [noEstoySeguro, setNoEstoySeguro] = useState({
    silbato: false,
    tarjetas: false,
  });

  const [nuevoValor, setNuevoValor] = useState("");
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setFicha(null);
      setEditando(null);
      setMensaje("");

      const { data, error } = await supabase
        .from("arbitros")
        .select("id,nombre_apellidos,silbato,tarjetas")
        .limit(150);

      if (cancelado) return;
      setCargando(false);

      if (error) {
        setMensaje("Error al cargar: " + error.message);
        return;
      }

      const encontrados = (data ?? []).filter(
        (item) =>
          normalizar(item.nombre_apellidos) ===
          normalizar(nombre)
      );

      if (encontrados.length !== 1) {
        setMensaje(
          "No se encontró una ficha única. No se modificarán datos."
        );
        return;
      }

      const actual = encontrados[0] as Ficha;
      setFicha(actual);

      setConfirmado({
        silbato:
          localStorage.getItem(
            `material-confirmado:${actual.id}:silbato`
          ) === (actual.silbato ?? ""),
        tarjetas:
          localStorage.getItem(
            `material-confirmado:${actual.id}:tarjetas`
          ) === (actual.tarjetas ?? ""),
      });
    }

    void cargar();

    return () => {
      cancelado = true;
    };
  }, [nombre]);

  function confirmar(campo: Campo, marcado: boolean) {
    if (!ficha) return;

    setConfirmado((anterior) => ({
      ...anterior,
      [campo]: marcado,
    }));

    const clave = `material-confirmado:${ficha.id}:${campo}`;

    if (marcado) {
      localStorage.setItem(clave, ficha[campo] ?? "");
    } else {
      localStorage.removeItem(clave);
    }
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!ficha || !editando || !puedeEditar || guardando) {
      return;
    }

    const campo = editando;
    const valor = nuevoValor.trim();
    const motivo = comentario.trim();

    if (!valor || !motivo) {
      setMensaje(
        "Escribe el dato correcto y el motivo de la corrección."
      );
      return;
    }

    if (valor === (ficha[campo] ?? "").trim()) {
      setMensaje("El nuevo dato es igual al registrado.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const { data: auth, error: errorAuth } =
        await supabase.auth.getUser();

      if (errorAuth || !auth.user) {
        throw new Error("Debes iniciar sesión.");
      }

      const { data: permisos, error: errorPermisos } =
        await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", auth.user.id)
          .single();

      if (errorPermisos || permisos?.rol !== "admin") {
        throw new Error(
          "Solo el administrador puede actualizar la ficha."
        );
      }

      const cambios =
        campo === "silbato"
          ? { silbato: valor }
          : { tarjetas: valor };

      const { data, error } = await supabase
        .from("arbitros")
        .update(cambios)
        .eq("id", ficha.id)
        .select("id,nombre_apellidos,silbato,tarjetas")
        .single();

      if (error || !data) {
        throw new Error(
          error?.message ??
          "Supabase no ha confirmado la actualización."
        );
      }

      const nuevaFicha = data as Ficha;

      setFicha(nuevaFicha);
      setConfirmado((anterior) => ({
        ...anterior,
        [campo]: true,
      }));

      localStorage.setItem(
        `material-confirmado:${nuevaFicha.id}:${campo}`,
        nuevaFicha[campo] ?? ""
      );

      setEditando(null);
      setNuevoValor("");
      setComentario("");

      setMensaje(
        "Dato actualizado en Supabase. " +
        "También aparecerá en la ficha pública al recargarla."
      );
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se ha podido guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        Cargando silbato y tarjetas...
      </p>
    );
  }

  if (!ficha) {
    return (
      <p className="mt-4 text-sm text-amber-300">
        {mensaje}
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {(["silbato", "tarjetas"] as const).map((campo) => (
          <div
            key={campo}
            className="rounded-2xl border border-blue-400/25 bg-slate-950/40 p-4"
          >
            <p className="text-xs font-black uppercase text-blue-300">
              {campo === "silbato" ? "Silbato" : "🟨🟥 Tarjetas"}
            </p>

            <p className="mt-2 break-words text-sm font-semibold text-white">
              {ficha[campo] || "Sin registrar"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-emerald-300">
                <input
                  type="checkbox"
                  checked={confirmado[campo]}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNoEstoySeguro((actual) => ({
                        ...actual,
                        [campo]: false,
                      }));
                    }
                    confirmar(campo, e.target.checked);
                  }}
                  className="h-4 w-4 accent-emerald-500"
                />
                ✓ Correcto
              </label>

              <button
                type="button"
                disabled={!puedeEditar}
                onClick={() => {
                  setEditando(campo);
                  setNuevoValor(ficha[campo] ?? "");
                  setComentario("");
                  setMensaje("");
                }}
                className="rounded-lg border border-red-400/30 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✕ Incorrecto
              </button>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-400/25 bg-slate-700/20 px-3 py-1 text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={noEstoySeguro[campo]}
                  onChange={(e) => {
                    setNoEstoySeguro((actual) => ({
                      ...actual,
                      [campo]: e.target.checked,
                    }));

                    if (e.target.checked) {
                      confirmar(campo, false);
                      setEditando(null);
                    }

                    setMensaje("");
                  }}
                  className="h-4 w-4 accent-slate-400"
                />
                No estoy seguro
              </label>

            </div>
          </div>
        ))}
      </div>

      {editando && puedeEditar && (
        <form
          onSubmit={guardar}
          className="space-y-3 rounded-2xl border border-amber-400/30 bg-slate-950/60 p-4"
        >
          <p className="text-sm font-black text-amber-300">
            Corregir {editando === "silbato" ? "silbato" : "tarjetas"}
          </p>

          <label
            htmlFor="material-valor"
            className="block text-xs font-bold text-white"
          >
            Dato correcto
          </label>

          <input
            id="material-valor"
            required
            maxLength={140}
            value={nuevoValor}
            onChange={(e) => setNuevoValor(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white"
          />

          <label
            htmlFor="material-motivo"
            className="block text-xs font-bold text-white"
          >
            Comentario explicando la corrección
          </label>

          <textarea
            id="material-motivo"
            required
            rows={3}
            maxLength={500}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Explica qué dato estaba mal..."
            className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white"
          />

          <p className="text-xs text-slate-400">
            El comentario explica la corrección,
            pero todavía no se archiva en Supabase.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : "Guardar y actualizar la web"}
            </button>

            <button
              type="button"
              onClick={() => setEditando(null)}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {mensaje && (
        <p role="status" className="text-xs font-bold text-amber-200">
          {mensaje}
        </p>
      )}

      {!puedeEditar && (
        <p className="text-xs text-slate-400">
          Solo el administrador puede modificar la ficha pública.
        </p>
      )}
    </div>
  );
}
