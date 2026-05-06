/* =========================================
   Archivo: community-score.js
   Tipo: Página
   Descripción: Página de análisis de toxicidad de posts en una comunidad simulada
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import { useState, useMemo } from "react";
import {
  badWords,
  goodWords,
  testSentences,
  getUserRank,
  intensifiers,
  negators,
} from "../date/ai-date.js";

/* ====== CONSTANTES / DATOS ======
   Datos estáticos, arrays de opciones, configuraciones internas */

// Configuración de puntos
const GOOD_POINTS = 2; // puntos por palabra buena
const BAD_POINTS = -5; // puntos base por palabra mala (mismo para todas)

/* ====== HOOKS ======  
   Estado y efectos del componente usando useState, useEffect, useRef, etc. */

// Normaliza texto: minúsculas y sin acentos
const normalizeText = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Divide texto en tokens
const tokenize = (text) => normalizeText(text).split(/\s+/).filter(Boolean);

// Limpia caracteres especiales de un token
const cleanToken = (token) =>
  normalizeText(token).replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");

// Construye léxico simple: -1 malas, +1 buenas
const buildLexicon = () => {
  const lex = {};
  badWords.forEach((w) => {
    const k = normalizeText(w);
    if (k) lex[k] = -1;
  });
  goodWords.forEach((w) => {
    const k = normalizeText(w);
    if (k) lex[k] = 1;
  });
  return lex;
};

// Busca palabra en léxico, con fallback por subcadena
const lookupLex = (lex, key) => {
  if (!key) return 0;
  key = key.toLowerCase();
  if (lex[key] !== undefined) return lex[key];

  // ⚡ nueva búsqueda por subcadena
  for (const w in lex) {
    if (key.includes(w)) return lex[w];
  }

  return 0;
};

// Escapa caracteres HTML básicos
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Calcula puntuaciones por token
function scoreTokens(text, lex) {
  const tokens = tokenize(text);
  const wordPoints = [];

  // Primera pasada: flag base y baseScore
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    let key = cleanToken(raw);
    let baseFlag = lookupLex(lex, key); // -1/0/1

    // Neutraliza palabras positivas si hay negadores
    if (baseFlag === 1) {
      // Revisar hasta 2 palabras previas
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const prevKey = cleanToken(tokens[j]);
        if (negators.includes(prevKey)) {
          baseFlag = 0;
          break;
        }
      }
      // Revisar si la palabra contiene un negador pegado al inicio
      for (const neg of negators) {
        if (key.startsWith(neg)) {
          baseFlag = 0;
          break;
        }
      }
    }

    const baseScore =
      baseFlag < 0 ? BAD_POINTS : baseFlag > 0 ? GOOD_POINTS : 0;
    wordPoints.push({
      token: raw,
      baseFlag,
      baseScore,
      score: 0,
      isIntensifier: false,
      mult: 1,
    });
  }

  // Segunda pasada: aplicar intensificadores
  for (let i = 0; i < wordPoints.length; i++) {
    const wp = wordPoints[i];
    if (wp.baseFlag === 0) {
      wp.score = 0;
      continue;
    }

    let mult = 1;
    const prevKey = i - 1 >= 0 ? cleanToken(wordPoints[i - 1].token) : null;
    const prevTwo =
      i - 2 >= 0 ? `${cleanToken(wordPoints[i - 2].token)} ${prevKey}` : null;

    if (prevTwo && intensifiers[prevTwo] !== undefined) {
      mult = intensifiers[prevTwo];
      wordPoints[i - 2].isIntensifier = true;
      wordPoints[i - 2].mult = mult;
      wordPoints[i - 1].isIntensifier = true;
      wordPoints[i - 1].mult = mult;
    } else if (prevKey && intensifiers[prevKey] !== undefined) {
      mult = intensifiers[prevKey];
      wordPoints[i - 1].isIntensifier = true;
      wordPoints[i - 1].mult = mult;
    }

    wp.score = Math.round(wp.baseScore * mult);
    wp.mult = mult;
  }

  // Sumar totalScore y contar buenas/malas
  let totalScore = 0,
    good = 0,
    bad = 0;
  wordPoints.forEach((w) => {
    if (w.score > 0) good++;
    if (w.score < 0) bad++;
    totalScore += w.score;
  });

  if (totalScore > 100) totalScore = 100;
  if (totalScore < -100) totalScore = -100;

  return { wordPoints, totalScore, good, bad, tokens };
}

// Formatea multiplicador a porcentaje legible
function formatMultiplierPercent(mult) {
  if (!mult || mult === 1) return "";
  const pct = Math.round((mult - 1) * 100);
  const sign = pct > 0 ? `+${pct}%` : `${pct}%`;
  return sign;
}

// Genera HTML con puntos por token
function wordPointsToHtmlWithPoints(wordPoints) {
  return wordPoints
    .map((w) => {
      const t = escapeHtml(w.token);
      if (w.isIntensifier) {
        // intensificador visual (amarillo) — solo aparece si se usó para potenciar
        return `<span class="g__text-color--yellow">${t}</span>`;
      }
      if (w.score > 0) {
        const multLabel =
          w.mult && w.mult !== 1 ? ` • ${formatMultiplierPercent(w.mult)}` : "";
        return `<span class="g__text-color--green">${t} <small>(+${w.score}${multLabel})</small></span>`;
      }
      if (w.score < 0) {
        const multLabel =
          w.mult && w.mult !== 1 ? ` • ${formatMultiplierPercent(w.mult)}` : "";
        return `<span class="g__text-color--red">${t} <small>(${w.score}${multLabel})</small></span>`;
      }
      return t;
    })
    .join(" ");
}

// Genera HTML para posts publicados (solo colores)
function wordPointsToHtml(wordPoints) {
  return wordPoints
    .map((w) => {
      const t = escapeHtml(w.token);
      if (w.isIntensifier)
        return `<span class="g__text-color--yellow">${t}</span>`;
      if (w.score > 0) return `<span class="g__text-color--green">${t}</span>`;
      if (w.score < 0) return `<span class="g__text-color--red">${t}</span>`;
      return t;
    })
    .join(" ");
}

// Wrapper simple para análisis de texto
function analyzeSentimentSimple(text, lex) {
  const { wordPoints, totalScore, good, bad, tokens } = scoreTokens(text, lex);
  return {
    text,
    tokens,
    good,
    bad,
    score: totalScore,
    wordPoints,
  };
}

/* ====== RENDER / JSX ======
   Estructura principal del componente, return con JSX */
export default function SocialSentimentProModerator() {
  const [post, setPost] = useState("");
  const [feed, setFeed] = useState([]);
  const lexicon = useMemo(() => buildLexicon(), []);

  const [users, setUsers] = useState(
    ["Ana", "Luis", "Carla", "Pedro", "Marta"].map((n, i) => ({
      name: n,
      avatar: `https://i.pravatar.cc/50?img=${i + 1}`,
      score: 0,
      posts: [],
    })),
  );

  const [selectedUser, setSelectedUser] = useState(users[0].name);

  // Publica post y actualiza score del usuario
  const publishPost = () => {
    if (!post.trim()) return;
    const user = users.find((u) => u.name === selectedUser);
    if (!user) return;

    const analyzed = analyzeSentimentSimple(post, lexicon);
    const item = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      user,
      ...analyzed,
    };

    setFeed((prev) => [item, ...prev]);

    setUsers((us) =>
      us.map((u) => {
        if (u.name !== user.name) return u;
        let newScore = u.score + analyzed.score;
        newScore = Math.max(-100, Math.min(100, newScore));
        return { ...u, score: newScore, posts: [item, ...u.posts] };
      }),
    );

    setPost("");
  };

  // Genera texto aleatorio para test
  const generateRandomPost = () =>
    setPost(testSentences[Math.floor(Math.random() * testSentences.length)]);

  // Exporta datos a JSON descargable
  const exportJSON = () => {
    const json = JSON.stringify({ feed, lexicon, users }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "socialsentiment_moderator.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preview de texto con puntos
  const previewHtml = post.trim()
    ? wordPointsToHtmlWithPoints(scoreTokens(post, lexicon).wordPoints)
    : "";

  // Estado agregado de la comunidad
  const community = useMemo(() => {
    const totalPosts = feed.length;

    const goodUsers = users
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score);

    const badUsers = users
      .filter((u) => u.score < 0)
      .sort((a, b) => a.score - b.score);

    const avgScore =
      users.length > 0
        ? Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length)
        : 0;

    return {
      totalPosts,
      avgScore,
      goodUsers,
      badUsers,
    };
  }, [feed, users]);

  return (
    <main>
      <div className="container">
        <div className="row g-4">
          {/* Panel de publicación */}
          <div className="col-md-8">
            <div className="g__card p-4 mb-3 rounded">
              {/* Selector de usuario para asignar post */}
              <select
                className="form-select mb-2"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>

              {/* Textarea para escribir el contenido del post */}
              <textarea
                className="g__text--md form-control mb-2"
                placeholder="Escribe un post..."
                value={post}
                onChange={(e) => setPost(e.target.value)}
              />

              {/* Preview de post con puntuaciones y multiplicadores aplicados */}
              <div
                className="cs__bg-previw-text w-100 rounded px-3 py-2 mb-2 bg-opacity-5"
                style={{ minHeight: 45 }}
              >
                {post.trim() ? (
                  <div
                    className="g__text--s"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div className="g__text--s g__text-color--grey">
                    Aquí aparecerá el texto analizado...
                  </div>
                )}
              </div>

              {/* Botones para publicar o generar texto de prueba */}
              <div className="d-flex gap-2 mt-2">
                <button className="g__btn g__btn--hover" onClick={publishPost}>
                  Publicar
                </button>
                <button
                  className="g__btn g__btn--hover"
                  onClick={generateRandomPost}
                >
                  Texto random
                </button>
              </div>
            </div>

            {/* Lista de posts publicados */}
            <div className="d-flex flex-column gap-3">
              {feed.length === 0 && (
                <div className="g__card g__text--md g__text-color--grey p-3 rounded">
                  Sin posts — publica para probar.
                </div>
              )}

              {feed.map((it) => (
                <div key={it.id} className="g__card p-3 rounded">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img
                      src={it.user.avatar}
                      className="rounded-circle"
                      width={30}
                      height={30}
                      alt=""
                    />
                    <div className="fw-semibold">{it.user.name}</div>
                    <div
                      className={`g__text--sm ms-auto ${
                        it.score > 0
                          ? "g__text-color--green"
                          : it.score < 0
                            ? "g__text-color--red"
                            : "g__text-color--grey"
                      }`}
                    >
                      Score: {it.score}
                    </div>
                  </div>

                  {/* Contenido del post con resaltado según puntuación */}
                  <p
                    dangerouslySetInnerHTML={{
                      __html: wordPointsToHtml(it.wordPoints),
                    }}
                  />

                  {/* Resumen de cantidad de palabras buenas y malas */}
                  <div className="g__text--sm g__text-color--grey">
                    Buenas: {it.good} | Malas: {it.bad}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="col-md-4">
            {/* Resumen general de la comunidad */}
            <div className="g__card p-4 rounded mb-3">
              <div className="fw-semibold mb-2">Estado general</div>
              <div className="g__text-color--grey">
                Posts totales: {community.totalPosts}
              </div>
              <div className="g__text-color--grey">
                Media de reputación: {community.avgScore}
              </div>
              <div>
                <span className="g__text-color--grey me-">Comunidad:</span>{" "}
                {community.avgScore > 20 ? (
                  <span className="g__text-color--green">Saludable</span>
                ) : community.avgScore > 0 ? (
                  <span className="g__text-color--green">Ligeramente positiva</span>
                ) : community.avgScore === 0 ? (
                  <span className="g__text-color--grey">Neutral</span>
                ) : community.avgScore >= -20 ? (
                  <span className="g__text-color--yellow">Algo tóxica</span>
                ) : (
                  <span className="g__text-color--red">Tóxica</span>
                )}
              </div>
            </div>

            {/* Lista de usuarios con score positivo */}
            <div className="g__card p-3 rounded mb-3">
              <div className="g__text-color--green fw-semibold mb-2">
                ✅ Usuarios buenos
              </div>

              {community.goodUsers.length === 0 ? (
                <div className="g__text-color--grey g__text--sm">
                  Nadie destacado todavía.
                </div>
              ) : (
                community.goodUsers.map((u) => (
                  <div
                    key={u.name}
                    className="g__text--sm d-flex justify-content-between mb-1"
                  >
                    <div>{u.name}</div>
                    <div className="fw-semibold">{getUserRank(u.score)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Lista de usuarios con score negativo */}
            <div className="g__card p-3 rounded mb-3">
              <div className="g__text-color--red fw-semibold mb-2">
                🚫 Usuarios tóxicos
              </div>

              {community.badUsers.length === 0 ? (
                <div className="g__text-color--grey g__text--sm">
                  Ningún usuario problemático.
                </div>
              ) : (
                community.badUsers.map((u) => (
                  <div
                    key={u.name}
                    className="g__text--sm d-flex justify-content-between mb-1"
                  >
                    <div>{u.name}</div>
                    <div className="fw-semibold">{getUserRank(u.score)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Instrucciones de uso de la app */}
            <div className="g__card p-3 rounded mb-3">
              <div className="g__text--md fw-semibold mb-2">
                Cómo usar la aplicación
              </div>
              <ul className="g__text--sm g__text-color--grey mb-0">
                <li>
                  Escribe un post y presiona <b>Publicar</b>. La app analiza
                  cada palabra.
                </li>
                <li>
                  Palabras positivas suman puntos (verde), negativas restan
                  (rojo). Intensificadores como "muy" amplifican el efecto.
                </li>
                <li>
                  Negadores como "no" pueden neutralizar palabras positivas
                  cercanas.
                </li>
                <li>
                  Revisa los usuarios buenos (score positivo) y tóxicos (score
                  negativo) en la lista derecha.
                </li>
                <li>
                  Usa <b>Texto random</b> para probar análisis automático.
                </li>
                <li>
                  Botones <b>Reiniciar</b> y <b>Exportar JSON</b> permiten
                  limpiar o guardar la información.
                </li>
                <li>
                  <b>
                    Nota: La app es limitada y es solo un ejemplo básico. No es
                    compleja ni exhaustiva.
                  </b>
                </li>
              </ul>
            </div>

            {/* Botones de exportar JSON y reiniciar todo */}
            <div className="g__card p-3 rounded">
              <button
                className="g__btn g__btn--hover w-100 mb-2"
                onClick={exportJSON}
              >
                Exportar JSON
              </button>
              <button
                className="g__btn g__btn--hover w-100"
                onClick={() => {
                  setFeed([]);
                  setUsers(users.map((u) => ({ ...u, score: 0, posts: [] })));
                }}
              >
                Reiniciar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
