"use client";

import { createPortal } from "react-dom";

type VarDetalle = {
  nombre: string;
  lugar_nacimiento: string;
  comite: string;
  fecha_nacimiento: string;
  temporadas_var: number;
  fifa: boolean;
  fifa_desde: number | null;
  foto_url: string;
};

type VarModalProps = {
  arbitroVar: VarDetalle;
  fotoUrl: string;
  onClose: () => void;
};

function calcularEdad(fechaNacimiento: string) {
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const noHaCumplido =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (noHaCumplido) edad--;

  return edad;
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default function VarModal({
  arbitroVar,
  fotoUrl,
  onClose,
}: VarModalProps) {
  const edad = calcularEdad(arbitroVar.fecha_nacimiento);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <article
        className="relative z-[10000] max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha"
          className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 text-2xl text-white transition hover:bg-slate-950"
        >
          ×
        </button>

        <section className="relative flex justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950">
          <img
            src={fotoUrl}
            alt={arbitroVar.nombre}
            className="max-h-[520px] w-full object-contain"
          />

          <div className="absolute left-5 top-5 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-black text-white shadow-md">
  26/27
</div>

          {arbitroVar.fifa === true && (
  <img
  src="/escarapela-fifa-var.png"
  alt="FIFA Video Match Official"
className="absolute bottom-16 right-5 z-20 h-24 w-auto object-contain"  />
)}
        </section>

        <section className="p-7 md:p-10">
          <h2 className="pr-12 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            {arbitroVar.nombre}
          </h2>

          <p className="mt-3 text-lg font-bold text-emerald-800">
            {arbitroVar.comite}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Dato
              titulo="Lugar de nacimiento"
              contenido={arbitroVar.lugar_nacimiento || "—"}
            />

            <Dato
              titulo="Fecha de nacimiento"
              contenido={`${formatearFecha(
                arbitroVar.fecha_nacimiento
              )} · ${edad} años`}
            />

            <Dato
              titulo="Temporadas como VAR"
              contenido={String(arbitroVar.temporadas_var)}
            />

             {arbitroVar.fifa && (
  <Dato
    titulo="FIFA desde"
    contenido={String(arbitroVar.fifa_desde)}
  />
)}
          </div>
        </section>
      </article>
    </div>,
    document.body
  );
}

function Dato({
  titulo,
  contenido,
}: {
  titulo: string;
  contenido: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
        {titulo}
      </p>

      <p className="mt-2 font-bold text-slate-900">{contenido}</p>
    </div>
  );
}