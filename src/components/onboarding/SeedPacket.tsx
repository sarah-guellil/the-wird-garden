"use client";

import { useState } from "react";

// Sobre de semillas del resumen final.
// - Frente: la flor, "Semillas de {nombre}" y la variedad (el objetivo).
// - Reverso: las instrucciones de siembra (método, ritmo, días, modo) y la floración.
// En ordenador se ven las dos caras a la vez. En móvil solo el frente,
// y al tocarlo se da la vuelta con una animación 3D.

export type PacketRow = { label: string; value: string };

type Props = {
  title: string; // "Semillas de Sarah"
  varietyLabel: string; // "Variedad"
  variety: string; // "Corán completo"
  instructions: [string, string]; // ["Instrucciones", "de siembra"]
  rows: PacketRow[];
  bloomLabel: string; // "Floración aprox."
  bloomDate: string; // "22 ene 2029"
  seeds?: string; // "Por las 41 suras que ya sabes…"
  flipHint: string; // "Toca el sobre para ver las instrucciones"
};

// Papel kraft con el borde de arriba en zigzag, como un sobre de verdad
const paper =
  "relative flex h-[236px] w-[210px] flex-col rounded-t-md rounded-b-xl bg-[#E9D6B8] text-[#5A3E2B] shadow-[0_10px_22px_rgba(90,62,43,0.2)] before:absolute before:inset-x-0 before:top-0 before:h-3.5 before:rounded-t-md before:bg-[repeating-linear-gradient(90deg,#DCC39D_0_8px,#E9D6B8_8px_16px)]";

function Front({ title, varietyLabel, variety }: Pick<Props, "title" | "varietyLabel" | "variety">) {
  return (
    <div className={`${paper} px-4 pt-6`}>
      {/* Ventanita con la flor */}
      <div className="flex h-[92px] shrink-0 items-end justify-center rounded-t-[50%] rounded-b-lg border-2 border-[#C9A97F] bg-[#FBF3EA]">
        <svg width="72" height="84" viewBox="-45 -95 90 100" aria-hidden="true">
          <path d="M0 0 V-50" stroke="var(--sage)" strokeWidth="3" />
          <path d="M0 -20 C-14 -24 -22 -34 -20 -40 C-10 -38 -2 -30 0 -20Z" fill="var(--sage)" />
          <g transform="translate(0 -62)">
            <circle cx="-12" cy="-4" r="9" fill="var(--rose)" />
            <circle cx="12" cy="-4" r="9" fill="var(--rose)" />
            <circle cx="-7" cy="-16" r="9" fill="var(--rose)" />
            <circle cx="7" cy="-16" r="9" fill="var(--rose)" />
            <circle r="9" fill="var(--rose-deep)" />
            <circle r="5.5" fill="var(--gold)" />
          </g>
        </svg>
      </div>
      {/* Si el nombre es largo, la letra es un poco más pequeña para que quepa */}
      <p className={`mt-2 text-center font-display leading-tight ${title.length > 18 ? "text-xl" : "text-2xl"}`}>{title}</p>
      <p className="mt-1 text-center text-[10px] tracking-[0.14em] uppercase">{varietyLabel}</p>
      <p className="text-center font-display text-lg text-rose-deep">{variety}</p>
      <p className="mt-auto pb-3 text-center text-[9px] tracking-[0.18em]">THE WIRD GARDEN</p>
    </div>
  );
}

function Back({ instructions, rows, bloomLabel, bloomDate, seeds }: Omit<Props, "title" | "varietyLabel" | "variety" | "flipHint">) {
  return (
    <div className={`${paper} px-3.5 pt-6 font-mono`}>
      <p className="text-center font-display text-base leading-tight">
        <span className="block font-sans text-[8.5px] tracking-[0.2em] text-[#8C6A4F] uppercase">{instructions[0]}</span>
        {instructions[1]}
      </p>
      <hr className="my-2 border-t-[1.5px] border-dashed border-[#B08968]" />
      {rows.map((row) => (
        // Etiqueta ...... valor, como en un ticket
        <p key={row.label} className="flex py-0.5 text-[10px] whitespace-nowrap">
          <span>{row.label}</span>
          <span className="mx-1 flex-1 overflow-hidden text-[#B08968]" aria-hidden="true">
            ........................................
          </span>
          <b>{row.value}</b>
        </p>
      ))}
      <hr className="my-2 border-t-[1.5px] border-dashed border-[#B08968]" />
      <p className="flex items-baseline justify-between text-[10px] font-bold whitespace-nowrap text-rose-deep uppercase">
        <span>{bloomLabel}</span>
        <span className="text-xs">{bloomDate}</span>
      </p>
      {seeds && <p className="mt-2 text-center font-sans text-[9.5px] leading-snug text-[#7A5A43]">{seeds}</p>}
    </div>
  );
}

export function SeedPacket(props: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="packet-in">
      {/* Ordenador: las dos caras, un poco torcidas como sobre una mesa */}
      <div className="hidden justify-center gap-6 lg:flex">
        <div className="-rotate-3">
          <Front {...props} />
        </div>
        <div className="rotate-2">
          <Back {...props} />
        </div>
      </div>

      {/* Móvil y tableta: una sola cara que gira al tocarla */}
      <div className="flex flex-col items-center lg:hidden">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={props.flipHint}
          className="[perspective:900px]"
        >
          {/* El "giro": las dos caras están una encima de otra; la de atrás empieza girada 180° */}
          <div
            className={`relative h-[236px] w-[210px] transition-transform duration-700 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <Front {...props} />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Back {...props} />
            </div>
          </div>
        </button>
        <p className="mt-3 text-sm text-ink-soft">↻ {props.flipHint}</p>
      </div>
    </div>
  );
}