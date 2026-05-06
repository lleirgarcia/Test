/* =========================================
   Archivo: navbar.js
   Tipo: Componente
   Descripción: Componente de navegación superior que muestra el título dinámico según la ruta actual y accesos principales
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import { Link } from "react-router-dom";

/* ====== CONSTANTES / DATOS ======
   Datos estáticos, arrays de opciones, configuraciones internas */

// Mapea rutas a títulos que se mostrarán en la barra
const titles = {
  "/": "Inicio",
  "/portafolio": "Portafolio",
  "/auth": "Iniciar Sesión",
  "/gestor-de-tareas": "Gestor de tareas",
  "/community-score": "Puntuación comunitaria",
};

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function NavBar({ location }) {
  // Obtiene el título según la ruta actual y proporciona un valor por defecto si la ruta no está mapeada
  const title = titles[location.pathname] || "Página sin identificar";

  return (
    <nav aria-label="Barra de navegación superior">
      <div className="container">
        <div className="g__card p-3 rounded-bottom d-flex align-items-center justify-content-between">
          {/* Enlace de navegación principal hacia la raíz */}
          <Link
            to="/"
            className="g__btn g__btn--hover g__text--sm fw-semibold d-flex align-items-center gap-2"
            aria-label="Volver a la página de inicio"
          >
            Volver
          </Link>

          {/* Título dinámico asociado a la ruta activa */}
          <span className="g__text--lg fw-semibold">{title}</span>

          {/* Acceso directo a la sección de autenticación */}
          <Link
            to="/auth"
            className="g__btn g__btn--hover g__text--sm fw-semibold d-flex align-items-center gap-2"
            aria-label="Ir a la página de inicio de sesión"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
