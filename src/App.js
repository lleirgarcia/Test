/* =========================================
   Archivo: App.js
   Tipo: Componente Root
   Descripción: Componente principal de la aplicación con enrutamiento y animaciones de transición entre páginas
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css"; // Estilos de Bootstrap
import "./styles/global.css"; // Estilos globales de la app
import "./styles/task-manager.css";
import "./styles/portafolio.css";
import "./styles/page-not-found.css";
import "./styles/community-score.css";
import "./styles/chatbot.css";

// Páginas y componentes
import Portafolio from "./pages/portafolio.js";
import TaskManager from "./pages/task-manager.js";
import Footer from "./components/footer.js";
import PageNotFound from "./pages/page-not-found.js";
import NavBar from "./components/navbar.js";
import Auth from "./pages/auth.js";
import CommunityScore from "./pages/community-score.js";
import Externo from "./pages/externo.js";
import Chatbot from "./components/chatbot.js";

/* ====== CONSTANTES / DATOS ======
   Datos estáticos, arrays de opciones, configuraciones internas */
function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  //Animación de fade
  useEffect(() => {
    const root = document.getElementById("root"); // obtenemos el div root
    if (root) root.style.transition = "opacity 0.28s ease-in-out";
    if (location.pathname !== displayLocation.pathname) {
      if (root) root.style.opacity = 0; // fade-out
      const t = setTimeout(() => {
        setDisplayLocation(location);
        requestAnimationFrame(() => {
          if (root) root.style.opacity = 1; // fade-in
        });
      }, 280);
      return () => clearTimeout(t);
    }
  }, [location, displayLocation]);

  // Mostrar NavBar en ciertas rutas, ocultar en otras
  const showMenu = ["/auth", "/gestor-de-tareas", "/community-score"].includes(
    displayLocation.pathname,
  );

  // Mostrar Footer en ciertas rutas
  const showFooter = ["/", "/gestor-de-tareas", "/auth", "/community-score"].includes(
    displayLocation.pathname,
  );

  // Mostrar Chatbot solo en la home del portafolio
  const showChatbot = displayLocation.pathname === "/";

  return (
    <>
      {/* Si se cumple muestra la NavBar y pasa la ubicación actual al componente */}
      {showMenu && <NavBar location={displayLocation} />}

      {/* Enrutamiento de páginas */}
      <Routes location={displayLocation} key={displayLocation.pathname}>
        <Route path="/" element={<Portafolio />} />
        <Route path="/gestor-de-tareas" element={<TaskManager />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/community-score" element={<CommunityScore />} />
        <Route path="/externo" element={<Externo />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {/* Si se cumple muestra el Footer */}
      {showFooter && <Footer />}

      {/* Chatbot — disponible en la home */}
      {showChatbot && <Chatbot />}
    </>
  );
}

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function App() {
  useEffect(() => {
    // Buscar el favicon actual en el documento
    const link = document.querySelector("link[rel~='icon']");
    link.rel = "icon";

    // Cambia el favicon según el tema del sistema (dark/light)
    const setFavicon = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      link.href = isDark ? "/white-favicon.png" : "/black-favicon.png";
      document.head.appendChild(link);
    };

    setFavicon(); // Establece el favicon al cargar la app

    // Escucha cambios en el tema del sistema y actualiza el favicon
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", setFavicon);
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
