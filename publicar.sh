#!/usr/bin/env bash
# Publica este proyecto en tu repo independiente de GitHub.
# PASO PREVIO: crea el repositorio vacío en https://github.com/new
#   - Nombre: PANEL-JEC
#   - Visibilidad: Public
#   - NO marques "Add a README" ni .gitignore ni licencia (déjalo totalmente vacío)
set -e

REMOTE_URL="https://github.com/juandaramirez43/PANEL-JEC.git"

if git remote | grep -q "^origin$"; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git push -u origin main

echo ""
echo "Listo. Verifica en: https://github.com/juandaramirez43/PANEL-JEC"
echo "Después sube las capturas a docs/screenshots/ (ver INSTRUCCIONES-PUBLICACION.md)."
