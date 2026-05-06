/* =========================================
   Archivo: login-page.js
   Tipo: Page
   Descripción: Página de autenticación que renderiza el formulario de acceso y enlaces auxiliares de recuperación y registro
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import { Link } from "react-router-dom";

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function Login() {
  return (
    <main className="justify-content-center align-items-center">
      <div className="container d-flex flex-column gap-3">
        <section className="g__card login-box p-4 rounded">
          {/* Formulario de autenticación */}
          <form>
            {/* Campo de correo electrónico */}
            <div className="mb-3">
              <label htmlFor="email" className="g__text--md mb-1">
                Correo
              </label>
              <input
                id="email"
                type="email"
                className="form-control login-input"
                placeholder="ejemplo@gmail.com"
                required
              />
            </div>

            {/* Campo de contraseña */}
            <div className="mb-3">
              <label htmlFor="password" className="g__text--md mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="form-control login-input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Enlace a flujo de recuperación de credenciales */}
            <div className="d-flex justify-content-end align-items-center">
              <Link to="/recuperar" className="g__text--sm fw-semibold">
                ¿Has olvidado la contraseña?
              </Link>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="g__btn g__btn--hover fw-semibold g__text--md w-100"
            >
              Entrar
            </button>
          </form>
        </section>

        {/* Sección secundaria para redirigir a registro */}
        <div className="text-center g__text--sm">
          <p className="mb-1">
            ¿No tienes cuenta?
            <Link to="/registro" className="fw-semibold ms-1">
              Crear una ahora
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
