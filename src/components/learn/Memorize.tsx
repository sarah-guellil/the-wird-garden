"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Ayah } from "@/lib/quran";
import { ayahWords, buildSession, splitAyah } from "@/lib/session";
import { AyaFull } from "@/components/characters/AyaFull";
import { AyahMarker } from "./AyahMarker";

// Pantalla de memorizar, aleya por aleya. La interfaz es fija: cabecera arriba,
// el recuadro con la aleya en el centro y el "mando" abajo. Lo único que cambia
// es lo que hay dentro del recuadro.
// Pendiente: audio (fase 2), guardar progreso y celebración (4).

type Props = {
  t: Dictionary["learn"];
  info: string; // "Página 582 · aleyas 1–9"
  title: string; // "An-Naba" o "An-Nisa 176 · Al-Ma'idah 1–2"
  part: { label: string; n: number; total: number } | null; // "Tercio 1 de 3"
  ayahs: Ayah[];
  translator: string | null;
};

type View = "arabic" | "latin" | "translation";

// Sustituye {clave} por su valor
const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

// El resaltado tipo Stabilo: rosa, con las esquinas un poco irregulares, como hecho a mano
const STABILO =
  "rounded-[12px_5px_14px_6px/7px_14px_6px_12px] bg-[#f5c3d2] px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]";

// Tamaño del texto según lo larga que sea la aleya: las cortas, enormes; las largas, más pequeñas.
// Se limita también por el alto de la pantalla (svh) para que siempre quepa.
function arabicSize(words: number) {
  if (words <= 6) return "text-[clamp(2.2rem,min(6vw,9svh),4.2rem)]";
  if (words <= 14) return "text-[clamp(1.9rem,min(4.2vw,6.5svh),3.2rem)]";
  if (words <= 30) return "text-[clamp(1.6rem,min(3vw,5svh),2.5rem)]";
  return "text-[clamp(1.4rem,min(2.5vw,4.2svh),2.1rem)]";
}

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function Memorize({ t, info, title, part, ayahs, translator }: Props) {
  // La sesión: la lista de unidades (aleyas, trozos, aleya entera, enlazar)
  const [units] = useState(() => buildSession(ayahs));
  const [unitIndex, setUnitIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [peek, setPeek] = useState(false); // "echar un vistazo"
  const [finished, setFinished] = useState(false);
  const [view, setView] = useState<View>("arabic");

  const unit = units[unitIndex];
  const step = unit.steps[stepIndex];
  const translating = view === "translation";
  const hide = step.kind === "memory" && !peek && !finished && !translating;
  const current = unit.type === "link" ? ayahs.length - 1 : unit.ayahIndex;

  // Cada toque es una repetición. Al completar un paso pasa al siguiente,
  // al completar la unidad pasa a la siguiente, y al acabar todas se termina.
  function tap() {
    setPeek(false);
    if (reps + 1 < step.count) return setReps(reps + 1);
    setReps(0);
    if (stepIndex < unit.steps.length - 1) return setStepIndex(stepIndex + 1);
    setStepIndex(0);
    if (unitIndex < units.length - 1) return setUnitIndex(unitIndex + 1);
    setFinished(true);
  }

  // Saltar a otra aleya (con los circulitos): empieza por su primera unidad
  function jump(ayahIndex: number) {
    setUnitIndex(
      units.findIndex((u) => u.type !== "link" && u.ayahIndex === ayahIndex),
    );
    setStepIndex(0);
    setReps(0);
    setPeek(false);
    setFinished(false);
  }

  // Lo que dice Aya, según la unidad y el paso
  const bubble = finished
    ? t.done.bubble
    : translating
      ? t.translationBubble
      : unit.type === "link"
        ? t.link.bubble
        : unit.type === "join"
          ? t.join.bubble
          : fill(t.aya[stepIndex], { n: step.count });

  // Texto de una aleya en la vista elegida
  const textOf = (a: Ayah) =>
    view === "arabic"
      ? ayahWords(a).join(" ")
      : view === "latin"
        ? a.transliteration
        : a.translation;

  // Principio o final de una aleya, para enseñar la anterior y la siguiente en pequeño
  const preview = (a: Ayah, from: "start" | "end") => {
    const words = textOf(a).split(" ");
    if (words.length <= 6) return textOf(a);
    return from === "end"
      ? `… ${words.slice(-6).join(" ")}`
      : `${words.slice(0, 6).join(" ")} …`;
  };

  const blur = hide ? "blur-[10px] select-none" : "";
  const isArabic = view === "arabic";
  const dir = isArabic ? "rtl" : "ltr";

  // ---------- Lo que va dentro del recuadro ----------

  function stage() {
    // Enlazar: todo el trozo de hoy seguido
    if (unit.type === "link" && !finished) {
      return (
        <p
          dir={dir}
          className={`leading-[2.1] ${blur} ${
            isArabic
              ? "text-justify font-quran text-[clamp(1.4rem,min(2.6vw,4.4svh),2.2rem)] [text-align-last:center]"
              : "text-center text-[clamp(1rem,1.6vw,1.25rem)]"
          }`}
        >
          {ayahs.map((a) => (
            <span key={a.key}>
              {textOf(a)}
              <AyahMarker number={a.number} />{" "}
            </span>
          ))}
        </p>
      );
    }

    const ayah = ayahs[current];
    const words = ayahWords(ayah);
    const size = isArabic
      ? `font-quran ${arabicSize(words.length)}`
      : view === "latin"
        ? "text-[clamp(1.2rem,2.4vw,1.9rem)] italic"
        : "text-[clamp(1.1rem,2vw,1.6rem)]";

    // La aleya actual. Si es larga y estamos con un trozo (solo en árabe), se ven los trozos:
    // los hechos en color normal, el actual con Stabilo y los que faltan clarito.
    let body: React.ReactNode;
    if (isArabic && unit.type === "piece") {
      body = splitAyah(words).map((piece, i) => (
        <span key={i}>
          <span
            className={
              i === unit.piece
                ? `${STABILO} ${hide ? "" : "text-ink"}`
                : i > unit.piece
                  ? "text-ink/35"
                  : "text-ink"
            }
          >
            <span className={i === unit.piece ? blur : ""}>
              {piece.join(" ")}
            </span>
          </span>{" "}
        </span>
      ));
    } else {
      body = (
        <span className={finished ? "" : STABILO}>
          <span className={blur}>{textOf(ayah)}</span>
        </span>
      );
    }

    return (
      <div
        dir={dir}
        className="flex w-full flex-col items-center gap-3 text-center"
      >
        {current > 0 && !finished && (
          <p
            className={`text-ink/35 ${isArabic ? "font-quran text-xl sm:text-2xl" : "text-sm"}`}
          >
            {preview(ayahs[current - 1], "end")}
          </p>
        )}
        <p
          className={`leading-[2] ${size} ${unit.type === "piece" ? "text-justify [text-align-last:center]" : ""}`}
        >
          {body}
          <AyahMarker number={ayah.number} />
        </p>
        {current < ayahs.length - 1 && !finished && (
          <p
            className={`text-ink/35 ${isArabic ? "font-quran text-xl sm:text-2xl" : "text-sm"}`}
          >
            {preview(ayahs[current + 1], "start")}
          </p>
        )}
      </div>
    );
  }

  // ---------- Pantalla ----------

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 pb-4 sm:px-6 lg:min-h-0">
      {/* Cabecera: dónde estás y, a la derecha, Aya con su mensaje */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-soft sm:text-sm">
            {info}
          </p>
          <h1 className="truncate font-display text-2xl leading-tight sm:text-3xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="hidden rounded-2xl rounded-tr-sm bg-surface px-4 py-2 font-display text-lg whitespace-nowrap shadow-sm sm:block">
            {bubble}
          </p>
          <span className="shrink-0 overflow-hidden rounded-full bg-[#e8efe6]">
            <AyaFull face height={48} />
          </span>
        </div>
      </div>
      {/* En el móvil el mensaje de Aya va en su propia línea */}
      <p className="-mt-1 font-display text-base text-ink-soft sm:hidden">
        {bubble}
      </p>

      {/* El recuadro: siempre del mismo tamaño, ocupa todo lo que queda */}
      <div className="relative flex min-h-[45svh] flex-1 flex-col rounded-3xl border-[1.5px] border-[#ECDCC4] bg-[#FFFDF8] shadow-[inset_0_0_0_7px_#FBF5EA] lg:min-h-0">
        {/* Circulitos con las aleyas de hoy: hechas en verde, la actual en rosa */}
        <div
          dir="rtl"
          className="flex flex-wrap justify-center gap-1.5 px-4 pt-4"
        >
          {ayahs.map((a, i) => {
            const done = finished || unit.type === "link" || i < current;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => jump(i)}
                aria-label={fill(t.goTo, { n: a.number })}
                className={`flex h-7 min-w-7 items-center justify-center rounded-full border-[1.5px] px-1 text-[11px] font-semibold ${
                  !done && i === current
                    ? "border-rose-deep bg-rose-deep text-surface"
                    : done
                      ? "border-[#cfe0cb] bg-[#eef3ec] text-[#5f7a5b]"
                      : "border-border bg-surface text-ink-soft"
                }`}
              >
                {a.number}
              </button>
            );
          })}
        </div>

        {/* El texto, centrado. Si algo no cupiera, se puede hacer scroll solo aquí dentro. */}
        <div className="flex flex-1 items-center overflow-y-auto px-4 py-4 sm:px-12">
          <div className="m-auto w-full">{stage()}</div>
        </div>

        {/* Debajo del texto: trozo actual, echar un vistazo y créditos */}
        <div className="flex flex-col items-center gap-1 px-4 pb-3">
          {unit.type === "piece" && !finished && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: unit.pieces }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-8 rounded-full ${i < unit.piece ? "bg-sage" : i === unit.piece ? "bg-rose" : "bg-border"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {fill(t.pieceOf, { n: unit.piece + 1, total: unit.pieces })}
              </span>
            </div>
          )}
          {step.kind === "memory" && !finished && !translating && (
            <button
              type="button"
              onClick={() => setPeek(!peek)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-deep"
            >
              <EyeIcon />
              {peek ? t.memory.hide : t.memory.peek}
            </button>
          )}
          <p className="text-[11px] text-ink-soft">
            {t.credits}
            {translator && ` · ${fill(t.translationBy, { name: translator })}`}
          </p>
        </div>
      </div>

      {/* El mando: pasos a la izquierda, botón en el centro, dónde vas y vista a la derecha.
          Siempre en el mismo sitio, cambie lo que cambie. */}
      <div className="grid shrink-0 grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-5">
        <div className="order-2 flex justify-center gap-1.5 sm:order-none sm:justify-start">
          {unit.steps.map((s, i) => {
            const done = finished || i < stepIndex;
            const now = !finished && i === stepIndex;
            const label =
              unit.type === "link"
                ? t.steps.link
                : unit.type === "join"
                  ? t.steps.join
                  : t.steps[s.kind];
            return (
              <div
                key={i}
                className={`rounded-xl border-[1.5px] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  translating ? "opacity-40" : ""
                } ${done ? "border-[#cfe0cb] bg-[#eef3ec]" : now ? "border-rose-deep bg-[#fdf3f6]" : "border-border bg-surface"}`}
              >
                {label} {s.count}
                {done && " ✓"}
                {now && (
                  <span className="mt-1 flex gap-0.5">
                    {Array.from({ length: s.count }, (_, k) => (
                      <span
                        key={k}
                        className={`h-1.5 w-1.5 rounded-full ${k < reps ? "bg-rose-deep" : "bg-border"}`}
                      />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Centro: el botón grande. En la vista Traducción, una nota en el mismo sitio. */}
        <div className="order-1 flex justify-center sm:order-none">
          {translating ? (
            <p className="flex h-24 w-56 items-center rounded-2xl bg-surface px-4 text-center text-xs text-ink-soft shadow-sm">
              {t.translationNote}
            </p>
          ) : (
            <button
              type="button"
              onClick={tap}
              disabled={finished}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-rose-deep text-surface shadow-[0_10px_22px_rgba(173,92,118,.3)] transition-transform active:scale-95 disabled:bg-sage"
            >
              {finished ? (
                <span className="font-display text-4xl">✓</span>
              ) : (
                <>
                  <span className="font-display text-3xl leading-none">
                    {reps} / {step.count}
                  </span>
                  <span className="mt-1 text-[11px]">
                    {step.kind === "read" ? t.read.tap : t.memory.tap}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="order-3 flex flex-col items-center gap-2 sm:order-none sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">
              {finished
                ? t.done.title
                : unit.type === "link"
                  ? `${part ? `${part.label} · ` : ""}${t.steps.link}`
                  : `${part ? `${part.label} · ` : ""}${fill(t.ayahOf, { n: current + 1, total: ayahs.length })}`}
            </span>
            {part && (
              <div className="flex gap-1">
                {Array.from({ length: part.total }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${i + 1 < part.n ? "bg-sage" : i + 1 === part.n ? "bg-rose" : "bg-border"}`}
                  />
                ))}
              </div>
            )}
          </div>
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
                className={`rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
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
      </div>
    </div>
  );
}