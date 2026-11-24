# Cómo publicar el proyecto PANEL-JEC (guía completa)

Esta guía tiene 3 partes: (A) crear el repo independiente, (B) subir las capturas al repo actual,
(C) pulir la presentación en GitHub y publicar en LinkedIn.

---

## A. Repo independiente (sin la etiqueta "forked from")

El plugin de GitHub con el que trabajé no tiene permiso para crear repositorios nuevos, así que este
paso lo haces tú una sola vez (30 segundos). Tienes dos caminos:

### Camino A1 — con Git instalado (recomendado)

1. Descarga y descomprime `PANEL-JEC-bundle.zip`. Contiene el proyecto completo, las capturas y el
   historial de commits ya creado a tu nombre.
2. Entra a https://github.com/new y crea el repo:
   - Nombre: `PANEL-JEC`
   - Visibilidad: **Public**
   - **NO** marques "Add a README", ni .gitignore, ni licencia (déjalo vacío).
3. Dentro de la carpeta descomprimida, ejecuta:

   ```bash
   chmod +x publicar.sh
   ./publicar.sh
   ```

   (o manualmente: `git remote add origin https://github.com/juandaramirez43/PANEL-JEC.git && git push -u origin main`)

### Camino A2 — sin Git (solo la web de GitHub)

1. Descomprime `PANEL-JEC-web.zip` (mismo proyecto, sin historial).
2. Crea el repo vacío en https://github.com/new (igual que arriba).
3. En la página del repo nuevo: **Add file → Upload files**, y arrastra TODO el contenido de la
   carpeta descomprimida (no la carpeta, sino lo que hay dentro). Confirma con **Commit changes**.
4. Entra a la carpeta `docs/screenshots/` en GitHub (Add file → Upload files de nuevo) y sube los 5 PNG
   de `capturas/`. GitHub crea las carpetas automáticamente al arrastrar archivos con rutas.

> Diferencia: el camino A1 conserva los commits (se ve más profesional en tu perfil); el A2 muestra
> un único commit de subida.

---

## B. Subir las capturas al repo actual (JEC-COLSUBSIDIO)

El README que ya está publicado referencia las capturas en `docs/screenshots/`, pero son archivos de
imagen (binarios) que no pude subir por API. Súbelas así:

1. Descarga la carpeta `capturas/` (o `capturas.zip`) de este chat.
2. Ve a https://github.com/juandaramirez43/JEC-COLSUBSIDIO
3. **Add file → Upload files** y arrastra los 5 PNG. En el campo de ruta/nombre del archivo, antepon
   `docs/screenshots/` a cada nombre (ejemplo: `docs/screenshots/01-dashboard.png`) — o crea primero
   la carpeta desde la web con "Create new file" escribiendo `docs/screenshots/.gitkeep` y luego sube
   las imágenes ahí.
4. Commit changes. Las imágenes del README se activan de inmediato.

---

## C. Pulir la presentación en GitHub

### 1. Nombre y descripción del repo (About)

El repo actual se llama `JEC-COLSUBSIDIO` y su descripción menciona a Colsubsidio. Como elegiste
presentación genérica:

- En la página del repo, clic en el engranaje de la sección **About** (a la derecha).
- Description: `Dashboard de gestión para programas educativos: reportes de asistencia, planeaciones y docentes a partir de Google Sheets y Drive. React + TypeScript + Google Apps Script.`
- Website: la URL de Netlify si lo despliegas.
- Topics: agrega estos: `react` `typescript` `vite` `tailwindcss` `google-apps-script` `google-sheets` `google-drive` `dashboard` `education` `netlify`

### 2. Cambiar el nombre del repo (opcional)

Settings → General → Repository name → `PANEL-JEC` → Rename. GitHub redirige automáticamente los
enlaces antiguos. Si lo haces, actualiza la URL de clone del README (hoy apunta a JEC-COLSUBSIDIO).

### 3. Seguridad pendiente (recomendado antes de difundir)

Estos puntos no los cambié porque afectan el uso interno, pero revísalos:

- `google-apps-script/Code.gs` (líneas 14-16) y `src/App.tsx` (líneas 44-45) tienen **IDs reales de
  carpetas de Drive** de la organización como valores por defecto. Sugerencia: déjalos como cadenas
  vacías y configúralos solo desde la pantalla de Setup.
- `src/App.tsx` (línea 46): la contraseña de administrador por defecto es literal `admin123`.
  Sugerencia: sin valor por defecto; que cada instalación defina la suya.
- Verifica con la organización que publicar el código (ya público) está autorizado.

### 4. Publicar en LinkedIn

Usa `post-linkedin.md`: contiene el texto del post, la descripción para la sección "Proyectos" de tu
perfil y la versión corta para "Acerca de".
