<div align="center">

# Panel JEC

**Dashboard de gestión para programas educativos: consolida asistencia, planeaciones, refrigerios y docentes a partir de fuentes de datos (CSV / Google Sheets / Google Drive).**

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Glossary/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![CSV](https://img.shields.io/badge/Datos-CSV-217346?logo=database&logoColor=white)](#base-de-datos-de-demostraci%C3%B3n-csv)
[![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-Backend-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)

[Captura del dashboard](docs/screenshots/01-dashboard.png)

</div>

---

Panel web construido para el equipo operativo de un programa educativo colombiano: reemplaza la revisión manual de decenas de hojas de cálculo por un dashboard único, con indicadores, alertas y reportes exportables por mes y por colegio.

La aplicación funciona con **una base de datos de demostración en archivos CSV** desde el primer minuto, de modo que cualquiera puede clonarla, ejecutarla y evaluarla sin acceso a información privada: el código no contiene ningún dato, solo lee las tablas.

## Características

**Reportes operativos**
- **Alertas diarias**: planeaciones faltantes, inasistencias y errores de documento por grupo y fecha.
- **Novedades NL (niños a lápiz)**: seguimiento de estudiantes con novedades de asistencia.
- **Planeaciones**: detección de saltos, retrocesos y errores de secuencia en los archivos de planeación.
- **Refrigerios**: estudiantes que asistieron sin registrar entrega de refrigerio.
- **Docentes**: cambios de docente sin reemplazo y alertas por quincena (Q1/Q2).

**Módulos adicionales**
- **Análisis NL**: conteo de asistencias por estudiante, detección de registros duplicados y búsqueda por número de documento.
- **Reporte de reemplazos**: histórico de docentes de reemplazo por colegio, grupo y fecha.
- **Historial de planeaciones**: matriz consolidada de la operación planeada vs. ejecutada.
- **Backups de listas**: generación de copias de respaldo en Drive con procesamiento por lotes y reanudación automática (triggers).
- **Niños en cero**: identificación de estudiantes sin registros de asistencia en la quincena.

**Experiencia de uso**
- Filtros cruzados por mes y por colegio (multi-selección).
- Búsqueda instantánea y ordenamiento por columna en todas las tablas.
- Exportación de cualquier reporte a **Excel (.xlsx)** y **CSV**.
- Barra de progreso en tiempo real durante la sincronización, con cancelación por parte del usuario.
- Pantalla de configuración protegida por contraseña (modo administrador).
- **Modo demo** alimentado por las tablas CSV, para explorar la interfaz sin conectar servicios.

## Arquitectura

```mermaid
flowchart LR
    subgraph cliente["Navegador"]
        UI["SPA JavaScript + HTML + CSS<br/>Dashboard y reportes"]
        DB["Capa de datos (dataService)<br/>Parser CSV propio"]
    end

    subgraph datos["Datos"]
        CSV[("public/data/*.csv<br/>Base de datos de demostración<br/>(5 tablas planas)")]
        GAS["Google Apps Script<br/>Web App (doPost / doGet)<br/>google-apps-script/Code.gs"]
        GWS["Google Sheets + Drive<br/>(producción)"]
    end

    DB -- "fetch + parse de tablas CSV<br/>(modo demo)" --> CSV
    UI -- "POST JSON (Content-Type: text/plain<br/>para evitar preflight CORS)" --> GAS
    GAS -- "DriveApp / SpreadsheetApp" --> GWS
    GAS -- "JSON: reportes, colegios,<br/>progreso por lotes" --> UI
```

**Decisiones técnicas destacadas**

| Reto | Solución implementada |
| --- | --- |
| Separar los datos del código | Los registros de la demo viven en **tablas CSV** (`public/data/`); el código solo contiene lógica de negocio y las lee con un parser CSV propio |
| Apps Script tiene un límite de ~6 minutos por ejecución | Los colegios se procesan en **lotes** (`fetchReportDataInBatches`), con reintentos y consolidación en el cliente |
| CORS con Apps Script | `POST` con `Content-Type: text/plain;charset=utf-8` para que la petición sea *simple request* y evite el preflight `OPTIONS` |
| Peticiones largas que se quedan colgadas | `AbortController` + timeout configurable (por defecto 360 s) y cancelación manual desde la UI |
| Visibilidad del avance en sincronizaciones largas | Servicio de progreso con *polling* (`getProgress`) y barra de avance con colegios procesados |
| Respaldo de cientos de archivos en Drive | Copias por lotes con **triggers** que reanudan el trabajo pendiente entre ejecuciones |
| IDs de Drive fuera del código | Las claves de carpetas se leen de **Script Properties** (`PropertiesService`), nunca en el código ni en el repositorio |
| Datos sensibles de menores de edad | Ningún dato real en el repositorio: la demo se alimenta de tablas CSV ficticias y la conexión real se configura en tiempo de ejecución |

## Base de datos de demostración (CSV)

La "base de datos" del modo demo es un pequeño modelo relacional en archivos CSV planos dentro de `public/data/`:

| Tabla | Contenido | Rol |
| --- | --- | --- |
| `colegios.csv` | Catálogo de colegios | Dimensión |
| `grupos.csv` | Catálogo de grupos | Dimensión |
| `docentes.csv` | Catálogo de docentes (anonimizado) | Dimensión |
| `estudiantes.csv` | Pool de nombres y apellidos para generar registros | Dimensión |
| `registros_nl.csv` | Registros del módulo Análisis NL (conteo, duplicados, búsqueda) | Tabla de hechos |

La conexión se hace en `src/dataService.ts`:

1. **`parseCSV()`**: parser de CSV escrito desde cero en JavaScript puro (soporta comillas, comas y saltos de línea escapados) — no depende de ninguna librería.
2. **`loadDemoDatabase()`**: descarga las 5 tablas con `fetch()`, las convierte en objetos JavaScript, normaliza los tipos (números, nulos) y **cachea** el resultado para que cada tabla se descargue una sola vez por sesión.
3. Los componentes consumen `loadDemoDatabase()` igual que consumirían el backend real: `generateMockReportData()` arma los reportes del dashboard a partir de las tablas, y los paneles de análisis leen `registros_nl.csv`.

En producción, la misma interfaz la cumple el backend de Google Apps Script (`services/apiService.ts`), que lee Google Sheets y Google Drive: cambiar de fuente de datos no exige tocar la interfaz.

## Estructura del proyecto

```
├── google-apps-script/
│   └── Code.gs              # Backend: API JSON sobre Drive y Sheets (doPost/doGet)
├── public/
│   ├── data/                # Base de datos de demostración (5 tablas CSV)
│   │   ├── colegios.csv
│   │   ├── docentes.csv
│   │   ├── estudiantes.csv
│   │   ├── grupos.csv
│   │   └── registros_nl.csv
│   └── _redirects           # Fallback SPA para Netlify
├── src/
│   ├── components/          # Componentes de UI (paneles, tarjetas, tablas)
│   ├── dataService.ts       # Capa de datos: parser CSV + carga y caché de tablas
│   ├── services/
│   │   └── apiService.ts    # Cliente HTTP del backend: batching, timeouts, progreso
│   ├── types.ts             # Tipos de dominio
│   ├── utils.ts             # Generación de reportes demo a partir del CSV + utilidades
│   ├── App.tsx              # Estado global, navegación y sincronización
│   └── main.tsx
├── index.html
├── netlify.toml             # Build y headers de seguridad para Netlify
└── package.json
```

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Lenguajes base | **JavaScript, HTML5, CSS3** |
| Datos | **CSV** (base de datos demo), Google Sheets y Google Drive en producción |
| Backend | Google Apps Script (Web App, JSON API) |
| Exportación | Excel (.xlsx) con SheetJS y CSV nativo |
| Despliegue | Netlify (configuración incluida en `netlify.toml`) |

Como librerías de apoyo, la interfaz usa React (para organizar los componentes reutilizables) y Tailwind CSS (para los estilos), sobre un build con Vite; toda la lógica de datos, parsing y negocio está escrita en JavaScript.

## Ejecución local (modo demo)

Requisitos: Node.js 18+ y npm.

```bash
# 1. Clonar el repositorio
git clone https://github.com/juandaramirez43/JEC-COLSUBSIDIO.git
cd JEC-COLSUBSIDIO

# 2. Instalar dependencias
npm install

# 3. Levantar el entorno de desarrollo
npm run dev
```

Abre `http://localhost:5173`. La aplicación arranca en **modo demo** leyendo las tablas CSV: puedes explorar reportes, filtros, búsqueda, ordenamiento y exportación sin configurar nada. También puedes abrir los archivos de `public/data/` directamente en Excel para ver (o ampliar) la base de datos demo.

## Conexión con datos reales

Si quieres conectar el panel a tus propias hojas de cálculo:

1. Crea una hoja de Google y un archivo de Apps Script con el contenido de `google-apps-script/Code.gs`.
2. Define los IDs de tus carpetas de Drive como **propiedades del script** en Apps Script (Configuración del proyecto → Propiedades del script), con las claves `API_ID_CARPETA_RAIZ`, `ID_ARCHIVO_SEGUIMIENTO` e `ID_CARPETA_COPIAS`. Así los IDs reales nunca quedan en el código ni en el repositorio.
3. Publica el proyecto como **aplicación web** (implementar → nueva implementación → aplicación web, acceso: solo tu cuenta) y copia la URL `https://script.google.com/...`.
4. En el panel, entra a **Conectar tu Google Apps Script API**, desactiva el modo demo, pega la URL y guarda.

## Despliegue

El repositorio incluye `netlify.toml` listo para Netlify (build con Vite y fallback SPA). También funciona en Vercel o cualquier hosting estático:

```bash
npm run build   # genera la carpeta dist/ (incluye las tablas CSV de public/data/)
```

## Capturas

| Dashboard principal | Backups y niños a lápiz |
| --- | --- |
| ![Dashboard](docs/screenshots/01-dashboard.png) | ![Backups](docs/screenshots/02-backup-listas.png) |

| Reporte de reemplazos | Historial de planeaciones |
| --- | --- |
| ![Reemplazos](docs/screenshots/03-reemplazos.png) | ![Historial](docs/screenshots/04-historial-planeaciones.png) |

| Configuración de conexión |
| --- |
| ![Configuración](docs/screenshots/05-configuracion.png) |

## Autor

Desarrollado por [Juan David Ramírez](https://github.com/juandaramirez43) — en formación, enfocado en **análisis de datos e ingeniería de datos**: modelado de datos, procesamiento por lotes, calidad y validación de registros, y automatización de reportes con Google Workspace.

---

## English summary

**Panel JEC** is an operations dashboard for an educational program run by a Colombian nonprofit organization. It replaces manual spreadsheet reviews with a single JavaScript dashboard that consolidates attendance, lesson-planning, snacks and teacher data stored across Google Sheets files in Google Drive, filtered by month and school.

- **Core languages:** JavaScript, HTML5 and CSS3 (React and Tailwind CSS are used as supporting libraries for components and styling).
- **Data layer:** the demo mode is powered by a small relational database of flat CSV files (`public/data/`) — schools, groups, teachers, students and an NL fact table — loaded and parsed by a hand-written CSV parser in plain JavaScript (`src/dataService.ts`), with in-memory caching. No data is hardcoded in the app logic.
- **Backend:** Google Apps Script Web App exposing a JSON API over Drive/Sheets — no servers to maintain.
- **Notable engineering:** batched processing to work around Apps Script's execution time limit, CORS-free `POST` requests using `text/plain` content type, `AbortController`-based timeouts and cancellation, real-time batch progress polling, Drive backup jobs resumed via Apps Script triggers, and Excel/CSV export.
- **Demo mode:** the app runs with simulated data out of the box, so no private or minors' data is included in this repository — clone it, `npm install`, `npm run dev`, and explore.
