import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { codigo } = await request.json();

    if (typeof codigo !== "string" || codigo.length < 8 || codigo.length > 128) {
      return NextResponse.json(
        { error: "Código incorrecto" },
        { status: 401 }
      );
    }

    const cuentas = [
      process.env.ACCESO_ADMIN_EMAIL,
      process.env.ACCESO_VALORADOR_EMAIL,
    ].filter((email): email is string => Boolean(email));

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key || cuentas.length !== 2) {
      return NextResponse.json(
        { error: "Acceso no configurado" },
        { status: 503 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    for (const email of cuentas) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: codigo,
      });

      if (!error && data.session) {
        const { data: perfil, error: errorPerfil } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", data.user.id)
          .single();

        const rolEsperado =
          email === cuentas[0] ? "admin" : "valorador";

        if (errorPerfil || perfil?.rol !== rolEsperado) {
          return NextResponse.json(
            { error: "Usuario sin permisos" },
            { status: 403 }
          );
        }

        return NextResponse.json({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    }

    return NextResponse.json(
      { error: "Código incorrecto" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo iniciar sesión" },
      { status: 400 }
    );
  }
}
