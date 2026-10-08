"use client";

type RefereeCardProps = {
  nombre: string;
  comite: string;
  fechaNacimiento: string;
  fifa: boolean;
  fotoUrl: string;
  onClick: () => void;
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

export default function RefereeCard({
  nombre,
  comite,
  fechaNacimiento,
  fifa,
  fotoUrl,
  onClick,
}: RefereeCardProps) {
  const edad = calcularEdad(fechaNacimiento);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group w-full overflow-hidden rounded-[28px]
        border border-slate-200 bg-white text-left
        shadow-[0_12px_30px_rgba(15,23,42,0.12)]
        transition-all duration-300
        hover:-translate-y-2
        hover:border-blue-400
        hover:shadow-[0_24px_55px_rgba(37,99,235,0.22)]
      "
    >
      <div className="relative bg-white">
        {/* Foto real del árbitro */}
        <img
          src={fotoUrl}
          alt={nombre}
          className="
            block h-auto w-full
            transition-transform duration-500
            group-hover:scale-[1.015]
          "
        />

        {/* Escarapela FIFA */}
        {fifa && (
          <img
            src="/fifa-referee-2026.png"
            alt="Árbitro FIFA"
            className="
              absolute
              right-4
              top-32
              h-16
              w-auto
              object-contain
              mix-blend-multiply
              drop-shadow-md
            "
          />
        )}
      </div>

      <div className="border-t border-slate-200 px-6 py-6">
        <h2 className="min-h-[72px] text-2xl font-black leading-tight text-slate-950">
          {nombre}
        </h2>

        <p className="mt-4 text-base font-bold text-slate-600">
          {comite}
        </p>

        <p className="mt-2 text-base text-slate-500">
          {edad} años
        </p>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Ver ficha
          </span>

          <span className="text-3xl text-blue-700 transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </div>
      </div>
    </button>
  );
}