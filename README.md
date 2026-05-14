# 🌐 Mi Plataforma Web Personal — React

Bienvenido a mi proyecto web personal, una plataforma en constante evolución creada con **React** y desplegada en **Vercel**. Este repositorio no es una única app cerrada: es un espacio central donde publico proyectos, utilidades y experimentos a medida que los desarrollo.

> ⚠️ Nota: no es necesario ni está pensado para descargarse o ejecutarse localmente desde GitHub. Si quieres ver el resultado final, visita la [web](https://test-gules-ten-34.vercel.app/) en producción.

---

## 🔎 Qué encontrarás aquí (resumen)
- **Portafolio público** con presentación personal y proyectos destacados.  
- **Aplicaciones y utilidades**: actualmente hay varias páginas funcionales (entre ellas, un gestor de tareas con operaciones CRUD y persistencia en base de datos), y seguiré añadiendo más mini-proyectos.  
- **Diseño y experiencia**: enfoque en simplicidad, usabilidad y adaptabilidad móvil.  
- **Código modular** y pensado para escalar: componentes reutilizables, separación por vistas y estilos organizados.

---

## ✨ Características destacadas
- Interfaz clara y navegable: navegación rápida entre secciones y proyectos.
- Experimentos interactivos que muestran técnicas y patrones de frontend.
- Persistencia en servidor/servicio externo para funcionalidades que lo requieren (por ejemplo, tareas).
- Enfoque práctico: cada componente o página está pensado para ser fácilmente ampliable o sustituible sin romper el resto del sitio.

---

## 🤖 Chatbot embebido en la home

La home incluye un chatbot flotante (FAB abajo a la derecha) que conversa como Henar en primera persona, basándose en su CV. Está pensado como **agente de portfolio**: cualquiera puede preguntar por experiencia, stack, formación o cómo contactar, y la respuesta se construye contra los datos del CV.

### Arquitectura

| Pieza                                          | Rol                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/data/cv.json`                             | Fuente de la verdad. Perfil, stack, experiencia y formación. La home y el chatbot leen de aquí.                    |
| `src/components/chatbot.js` + `chatbot.css`    | Componente React: FAB, panel deslizable, mensajes, sugerencias, typing dots, manejo de errores.                    |
| `api/chat.js` (Vercel Function)                | Endpoint de producción. Usa el SDK de Anthropic (Claude Haiku 4.5) con **prompt caching** del CV (`ephemeral`).    |
| `dev-server/chat-cli.js`                       | Servidor HTTP local opcional para desarrollo sin API key. Delega la inferencia en la **CLI `claude`** del entorno. |
| `"proxy": "http://localhost:4981"` (package.json) | Permite que en `npm start` (CRA) las llamadas a `/api/chat` se redirijan al dev-server local.                      |

### Flujo en producción

1. El usuario escribe en el chat → `POST /api/chat` con el historial de mensajes.
2. `api/chat.js` importa `cv.json` y lo inyecta en un `system` prompt con `cache_control: ephemeral` (los siguientes turnos reusan la caché de 5 min y bajan el coste).
3. Claude Haiku 4.5 responde en castellano, catalán o inglés según el idioma del usuario, ciñéndose al CV y rechazando prompt injection.
4. La respuesta vuelve al frontend y se renderiza en el panel del chat.

Variables de entorno necesarias en Vercel:

| Env var             | Para qué                            |
| ------------------- | ----------------------------------- |
| `ANTHROPIC_API_KEY` | Llamada al modelo Claude en `/api/chat` |
| `MONGODB_URI`       | Endpoint `/api/db` del gestor de tareas |

### Flujo en local (sin API key)

Pensado para iterar el system prompt o la UI sin gastar tokens, usando tu sesión `claude` autenticada:

```bash
npm run dev:chat   # terminal 1 — server HTTP en :4981 que hace `spawn('claude', ['-p', ...])`
npm start          # terminal 2 — CRA en :4980 con proxy a :4981
```

El backend local mantiene exactamente el mismo contrato HTTP que el endpoint Vercel, así que el componente React no necesita saber qué hay detrás.

### Endpoints HTTP

El inventario completo está en [`API.md`](./API.md): método, body, ejemplos `curl`, errores, idempotencia y efectos colaterales por endpoint.

---

## 🎯 Objetivos del proyecto
- Servir como **tarjeta de presentación técnica**: mostrar cómo organizo y resuelvo problemas reales con React.  
- Tener un entorno donde probar nuevas ideas (UI, performance, integración con APIs).  
- Mantener un repositorio vivo que crezca con nuevas funciones y mini-proyectos.

---

## 🛠 Tecnologías (visión general)
- **React** (Create React App)  
- **JavaScript (ES6+)**  
- **HTML5 / CSS3** (con estilos organizados por componentes/vistas)  
- **Bootstrap** (para diseño responsivo y componentes listos)  
- Despliegue: **Vercel**  
- Integraciones: APIs y servicios de base de datos según la funcionalidad

---

## 📈 Estado y roadmap
**Estado actual:** proyecto activo — contenido y features en desarrollo.  
**Próximas mejoras previstas:**
- Más proyectos públicos añadidos al portafolio.  
- Mejoras visuales y de accesibilidad.  
- Opciones avanzadas para algunas apps (autenticación, filtros, sincronización).  
- Documentación interna y pequeñas guías para quien quiera revisar el código.

---

## 🤝 Colaboración y feedback
Si te interesa aportar, ver un bug o sugerir una mejora:
- Abre un **issue** con una descripción breve.
- Si envías un PR, explica el objetivo y cómo probarlo..

---

## 👤 Sobre el autor
Desarrollador **full-stack**. 
Trabajo con React y en la creación de experiencias web prácticas, escalables y bien organizadas.

---

## 🌍 Web en producción
👉 https://test-gules-ten-34.vercel.app/