// Lo que toca hoy, calculado a partir del plan (sin interfaz, fácil de probar).
// De momento no hay progreso guardado: lo único que se sabe es lo que marcó
// en el onboarding. Cuando exista la pantalla de memorizar, aquí se sumará.
import { goalRange, pagesToMemorize, type Plan } from "./plan";
import { SURAHS, surahPages } from "./surahs";

// Porcentaje del objetivo que ya se sabe, por páginas
export function goalProgress(plan: Plan) {
  const [a, b] = goalRange(plan);
  const total = b - a;
  const done = total - pagesToMemorize(plan);
  return { done: Math.round(done), total, percent: Math.round((done / total) * 100) };
}

// ¿Se sabe entera esta página? (porque marcó todas las suras que hay en ella)
function isPageKnown(plan: Plan, page: number) {
  const covered = plan.knownSurahs.reduce((sum, n) => {
    const [s, e] = surahPages(n);
    return sum + Math.max(0, Math.min(page + 1, e) - Math.max(page, s));
  }, 0);
  return covered > 0.99;
}

// Suras que aparecen en una página
export function surahsOnPage(page: number) {
  return SURAHS.filter((s) => {
    const [start, end] = surahPages(s.number);
    return start < page + 1 && end > page;
  });
}

// La primera página que le falta, en el orden de su plan
// (desde el principio, o desde el final si empieza por Juz' Amma)
export function nextPage(plan: Plan): number | null {
  const [a, b] = goalRange(plan);
  const pages = Array.from({ length: b - a }, (_, i) => a + i);
  if (plan.direction === "end") pages.reverse();
  return pages.find((page) => !isPageKnown(plan, page)) ?? null;
}

// La primera sura que le falta en esa página, en el orden de su plan
export function nextSurah(plan: Plan, page: number) {
  const onPage = surahsOnPage(page).filter((s) => !plan.knownSurahs.includes(s.number));
  return plan.direction === "end" ? onPage.at(-1) : onPage[0];
}

// Suras que toca repasar hoy (de momento, las que ya sabía)
export const reviewSurahs = (plan: Plan) =>
  plan.reviewKnown ? SURAHS.filter((s) => plan.knownSurahs.includes(s.number)) : [];