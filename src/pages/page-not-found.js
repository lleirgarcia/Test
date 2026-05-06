/* =========================================
   Archivo: not-found.js
   Tipo: Pagina
   Descripción: Página de error 404 para rutas inexistentes
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import { Link } from "react-router-dom";

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function NotFound() {
  return (
    <main className="d-flex justify-content-center align-items-center">
      <section className="text-center">
        {/* Código de error 404 */}
        <h1 className="pnf__warning-text fw-semibold display-1 mb-2">404</h1>
        {/* Mensaje de página no encontrada */}
        <p className="lead mb-4">Página no encontrada</p>
        {/* Botón de navegación de regreso al inicio */}
        <div>
          <Link
            to="/"
            className="g__text--md g__btn pnf__btn--hover fw-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
