/**
 * ================================================================
 * CAPA DE ACCESO A DATOS (dataService.ts)
 * ================================================================
 * El panel no contiene datos embebidos en el código: la "base de
 * datos" de demostración vive en tablas CSV planas dentro de
 * public/data/ y este módulo es su único cliente.
 *
 * Responsabilidades:
 *   1. parseCSV(): parser de CSV escrito desde cero en JavaScript
 *      puro (soporta comillas, comas y saltos de línea escapados).
 *   2. loadDemoDatabase(): lee las 5 tablas (colegios, grupos,
 *      docentes, estudiantes, registros_nl) en paralelo, normaliza
 *      los tipos (números, nulos) y cachea el resultado en memoria,
 *      de modo que cada tabla se descarga una sola vez por sesión.
 *
 * En producción la misma interfaz la cumple el backend de Google
 * Apps Script (services/apiService.ts), que lee Google Sheets y
 * Google Drive. Cambiar de "base de datos" no exige tocar la UI.
 */

/// <reference types="vite/client" />
import { NlBusquedaRow, NlConteoRow, NlDuplicadoRow } from "./types";

export interface DemoDatabase {
  colegios: string[];
  grupos: string[];
  docentes: string[];
  /** Pool de nombres y apellidos para generar registros simulados */
  nombres: string[];
  apellidos: string[];
  /** Tabla de hechos del módulo Análisis NL, partida por módulo */
  registrosNL: {
    conteo: NlConteoRow[];
    duplicados: NlDuplicadoRow[];
    busqueda: NlBusquedaRow[];
  };
}

/** Parser CSV en JavaScript puro: convierte el texto en filas de objetos */
export function parseCSV(text: string): Record<string, string>[] {
  // Quita el BOM si el archivo fue guardado con él
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // comilla escapada ""
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0].trim() !== "") rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0].trim() !== "") rows.push(row);

  // Primera fila = encabezados; el resto se mapea a objetos
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

async function fetchTable(name: string): Promise<Record<string, string>[]> {
  const res = await fetch(`${DATA_BASE}${name}.csv`);
  if (!res.ok) {
    throw new Error(`No se pudo leer la tabla de datos "${name}.csv" (HTTP ${res.status}).`);
  }
  return parseCSV(await res.text());
}

/** Cache: la base de datos se carga una sola vez por sesión */
let dbPromise: Promise<DemoDatabase> | null = null;

function buildDatabase(
  colegiosRows: Record<string, string>[],
  gruposRows: Record<string, string>[],
  docentesRows: Record<string, string>[],
  estudiantesRows: Record<string, string>[],
  registrosRows: Record<string, string>[]
): DemoDatabase {
  const conteo: NlConteoRow[] = [];
  const duplicados: NlDuplicadoRow[] = [];
  const busqueda: NlBusquedaRow[] = [];

  registrosRows.forEach(r => {
    if (r.modulo === "conteo") {
      conteo.push({
        nombre: r.nombre,
        documento: r.documento,
        colegio: r.colegio,
        grupo: r.grupo,
        asisUnica: r.asis_unica,
        totalAsis: Number(r.total_asis) || 0
      });
    } else if (r.modulo === "duplicados") {
      duplicados.push({
        colegio: r.colegio,
        nombre: r.nombre,
        documento: r.documento,
        grupoActivo: r.grupo_activo,
        grupoNl: r.grupo_nl
      });
    } else if (r.modulo === "busqueda") {
      busqueda.push({
        documentoEncontrado: r.documento,
        nombre: r.nombre,
        colegio: r.colegio,
        grupo: r.grupo,
        asistenciasMes: Number(r.asistencias_mes) || 0
      });
    }
  });

  return {
    colegios: colegiosRows.map(r => r.nombre).filter(Boolean),
    grupos: gruposRows.map(r => r.grupo).filter(Boolean),
    docentes: docentesRows.map(r => r.nombre).filter(Boolean),
    nombres: estudiantesRows.map(r => r.nombres).filter(Boolean),
    apellidos: estudiantesRows.map(r => r.apellidos).filter(Boolean),
    registrosNL: { conteo, duplicados, busqueda }
  };
}

export function loadDemoDatabase(): Promise<DemoDatabase> {
  if (!dbPromise) {
    dbPromise = Promise.all([
      fetchTable("colegios"),
      fetchTable("grupos"),
      fetchTable("docentes"),
      fetchTable("estudiantes"),
      fetchTable("registros_nl")
    ]).then(([colegios, grupos, docentes, estudiantes, registros]) =>
      buildDatabase(colegios, grupos, docentes, estudiantes, registros)
    );
  }
  return dbPromise;
}
