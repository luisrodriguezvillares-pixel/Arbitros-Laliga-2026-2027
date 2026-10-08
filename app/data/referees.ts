export type Referee = {
  id: string;
  name: string;
  photo: string;
};

export const referees: Referee[] = [
  {
    id: "adrian-cordero-vega",
    name: "Adrián Cordero Vega",
    photo: "/referees/adrian-cordero-vega.png",
  },
  {
    id: "alejandro-hernandez-hernandez",
    name: "Alejandro Hernández Hernández",
    photo: "/referees/alejandro-hernandez-hernandez.png",
  },
  {
    id: "alejandro-muniz-ruiz",
    name: "Alejandro Muñiz Ruiz",
    photo: "/referees/alejandro-muniz-ruiz.png",
  },
  {
    id: "alejandro-quintero-gonzalez",
    name: "Alejandro Quintero González",
    photo: "/referees/alejandro-quintero-gonzalez.png",
  },
  {
    id: "alvaro-moreno-aragon",
    name: "Álvaro Moreno Aragón",
    photo: "/referees/alvaro-moreno-aragon.png",
  },
  {
    id: "carlos-del-cerro-grande",
    name: "Carlos del Cerro Grande",
    photo: "/referees/carlos-del-cerro-grande.png",
  },
  {
    id: "carlos-muniz-munoz",
    name: "Carlos Muñiz Muñoz",
    photo: "/referees/carlos-muniz-munoz.png",
  },
  {
    id: "cesar-soto-grado",
    name: "César Soto Grado",
    photo: "/referees/cesar-soto-grado.png",
  },
  {
    id: "daniel-jesus-trujillo-suarez",
    name: "Daniel Jesús Trujillo Suárez",
    photo: "/referees/daniel-jesus-trujillo-suarez.png",
  },
  {
    id: "david-galvez-rascon",
    name: "David Gálvez Rascón",
    photo: "/referees/david-galvez-rascon.png",
  },
  {
    id: "francisco-jose-hernandez-maeso",
    name: "Francisco José Hernández Maeso",
    photo: "/referees/francisco-jose-hernandez-maeso.png",
  },
  {
    id: "guillermo-cuadra-fernandez",
    name: "Guillermo Cuadra Fernández",
    photo: "/referees/guillermo-cuadra-fernandez.png",
  },
  {
    id: "isidro-diaz-de-mera-escuderos",
    name: "Isidro Díaz de Mera Escuderos",
    photo: "/referees/isidro-diaz-de-mera-escuderos.png",
  },
  {
    id: "ivan-caparros-hernandez",
    name: "Iván Caparrós Hernández",
    photo: "/referees/ivan-caparros-hernandez.png",
  },
  {
    id: "javier-alberola-rojas",
    name: "Javier Alberola Rojas",
    photo: "/referees/javier-alberola-rojas.png",
  },
  {
    id: "javier-iglesias-villanueva",
    name: "Javier Iglesias Villanueva",
    photo: "/referees/javier-iglesias-villanueva.png",
  },
  {
    id: "jesus-gil-manzano",
    name: "Jesús Gil Manzano",
    photo: "/referees/jesus-gil-manzano.png",
  },
  {
    id: "jon-ander-gonzalez-esteban",
    name: "Jon Ander González Esteban",
    photo: "/referees/jon-ander-gonzalez-esteban.png",
  },
  {
    id: "jorge-figueroa-vazquez",
    name: "Jorge Figueroa Vázquez",
    photo: "/referees/jorge-figueroa-vazquez.png",
  },
  {
    id: "jose-antonio-lopez-toca",
    name: "José Antonio López Toca",
    photo: "/referees/jose-antonio-lopez-toca.png",
  },
  {
    id: "jose-luis-munuera-montero",
    name: "José Luis Munuera Montero",
    photo: "/referees/jose-luis-munuera-montero.png",
  },
  {
    id: "jose-maria-sanchez-martinez",
    name: "José María Sánchez Martínez",
    photo: "/referees/jose-maria-sanchez-martinez.png",
  },
  {
    id: "juan-luis-pulido-santana",
    name: "Juan Luis Pulido Santana",
    photo: "/referees/juan-luis-pulido-santana.png",
  },
  {
    id: "juan-martinez-munuera",
    name: "Juan Martínez Munuera",
    photo: "/referees/juan-martinez-munuera.png",
  },
  {
    id: "luis-bestard-servera",
    name: "Luis Bestard Servera",
    photo: "/referees/luis-bestard-servera.png",
  },
  {
    id: "luis-mario-milla-alvendiz",
    name: "Luis Mario Milla Alvendiz",
    photo: "/referees/luis-mario-milla-alvendiz.png",
  },
  {
    id: "manuel-jesus-orellana-cid",
    name: "Manuel Jesús Orellana Cid",
    photo: "/referees/manuel-jesus-orellana-cid.png",
  },
  {
    id: "mateo-busquets-ferrer",
    name: "Mateo Busquets Ferrer",
    photo: "/referees/mateo-busquets-ferrer.png",
  },
  {
    id: "miguel-angel-ortiz-arias",
    name: "Miguel Ángel Ortiz Arias",
    photo: "/referees/miguel-angel-ortiz-arias.png",
  },
  {
    id: "miguel-sesma-espinosa",
    name: "Miguel Sesma Espinosa",
    photo: "/referees/miguel-sesma-espinosa.png",
  },
  {
    id: "raul-martin-gonzalez-frances",
    name: "Raúl Martín González Francés",
    photo: "/referees/raul-martin-gonzalez-frances.png",
  },
  {
    id: "ricardo-de-burgos-bengoetxea",
    name: "Ricardo de Burgos Bengoetxea",
    photo: "/referees/ricardo-de-burgos-bengoetxea.png",
  },
  {
    id: "ruben-avalos-barrera",
    name: "Rubén Ávalos Barrera",
    photo: "/referees/ruben-avalos-barrera.png",
  },
  {
    id: "valentin-pizarro-gomez",
    name: "Valentín Pizarro Gómez",
    photo: "/referees/valentin-pizarro-gomez.png",
  },
  {
    id: "victor-garcia-verdura",
    name: "Víctor García Verdura",
    photo: "/referees/victor-garcia-verdura.png",
  },
];

export function getRefereeById(id?: string | null) {
  if (!id) return undefined;

  return referees.find((referee) => referee.id === id);
}