"use client";

type VarCardProps = {
  nombre: string;
  comite: string;
  fechaNacimiento: string;
  temporadasVar: number;
  fifa: boolean;
  fifaDesde: number | null;
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

export default function VarCard({
  nombre,
  comite,
  fechaNacimiento,
  fifa,
  fotoUrl,
  onClick,
}: VarCardProps) {
  const edad = calcularEdad(fechaNacimiento);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group w-full max-w-[295px] overflow-hidden rounded-[24px]
        border border-emerald-900/20 bg-white text-left
        shadow-[0_12px_30px_rgba(6,78,59,0.12)]
        transition-all duration-300
        hover:-translate-y-2
        hover:border-emerald-300
        hover:shadow-[0_24px_55px_rgba(5,150,105,0.22)]
      "
    >
      <div className="relative overflow-hidden bg-slate-100 pt-5">
        {fifa === true && (
          <img
            src="/escarapela-fifa-var.png"
            alt="Escarapela FIFA VAR"
            className="pointer-events-none absolute right-3 top-[7.5rem] z-30 h-14 w-auto object-contain drop-shadow-md"
          />
        )}
        <img
          src={fotoUrl}
          alt={nombre}
          className="
            relative z-10 mx-auto h-[250px] w-auto object-contain
            transition-transform duration-500
            group-hover:scale-[1.02]
          "
        />
      </div>

      <div className="border-t border-emerald-900/10 px-6 py-6">
        <h2 className="min-h-[72px] text-2xl font-black leading-tight text-slate-950">
          {nombre}
        </h2>

        <p className="mt-4 text-base font-bold text-emerald-800">
          {comite}
        </p>

        <p className="mt-2 text-base text-slate-500">
          {edad} años
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
            Ver ficha
          </span>

          <span className="text-3xl text-emerald-700 transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </div>
      </div>
    </button>
  );
}