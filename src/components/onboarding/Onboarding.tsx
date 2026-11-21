"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  estimateFinishDate,
  needsDirection,
  PER_DAY_OPTIONS,
  PLAN_STORAGE_KEY,
  type Method,
  type Plan,
} from "@/lib/plan";
import { JUZ_AMMA, JUZ_TABARAK, parseSurahList, range, SURAHS } from "@/lib/surahs";
import { GardenSign } from "./GardenSign";
import { Yasmin } from "./Yasmin";

type T = Dictionary["onboarding"];
type StepId =
  | "welcome"
  | "known"
  | "surahs"
  | "review"
  | "goal"
  | "direction"
  | "method"
  | "perDay"
  | "days"
  | "mode"
  | "summary";

// Sustituye {clave} por su valor: fill("Paso {n}", { n: 2 }) → "Paso 2"
const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

// "{n} tercio|{n} tercios" → singular si n es 1, plural si no
const plural = (text: string, n: number) => {
  const [one, many = one] = text.split("|");
  return fill(n === 1 ? one : many, { n });
};

const initialPlan: Plan = {
  name: "",
  knownSurahs: [],
  reviewKnown: true,
  goal: "amma",
  juz: 30,
  direction: "end",
  method: "third",
  perDay: 1,
  days: 5,
  mode: "guided",
};

export function Onboarding({ t, locale }: { t: T; locale: Locale }) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [knowsSome, setKnowsSome] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<Set<StepId>>(new Set());
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [saved, setSaved] = useState(false);

  // Los pasos dependen de las respuestas anteriores
  const steps: StepId[] = [
    "welcome",
    "known",
    ...(knowsSome ? (["surahs", "review"] as const) : []),
    "goal",
    ...(needsDirection(plan) ? (["direction"] as const) : []),
    "method",
    "perDay",
    "days",
    "mode",
    "summary",
  ];
  const step = steps[Math.min(index, steps.length - 1)];
  const questionCount = steps.length - 2; // sin bienvenida ni resumen
  const name = plan.name.trim();

  const canContinue =
    step === "welcome"
      ? name.length > 0
      : step === "known"
        ? knowsSome !== null
        : step === "surahs"
          ? plan.knownSurahs.length > 0
          : step === "summary" || answered.has(step);

  const update = (stepId: StepId, changes: Partial<Plan>) => {
    setPlan((p) => ({ ...p, ...changes }));
    setAnswered((a) => new Set(a).add(stepId));
  };

  const setKnown = (numbers: number[]) =>
    setPlan((p) => ({ ...p, knownSurahs: [...new Set(numbers)].sort((a, b) => a - b) }));

  const toggleSurah = (n: number) =>
    setKnown(plan.knownSurahs.includes(n) ? plan.knownSurahs.filter((x) => x !== n) : [...plan.knownSurahs, n]);

  // Los atajos marcan el bloque entero, o lo desmarcan si ya estaba
  const toggleBlock = ({ from, to }: { from: number; to: number }) => {
    const block = range(from, to);
    const allMarked = block.every((n) => plan.knownSurahs.includes(n));
    setKnown(allMarked ? plan.knownSurahs.filter((n) => !block.includes(n)) : [...plan.knownSurahs, ...block]);
  };

  function savePlan() {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ ...plan, name }));
    } catch {
      // Si el navegador no deja guardar (modo privado), seguimos igual
    }
    setSaved(true);
  }

  const choice = (selected: boolean, label: string, onClick: () => void, hint?: string) => (
    <button
      key={label}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full rounded-2xl border-2 px-5 py-4 text-start transition-colors ${
        selected ? "border-rose-deep bg-rose-soft" : "border-border bg-surface hover:border-rose"
      }`}
    >
      <span className="text-lg font-semibold">{label}</span>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </button>
  );

  // Opción que guarda un valor del plan
  const option = <K extends keyof Plan>(stepId: StepId, key: K, value: Plan[K], label: string, hint?: string) =>
    choice(answered.has(stepId) && plan[key] === value, label, () => update(stepId, { [key]: value } as Partial<Plan>), hint);

  const unitLabel = (method: Method, n: number) => plural(t.perDay.units[method], n);

  // Lo que dice Yasmin en cada paso
  const speech: Record<StepId, string> = {
    welcome: t.welcome.title,
    known: fill(t.known.question, { name }),
    surahs: t.surahs.question,
    review: t.review.question,
    goal: t.goal.question,
    direction: t.direction.question,
    method: t.method.question,
    perDay: t.perDay.question,
    days: t.days.question,
    mode: t.mode.question,
    summary: t.summary.title,
  };

  function renderStep() {
    switch (step) {
      case "welcome":
        return (
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-ink-soft">{t.welcome.text}</p>
            <label className="block">
              <span className="font-semibold">{t.welcome.nameLabel}</span>
              <input
                value={plan.name}
                onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && canContinue && setIndex(1)}
                placeholder={t.welcome.namePlaceholder}
                maxLength={30}
                autoComplete="given-name"
                className="mt-2 block w-full rounded-2xl border-2 border-border bg-surface px-5 py-4 text-lg focus:border-rose-deep focus:outline-none"
              />
            </label>
          </div>
        );

      case "known":
        return (
          <div className="grid gap-3">
            {choice(knowsSome === true, t.known.options.yes, () => setKnowsSome(true))}
            {choice(knowsSome === false, t.known.options.no, () => {
              setKnowsSome(false);
              setKnown([]);
            })}
          </div>
        );

      case "surahs":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                [JUZ_AMMA, t.surahs.shortcutAmma],
                [JUZ_TABARAK, t.surahs.shortcutTabarak],
              ].map(([block, label]) => {
                const { from, to } = block as typeof JUZ_AMMA;
                const active = range(from, to).every((n) => plan.knownSurahs.includes(n));
                return (
                  <button
                    key={label as string}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleBlock({ from, to })}
                    className={`rounded-full border-2 border-sage px-4 py-2 text-sm font-semibold transition-colors ${
                      active ? "bg-sage/30" : "hover:bg-sage/20"
                    }`}
                  >
                    {label as string}
                  </button>
                );
              })}
              {plan.knownSurahs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setKnown([])}
                  className="rounded-full px-4 py-2 text-sm text-ink-soft hover:text-ink"
                >
                  {t.surahs.clear}
                </button>
              )}
            </div>

            <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-border bg-surface p-3 sm:grid-cols-3">
              {SURAHS.map((s) => {
                const selected = plan.knownSurahs.includes(s.number);
                return (
                  <button
                    key={s.number}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSurah(s.number)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors ${
                      selected ? "bg-rose-soft font-semibold" : "hover:bg-background"
                    }`}
                  >
                    <span className="w-7 shrink-0 text-ink-soft">{s.number}</span>
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-semibold" aria-live="polite">
              {plan.knownSurahs.length > 0
                ? fill(t.surahs.selected, { n: plan.knownSurahs.length })
                : t.surahs.none}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setKnown([...plan.knownSurahs, ...parseSurahList(typed)]);
                setTyped("");
              }}
            >
              <label className="text-sm text-ink-soft" htmlFor="surah-numbers">
                {t.surahs.typeLabel}
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="surah-numbers"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  inputMode="numeric"
                  className="min-w-0 flex-1 rounded-xl border-2 border-border bg-surface px-4 py-2 focus:border-rose-deep focus:outline-none"
                />
                <button type="submit" className="rounded-xl bg-sage/25 px-4 py-2 font-semibold hover:bg-sage/40">
                  {t.surahs.typeAdd}
                </button>
              </div>
            </form>
          </div>
        );

      case "review":
        return (
          <div className="grid gap-3">
            {option("review", "reviewKnown", true, t.review.options.yes)}
            {option("review", "reviewKnown", false, t.review.options.no)}
            <p className="text-sm text-ink-soft">{t.review.hint}</p>
          </div>
        );

      case "goal":
        return (
          <div className="grid gap-3">
            {(["quran", "amma", "juz"] as const).map((v) => option("goal", "goal", v, t.goal.options[v]))}
            {plan.goal === "juz" && answered.has("goal") && (
              <label className="mt-2 block">
                <span className="text-sm text-ink-soft">{t.goal.juzLabel}</span>
                <select
                  value={plan.juz}
                  onChange={(e) => setPlan((p) => ({ ...p, juz: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-lg"
                >
                  {range(1, 30).map((n) => (
                    <option key={n} value={n}>
                      {fill(t.goal.juzOption, { n })}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        );

      case "direction":
        return (
          <div className="grid gap-3">
            {(["start", "end"] as const).map((v) => option("direction", "direction", v, t.direction.options[v]))}
            <p className="text-sm text-ink-soft">{t.direction.hint}</p>
          </div>
        );

      case "method":
        return (
          <div className="grid gap-3">
            {(["ayah", "third", "half", "page"] as const).map((v) =>
              choice(answered.has("method") && plan.method === v, t.method.options[v], () => {
                // Al cambiar de método, la cantidad diaria vuelve a la primera opción
                update("method", { method: v, perDay: PER_DAY_OPTIONS[v][0] });
                setAnswered((a) => {
                  const next = new Set(a).add("method");
                  next.delete("perDay");
                  return next;
                });
              }),
            )}
            <p className="text-sm text-ink-soft">{t.method.hint}</p>
          </div>
        );

      case "perDay":
        return (
          <div className="grid gap-3">
            {PER_DAY_OPTIONS[plan.method].map((n) => option("perDay", "perDay", n, unitLabel(plan.method, n)))}
            <p className="text-sm text-ink-soft">
              {t.perDay.hints[plan.method]} {t.perDay.review}
            </p>
          </div>
        );

      case "days":
        return (
          <div className="grid gap-3">
            {([3, 5, 7] as const).map((v) =>
              option("days", "days", v, v === 7 ? t.days.optionAll : fill(t.days.option, { n: v })),
            )}
          </div>
        );

      case "mode":
        return (
          <div className="grid gap-3">
            {(["guided", "free"] as const).map((v) => option("mode", "mode", v, t.mode.options[v], t.mode.hints[v]))}
          </div>
        );

      case "summary":
        return renderSummary();
    }
  }

  function renderSummary() {
    const finish = estimateFinishDate(plan, new Date());
    const goal = fill(t.summary.goals[plan.goal], { n: plan.juz });
    const date = finish ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(finish) : "";

    return (
      <div className="space-y-6">
        <GardenSign text={fill(t.summary.sign, { name })} />

        {plan.knownSurahs.length > 0 && (
          <p className="text-center text-ink-soft">{fill(t.summary.plants, { n: plan.knownSurahs.length })}</p>
        )}

        <p className="text-lg leading-relaxed">{finish ? fill(t.summary.estimate, { goal, date }) : t.summary.done}</p>

        <dl className="grid gap-3 rounded-2xl bg-surface p-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-ink-soft">{t.labels.method}</dt>
            <dd className="font-semibold">{t.method.options[plan.method]}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">{t.labels.pace}</dt>
            <dd className="font-semibold">
              {fill(t.labels.paceValue, { amount: unitLabel(plan.method, plan.perDay), days: plan.days })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">{t.labels.mode}</dt>
            <dd className="font-semibold">{t.mode.options[plan.mode]}</dd>
          </div>
        </dl>

        <p className="text-sm text-ink-soft">{t.summary.approx}</p>

        {finish &&
          (saved ? (
            <div className="space-y-4">
              <p role="status" className="rounded-2xl bg-sage/20 p-4 font-semibold">
                {t.summary.saved}
              </p>
              <Link href={`/${locale}`} className="inline-block font-semibold text-rose-deep hover:text-ink">
                {t.summary.home}
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={savePlan}
              className="rounded-2xl bg-rose-deep px-8 py-4 text-lg font-semibold text-surface shadow-lg shadow-rose/25 transition hover:-translate-y-0.5"
            >
              {t.summary.save}
            </button>
          ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Progreso */}
      {step !== "welcome" && step !== "summary" && (
        <div className="mb-8">
          <p className="text-sm text-ink-soft">{fill(t.progress, { current: index, total: questionCount })}</p>
          <div className="mt-2 h-2 rounded-full bg-rose-soft">
            <div
              className="h-2 rounded-full bg-sage transition-all"
              style={{ width: `${(index / questionCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Yasmin habla */}
      <div className="flex items-start gap-4">
        <Yasmin size={step === "welcome" ? 96 : 64} />
        <h1
          key={step}
          aria-live="polite"
          className="mt-2 rounded-3xl rounded-tl-md bg-surface px-6 py-4 font-display text-3xl leading-snug shadow-sm"
        >
          {speech[step]}
        </h1>
      </div>

      <div className="mt-8">{renderStep()}</div>

      {/* Navegación */}
      {!saved && (
        <div className="mt-10 flex items-center justify-between">
          {index > 0 ? (
            <button type="button" onClick={() => setIndex((i) => i - 1)} className="font-semibold text-ink-soft hover:text-ink">
              {t.back}
            </button>
          ) : (
            <span />
          )}
          {step !== "summary" && (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-2xl bg-rose-deep px-8 py-3 font-semibold text-surface transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.next}
            </button>
          )}
        </div>
      )}
    </div>
  );
}