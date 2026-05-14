/* =========================================
   Archivo: Portafolio.js
   Tipo: Pagina
   Descripción: Portafolio de Henar Garcia Boada — datos basados en cv.json
   ========================================= */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import myPhoto from "../images/mi-cara.png";
import cv from "../data/cv.json";

const stack = [
  "React",
  "Next.js",
  "JavaScript",
  "Node.js",
  "MongoDB",
  "API Routes",
  "Serverless",
  "Fetch",
  "REST",
  "CI/CD",
  "GitHub",
  "Vercel",
  "Bootstrap",
  "CSS",
  "HTML",
  "VS Code",
  "WordPress",
  "Elementor",
];

const projects = [
  {
    title: "Gestor de tareas",
    description: "App de gestión de tareas con CRUD y persistencia en MongoDB Atlas.",
    link: "/gestor-de-tareas",
    year: "2025",
    stack: "React · Serverless · Mongo",
  },
  {
    title: "Puntuación comunitaria",
    description: "Analiza texto y asigna una puntuación de toxicidad vía API.",
    link: "/community-score",
    year: "2025",
    stack: "React · API",
  },
  {
    title: "Transcriptor de videos",
    description: "Transcribe el audio de un vídeo usando una API.",
    link: "#",
    year: "2025",
    stack: "API · Audio",
  },
  {
    title: "Explorador de ciudades",
    description: "Búsqueda de información sobre ciudades a través de APIs.",
    link: "#",
    year: "2024",
    stack: "React · APIs",
  },
  {
    title: "Retro shooter",
    description: "Juego arcade de disparos en JavaScript y HTML canvas.",
    link: "#",
    year: "2024",
    stack: "JS · Canvas",
  },
  {
    title: "Ajedrez 2D",
    description: "Juego de ajedrez con tablero 2D y reglas completas.",
    link: "#",
    year: "2023",
    stack: "JS · HTML",
  },
];

const renderWhen = (period) => {
  const s = period.start?.slice(0, 4);
  if (!period.end) return `${s} →`;
  const e = period.end?.slice(0, 4);
  return s === e ? s : `${s} — ${e.slice(2)}`;
};

export default function Portafolio() {
  useEffect(() => {
    document.body.classList.add("theme-paper");
    return () => document.body.classList.remove("theme-paper");
  }, []);

  return (
    <main>
      <div className="container">
        {/* ===== HERO ===== */}
        <section className="v-hero">
          <div className="v-hero-top v-reveal">
            <div className="v-hero-avatar">
              <img src={myPhoto} alt={cv.profile.name} />
              <div className="who">
                <span className="name">{cv.profile.name}</span>
                <span className="handle">{cv.profile.handle} — Fullstack Junior</span>
              </div>
            </div>

            <span className="v-status" aria-label="Estado profesional">
              <span className="v-status-dot" />
              Busco primera oportunidad
            </span>
          </div>

          <h1 className="v-headline v-reveal">
            {cv.profile.title}.{" "}
            <span className="v-soft">
              Construyo apps en React + Next.js sobre Vercel, con MongoDB Atlas y
              funciones serverless.
            </span>
          </h1>

          <p className="v-bio v-reveal">
            {cv.summary}
          </p>

          <div className="v-meta-row v-reveal">
            <span>Llinars del Vallès · Cataluña</span>
            <span className="dot" />
            <span>CA · ES · EN</span>
            <span className="dot" />
            <span>Open to work</span>
          </div>
        </section>

        {/* ===== STACK ===== */}
        <section className="v-section">
          <div className="v-section-head">
            <h2>Stack</h2>
            <span className="v-count">{stack.length}</span>
          </div>
          <div className="v-stack">
            {stack.map((s) => (
              <span className="v-chip" key={s}>{s}</span>
            ))}
          </div>
        </section>

        {/* ===== PROYECTOS ===== */}
        <section className="v-section">
          <div className="v-section-head">
            <h2>Proyectos</h2>
            <span className="v-count">{projects.length}</span>
          </div>
          <div className="v-list">
            {projects.map((p) => {
              const available = p.link !== "#";
              const Inner = (
                <>
                  <span className="v-row-when v-mono">{p.year}</span>
                  <div className="v-row-main">
                    <span className="v-row-title">{p.title}</span>
                    <span className="v-row-desc">{p.description}</span>
                  </div>
                  <span className="v-row-meta">
                    {available ? (
                      <>
                        {p.stack}
                        <span className="v-row-arrow">↗</span>
                      </>
                    ) : (
                      <>En curso</>
                    )}
                  </span>
                </>
              );
              return available ? (
                <Link to={p.link} key={p.title} className="v-row">
                  {Inner}
                </Link>
              ) : (
                <div key={p.title} className="v-row" aria-disabled="true">
                  {Inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== EXPERIENCIA ===== */}
        <section className="v-section">
          <div className="v-section-head">
            <h2>Experiencia</h2>
            <span className="v-count">{cv.experience.length}</span>
          </div>
          <div className="v-list">
            {cv.experience.map((e) => (
              <div className="v-row" key={e.role + e.company + e.period.start}>
                <span className="v-row-when v-mono">{renderWhen(e.period)}</span>
                <div className="v-row-main">
                  <span className="v-row-title">
                    {e.role}{" "}
                    <span className="v-row-org">· {e.company}</span>
                  </span>
                  {e.description && (
                    <span className="v-row-desc">{e.description}</span>
                  )}
                </div>
                <span className="v-row-meta">
                  {e.ongoing ? "en curso" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FORMACIÓN ===== */}
        <section className="v-section">
          <div className="v-section-head">
            <h2>Formación</h2>
            <span className="v-count">{cv.education.length}</span>
          </div>
          <div className="v-list">
            {cv.education.map((edu) => (
              <div className="v-row" key={edu.title}>
                <span className="v-row-when v-mono">
                  {edu.period.split("—")[0].trim().slice(-4)} — {edu.period.split("—")[1].trim().slice(-4).slice(2)}
                </span>
                <div className="v-row-main">
                  <span className="v-row-title">{edu.title}</span>
                  <span className="v-row-desc">{edu.school}</span>
                </div>
                <span className="v-row-meta">—</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
