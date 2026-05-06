/* =========================================
   Archivo: Task.js
   Tipo: Página
   Descripción: Página de gestor de tareas con búsqueda, filtros, ordenamiento y vista en lista/tablero. Contiene el subcomponente TagList para renderizado responsivo de tags.
   ========================================= */

/* ====== IMPORTS ======
   Importaciones de librerías, hooks, componentes y recursos */
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";

/* ====== CONSTANTES / DATOS ======
   Datos estáticos, arrays de opciones, configuraciones internas */
const DEFAULT_SORT_FIELD = "created";
const DEFAULT_SORT_DIR = "desc";
const MEASURE_GAP = 6; // espacio extra por tag al medir

/* ====== FUNCIONES / MÉTODOS ======
   Funciones auxiliares, handlers y callbacks */
function TagList({ tags, boardView = false }) {
  const containerRef = useRef(null);
  const measurerRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(tags.length);
  const [expanded, setExpanded] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  const truncate = useCallback(
    (t, max = 10) => (t.length > max ? t.slice(0, max) + "..." : t),
    [],
  );

  const truncated = useMemo(
    () => tags.map((t) => truncate(t)),
    [tags, truncate],
  );

  const measure = useCallback(() => {
    if (expanded) {
      setVisibleCount(tags.length);
      return;
    }

    const cont = containerRef.current;
    const m = measurerRef.current;
    if (!cont || !m) return;

    // Asegurarnos de que el measurer use el mismo box-sizing / fuente / padding
    m.style.boxSizing = "border-box";
    m.style.whiteSpace = "nowrap";

    // ancho disponible real (sin scrollbars)
    const contW = cont.clientWidth;

    // gap real entre elementos (flex gap)
    const cs = getComputedStyle(cont);
    const gap =
      parseFloat(cs.columnGap || cs.gap || MEASURE_GAP) || MEASURE_GAP;

    let used = 0;
    let lastVisible = -1;

    for (let i = 0; i < truncated.length; i++) {
      // medir el tag i
      m.textContent = truncated[i];
      const w = m.offsetWidth + gap;

      // calcular cuánto ocuparía el "+N" si hubiese elementos restantes
      const remaining = tags.length - (i + 1);
      let plusW = 0;
      if (remaining > 0) {
        m.textContent = `+${remaining}`;
        plusW = m.offsetWidth + gap;
        // restauramos el texto para seguir midiendo si hace falta
        m.textContent = truncated[i];
      }

      // comprobar si caben (tag actual + posible botón +N)
      if (used + w + plusW <= contW) {
        used += w;
        lastVisible = i;
      } else {
        break;
      }
    }

    setVisibleCount(lastVisible + 1);
  }, [tags, truncated, expanded]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <>
      {/* Measurer: le damos la misma clase que el tag para medir exactamente */}
      <div
        ref={measurerRef}
        className="g__btn g__btn--hover g__text--xs tm__tag-item fw-semibold"
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          visibility: "hidden",
          whiteSpace: "nowrap",
        }}
      />

      <div ref={containerRef} className="d-flex gap-2 flex-wrap mt-2">
        {tags.slice(0, visibleCount).map((tag, i) => (
          <div
            key={tag + i}
            className="tm__tag-wrapper"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div className="g__btn g__btn--hover g__text--xs tm__tag-item fw-semibold">
              {truncated[i].charAt(0).toUpperCase() + truncated[i].slice(1)}
            </div>

            {hoverIndex === i && (
              <div className="g__btn g__btn--hover g__text--xs tm__tag-tooltip">
                {tag}
              </div>
            )}
          </div>
        ))}

        {boardView && visibleCount < tags.length && (
          <div className="g__btn g__text--xs tm__tag-item fw-semibold">...</div>
        )}
        {!boardView && !expanded && visibleCount < tags.length && (
          <div
            className="g__btn g__btn--hover g__text--xs tm__tag-item fw-semibold"
            onClick={() => setExpanded(true)}
          >
            +{tags.length - visibleCount}
          </div>
        )}

        {expanded && (
          <div
            className="g__btn g__btn--hover g__text--xs tm__tag-item fw-semibold"
            onClick={() => setExpanded(false)}
          >
            ▲
          </div>
        )}
      </div>
    </>
  );
}

/* ====== HOOKS ======
   Estado y efectos del componente usando useState, useEffect, useRef, etc. */
export default function Tareas() {
  // Datos y UI
  const [tasks, setTasks] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vista, búsqueda, filtros y orden
  const [view, setView] = useState("list"); // "list" | "board"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("title"); // "title" | "tags"
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMatchMode, setTagMatchMode] = useState("any"); // "any" | "all"
  const [sortField, setSortField] = useState(DEFAULT_SORT_FIELD);
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR);
  const [tagsOpen, setTagsOpen] = useState(false);

  // Fetch de tareas con AbortController para limpiar en unmount
  useEffect(() => {
    fetch("/api/db")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
        setAllTags(data.tags);

        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  /* ====== FUNCIONES / MÉTODOS ======
     Funciones auxiliares, handlers y callbacks */
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  // Limpia búsqueda y todos los filtros
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTags([]);
    setSearchMode("title");
    setTagMatchMode("any");
  }, []);

  // Lógica de filtrado y ordenamiento de tareas
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const res = tasks.filter((task) => {
      // Búsqueda por título/texto o por tags
      if (q) {
        if (searchMode === "title") {
          // Busca en título y descripción
          if (
            !task.title.toLowerCase().includes(q) &&
            !task.text.toLowerCase().includes(q)
          )
            return false;
        } else {
          if (!task.tags.some((t) => t.toLowerCase().includes(q))) return false;
        }
      }

      // Filtro por tags seleccionados
      if (selectedTags.length > 0) {
        if (tagMatchMode === "all") {
          // Modo "contiene todos": debe tener TODOS los tags seleccionados
          if (!selectedTags.every((tag) => task.tags.includes(tag)))
            return false;
        } else {
          // Modo "incluye cualquiera": debe tener AL MENOS UNO de los tags
          if (!selectedTags.some((tag) => task.tags.includes(tag)))
            return false;
        }
      }

      return true;
    });

    // Ordenamiento estable
    const sorted = res.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];

      // Ordenamiento por fecha
      if (sortField === "created" || sortField === "updated") {
        const da = Date.parse(va);
        const db = Date.parse(vb);
        return sortDir === "asc" ? da - db : db - da;
      }

      // Ordenamiento alfabético (para título)
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

    return sorted;
  }, [
    searchQuery,
    searchMode,
    selectedTags,
    tagMatchMode,
    sortField,
    sortDir,
    tasks,
  ]);

  /* ====== RENDER / JSX ======
     Estructura principal del componente, return con JSX */
  return (
    <main>
      <div className="container">
        {/* ENCABEZADO / CAMBIO DE VISTA */}
        <div className="g__card tm__button-list d-inline-flex justify-content-between align-items-center p-3 rounded">
          {/* Botones para cambiar entre vista lista y tablero */}
          <div className="d-flex gap-2">
            <button
              className={`g__btn g__btn--hover g__text--sm tm__btn--hover fw-semibold  ${view === "list" ? "tm__btn--active" : ""}`}
              onClick={() => setView("list")}
            >
              Lista
            </button>
            <button
              className={`g__btn g__text--sm tm__btn--hover fw-semibold ${view === "board" ? "tm__btn--active" : ""}`}
              onClick={() => setView("board")}
            >
              Tablero
            </button>
          </div>
        </div>

        {/* BÚSQUEDA / ORDENAMIENTO */}
        <div className="g__card p-3 mb-4 rounded">
          <div className="row g-3 align-items-center">
            {/* Campo de búsqueda con botón limpiar */}
            <div className="col-md-5">
              <div className="input-group">
                <input
                  className=" g__text--sm fw-semibold form-control"
                  placeholder={
                    searchMode === "title"
                      ? "Buscar por título o texto..."
                      : "Buscar dentro de tags..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="g__btn g__btn--hover g__text--sm fw-semibold"
                  onClick={() => setSearchQuery("")}
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Selector del modo de búsqueda */}
            <div className="col-md-3">
              <select
                className="g__text--sm fw-semibold form-select"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
              >
                <option value="title">Buscar por título/texto</option>
                <option value="tags">Buscar por tag</option>
              </select>
            </div>

            {/* Selector de ordenamiento + botón de dirección */}
            <div className="col-md-4">
              <div className="input-group">
                <select
                  className="g__text--sm fw-semibold form-select"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="created">Ordenar por fecha de creación</option>
                  <option value="updated">
                    Ordenar por fecha de modificación
                  </option>
                  <option value="title">Ordenar por nombre</option>
                </select>

                {/* Botón para cambiar dirección de ordenamiento (asc/desc) */}
                <button
                  className="g__btn g__btn--hover g__text--sm fw-semibold"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortDir === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FILTROS / TAGS */}
        <div className="g__card p-3 mb-4 rounded">
          <div className="d-flex justify-content-between align-items-center">
            {/* Botón para abrir/cerrar panel de filtros */}
            <button
              className={`g__text--sm g__btn tm__btn--hover fw-semibold ${tagsOpen ? "tm__btn--active" : ""}`}
              onClick={() => setTagsOpen((open) => !open)}
            >
              Filtrar por tags
            </button>

            {/* Botones para cambiar modo de coincidencia de tags */}
            <div className="d-flex gap-2">
              <button
                className={`g__text--sm g__btn tm__btn--hover fw-semibold ${tagMatchMode === "any" ? "tm__btn--active" : ""}`}
                onClick={() => setTagMatchMode("any")}
              >
                Incluye cualquiera
              </button>
              <button
                className={`g__text--sm g__btn tm__btn--hover fw-semibold ${tagMatchMode === "all" ? "tm__btn--active" : ""}`}
                onClick={() => setTagMatchMode("all")}
              >
                Contiene todos
              </button>
            </div>
          </div>

          {/* Lista de tags disponibles para filtrar (se muestra cuando tagsOpen es true) */}
          {tagsOpen && (
            <div className="d-flex flex-wrap gap-2 mt-3">
              {/* Botones de cada tag disponible */}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`g__text--sm g__btn tm__btn--hover fw-semibold ${
                    selectedTags.includes(tag) ? "tm__btn--active" : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}

              {/* Botón para limpiar todos los filtros */}
              <button
                className="g__btn g__btn--hover g__text--sm fw-semibold"
                onClick={clearFilters}
              >
                Borrar filtros
              </button>
            </div>
          )}
        </div>

        {/* VISTA / LISTA */}
        {view === "list" ? (
          <div className="list-group">
            {loading ? (
              <div className="g__card g__text--md rounded p-3">
                Cargando tareas...
              </div>
            ) : tasks.length === 0 ? (
              <div className="g__card g__text--md rounded p-3">
                No hay tareas en la base de datos.
              </div>
            ) : filtered.length === 0 ? (
              <div className="g__card g__text--md rounded p-3">
                No hay tareas que coincidan con los filtros.
              </div>
            ) : (
              filtered.map((task) => (
                <div
                  key={task.id}
                  className="g__card rounded p-3 mb-4 position-relative"
                >
                  <div className="tm__card-buttons d-flex gap-2">
                    <button className="g__btn g__btn--hover g__text--sm fw-semibold">
                      Editar
                    </button>
                    <button className="g__btn g__text--sm tm__btn--remove fw-semibold">
                      Eliminar
                    </button>
                  </div>

                  <div className="g__text--md fw-semibold">{task.title}</div>
                  <div className="g__text--sm g__text-color--grey ">
                    Creado: {task.created} · Modificado: {task.updated}
                  </div>
                  <TagList tags={task.tags} />
                </div>
              ))
            )}
          </div>
        ) : (
          /* VISTA / TABLERO */
          <div className="row g-4">
            {loading ? (
              <div className="col-12">
                <div className="g__card g__text--md rounded p-3">
                  Cargando tareas...
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="col-12">
                <div className="g__card g__text--md rounded p-3">
                  No hay tareas en la base de datos.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-12">
                <div className="g__card g__text--md rounded p-3">
                  No hay tareas que coincidan con los filtros.
                </div>
              </div>
            ) : (
              filtered.map((task) => (
                <div key={task.id} className="col-md-4">
                  <div className="g__card rounded p-3 d-flex flex-column h-100">
                    <div className="g__text--md fw-semibold">{task.title}</div>
                    <div className="g__text--sm g__text-color--grey ">
                      Creado: {task.created} · Modificado: {task.updated}
                    </div>
                    <div className="g__text--sm g__text-color--grey  mt-2 tm__two-lines">
                      {task.text}
                    </div>
                    <TagList tags={task.tags} boardView={true} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
