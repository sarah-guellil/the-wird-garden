import { Daisy, Rose } from "./Character";

// Aya de cuerpo entero, sujetando el mushaf.
// Se usa en pantallas grandes, al lado de la conversación.
// - talkingMs: cuánto rato habla (mueve la boca). Parpadea sola.
// - face: si es true, solo se ve la cabeza (para usarla como foto de perfil).


const HIJAB = "#F6DDE3";
const HIJAB_INNER = "#E7BFCB";
const HIJAB_LINE = "#E2B3C1";
// Ropa en verde pastel, más clara que el mushaf para que se distingan
const DRESS = "#CFE3CB";
const DRESS_DARK = "#B7D2B2";
const DRESS_LINE = "#A9C6A4";
const SASH = "#F2C9D3";
const MUSHAF = "#4F6B4B";
const MUSHAF_EDGE = "#3B5238";
const SKIN = "#F7DFCF";
const GOLD = "#D9B67E";

export function AyaFull({
  height = 420,
  talkingMs = 0,
  face = false,
}: {
  height?: number;
  talkingMs?: number;
  face?: boolean;
}) {
  const talking = talkingMs > 0;
  const mouthCycles = Math.ceil(talkingMs / 300);

  return (
    // Con face, el viewBox "recorta" el dibujo y solo enseña la cabeza con el hijab
    <svg
      viewBox={face ? "46 30 108 108" : "0 0 200 330"}
      height={height}
      width={face ? height : (height * 200) / 330}
      aria-hidden="true"
    >
      {/* Suelo y brotes */}
      <ellipse cx="100" cy="312" rx="80" ry="12" fill={DRESS} opacity="0.25" />
      <g transform="translate(160 312)">
        <path d="M0 0 V-12" stroke="#7F9C7B" strokeWidth="2" />
        <path d="M0 -8 C-6 -12 -8 -16 -6 -18 C-2 -16 0 -12 0 -8 Z" fill="#7F9C7B" />
        <path d="M0 -10 C6 -14 8 -18 6 -20 C2 -18 0 -14 0 -10 Z" fill={DRESS} />
      </g>
      <g transform="translate(36 314)">
        <path d="M0 0 V-10" stroke="#7F9C7B" strokeWidth="2" />
        <path d="M0 -7 C-5 -10 -7 -14 -5 -15 C-2 -14 0 -10 0 -7 Z" fill="#7F9C7B" />
      </g>

      {/* Zapatos y abaya larga, con un poco de vuelo abajo */}
      <ellipse cx="84" cy="306" rx="12" ry="6" fill="#6E5560" />
      <ellipse cx="116" cy="306" rx="12" ry="6" fill="#6E5560" />
      <path
        d="M66 138 C60 200 48 262 40 300 Q70 308 100 304 Q130 308 160 300 C152 262 140 200 134 138 Z"
        fill={DRESS}
        stroke={DRESS_LINE}
        strokeWidth="1"
      />
      {/* Pliegues de la tela */}
      <path d="M82 214 C78 248 72 276 68 300" stroke={DRESS_LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M100 214 V302" stroke={DRESS_LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M118 214 C122 248 128 276 132 300" stroke={DRESS_LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Ribete del bajo */}
      <path d="M44 290 Q70 298 100 294 Q130 298 156 290" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.8" />
      {/* Fajín rosa con lazo */}
      <path d="M70 206 Q100 214 130 206 L131 216 Q100 224 69 216 Z" fill={SASH} />
      <path d="M118 214 C126 226 124 238 120 246 L114 240 C116 232 116 224 112 216 Z" fill={SASH} />
      <circle cx="116" cy="214" r="4" fill="#E7AEBE" />

      {/* Brazos, que sujetan el mushaf a la altura del pecho */}
      <path d="M70 142 C62 165 66 186 84 196" stroke={DRESS_DARK} strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d="M130 142 C138 165 134 186 116 196" stroke={DRESS_DARK} strokeWidth="15" fill="none" strokeLinecap="round" />

      {/* Hijab, que cae sobre los hombros */}
      <path
        d="M100 42 C76 42 66 60 66 80 C66 98 70 110 62 130 C72 150 84 160 100 162 C116 160 128 150 138 130 C130 110 134 98 134 80 C134 60 124 42 100 42 Z"
        fill={HIJAB}
        stroke={HIJAB_LINE}
        strokeWidth="1"
      />
      <ellipse cx="100" cy="82" rx="22.5" ry="26.5" fill={HIJAB_INNER} />
      <ellipse cx="100" cy="84" rx="20" ry="24" fill={SKIN} />
      <path d="M80 98 C86 112 114 112 120 98 C120 112 114 120 100 120 C86 120 80 112 80 98 Z" fill={HIJAB} />

      {/* Cara */}
      <g className="character-blink">
        <ellipse cx="92.5" cy="83" rx="2.1" ry="2.6" fill="#3D2B33" />
        <ellipse cx="107.5" cy="83" rx="2.1" ry="2.6" fill="#3D2B33" />
        <circle cx="93.2" cy="82.1" r="0.7" fill="#FFFFFF" />
        <circle cx="108.2" cy="82.1" r="0.7" fill="#FFFFFF" />
      </g>
      <path d="M88.5 77.5 Q92.5 75.5 96 77" stroke="#8A6A5C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M104 77 Q107.5 75.5 111.5 77.5" stroke="#8A6A5C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="87.5" cy="90" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.55" />
      <ellipse cx="112.5" cy="90" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.55" />
      <path
        d="M95.5 92.5 Q100 96.5 104.5 92.5"
        stroke="#B5647D"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        className={talking ? "character-mouth-closed" : ""}
        style={{ animationIterationCount: mouthCycles }}
      />
      <ellipse
        cx="100"
        cy="93.5"
        rx="3.2"
        ry="2.7"
        fill="#A04F67"
        opacity="0"
        className={talking ? "character-mouth-open" : ""}
        style={{ animationIterationCount: mouthCycles }}
      />

      {/* Flores en el hijab */}
      <Daisy x={79} y={66} scale={0.8} />
      <Rose x={121} y={62} />

      {/* Mushaf, con la estrella dorada en la tapa */}
      <g transform="translate(100 194) scale(1.25)">
        <rect x="-17" y="-12" width="34" height="24" rx="2.5" fill={MUSHAF_EDGE} />
        <rect x="-16" y="-11" width="32" height="22" rx="2" fill={MUSHAF} />
        <rect x="-12" y="-7.5" width="24" height="15" rx="1.5" fill="none" stroke={GOLD} strokeWidth="1" />
        <rect x="-3.5" y="-3.5" width="7" height="7" fill={GOLD} />
        <rect x="-3.5" y="-3.5" width="7" height="7" fill={GOLD} transform="rotate(45)" />
        <circle r="1.6" fill={MUSHAF} />
      </g>
      <circle cx="83" cy="197" r="6.5" fill={SKIN} />
      <circle cx="117" cy="197" r="6.5" fill={SKIN} />
    </svg>
  );
}