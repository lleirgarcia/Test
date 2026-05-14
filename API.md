# API

Inventario de endpoints HTTP del proyecto. Las funciones viven en `/api/*.js` y se despliegan como Vercel Functions.

| Método | Ruta          | Descripción                              | Auth     |
| ------ | ------------- | ---------------------------------------- | -------- |
| GET    | `/api/db`     | Devuelve tareas + tags del gestor (Mongo) | Público  |
| GET    | `/api/externo`| Proxy a Yahoo Finance (^GSPC 10y diario) | Público  |
| POST   | `/api/chat`   | Chatbot con CV de Henar (Claude)         | Público  |

---

## `GET /api/db`

Lee MongoDB y devuelve las tareas con sus tags resueltos + el listado plano de tags.

- **Auth:** público. **CORS:** mismo origen (Vercel).
- **Variables de entorno:** `MONGODB_URI` (string de conexión Mongo Atlas).
- **Precondiciones:** la base `task_app` debe existir con las colecciones `tasks` y `tags`. Cada `task.tags` es un array de ObjectId que referencian `tags._id`.
- **Idempotencia:** lectura pura. Reintentar es seguro.
- **Efectos colaterales:** abre y reutiliza una conexión Mongo persistente vía `global._mongoClientPromise`.

**Parámetros:** ninguno.

**Respuesta `200`:**
```json
{
  "tasks": [
    {
      "id": "65f1...",
      "title": "Comprar leche",
      "text": "Mercadona o Bonpreu",
      "tags": ["compras", "casa"],
      "created": "2025-03-14",
      "updated": "2025-03-15"
    }
  ],
  "tags": ["compras", "casa", "trabajo"]
}
```

**Errores:**

| Status | Payload                                                | Causa                                  |
| ------ | ------------------------------------------------------ | -------------------------------------- |
| 405    | `{ "error": "Método no permitido" }`                   | Método ≠ GET                           |
| 500    | `{ "error": "Error al obtener datos", "details": "…" }`| Conexión a Mongo o consulta fallida    |

**Ejemplo:**
```bash
curl https://test-gules-ten-34.vercel.app/api/db
```

---

## `GET /api/externo`

Proxy a Yahoo Finance — devuelve el histórico (10 años, intervalo diario) del índice **S&P 500 (^GSPC)**.

- **Auth:** público. **CORS:** mismo origen.
- **Variables de entorno:** ninguna.
- **Precondiciones:** Yahoo Finance debe estar accesible. No hay caché.
- **Idempotencia:** lectura pura.
- **Efectos colaterales:** una request `fetch` saliente a `query1.finance.yahoo.com`.

**Parámetros:** ninguno.

**Respuesta `200`:** payload de `chart.result[0]` tal cual lo devuelve Yahoo (meta + timestamp + indicators). Schema completo en la doc de Yahoo Finance.

**Errores:**

| Status | Payload               | Causa                          |
| ------ | --------------------- | ------------------------------ |
| 500    | `{ "error": "error" }`| Falla la fetch o el parseo JSON|

**Ejemplo:**
```bash
curl https://test-gules-ten-34.vercel.app/api/externo
```

---

## `POST /api/chat`

Chatbot que responde como **Henar Garcia Boada** basándose en su CV (`src/data/cv.json`). Usa el SDK de Anthropic (Claude Haiku 4.5) con prompt caching del CV para bajar coste y latencia.

- **Auth:** público. **CORS:** mismo origen. *No protegido contra abuso — añadir rate limiting si se expone públicamente con tráfico real.*
- **Variables de entorno:** `ANTHROPIC_API_KEY` (obligatoria).
- **Precondiciones:** `src/data/cv.json` debe estar presente en el bundle de la función (se importa estáticamente). El último mensaje debe ser de `role: "user"`.
- **Idempotencia:** no idempotente — cada llamada genera una respuesta nueva y consume tokens.
- **Efectos colaterales:** llamada saliente a la API de Anthropic. Consume tokens (cobro por uso).

**Headers:**

| Header         | Valor                |
| -------------- | -------------------- |
| `Content-Type` | `application/json`   |

**Body:**

```ts
{
  messages: Array<{
    role: "user" | "assistant";
    content: string; // máx 1500 chars
  }>; // máx 20 mensajes, último debe ser "user"
}
```

**Respuesta `200`:**
```json
{
  "reply": "Trabajo como first SDET en Vega, una startup de Londres financiada con 20M$. Me centro en automatizar user journeys críticos con Playwright + TypeScript.",
  "usage": {
    "input_tokens": 1820,
    "output_tokens": 64,
    "cache_read": 1750,
    "cache_creation": 0
  }
}
```

**Errores:**

| Status | Payload                                            | Causa                                       |
| ------ | -------------------------------------------------- | ------------------------------------------- |
| 400    | `{ "error": "Falta el array 'messages' en el body" }` | Body inválido o vacío                      |
| 400    | `{ "error": "Demasiados mensajes (máx 20)" }`      | `messages.length > 20`                      |
| 400    | `{ "error": "El último mensaje debe ser del usuario" }` | Conversación termina en `assistant`        |
| 405    | `{ "error": "Método no permitido" }`               | Método ≠ POST                               |
| 500    | `{ "error": "Falta ANTHROPIC_API_KEY…" }`          | Variable de entorno no configurada          |
| 4xx/5xx| `{ "error": "<mensaje upstream>" }`                | Error devuelto por la API de Anthropic      |

**Ejemplo:**
```bash
curl -X POST https://test-gules-ten-34.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "¿Cuántos años de experiencia tienes con Playwright?"}
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "Llevo unos dos años usando Playwright en producción — desde Cloudpay (Java/Selenium principalmente) hasta Vega, donde es la herramienta principal para automation e2e en TypeScript.",
  "usage": { "input_tokens": 1820, "output_tokens": 48, "cache_read": 1750, "cache_creation": 0 }
}
```

**Notas operativas:**
- El system prompt incluye el JSON completo de `cv.json` con `cache_control: ephemeral`. Tras la primera llamada, las siguientes leen el CV desde caché de Anthropic (5 min TTL), reduciendo tokens facturados.
- En `npm start` (CRA dev server) la función **no se ejecuta**. Para probar el chat en local hace falta `vercel dev`.
