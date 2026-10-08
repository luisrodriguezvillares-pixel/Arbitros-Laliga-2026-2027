import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.SPORTMONKS_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "No se ha encontrado SPORTMONKS_API_TOKEN" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
  `https://api.sportmonks.com/v3/football/leagues/564?api_token=${token}&include=currentSeason`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Sportmonks ha rechazado la petición",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      conectado: true,
      mensaje: "Sportmonks conectado correctamente",
      data: data.data,
    });
  } catch (error) {
    console.error("Error conectando con Sportmonks:", error);

    return NextResponse.json(
      { error: "No se ha podido conectar con Sportmonks" },
      { status: 500 }
    );
  }
}