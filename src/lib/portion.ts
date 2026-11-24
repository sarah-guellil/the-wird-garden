// Qué trozo de la página toca memorizar (sin interfaz, fácil de probar).
import type { Ayah } from "./quran";
import type { Method } from "./plan";

const LINES_PER_PAGE = 15;

// Líneas de cada parte, según el método. Tercios: 1-5, 6-10, 11-15. Mitades: 1-7, 8-15.
export function portionLines(method: Method, part: number): [number, number] {
  if (method === "third") return [(part - 1) * 5 + 1, part * 5];
  if (method === "half") return part === 1 ? [1, 7] : [8, LINES_PER_PAGE];
  return [1, LINES_PER_PAGE]; // página entera (y "por aleyas", que se filtra después)
}

// Cuántas partes tiene una página con cada método
export const partsPerPage = (method: Method) => (method === "third" ? 3 : method === "half" ? 2 : 1);

// Las aleyas de esa parte. Regla A: una aleya partida entre dos partes va entera
// en la parte donde EMPIEZA. (Las aleyas muy largas se trocearán en la fase 3.)
export function ayahsInPortion(ayahs: Ayah[], method: Method, part: number, perDay: number): Ayah[] {
  // Si la página empieza con el final de una aleya de la página anterior, no la contamos aquí
  const onPage = ayahs.filter((a) => a.words.length > 0);
  if (method === "ayah") return onPage.slice((part - 1) * perDay, part * perDay);

  const [from, to] = portionLines(method, part);
  return onPage.filter((a) => {
    const firstLine = a.words[0].line;
    return firstLine >= from && firstLine <= to;
  });
}