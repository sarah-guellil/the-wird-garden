// Lógica del plan de memorización (sin interfaz, fácil de probar).
import { surahPages } from "./surahs";

export type Goal = "quran" | "amma" | "juz";
export type Direction = "start" | "end";
export type Method = "ayah" | "third" | "half" | "page";
export type DaysPerWeek = 3 | 5 | 7;
export type Mode = "guided" | "free";

export type Plan = {
  name: string;
  knownSurahs: number[]; // números de sura que ya sabe
  reviewKnown: boolean; // si quiere repasar lo que ya sabe
  goal: Goal;
  juz: number; // solo se usa si goal === "juz"
  direction: Direction;
  method: Method;
  perDay: number; // cantidad diaria, en la unidad del método
  days: DaysPerWeek;
  mode: Mode;
};

export const PLAN_STORAGE_KEY = "twg-plan";

const LINES_PER_PAGE = 15;

// Cuántas líneas del mushaf ocupa, de media, cada unidad
const LINES_PER_UNIT: Record<Method, number> = {
  ayah: 1.5, // 6236 aleyas en 9060 líneas, aproximadamente
  third: 5,
  half: 7.5,
  page: 15,
};

// Opciones de cantidad diaria para cada método
export const PER_DAY_OPTIONS: Record<Method, number[]> = {
  ayah: [3, 5, 10],
  third: [1, 2, 3],
  half: [1, 2],
  page: [1, 2],
};

// Páginas que abarca cada objetivo, como intervalo [inicio, fin)
function goalRange(plan: Plan): [number, number] {
  if (plan.goal === "quran") return [1, 605];
  if (plan.goal === "amma") return [582, 605];
  const start = plan.juz === 1 ? 1 : 2 + 20 * (plan.juz - 1);
  const end = plan.juz === 30 ? 605 : 22 + 20 * (plan.juz - 1);
  return [start, end];
}

// Páginas que quedan por memorizar: el objetivo menos lo que ya sabe
export function pagesToMemorize(plan: Plan): number {
  const [a, b] = goalRange(plan);
  const known = plan.knownSurahs.reduce((sum, n) => {
    const [s, e] = surahPages(n);
    return sum + Math.max(0, Math.min(b, e) - Math.max(a, s));
  }, 0);
  return Math.max(0, b - a - known);
}

// Fecha estimada de fin, o null si ya lo sabe todo
export function estimateFinishDate(plan: Plan, from: Date): Date | null {
  const lines = pagesToMemorize(plan) * LINES_PER_PAGE;
  if (lines < 1) return null;

  const linesPerDay = plan.perDay * LINES_PER_UNIT[plan.method];
  const studyDays = Math.ceil(lines / linesPerDay);
  const calendarDays = Math.ceil((studyDays * 7) / plan.days);

  const finish = new Date(from);
  finish.setDate(finish.getDate() + calendarDays);
  return finish;
}

// La dirección solo tiene sentido si el objetivo es el Corán completo
export const needsDirection = (plan: Plan) => plan.goal === "quran";