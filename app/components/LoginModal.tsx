"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  onClose: () => void;
  onLoginCorrecto: () => void;
};

export default function LoginModal({
  onClose,
  onLoginCorrecto,
}: Props) {
  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "Código incorrecto");
      }

      const { error: errorSesion } = await supabase.auth.setSession({
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
      });

      if (errorSesion) throw errorSesion;

      setCodigo("");
      onLoginCorrecto();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de acceso");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="relative w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl text-slate-700"
          aria-label="Cerrar"
        >
          ×
        </button>

        <p className="text-sm font-black uppercase tracking-widest text-blue-700">
          🔐 Acceso privado
        </p>

        <h2 className="mt-4 text-3xl font-black text-slate-950">
          Código de acceso
        </h2>

        <p className="mt-3 text-slate-500">
          Introduce tu código para acceder.
        </p>

        <form onSubmit={entrar} className="mt-7 space-y-5">
          <input
            type={mostrarCodigo ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="current-password"
            placeholder="Introduce tu código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-slate-950 outline-none focus:border-blue-500"
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={mostrarCodigo}
              onChange={(e) => setMostrarCodigo(e.target.checked)}
            />
            Mostrar contraseña
          </label>

          {error && (
            <p className="text-sm font-bold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-2xl bg-blue-700 px-5 py-4 font-black text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {cargando ? "Comprobando..." : "Entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}
