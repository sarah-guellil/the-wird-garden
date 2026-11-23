"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { estimateFinishDate, PLAN_STORAGE_KEY, type Plan } from "@/lib/plan";
import { goalProgress, nextPage, nextSurah, reviewSurahs } from "@/lib/today";
import { AyaFull } from "@/components/characters/AyaFull";
import { GardenScene } from "@/components/garden/GardenScene";

type Props = {
  t: Dictionary["today"];
  units: Dictionary["onboarding"]["perDay"]["units"];
  varieties: Dictionary["onboarding"]["summary"]["varieties"];
  locale: Locale;
};

// Sustituye {clave} por su valor y elige singular/plural si el texto tiene "|"
function fill(text: string, vars: Record<string, string | number> = {}) {
  const [one, many = one] = text.split("|");
  const chosen = vars.n === 1 ? one : many;
  return chosen.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Lee el plan guardado en el navegador. useSyncExternalStore es la forma de React
// de leer algo "de fuera" (aquí, localStorage): en el servidor no existe, así que
// allí devuelve null y la página se rellena al llegar al navegador.
const subscribe = () => () => {};
const readPlan = () => {
  try {
    return localStorage.getItem(PLAN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export function Today({ t, units, varieties, locale }: Props) {
  const saved = useSyncExternalStore(subscribe, readPlan, () => null);
  const plan = useMemo<Plan | null>(() => (saved ? JSON.parse(saved) : null), [saved]);

  // Todavía en el servidor, o sin plan: invitamos a hacer el onboarding
  if (!plan) {
    return (
      <div className="mx-auto max-w-md px-6 pt-16 text-center">
        <h1 className="font-display text-3xl">{t.noPlan.title}</h1>
        <p className="mt-3 text-ink-soft">{t.noPlan.text}</p>
        <Link
          href={`/${locale}/start`}
          className="mt-6 inline-block rounded-2xl bg-rose-deep px-8 py-3 font-semibold text-surface"
        >
          {t.noPlan.cta}
        </Link>
      </div>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 13 ? t.greeting.morning : hour < 20 ? t.greeting.afternoon : t.greeting.night;
  const today = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(now);

  const progress = goalProgress(plan);
  const finish = estimateFinishDate(plan, now);
  const finishText = finish
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(finish).replace(".", "")
    : t.finishDone;

  // Lo nuevo de hoy
  const page = nextPage(plan);
  const amount = fill(units[plan.method], { n: plan.perDay });
  const surah = page ? nextSurah(plan, page) : undefined;
  const memorizeDetail =
    page === null
      ? t.memorizeDone
      : plan.method === "ayah"
        ? fill(t.memorizeAyah, { amount, surah: surah?.name ?? "" })
        : fill(t.memorizePage, { amount, page, surah: surah?.name ?? "" });

  // Lo que toca regar
  const review = reviewSurahs(plan);
  const reviewText =
    review.length === 0
      ? t.reviewNothing
      : review.slice(0, 3).map((s) => s.name).join(" · ") +
        (review.length > 3 ? ` ${fill(t.reviewMore, { n: review.length - 3 })}` : "");

  // Todavía no se guarda la racha ni lo hecho hoy: llegarán con la pantalla de memorizar
  const streak = 0;
  const tasksDone = 0;
  const tasksTotal = review.length > 0 ? 2 : 1;

  // Anillo de progreso: la longitud del trazo es la circunferencia (2πr)
  const circumference = 2 * Math.PI * 21;

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pb-6">
          {/* Saludo de Aya */}
          <div className="flex items-center gap-4">
            <div className="shrink-0 overflow-hidden rounded-full bg-[#E8EFE6]">
              <AyaFull face height={54} />
            </div>
            <div>
              <h1 className="font-display text-3xl leading-tight">{fill(greeting, { name: plan.name })}</h1>
              <p className="text-sm text-ink-soft first-letter:uppercase">
                {today} · {fill(varieties[plan.goal], { n: plan.juz })}
              </p>
            </div>
          </div>

          {/* Las tres cifras: progreso, fecha de fin y racha */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-3 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-start">
              <svg viewBox="0 0 52 52" className="h-10 w-10 shrink-0 sm:h-13 sm:w-13" aria-hidden="true">
                <circle cx="26" cy="26" r="21" fill="none" stroke="var(--rose-soft)" strokeWidth="6" />
                <circle
                  cx="26"
                  cy="26"
                  r="21"
                  fill="none"
                  stroke="var(--sage)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress.percent / 100)}
                  transform="rotate(-90 26 26)"
                />
              </svg>
              <div>
                <p className="text-xs text-ink-soft">{t.progress}</p>
                <p className="font-display text-xl sm:text-2xl">{progress.percent} %</p>
                <p className="hidden text-xs text-ink-soft sm:block">
                  {fill(t.progressSub, { done: progress.done, total: progress.total })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-3 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-start">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-soft sm:h-11 sm:w-11">
                <svg viewBox="-12 -12 24 24" width="24" height="24" aria-hidden="true">
                  {[0, 72, 144, 216, 288].map((r) => (
                    <ellipse key={r} cy="-5.5" rx="4" ry="5.5" fill="var(--rose)" transform={`rotate(${r})`} />
                  ))}
                  <circle r="3" fill="var(--gold)" />
                </svg>
              </span>
              <div>
                <p className="text-xs text-ink-soft">{t.finish}</p>
                <p className="font-display text-xl sm:text-2xl">{finishText}</p>
                <p className="hidden text-xs text-ink-soft sm:block">{t.finishSub}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-3 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-start">
              {/* La racha es un sol: cuantos más días, más brilla (más adelante) */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBF1DE] sm:h-11 sm:w-11">
                <svg viewBox="-12 -12 24 24" width="26" height="26" aria-hidden="true">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
                    <path key={r} d="M0 -10.5 V-7.5" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${r})`} />
                  ))}
                  <circle r="5.5" fill="var(--gold)" />
                </svg>
              </span>
              <div>
                <p className="text-xs text-ink-soft">{t.streak}</p>
                <p className="font-display text-xl sm:text-2xl">{fill(t.streakValue, { n: streak })}</p>
                <p className="hidden text-xs text-ink-soft sm:block">{t.streakStart}</p>
              </div>
            </div>
          </div>

          {/* Tu wird de hoy: primero lo nuevo, después el repaso */}
          <section className="mt-3 rounded-3xl border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{t.wird}</h2>
              <p className="text-sm text-ink-soft">{fill(t.wirdDone, { done: tasksDone, total: tasksTotal })}</p>
            </div>
            <div className="mt-2 mb-3 h-1.5 rounded-full bg-rose-soft">
              <div className="h-1.5 rounded-full bg-sage" style={{ width: `${(tasksDone / tasksTotal) * 100}%` }} />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-rose bg-rose-soft/40 p-3 sm:flex-nowrap">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-deep text-sm font-bold text-surface">
                1
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.memorize}</p>
                <p className="text-sm text-ink-soft">{memorizeDetail}</p>
              </div>
              {page !== null && (
                <Link
                  href={`/${locale}/learn`}
                  className="w-full rounded-2xl bg-rose-deep px-6 py-2.5 text-center font-semibold text-surface sm:w-auto"
                >
                  {t.start}
                </Link>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-dashed border-border p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-ink">
                2
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.review}</p>
                <p className="text-sm text-ink-soft">{reviewText}</p>
              </div>
              {review.length > 0 && <span className="shrink-0 text-sm text-ink-soft">{t.later}</span>}
            </div>
          </section>
        </div>
      </div>

      {/* El jardín, siempre abajo (más adelante mostrará lo que llevas de verdad) */}
      <div className="shrink-0 opacity-90">
        <GardenScene />
      </div>
    </div>
  );
}