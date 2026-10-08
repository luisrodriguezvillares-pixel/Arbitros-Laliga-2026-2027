import Link from "next/link";

const sections = [
  {
    title: "Árbitros",
    description: "Fichas completas de árbitros principales y VAR.",
    href: "/arbitros",
    icon: "A",
  },
  {
    title: "Partidos",
    description: "Calendario completo, jornadas y seguimiento de cada partido.",
    href: "/partidos",
    icon: "P",
  },
  {
    title: "Designaciones",
    description: "Consulta las designaciones arbitrales publicadas.",
    href: "/designaciones",
    icon: "D",
  },
  {
    title: "Kit Selector",
    description: "Selecciona las equipaciones de equipos y árbitros.",
    href: "/kit-selector",
    icon: "K",
  },
  {
    title: "Valoraciones",
    description: "Evalúa las actuaciones arbitrales de cada encuentro.",
    href: "/valoraciones",
    icon: "V",
  },
  {
    title: "Rankings",
    description: "Clasificaciones y medias de la temporada.",
    href: "/rankings",
    icon: "R",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <section className="relative overflow-hidden">
        {/* Fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
          {/* Presentación */}
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">
              LaLiga EA Sports 2026/2027
            </p>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Árbitros LaLiga
              <br />
              <span className="text-blue-400">2026/2027</span>
            </h1>

            <img
              src="/logo-cta.png"
              alt="Comité Técnico de Árbitros"
              className="mx-auto mt-10 h-44 w-auto object-contain sm:h-52"
            />

            <h2 className="mt-10 text-2xl font-bold leading-tight text-white sm:text-3xl">
              La plataforma arbitral más completa
              <br />
              de LaLiga EA Sports
            </h2>

            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-300 sm:text-xl">
              Árbitros, designaciones, partidos, equipaciones, valoraciones y
              rankings en un único espacio.
            </p>
          </div>

          {/* Categorías */}
          <section className="mt-24">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-400">
                Accede a todas las secciones
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                Explora la plataforma
              </h3>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="
                    group relative overflow-hidden rounded-3xl
                    border border-white/10 bg-white/[0.04]
                    p-7 backdrop-blur-sm
                    transition-all duration-300
                    hover:-translate-y-2
                    hover:border-blue-500/70
                    hover:bg-blue-500/[0.08]
                    hover:shadow-[0_20px_55px_rgba(37,99,235,0.18)]
                  "
                >
                  <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-blue-600/10 to-transparent transition-transform duration-300 group-hover:translate-y-0" />

                  <div className="relative z-10">
                    <div
                      className="
                        flex h-14 w-14 items-center justify-center
                        rounded-2xl border border-blue-400/20
                        bg-blue-500/10
                        text-xl font-black text-blue-300
                        transition duration-300
                        group-hover:scale-110
                        group-hover:border-blue-400/50
                        group-hover:bg-blue-500/20
                      "
                    >
                      {section.icon}
                    </div>

                    <h4 className="mt-6 text-2xl font-black text-white">
                      {section.title}
                    </h4>

                    <p className="mt-3 leading-7 text-slate-400">
                      {section.description}
                    </p>

                    <span className="mt-7 inline-flex items-center text-sm font-black uppercase tracking-[0.16em] text-blue-400">
                      Entrar
                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}