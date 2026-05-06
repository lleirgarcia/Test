/* =========================================
   Archivo: footer.js
   Tipo: Componente
   Descripción: Pie de página con copyright dinámico y enlaces de contacto/redes sociales
   ========================================= */

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function Footer() {
  return (
    <footer className="pb-3">
      <div className="container py-3">
        <div className="g__text--sm d-flex justify-content-between align-items-center">
          {/* Copyright dinámico con año actual */}
          <span>© {new Date().getFullYear()} Henar Garcia</span>

          {/* Grupo de enlaces de contacto */}
          <div className="d-flex gap-3 list-unstyled">
            <li>
              <a
                href="http://www.linkedin.com/in/henar-garcia-boada-145893201"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Perfil de LinkedIn de Henar Garcia"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="mailto:hegarbod@gmail.com"
                aria-label="Enviar correo a Henar Garcia"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="https://github.com/henar2004/Test"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositorio de GitHub de Henar Garcia"
              >
                GitHub
              </a>
            </li>
          </div>
        </div>
      </div>
    </footer>
  );
}
