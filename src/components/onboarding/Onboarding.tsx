"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  estimateFinishDate,
  isGoalDone,
  needsDirection,
  PER_DAY_OPTIONS,
  PLAN_STORAGE_KEY,
  type Method,
  type Plan,
} from "@/lib/plan";
import { countAyahs, JUZ_AMMA, JUZ_TABARAK, range, SURAHS } from "@/lib/surahs";
import { Typewriter } from "./Typewriter";
import { SeedPacket } from "./SeedPacket";
import { Aya } from "@/components/characters/Aya";
import { AyaFull } from "@/components/characters/AyaFull";
import { GardenScene } from "@/components/garden/GardenScene";
import { Butterfly } from "@/components/garden/Butterfly";

type T = Dictionary["onboarding"];

// Milisegundos entre cada letra cuando habla Aya
const SPEED = 30;
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
const plural = (text: string, n: number, vars: Record<string, string | number> = {}) => {
  const [one, many = one] = text.split("|");
  return fill(n === 1 ? one : many, { n, ...vars });
};

// Número máximo de pasos posibles (con todas las preguntas opcionales).
// Sirve para que el jardín crezca siempre hacia delante, aunque cambien los pasos.
const MAX_STEPS = 11;

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
  const router = useRouter();

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
  // El nombre siempre con la primera letra de cada palabra en mayúscula: "sarah" → "Sarah"
  const name = plan.name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase(locale) + word.slice(1))
    .join(" ");

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

  // Al cruzar la valla: guardamos el plan en el navegador y entramos al jardín
  function enterGarden() {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ ...plan, name }));
    } catch {
      // Si el navegador no deja guardar (modo privado), seguimos igual
    }
    router.push(`/${locale}/today`);
  }

  // Pasa a la siguiente pregunta tras un momento, para que se vea la opción elegida.
  // "advancing" evita que un doble clic salte dos preguntas.
  const [advancing, setAdvancing] = useState(false);
  const goNext = () => {
    if (advancing) return;
    setAdvancing(true);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setAdvancing(false);
    }, 300);
  };

  const choice = (selected: boolean, label: string, onClick: () => void, hint?: string) => (
    <button
      key={label}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full rounded-2xl border-2 px-5 py-3 text-start transition-colors ${
        selected ? "border-rose-deep bg-rose-soft" : "border-border bg-surface hover:border-rose"
      }`}
    >
      <span className="text-lg font-semibold">{label}</span>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </button>
  );

  // Opción que guarda un valor del plan
  const option = <K extends keyof Plan>(stepId: StepId, key: K, value: Plan[K], label: string, hint?: string) =>
    choice(
      answered.has(stepId) && plan[key] === value,
      label,
      () => {
        update(stepId, { [key]: value } as Partial<Plan>);
        // Si elige "un juz' concreto", primero tiene que decir cuál
        if (!(key === "goal" && value === "juz")) goNext();
      },
      hint,
    );

  const unitLabel = (method: Method, n: number) => plural(t.perDay.units[method], n);

  // Lo que dice Aya en cada paso
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
            {choice(knowsSome === true, t.known.options.yes, () => {
              setKnowsSome(true);
              goNext();
            })}
            {choice(knowsSome === false, t.known.options.no, () => {
              setKnowsSome(false);
              setKnown([]);
              goNext();
            })}
          </div>
        );

      case "surahs":
        return (
          <div className="space-y-3">
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
              {/* Cuántas lleva marcadas, en la misma fila para ahorrar espacio */}
              <p className="ml-auto self-center text-sm font-semibold" aria-live="polite">
                {plan.knownSurahs.length > 0
                  ? fill(t.surahs.selected, { n: plan.knownSurahs.length })
                  : t.surahs.none}
              </p>
            </div>

            <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto rounded-2xl border border-border bg-surface p-2 sm:grid-cols-3 lg:max-h-28">
              {SURAHS.map((s) => {
                const selected = plan.knownSurahs.includes(s.number);
                return (
                  <button
                    key={s.number}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSurah(s.number)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors ${
                      selected ? "bg-rose-soft font-semibold" : "hover:bg-background"
                    }`}
                  >
                    <span className="w-7 shrink-0 text-ink-soft">{s.number}</span>
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
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

      case "goal": {
        // Solo proponemos lo que aún no se sabe entero
        const freeJuz = range(1, 30).filter((n) => !isGoalDone(plan, "juz", n));
        const hidesSomething = isGoalDone(plan, "amma") || freeJuz.length < 30;
        return (
          <div className="grid gap-3">
            {!isGoalDone(plan, "quran") && option("goal", "goal", "quran", t.goal.options.quran)}
            {!isGoalDone(plan, "amma") && option("goal", "goal", "amma", t.goal.options.amma)}
            {freeJuz.length > 0 &&
              choice(answered.has("goal") && plan.goal === "juz", t.goal.options.juz, () =>
                // Si el juz' que había elegido ya se lo sabe, pasamos al primero que no
                update("goal", { goal: "juz", juz: freeJuz.includes(plan.juz) ? plan.juz : freeJuz[0] }),
              )}
            {plan.goal === "juz" && answered.has("goal") && (
              <label className="mt-2 block">
                <span className="text-sm text-ink-soft">{t.goal.juzLabel}</span>
                <select
                  value={plan.juz}
                  onChange={(e) => setPlan((p) => ({ ...p, juz: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-lg"
                >
                  {freeJuz.map((n) => (
                    <option key={n} value={n}>
                      {fill(t.goal.juzOption, { n })}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {hidesSomething && <p className="text-sm text-ink-soft">{t.goal.hidden}</p>}
          </div>
        );
      }

      case "direction":
        return (
          <div className="grid gap-3">
            {(["start", "end"] as const).map((v) => option("direction", "direction", v, t.direction.options[v]))}
            <p className="text-sm text-ink-soft">{t.direction.hint}</p>
          </div>
        );

      case "method":
        return (
          // Cuatro opciones: en pantallas medianas y grandes van de dos en dos para que quepan
          <div className="grid gap-3 sm:grid-cols-2">
            {(["ayah", "third", "half", "page"] as const).map((v) =>
              choice(answered.has("method") && plan.method === v, t.method.options[v], () => {
                // Al cambiar de método, la cantidad diaria vuelve a la primera opción
                update("method", { method: v, perDay: PER_DAY_OPTIONS[v][0] });
                setAnswered((a) => {
                  const next = new Set(a).add("method");
                  next.delete("perDay");
                  return next;
                });
                goNext();
              }),
            )}
            <p className="text-sm text-ink-soft sm:col-span-2">{t.method.hint}</p>
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
    // Si ya se sabe todo lo que eligió, no hay sobre: le pedimos que elija otro objetivo
    if (!finish) return <p className="text-center text-lg leading-relaxed">{t.summary.done}</p>;

    const p = t.summary.packet;
    const known = plan.knownSurahs.length;
    // Fecha corta para el sobre: "22 ene 2029"
    const bloomDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })
      .format(finish)
      .replace(".", "");

    return (
      <div className="space-y-3">
        <SeedPacket
          title={fill(p.title, { name })}
          varietyLabel={p.variety}
          variety={fill(t.summary.varieties[plan.goal], { n: plan.juz })}
          instructions={[p.instructions, p.sowing]}
          rows={[
            { label: p.method, value: t.summary.methods[plan.method] },
            { label: p.sow, value: fill(p.perDay, { amount: unitLabel(plan.method, plan.perDay) }) },
            { label: p.water, value: fill(p.days, { n: plan.days }) },
            { label: p.care, value: p.modes[plan.mode] },
          ]}
          bloomLabel={p.bloom}
          bloomDate={bloomDate}
          seeds={known > 0 ? plural(p.seeds, known, { seeds: countAyahs(plan.knownSurahs) }) : undefined}
          flipHint={p.flip}
        />
        <p className="text-center font-semibold text-rose-deep">{t.summary.enterHint}</p>
      </div>
    );
  }

  // El botón "Siguiente" solo hace falta donde hay que escribir o elegir varias cosas,
  // o si vuelves atrás a una pregunta ya contestada
  const showNext =
    !advancing &&
    step !== "summary" &&
    (step === "welcome" ||
      step === "surahs" ||
      (step === "goal" && plan.goal === "juz" && answered.has("goal")) ||
      answered.has(step) ||
      (step === "known" && knowsSome !== null));

  // Cuánto rato habla Aya en este paso (lo que tarda en escribirse su texto)
  const spoken = step === "welcome" ? speech.welcome.length + t.welcome.text.length + 10 : speech[step].length;
  const talkingMs = spoken * SPEED;

  // La valla para entrar al jardín: solo al final, y si queda algo por memorizar
  const showGate = step === "summary" && estimateFinishDate(plan, new Date()) !== null;

  // Lo que ha florecido el jardín: avanza con cada pregunta y se completa en el resumen
  const gardenProgress = step === "summary" ? 1 : Math.min(index / (MAX_STEPS - 1), 0.9);

  return (
    <div className="flex w-full flex-1 flex-col lg:min-h-0">
      {/* En ordenador, si una pregunta es larga, se desplaza solo esta zona y el jardín se queda fijo abajo */}
      <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 pb-4">
          {/* Progreso */}
          {step !== "welcome" && step !== "summary" && (
            <div className="mx-auto mb-2 max-w-xl">
              <p className="text-sm text-ink-soft">{fill(t.progress, { current: index, total: questionCount })}</p>
              <div className="mt-2 h-2 rounded-full bg-rose-soft">
                <div
                  className="h-2 rounded-full bg-sage transition-all"
                  style={{ width: `${(index / questionCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* La conversación va centrada (alineada con el arco del jardín).
              lg:min-h-[340px] deja sitio para que Aya quepa entera aunque la pregunta sea corta */}
          <div className="relative mx-auto w-full max-w-xl lg:min-h-[410px]">
            {/* En ordenador, Aya de cuerpo entero fuera de la columna, a su derecha (left-full),
                así no empuja la conversación y esta se queda en el centro */}
            <div className="absolute top-0 left-full ml-6 hidden lg:block">
              <AyaFull key={step} height={400} talkingMs={talkingMs} />
            </div>

            <div className="lg:pt-2">
              {/* Aya habla: el texto aparece letra a letra y ella se mueve mientras tanto.
                  En ordenador el bocadillo se pega a la derecha, al lado de Aya (lg:justify-end) */}
              <div className="flex items-start gap-4 lg:justify-end">
                {/* En móvil y tableta, el retrato pequeño al lado del bocadillo */}
                <div className="lg:hidden">
                  <Aya key={step} size={step === "welcome" ? 96 : 64} talkingMs={talkingMs} />
                </div>
                {/* Bocadillo, con un piquito que apunta a Aya: a la izquierda en móvil, a la derecha en ordenador */}
                <div className="relative mt-2 rounded-3xl bg-surface px-6 py-4 shadow-sm">
                  <span aria-hidden="true" className="absolute top-7 -left-2 h-4 w-4 rotate-45 bg-surface lg:right-[-0.5rem] lg:left-auto" />
                  <h1 key={step} className="relative font-display text-3xl leading-snug">
                    <Typewriter text={speech[step]} speed={SPEED} />
                  </h1>
                  {step === "welcome" && (
                    <p className="relative mt-3 text-lg leading-relaxed text-ink-soft">
                      <Typewriter text={t.welcome.text} delay={speech.welcome.length * SPEED + 300} speed={SPEED} />
                    </p>
                  )}
                </div>
              </div>

              <div className={step === "summary" ? "mt-4" : "mt-6"}>{renderStep()}</div>

              {/* Navegación */}
              <div className={`mt-4 flex items-center ${step === "summary" ? "justify-center" : "justify-between"}`}>
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i - 1)}
                    className="font-semibold text-ink-soft hover:text-ink"
                  >
                    {t.back}
                  </button>
                ) : (
                  <span />
                )}
                {showNext && (
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
            </div>
          </div>
        </div>
      </div>

      {/* Jardín: siempre abajo, va floreciendo a medida que respondes, con una
          mariposa revoloteando por encima. Al final florece entero y aparece el cartel. */}
      <div className="pointer-events-none relative shrink-0">
        <div className={`transition-opacity duration-1000 ${step === "summary" ? "opacity-100" : "opacity-80"}`}>
          <GardenScene
            progress={gardenProgress}
            gate={showGate ? { label: t.summary.enter, onEnter: enterGarden } : undefined}
          />
        </div>
        <div className="hidden lg:block" aria-hidden="true">
          <Butterfly />
        </div>
      </div>
    </div>
  );
}