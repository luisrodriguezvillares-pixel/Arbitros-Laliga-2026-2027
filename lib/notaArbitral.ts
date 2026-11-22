// Normativa arbitral 2026/2027.
// Misma fórmula para Valoraciones, Rankings y notas históricas.

type AccionRelevante = {
  valor?: number | null;
  decision?: string | null;
  correccionTrasVAR?: boolean;
};

export function obtenerDetalleArbitral(
  criterios: Record<string, unknown> | null | undefined,
  acciones: AccionRelevante[] | null | undefined
) {
  const c = criterios ?? {};
  const lista = Array.isArray(acciones) ? acciones : [];

  const cantidad = (clave: string): number => {
    const valor = Number(c[clave] ?? 0);
    return Number.isFinite(valor)
      ? Math.max(0, Math.trunc(valor))
      : 0;
  };

  const graves =
    cantidad("penalti_incorrecto") +
    cantidad("roja_incorrecta");

  const clavesLeves = [
    "amarilla_incorrecta",
    "falta_incorrecta",
    "falta_peligrosa_incorrecta",
    "ventaja_mal_aplicada",
    "saque_puerta_incorrecto",
    "corner_incorrecto",
    "saque_banda_incorrecto",
    "fuera_juego_incorrecto",
    "anadido_incorrecto",
    "mal_control",
    "mala_intervencion_var"
  ];

  const leves =
    clavesLeves.reduce(
      (suma, clave) => suma + cantidad(clave), 0
    ) +
    lista.filter(
      (accion) => accion.decision === "incorrecta"
    ).length;

  const correccionVAR =
    cantidad("correccion_tras_var") > 0 ||
    lista.some(
      (accion) => accion.correccionTrasVAR === true
    );

  const topeGraves =
    graves === 0 ? 10 :
    graves === 1 ? 8.5 :
    graves === 2 ? 7 : 4.5;

  const reduccionLeves = Math.floor(leves / 5) * 0.5;
  const reduccionVAR = correccionVAR ? 1 : 0;

  const maximo = Math.max(
    0,
    topeGraves - reduccionLeves - reduccionVAR
  );

  return {
    graves,
    leves,
    correccionVAR,
    maximo
  };
}


export function calcularNotaArbitral(
  criterios: Record<string, unknown> | null | undefined,
  acciones: AccionRelevante[] | null | undefined
): number {
  const c = criterios ?? {};
  const lista = Array.isArray(acciones) ? acciones : [];

  const n = (clave: string): number => {
    const valor = c[clave];

    if (typeof valor !== "number" && typeof valor !== "string") {
      return 0;
    }

    if (typeof valor === "string" && valor.trim() === "") {
      return 0;
    }

    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  };

  const cantidad = (clave: string): number =>
    Math.max(0, Math.trunc(n(clave)));

  const { maximo } = obtenerDetalleArbitral(c, lista);

  // Córner, banda y puerta:
  // +0,02 por acierto, máximo conjunto +0,50.
  const positivosRutinarios = Math.min(
    0.50,
    (
      cantidad("corner_correcto") +
      cantidad("saque_banda_correcto") +
      cantidad("saque_puerta_correcto")
    ) * 0.02
  );

  // Acciones relevantes con su valor personalizado.
  const ajusteAcciones = lista.reduce((total, a) => {
    const valor = Math.abs(Number(a.valor ?? 0));

    if (!Number.isFinite(valor)) {
      return total;
    }

    return total + (
      a.decision === "incorrecta" ? -valor : valor
    );
  }, 0);

  // Nota inicial: 6 puntos.
  const notaBruta =
    6 +

    // Control y colocación.
    n("control") +
    n("colocacion") +
    cantidad("buen_control") * 0.30 -
    cantidad("mal_control") * 0.30 +

    // Amarillas.
    cantidad("amarilla_correcta") * 0.75 -
    cantidad("amarilla_incorrecta") * 0.75 +

    // Rojas.
    cantidad("roja_correcta") * 1.50 -
    cantidad("roja_incorrecta") * 1.50 +

    // Penaltis.
    cantidad("penalti_correcto") * 1.50 -
    cantidad("penalti_incorrecto") * 1.50 +

    // Faltas normales.
    cantidad("falta_correcta") * 0.20 -
    cantidad("falta_incorrecta") * 0.50 +

    // Faltas peligrosas.
    cantidad("falta_peligrosa_correcta") * 0.50 -
    cantidad("falta_peligrosa_incorrecta") * 0.50 +

    // Ventajas.
    cantidad("ventaja_bien_aplicada") * 0.25 -
    cantidad("ventaja_mal_aplicada") * 0.50 +

    // Córneres, bandas y puertas correctos.
    positivosRutinarios -

    // Saques incorrectos.
    cantidad("corner_incorrecto") * 0.20 -
    cantidad("saque_banda_incorrecto") * 0.20 -
    cantidad("saque_puerta_incorrecto") * 0.20 +

    // Fuera de juego: no comparte el límite +0,50.
    cantidad("fuera_juego_correcto") * 0.02 -
    cantidad("fuera_juego_incorrecto") * 0.20 +

    // Tiempo añadido.
    cantidad("anadido_correcto") * 0.25 -
    cantidad("anadido_incorrecto") * 0.25 +

    // Otros criterios existentes.
    cantidad("buena_intervencion_var") * 0.25 -
    cantidad("mala_intervencion_var") * 0.25 +
    cantidad("buena_decision_revision") * 0.50 +

    // Acciones relevantes.
    ajusteAcciones;

  // Aplicar todos los límites acumulados.
  const resultado = Math.max(
    0,
    Math.min(notaBruta, maximo)
  );

  return Math.round(resultado * 100) / 100;
}
