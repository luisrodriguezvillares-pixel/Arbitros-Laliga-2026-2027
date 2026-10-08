"use client";

type ArbitroDetalle = {
  nombre_apellidos: string;
  lugar_nacimiento: string;
  comite: string;
  fecha_nacimiento: string;
  temporadas_primera: number;
  fifa: boolean;
  fifa_desde: number | null;
  silbato: string;
  tarjetas: string;
  lleva_tarjetas: string;
  pitido_final: string;
  foto_url: string;
};

type RefereeModalProps = {
  arbitro: ArbitroDetalle;
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

export default function RefereeModal({
  arbitro,
  fotoUrl,
  onClose,
}: RefereeModalProps) {
  const edad = calcularEdad(arbitro.fecha_nacimiento);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <article
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl"
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

 <div className="flex flex-col">         <section className="relative bg-slate-100 flex justify-center">
            <img
  src={fotoUrl}
  alt={arbitro.nombre_apellidos}
  className="w-full max-h-[520px] object-contain"
/>

            {arbitro.fifa && (
              <img
                src="/fifa-referee-2026.png"
                alt="Árbitro FIFA"
                className="absolute right-5 top-40 h-20 w-auto object-contain mix-blend-multiply drop-shadow-md"
              />
            )}
          </section>

          <section className="p-7 md:p-10">
            <h2 className="pr-12 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              {arbitro.nombre_apellidos}
            </h2>

            <p className="mt-3 text-lg font-bold text-blue-700">
              {arbitro.comite}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Dato
                titulo="Lugar de nacimiento"
                contenido={arbitro.lugar_nacimiento || "-"}
              />

              <Dato
                titulo="Fecha de nacimiento"
                contenido={`${formatearFecha(arbitro.fecha_nacimiento)} · ${edad} años`}
              />

              <Dato
                titulo="Temporadas en Primera"
                contenido={String(arbitro.temporadas_primera)}
              />

              {arbitro.fifa && (
                <Dato
  titulo="FIFA desde"
  contenido={
    arbitro.nombre_apellidos === "Alejandro Quintero González" ||
    arbitro.nombre_apellidos === "Víctor García Verdura"
      ? "A partir de 2027"
      : arbitro.fifa_desde
      ? String(arbitro.fifa_desde)
      : "-"
  }
/>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <DatoGrande
                titulo="Su silbato"
                contenido={arbitro.silbato || "-"}
              />

              <DatoGrande
                titulo="Sus tarjetas"
                contenido={arbitro.tarjetas || "-"}
              />

              <DatoGrande
  titulo="Lleva las tarjetas"
  contenido={arbitro.lleva_tarjetas || "-"}
/>

              <DatoGrande
                titulo="Pitido final"
                contenido={arbitro.pitido_final || "-"}
              />
            </div>
          </section>
        </div>
      </article>
    </div>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 font-bold text-slate-900">{contenido}</p>
    </div>
  );
}

function DatoGrande({
  titulo,
  contenido,
}: {
  titulo: string;
  contenido: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-700">
        {titulo}
      </p>

      <p className="mt-3 leading-7 text-slate-700">{contenido}</p>
    </div>
  );
}