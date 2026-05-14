/* =========================================
   Archivo: footer.js
   Tipo: Componente
   Descripción: Pie de página con copyright dinámico y enlaces de contacto/redes sociales
   ========================================= */

export default function Footer() {
  return (
    <footer className="pb-3">
      <div className="container py-3 footer-grid g__text--sm">
        <span className="footer-copy">© {new Date().getFullYear()} Henar Garcia</span>

        <ul className="footer-links">
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
        </ul>

        <span className="footer-locale">España — ES</span>
      </div>
    </footer>
  );
}
