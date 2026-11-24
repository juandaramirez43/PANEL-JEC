# Borradores para LinkedIn — Panel JEC

## 1. Post de LinkedIn (copia y pega)

---

Automatizar procesos manuales es, para mí, la forma más directa en que la tecnología mejora el día a día de un equipo. Este proyecto es un buen ejemplo.

**Panel JEC** — dashboard de gestión para un programa educativo en Colombia.

El equipo operativo revisaba a diario decenas de hojas de cálculo en Google Sheets para detectar planeaciones faltantes, errores de asistencia y cambios de docentes sin reemplazo. Construí un panel web que consolida toda esa información en segundos.

Lo que hace:
- Indicadores y alertas por mes y por colegio (asistencia, planeaciones, refrigerios, docentes)
- Análisis de novedades: registros duplicados, conteos por estudiante y búsqueda por documento
- Historial de planeaciones y respaldos automáticos de listas en Google Drive
- Exportación de cualquier reporte a Excel

Cómo está construido:
- Frontend: React 19 + TypeScript + Tailwind CSS, con Vite de build
- Backend: Google Apps Script como API JSON sobre Google Sheets y Drive (sin servidores)
- El dato que más me gusta contar: Apps Script corta las ejecuciones a los ~6 minutos, así que diseñé el procesamiento por lotes con reintentos, barra de progreso en tiempo real y cancelación manual desde la interfaz. También resolví el CORS de Apps Script usando peticiones POST con Content-Type text/plain (simple request, sin preflight).

El repositorio incluye un modo demo con datos simulados, para que cualquiera pueda ejecutarlo con `npm install && npm run dev` sin acceso a datos privados.

Código y documentación completa: https://github.com/juandaramirez43/JEC-COLSUBSIDIO

#React #TypeScript #GoogleAppsScript #DesarrolloWeb #Automatización #Portfolio

---

*Tip: adjunta la captura del dashboard (`01-dashboard.png`) como imagen del post — los posts con captura de interfaz generan más clics al repo. Menciona a los compañeros del proyecto si aplica.*

## 2. Sección "Proyectos" de tu perfil

**Panel JEC — Dashboard de gestión educativa**
Proyecto personal · React · TypeScript · Google Apps Script
Dashboard que consolida asistencia, planeaciones, refrigerios y docentes a partir de Google Sheets y Google Drive para el equipo operativo de un programa educativo. Procesamiento por lotes para sortear el límite de ejecución de Apps Script, cliente HTTP con timeouts y cancelación vía AbortController, progreso en tiempo real con polling y exportación a Excel. Disponible en modo demo con datos simulados.

## 3. Versión corta para "Acerca de"

Desarrollo aplicaciones web enfocadas en automatización de procesos con React, TypeScript y el ecosistema de Google Workspace (Apps Script, Sheets, Drive). Autor del Panel JEC, un dashboard de gestión educativa usado para consolidar reportes operativos.
