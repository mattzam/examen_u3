"use client";

import { useMemo, useState } from "react";
import {
  autenticarUsuario,
  cerrarSesionUsuario,
  configurarPersistencia,
} from "@/firebase/auth";

type AuthUser = {
  email: string;
};

function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function mensajeFirebase(codigo: string): string {
  const mensajes: Record<string, string> = {
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-email": "El formato del correo no es válido.",
    "auth/invalid-credential": "Credenciales inválidas. Verifica tu correo y contraseña.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
    "auth/network-request-failed": "Error de red. Verifica tu conexión.",
  };
  return mensajes[codigo] ?? "Ocurrió un error inesperado. Intenta de nuevo.";
}

export default function LoginExam() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  const tituloBoton = useMemo(() => {
    return cargando ? "Entrando..." : "Entrar";
  }, [cargando]);

  async function procesarAcceso(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!correo.trim() || !contrasena.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (!esCorreoValido(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setCargando(true);

    try {
      await configurarPersistencia(recordarme);
      const credencial = await autenticarUsuario(correo, contrasena);
      setUsuario({ email: credencial.user.email ?? correo });
    } catch (err: unknown) {
      const codigo =
        err !== null &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
          ? (err as { code: string }).code
          : "";
      setError(mensajeFirebase(codigo));
    } finally {
      setCargando(false);
    }
  }

  async function salir() {
    await cerrarSesionUsuario();
    setUsuario(null);
    setCorreo("");
    setContrasena("");
    setRecordarme(false);
    setError("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <section className="w-full max-w-md">
        {!usuario ? (
          <div className="rounded-2xl bg-white px-8 py-10 shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Acceso escolar
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={procesarAcceso} noValidate className="space-y-5">
              {/* Correo */}
              <div>
                <label
                  htmlFor="correo"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  placeholder="alumno@correo.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="contrasena"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Recordarme */}
              <div className="flex items-center gap-2.5">
                <input
                  id="recordarme"
                  type="checkbox"
                  checked={recordarme}
                  onChange={(event) => setRecordarme(event.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <label
                  htmlFor="recordarme"
                  className="cursor-pointer select-none text-sm text-slate-600"
                >
                  Recordarme
                </label>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {tituloBoton}
              </button>
            </form>
          </div>
        ) : (
          /* Vista de bienvenida */
          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p className="text-sm font-medium uppercase tracking-wide text-green-600">
              Inicio de sesión correcto
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">
              ¡Bienvenido!
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {usuario.email}
            </p>

            <hr className="my-6 border-slate-200" />

            <button
              type="button"
              onClick={salir}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </section>
    </main>
  );
}