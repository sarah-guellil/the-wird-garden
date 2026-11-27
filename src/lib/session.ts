// Cómo se organiza una sesión de memorizar (sin interfaz, fácil de probar).
//
// La sesión es una lista de "unidades" de trabajo, una detrás de otra:
// - aleya corta: la aleya entera con el 6446
// - aleya larga: cada trozo con el 6446 y, al final, la aleya entera de memoria
// - al acabar todas: enlazar, el trozo de hoy entero de memoria
import type { Ayah } from "./quran";

export type Step = { kind: "read" | "memory"; count: number };

export type Unit =
  | { type: "ayah"; ayahIndex: number; steps: Step[] } // aleya corta, con el 6446
  | {
      type: "piece";
      ayahIndex: number;
      piece: number;
      pieces: number;
      steps: Step[];
    } // trozo de una aleya larga
  | { type: "join"; ayahIndex: number; steps: Step[] } // aleya larga entera, tras sus trozos
  | { type: "link"; steps: Step[] }; // todo el trozo de hoy seguido

export const METHOD_6446: Step[] = [
  { kind: "read", count: 6 },
  { kind: "memory", count: 4 },
  { kind: "read", count: 4 },
  { kind: "memory", count: 6 },
];
const RECITE_3: Step[] = [{ kind: "memory", count: 3 }];

// A partir de cuántas palabras una aleya se considera larga y se trocea
const LONG_AYAH = 20;
// Marcas de pausa del Corán (ۖ ۗ ۘ ۙ ۚ ۛ ۜ): ahí se puede parar, así que ahí cortamos
const PAUSE = /[\u06D6-\u06DC]/;

// Trocea una aleya larga en frases, cortando en sus pausas.
// Devuelve grupos de palabras. Una aleya corta es un solo grupo.
export function splitAyah(words: string[]): string[][] {
  if (words.length <= LONG_AYAH) return [words];

  const pieces: string[][] = [];
  let piece: string[] = [];
  words.forEach((word) => {
    piece.push(word);
    // Cortamos en una pausa si el trozo ya tiene unas cuantas palabras,
    // o a la fuerza si se hace demasiado largo (por si la aleya no tiene pausas)
    if ((piece.length >= 6 && PAUSE.test(word)) || piece.length >= 14) {
      pieces.push(piece);
      piece = [];
    }
  });
  if (piece.length > 0) pieces.push(piece);

  // Un último trozo muy corto (menos de 4 palabras) se une al anterior
  const last = pieces.at(-1)!;
  if (pieces.length > 1 && last.length < 4)
    pieces.splice(-2, 2, [...pieces.at(-2)!, ...last]);
  return pieces;
}

// Las palabras de cada aleya, en texto
export const ayahWords = (ayah: Ayah) => ayah.words.map((w) => w.text);

// Construye la lista de unidades de la sesión
export function buildSession(ayahs: Ayah[]): Unit[] {
  const units: Unit[] = [];
  ayahs.forEach((ayah, ayahIndex) => {
    const pieces = splitAyah(ayahWords(ayah));
    if (pieces.length === 1) {
      units.push({ type: "ayah", ayahIndex, steps: METHOD_6446 });
      return;
    }
    pieces.forEach((_, piece) =>
      units.push({
        type: "piece",
        ayahIndex,
        piece,
        pieces: pieces.length,
        steps: METHOD_6446,
      }),
    );
    units.push({ type: "join", ayahIndex, steps: RECITE_3 });
  });
  // Enlazar solo tiene sentido si hoy hay más de una aleya
  if (ayahs.length > 1) units.push({ type: "link", steps: RECITE_3 });
  return units;
}