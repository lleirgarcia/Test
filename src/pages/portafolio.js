/* =========================================
   Archivo: Portafolio.js
   Tipo: Pagina
   Descripción: Página de portafolio personal con secciones de Hero, Habilidades, Proyectos, Experiencia y Estudios
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import myPhoto from "../images/mi-cara.png";
import webIcon from "../images/link.png";
import { Link } from "react-router-dom";

/* ====== CONSTANTES / DATOS ======
   Datos estáticos, arrays de opciones, configuraciones internas */

// Habilidades del portafolio: lista de tecnologías y lenguajes que domina el desarrollador
const skills = [
  "Lua",
  "Python",
  "Kotlin",
  "C#",
  "Java",
  "React",
  "Bootstrap",
  "CSS",
  "JavaScript",
  "Laravel",
  "Express",
  "API",
  "Serverless",
  "MongoDB",
  "GitHub",
  "CI/CD",
  "UI",
  "Diseño",
];

// Proyectos: lista de proyectos a mostrar en la sección de portfolio con título, descripción y enlace
const projects = [
  {
    title: "Gestor de tareas",
    description: "App simple de gestión de tareas con el sistema CRUD.",
    link: "/gestor-de-tareas",
  },
  {
    title: "Puntuación comunitaria",
    description: "App que analiza texto y asigna una puntuación de toxicidad.",
    link: "/community-score",
  },
  {
    title: "Transcriptor de videos",
    description: "App que transcribe el audio de un video usando una API.",
    link: "#",
  },
  {
    title: "Explorador de ciudades",
    description: "App de busqueda de información sobre ciudades usando APIs.",
    link: "#",
  },
  {
    title: "Retro shooter",
    description: "Juego de disparos desarrollado con JavaScript y HTML.",
    link: "#",
  },
  {
    title: "Ajedrez 2D",
    description: "Juego de ajedrez desarrollado con JavaScript y HTML.",
    link: "#",
  },
];

// Experiencia laboral: lista de trabajos y roles con título, periodo y descripción de responsabilidades
const experience = [
  {
    title: "Empleado - McDonald's",
    period: "Abril 2025 - Actualidad",
    startIso: "2025-04",
    endIso: null, // null porque sigue en curso
    description: "Atención a clientes, gestión de pagos, trabajo en equipo bajo presión.",
  },
  {
    title: "Diseñadora de publicidad - KIT DIGITAL",
    period: "Marzo 2025 - Diciembre 2025",
    startIso: "2025-03",
    endIso: "2025-12",
    description: "Contenido publicitario para redes sociales, contacto con clientes.",
  },
  {
    title: "Diseñadora Web - KIT DIGITAL",
    period: "Marzo 2024 - Agosto 2024",
    startIso: "2024-03",
    endIso: "2024-08",
    description: "Páginas web, contenido publicitario y gestión de clientes.",
  },
  {
    title: "Técnico de TI - Miscota",
    period: "Febrero 2021 - Marzo 2022",
    startIso: "2021-02",
    endIso: "2022-03",
    description: "Reparación de ordenadores, soporte técnico remoto, bases de datos.",
  },
];

// Estudios académicos: lista de formaciones relevantes con título y periodo
const education = [
  {
    title: "CFGM - Sistemas Microinformáticos y Redes",
    period: "Sept 2020 - Mayo 2022",
    startIso: "2020-09",
    endIso: "2022-05",
  },
  {
    title: "CFGS - Desarrollo de Aplicaciones Multiplataforma",
    period: "Sept 2022 - Mayo 2024",
    startIso: "2022-09",
    endIso: "2024-05",
  },
];

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function Portafolio() {
  return (
    <main>
      <div className="container">
        {/* HERO / INICIO */}
        <header id="inicio" className="p__hero gap-3 mb-5">
          <img
            src={myPhoto}
            alt="Henar Garcia Boada"
            className="p__hero-photo"
          />
          {/* Información personal: nombre, rol y descripción */}
          <div>
            <h1 className="g__text--xl m-0">Henar Garcia Boada</h1>
            <p className="g__text--md g__text-color--grey p__hero-role fw-semibold">
              Desarrollador Web · Tecnología & Programación
            </p>
            <p className="g__text--md m-0">
              Soy una persona optimista, entusiasta y persistente, con pasión
              por la tecnología y la programación. Me especializo en desarrollo
              Fullstack, trabajando tanto en frontend como backend con múltiples
              lenguajes y frameworks, creando aplicaciones completas y
              funcionales, siempre buscando aprender y mejorar mis habilidades.
            </p>
          </div>
        </header>

        {/* HABILIDADES / ATRIBUTOS */}
        <section className="mb-4">
          <h5 className="g__text--lg fw-semibold mb-3">
            Habilidades & Tecnologías
          </h5>
          <div className="g__card p-4 rounded">
            <div className="row g-3">
              {skills.map((skill, i) => (
                <div
                  key={i}
                  className="col-6 col-md-2 d-flex align-items-center"
                >
                  {/* Punto visual de skill */}
                  <span className="p__skill-dot me-2" />
                  {/* Nombre de la skill */}
                  <span className="g__text--md">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROYECTOS */}
        <section className="mb-4">
          <h5 className="g__text--lg fw-semibold mb-3">Proyectos</h5>
          <div className="row g-4">
            {projects.map((project ,i) => (
              <div className="col-md-4" key={i}>
                <div className="g__card p-4 rounded h-100 d-flex flex-column justify-content-between position-relative">
                  {/* Título y descripción del proyecto */}
                  <div>
                    <h6 className="g__text--md fw-semibold">
                      {project.title}
                    </h6>
                    <p className="mb-0">{project.description}</p>
                  </div>
                  {/* Botón de enlace o disabled según disponibilidad */}
                  <div className="d-flex gap-3 mt-3 align-items-center">
                    {project.link !== "#" ? (
                      <Link
                        to={project.link}
                        className="g__text--md g__btn g__btn--hover p__btn-img--hover fw-semibold d-flex align-items-center gap-2"
                      >
                        <img src={webIcon} alt="" width={18} height={18} />
                        Abrir
                      </Link>
                    ) : (
                      <button
                        className="g__text--md g__btn p__btn--disabled fw-semibold d-flex align-items-center gap-2"
                        disabled
                      >
                        <img src={webIcon} alt="" width={18} height={18} />
                        No disponible
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPERIENCIA LABORAL */}
        <section className="mb-4">
          <h5 className="g__text--lg fw-semibold mb-3">Experiencia Laboral</h5>
          <div className="g__card p-4 rounded">
            <div className="p__timeline gap-3">
              {experience.map((exp, i) => (
                <div key={i} className="d-flex gap-3 align-items-start">
                  {/* Dot de la línea de tiempo */}
                  <div className="p__timeline-dot mt-1" />
                  {/* Contenido de la experiencia: título y detalles */}
                  <div className="d-flex flex-column">
                    <h6 className="g__text--md fw-semibold mb-1">
                      {exp.title}
                    </h6>
                    <div className="g__text--md g__text-color--grey">
                      {/* Fechas con dateTime para semántica */}
                      <time dateTime={exp.startIso}>
                        {exp.period.split("-")[0].trim()}
                      </time>
                      <span> - </span>
                      {exp.endIso ? (
                        <time dateTime={exp.endIso}>
                          {exp.period.split("-")[1].trim()}
                        </time>
                      ) : (
                        "Actualidad"
                      )}
                      <span> · {exp.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESTUDIOS */}
        <section className="mb-4">
          <h5 className="g__text--lg fw-semibold mb-3">Estudios</h5>
          <div className="row g-4">
            {education.map((edu, i) => (
              <div key={i} className="col-md-6">
                <div className="g__card p-3 rounded d-flex flex-column justify-content-center">
                  {/* Título del estudio */}
                  <div className="g__text--md fw-semibold mb-1">
                    {edu.title}
                  </div>
                  {/* Periodo del estudio con dateTime */}
                  <div className="g__text--md g__text-color--grey">
                    <time dateTime={edu.startIso}>
                      {edu.period.split("-")[0].trim()}
                    </time>
                    <span> - </span>
                    {edu.endIso ? (
                      <time dateTime={edu.endIso}>
                        {edu.period.split("-")[1].trim()}
                      </time>
                    ) : (
                      "Actualidad"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
