"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

type LoginModalProps = {
  onClose: () => void;
  onLoginCorrecto: () => void;
};

export default function LoginModal({
  onClose,
  onLoginCorrecto,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);
    setError("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError("El correo o la contraseña no son correctos.");
      setCargando(false);
      return;
    }

    setCargando(false);
    onLoginCorrecto();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="relative w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-700 transition hover:bg-slate-200"
        >
          ×
        </button>

        <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
          Acceso privado
        </p>

        <h2 className="mt-3 text-3xl font-black text-slate-950">
          Iniciar sesión
        </h2>

        <p className="mt-3 leading-7 text-slate-500">
          El acceso es solo para administradores y valoradores.
        </p>

        <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-slate-700"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(evento) =>
                setPassword(evento.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-2xl bg-blue-700 px-5 py-4 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </div>
  );
}