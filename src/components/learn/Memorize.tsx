"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Ayah } from "@/lib/quran";
import { AyaFull } from "@/components/characters/AyaFull";
import { AyahMarker } from "./AyahMarker";

// Pantalla de memorizar con el método 6446: cada aleya se lee 6 veces mirando,
// 4 de memoria, 4 mirando y 6 de memoria. Al terminar, pasa sola a la siguiente.
// Pendiente: audio (fase 2), enlazar aleyas y trocear las largas (3), guardar progreso (4), tutorial (5).

type Props = {
  t: Dictionary["learn"];
  info: string; // "Página 582 · aleyas 1–11"
  surah: string; // "An-Naba"
  part: { label: string; n: number; total: number } | null; // "Tercio 1 de 3" (null si es la página entera)
  ayahs: Ayah[];
  translator: string | null;
};

type View = "arabic" | "latin" | "translation";

// Los 4 pasos del 6446. "read" = mirando el texto, "memory" = de memoria (texto oculto)
const STEPS = [
  { kind: "read", count: 6 },
  { kind: "memory", count: 4 },
  { kind: "read", count: 4 },
  { kind: "memory", count: 6 },
] as const;

// Sustituye {clave} por su valor
const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

const Icon = ({ name }: { name: "eye" | "heart" }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
    aria-hidden="true"
  >
    {name === "eye" ? (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    )}
  </svg>
);

// El texto de una aleya. Si es la actual, va pintada de rosa como con un Stabilo
// (los bordes un poco irregulares lo hacen parecer hecho a mano). Si toca recitar de memoria,
// el texto se emborrona, pero el rosa sigue ahí para que sepas por dónde vas.
function AyahText({
  active,
  hidden,
  onClick,
  text,
  number,
}: {
  active: boolean;
  hidden: boolean;
  onClick: () => void;
  text: string;
  number: number;
}) {
  // La última palabra va pegada a la roseta (whitespace-nowrap), para que el número
  // nunca se quede solo al principio de la línea siguiente
  const words = text.split(" ");
  const last = words.pop();
  const blur = hidden ? "blur-[10px] select-none" : undefined;

  // Es un <span> (no un <button>) para que el texto fluya palabra a palabra entre líneas
  // como texto normal. role="button" y tabIndex hacen que se pueda usar con el teclado.
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={`cursor-pointer rounded-md transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone] ${
        active
          ? "rounded-[10px_4px_12px_5px/6px_12px_5px_10px] bg-[#f5c3d2] px-2 text-ink"
          : "text-ink/85 hover:text-ink"
      }`}
    >
      {words.length > 0 && <span className={blur}>{words.join(" ")} </span>}
      <span className="whitespace-nowrap">
        <span className={blur}>{last}</span>
        <AyahMarker number={number} />
      </span>
    </span>
  );
}

export function Memorize({ t, info, surah, part, ayahs, translator }: Props) {
  const [current, setCurrent] = useState(0); // aleya que se está memorizando
  const [step, setStep] = useState(0); // paso del 6446 (0 a 3)
  const [reps, setReps] = useState(0); // repeticiones hechas en este paso
  const [peek, setPeek] = useState(false); // "echar un vistazo" en los pasos de memoria
  const [finished, setFinished] = useState(false);
  const [view, setView] = useState<View>("arabic");

  const { kind, count } = STEPS[step];
  const hide =
    kind === "memory" && !peek && !finished && view !== "translation";

  // Cada toque del botón grande es una repetición. Al completar un paso, pasa al siguiente;
  // al completar los 4, pasa a la siguiente aleya; y al acabar la última, se termina el trozo.
  function tap() {
    setPeek(false);
    if (reps + 1 < count) return setReps(reps + 1);
    setReps(0);
    if (step < STEPS.length - 1) return setStep(step + 1);
    setStep(0);
    if (current < ayahs.length - 1) return setCurrent(current + 1);
    setFinished(true);
  }

  // Tocar otra aleya: empieza su 6446 desde el principio
  function choose(index: number) {
    setCurrent(index);
    setStep(0);
    setReps(0);
    setPeek(false);
    setFinished(false);
  }

  // Lo que dice Aya y el título junto al contador, según el paso
  const bubble = finished ? t.done.bubble : fill(t.aya[step], { n: count });
  const title = finished
    ? t.done.title
    : kind === "read"
      ? t.read.title
      : t.memory.title;
  const hint = finished
    ? t.done.text
    : kind === "read"
      ? t.read.text
      : t.memory.text;

  // Con la traducción se entiende el significado, pero el Corán se memoriza en árabe:
  // en esa vista no hay contador ni texto oculto, solo una nota para volver.
  const translating = view === "translation";

  // El botón grande y lo que toca hacer. Se pinta en un sitio u otro según la pantalla.
  const counter = translating ? (
    <p className="max-w-xs rounded-2xl bg-surface px-4 py-3 text-center text-sm text-ink-soft shadow-sm">
      {t.translationNote}
    </p>
  ) : (
    <div className="flex flex-col items-center gap-3 text-center">
      <button
        type="button"
        onClick={tap}
        disabled={finished}
        className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-rose-deep text-surface shadow-[0_10px_22px_rgba(173,92,118,.3)] transition-transform active:scale-95 disabled:bg-sage lg:h-[clamp(6.5rem,15svh,8rem)] lg:w-[clamp(6.5rem,15svh,8rem)]"
      >
        {finished ? (
          <span className="font-display text-4xl">✓</span>
        ) : (
          <>
            <span className="font-display text-3xl leading-none sm:text-4xl">
              {reps} / {count}
            </span>
            <span className="mt-1 text-xs">
              {kind === "read" ? t.read.tap : t.memory.tap}
            </span>
          </>
        )}
      </button>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="max-w-xs text-sm text-ink-soft">{hint}</p>
      </div>
    </div>
  );

  return (
    // Ocupa el alto que deja el menú; si la pantalla es bajita, se puede hacer scroll
    <div className="flex flex-1 overflow-y-auto">
      <div className="m-auto grid w-full max-w-6xl items-center gap-6 px-4 py-3 sm:px-6 lg:gap-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {/* Cabecera: la sura en grande a la izquierda; a la derecha, en qué tercio y aleya vas */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="overflow-hidden rounded-full bg-[#e8efe6] lg:hidden">
                <AyaFull face height={46} />
              </span>
              <div>
                <p className="text-xs font-semibold whitespace-nowrap text-ink-soft sm:text-sm">
                  {info}
                </p>
                <h1 className="font-display text-3xl leading-tight sm:text-4xl">
                  {surah}
                </h1>
              </div>
            </div>
            <div className="text-right">
              {part && (
                <div className="flex justify-end gap-1">
                  {Array.from({ length: part.total }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-6 rounded-full sm:w-10 ${i + 1 < part.n ? "bg-sage" : i + 1 === part.n ? "bg-rose" : "bg-border"}`}
                    />
                  ))}
                </div>
              )}
              {/* En el móvil, "Tercio 1 de 3" y "aleya 1 de 6" van en dos líneas para que quepa */}
              <p className="mt-1.5 text-xs font-semibold whitespace-nowrap text-ink-soft sm:text-sm">
                {part && (
                  <span className="block sm:inline">
                    {part.label}
                    <span className="hidden sm:inline"> · </span>
                  </span>
                )}
                {fill(t.ayahOf, { n: current + 1, total: ayahs.length })}
              </p>
            </div>
          </div>

          {/* Los 4 pasos del 6446: hechos en verde, el actual en rosa con sus repeticiones */}
          <div
            className={`mt-4 grid grid-cols-4 gap-1.5 transition-opacity sm:gap-2.5 ${translating ? "opacity-40" : ""}`}
          >
            {STEPS.map((s, i) => {
              const done = finished || i < step;
              const now = !finished && i === step;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border-[1.5px] px-2 py-2 sm:px-3.5 sm:py-2.5 ${
                    done
                      ? "border-[#cfe0cb] bg-[#eef3ec]"
                      : now
                        ? "border-rose-deep bg-[#fdf3f6]"
                        : "border-border bg-surface"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap sm:text-[15px]">
                    <span className="hidden text-rose-deep sm:inline">
                      <Icon name={s.kind === "read" ? "eye" : "heart"} />
                    </span>
                    <span className="sm:hidden">
                      {s.kind === "read" ? t.steps.read : t.steps.memoryShort}
                    </span>
                    <span className="hidden sm:inline">
                      {s.kind === "read" ? t.steps.read : t.steps.memory} ·
                    </span>
                    {s.count}
                    {done && " ✓"}
                  </p>
                  <div
                    className={`mt-1.5 gap-1 ${now ? "flex" : "hidden sm:flex"}`}
                  >
                    {Array.from({ length: s.count }, (_, k) => (
                      <span
                        key={k}
                        className={`h-1.5 w-1.5 rounded-full sm:h-2.5 sm:w-2.5 ${
                          done
                            ? "bg-sage"
                            : now && k < reps
                              ? "bg-rose-deep"
                              : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* El trozo de hoy, como en el mushaf */}
          <div className="mt-4 rounded-3xl border-[1.5px] border-[#ECDCC4] bg-[#FFFDF8] px-3 py-[clamp(0.75rem,2svh,1.25rem)] shadow-[inset_0_0_0_7px_#FBF5EA] sm:px-8">
            {view === "arabic" ? (
              // El árabe va seguido, de lado a lado del recuadro (no línea a línea como el mushaf),
              // para aprovechar el ancho. "justify" reparte las palabras para que cada línea
              // llegue a los dos bordes; la última línea va centrada.
              <p
                dir="rtl"
                lang="ar"
                className="text-justify font-quran text-[clamp(1.6rem,min(3.3vw,5svh),2.6rem)] leading-[2.1] [text-align-last:center]"
              >
                {ayahs.map((a, i) => (
                  <span key={a.key}>
                    <AyahText
                      active={i === current}
                      hidden={hide && i === current}
                      onClick={() => choose(i)}
                      text={a.words.map((w) => w.text).join(" ")}
                      number={a.number}
                    />{" "}
                  </span>
                ))}
              </p>
            ) : (
              // Transliteración o traducción: el mismo formato, texto seguido y centrado
              <p
                className={`text-center leading-[2.1] ${
                  view === "latin"
                    ? "text-[clamp(1.15rem,2vw,1.5rem)] italic"
                    : "text-[clamp(1.05rem,1.8vw,1.3rem)]"
                }`}
              >
                {ayahs.map((a, i) => (
                  <span key={a.key}>
                    <AyahText
                      active={i === current}
                      hidden={hide && i === current}
                      onClick={() => choose(i)}
                      text={
                        view === "latin" ? a.transliteration : a.translation
                      }
                      number={a.number}
                    />{" "}
                  </span>
                ))}
              </p>
            )}
            {kind === "memory" && !finished && !translating && (
              <p className="text-center">
                <button
                  type="button"
                  onClick={() => setPeek(!peek)}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-deep"
                >
                  <Icon name="eye" />
                  {peek ? t.memory.hide : t.memory.peek}
                </button>
              </p>
            )}
          </div>

          {/* Debajo del texto: el contador (solo móvil; en ordenador va junto a Aya) y cómo ver el texto */}
          <div className="mt-3 flex flex-col items-center gap-4">
            <div className="lg:hidden">{counter}</div>
            <div
              className="inline-flex rounded-full bg-rose-soft/60 p-1"
              role="radiogroup"
              aria-label={t.view}
            >
              {(["arabic", "latin", "translation"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={view === value}
                  onClick={() => setView(value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm ${
                    view === value
                      ? "bg-surface text-rose-deep shadow-sm"
                      : "text-ink-soft"
                  }`}
                >
                  {t.views[value]}
                </button>
              ))}
            </div>
          </div>

          {/* Créditos que piden las condiciones de Quran Foundation */}
          <p className="mt-3 text-center text-xs text-ink-soft">
            {t.credits}
            {translator && ` · ${fill(t.translationBy, { name: translator })}`}
          </p>
        </div>

        {/* Ordenador: Aya con lo que toca en cada paso y, debajo, el contador.
            Aya se encoge si la pantalla es bajita, para que todo quepa sin hacer scroll. */}
        <div className="hidden flex-col items-center gap-3 lg:flex">
          <p className="relative rounded-2xl bg-surface px-5 py-2.5 font-display text-xl whitespace-nowrap shadow-sm">
            {translating ? t.translationBubble : bubble}
            <span
              className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-surface"
              aria-hidden="true"
            />
          </p>
          <div className="h-[clamp(11rem,30svh,20rem)] [&>svg]:h-full [&>svg]:w-auto">
            <AyaFull height={320} />
          </div>
          {counter}
        </div>
      </div>
    </div>
  );
}