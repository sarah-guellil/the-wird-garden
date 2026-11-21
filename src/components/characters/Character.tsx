// Base común de todos los personajes (Aya, Yasmin y, en el futuro, Hayat).
// Dibuja lo que comparten: cara, ojos que parpadean, boca que habla
// y la silueta del hijab. Cada personaje elige sus colores y añade
// sus propios detalles (flores, sombrero…) con "children".

export type CharacterColors = {
  background: string;
  hijab: string;
  hijabInner: string;
  dress: string;
  skin?: string;
};

type Props = {
  id: string; // nombre único, para el recorte circular del dibujo
  colors: CharacterColors;
  size?: number;
  talkingMs?: number; // cuánto rato habla: mueve la boca y se balancea
  apron?: boolean;
  children?: React.ReactNode; // detalles propios, se dibujan encima
};

export function Character({ id, colors, size = 72, talkingMs = 0, apron = true, children }: Props) {
  const talking = talkingMs > 0;
  const mouthCycles = Math.ceil(talkingMs / 300); // abrir y cerrar dura 300 ms
  const skin = colors.skin ?? "#F7DFCF";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 ${talking ? "character-talk" : ""}`}
      style={{ animationIterationCount: Math.ceil(talkingMs / 400) }}
    >
      <defs>
        <clipPath id={`${id}-circle`}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-circle)`}>
        <rect width="120" height="120" fill={colors.background} />

        {/* Ropa */}
        <path d="M14 120 C16 98 34 88 60 88 C86 88 104 98 106 120 Z" fill={colors.dress} />
        {apron && (
          <>
            <path d="M44 120 L46 98 C52 95 68 95 74 98 L76 120 Z" fill="#FBF3EA" />
            <rect x="53" y="104" width="14" height="9" rx="2.5" fill="#F0E2D3" />
          </>
        )}

        {/* Hijab y cara */}
        <path
          d="M60 18 C36 18 26 36 26 56 C26 74 30 86 22 100 C36 100 48 96 60 96 C72 96 84 100 98 100 C90 86 94 74 94 56 C94 36 84 18 60 18 Z"
          fill={colors.hijab}
        />
        <ellipse cx="60" cy="58" rx="22.5" ry="26.5" fill={colors.hijabInner} />
        <ellipse cx="60" cy="60" rx="20" ry="24" fill={skin} />
        <path d="M40 74 C46 88 74 88 80 74 C80 86 74 94 60 94 C46 94 40 86 40 74 Z" fill={colors.hijab} />

        {/* Ojos (parpadean) */}
        <g className="character-blink">
          <ellipse cx="52.5" cy="59" rx="2.1" ry="2.6" fill="#3D2B33" />
          <ellipse cx="67.5" cy="59" rx="2.1" ry="2.6" fill="#3D2B33" />
          <circle cx="53.2" cy="58.1" r="0.7" fill="#FFFFFF" />
          <circle cx="68.2" cy="58.1" r="0.7" fill="#FFFFFF" />
        </g>

        {/* Cejas y mejillas */}
        <path d="M48.5 53.5 Q52.5 51.5 56 53" stroke="#8A6A5C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M64 53 Q67.5 51.5 71.5 53.5" stroke="#8A6A5C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="47.5" cy="66" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.55" />
        <ellipse cx="72.5" cy="66" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.55" />

        {/* Boca: sonrisa y boca abierta, que se turnan al hablar */}
        <path
          d="M55.5 68.5 Q60 72.5 64.5 68.5"
          stroke="#B5647D"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          className={talking ? "character-mouth-closed" : ""}
          style={{ animationIterationCount: mouthCycles }}
        />
        <ellipse
          cx="60"
          cy="69.5"
          rx="3.2"
          ry="2.7"
          fill="#A04F67"
          opacity="0"
          className={talking ? "character-mouth-open" : ""}
          style={{ animationIterationCount: mouthCycles }}
        />

        {/* Detalles propios de cada personaje */}
        {children}
      </g>
    </svg>
  );
}

// ---------- Piezas decorativas que pueden usar los personajes ----------

export function Daisy({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-4.5"
          rx="1.9"
          ry="3.8"
          fill="#FFFFFF"
          stroke="#EBCBD4"
          strokeWidth="0.5"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r="2.6" fill="#E2B54B" />
      <path d="M3 3 C8 5 11 4 13 1 C9 0 5 1 3 3 Z" fill="#7F9C7B" />
    </g>
  );
}

export function Rose({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="5" fill="#C97A92" />
      <path
        d="M0.5 0 a1.2 1.2 0 1 1 -2.4 0 a2.4 2.4 0 1 1 4.8 0 a3.6 3.6 0 1 1 -7.2 0"
        fill="none"
        stroke="#9E4F67"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M4 3 C8 5 11 4 13 1 C9 0 6 1 4 3 Z" fill="#7F9C7B" />
    </g>
  );
}