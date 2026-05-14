/* =========================================
   Archivo: chatbot.js
   Tipo: Componente
   Descripción: Chatbot flotante que conversa como Henar usando /api/chat
   ========================================= */

import { useEffect, useRef, useState } from "react";
import myPhoto from "../images/mi-cara.png";

const GREETING =
  "Hola, soy Henar. Pregúntame por mi experiencia, stack o proyectos. Respondo en castellano, inglés o catalán.";

const SUGGESTIONS = [
  "¿Qué hace ahora?",
  "Stack principal",
  "Experiencia con Playwright",
  "Cómo contactar",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setMessages([...next, { role: "assistant", content: data.reply || "" }]);
    } catch (e) {
      setError(e.message || "Error al contactar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        className={`cbot-fab${open ? " cbot-fab--hidden" : ""}`}
        aria-label="Abrir chat con Henar"
        onClick={() => setOpen(true)}
      >
        <span className="cbot-fab-avatar">
          <img src={myPhoto} alt="" />
          <span className="cbot-fab-dot" />
        </span>
        <span className="cbot-fab-label">
          <span className="cbot-fab-top">Hablar con Henar</span>
          <span className="cbot-fab-sub">Pregunta sobre el CV</span>
        </span>
      </button>

      <div
        role="dialog"
        aria-modal="false"
        aria-label="Chat con Henar"
        className={`cbot-panel${open ? " cbot-panel--open" : ""}`}
      >
        <header className="cbot-head">
          <div className="cbot-who">
            <img src={myPhoto} alt="" />
            <div>
              <div className="cbot-name">Henar Garcia Boada</div>
              <div className="cbot-sub">
                <span className="cbot-dot" /> Asistente del portafolio
              </div>
            </div>
          </div>
          <button
            type="button"
            className="cbot-close"
            aria-label="Cerrar chat"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="cbot-body" ref={scrollRef}>
          <div className="cbot-msg cbot-msg--bot">
            <div className="cbot-bubble">{GREETING}</div>
          </div>

          {messages.length === 0 && (
            <div className="cbot-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  className="cbot-suggestion"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`cbot-msg cbot-msg--${m.role === "user" ? "user" : "bot"}`}
            >
              <div className="cbot-bubble">{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="cbot-msg cbot-msg--bot">
              <div className="cbot-bubble cbot-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && (
            <div className="cbot-msg cbot-msg--bot">
              <div className="cbot-bubble cbot-bubble--error">
                {error}
              </div>
            </div>
          )}
        </div>

        <form
          className="cbot-foot"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            ref={inputRef}
            className="cbot-input"
            placeholder="Escribe un mensaje…"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button
            type="submit"
            className="cbot-send"
            disabled={!input.trim() || loading}
            aria-label="Enviar"
          >
            ↑
          </button>
        </form>
      </div>
    </>
  );
}
