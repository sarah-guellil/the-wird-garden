import { Character, Daisy } from "./Character";

const STRAW = "#E9CD9C";
const STRAW_DARK = "#D9B67E";

// Yasmin: la jardinera (jardín, boutique de semillas y premios)
export function Yasmin({ size, talkingMs }: { size?: number; talkingMs?: number }) {
  return (
    <Character
      id="yasmin"
      size={size}
      talkingMs={talkingMs}
      colors={{
        background: "#F6DDE3",
        hijab: "#D98BA0",
        hijabInner: "#C27389",
        dress: "#8FA98B",
      }}
    >
      {/* Sombrero de paja */}
      <g transform="translate(60 36)">
        <ellipse cx="0" cy="0" rx="54" ry="11" fill={STRAW_DARK} />
        <ellipse cx="0" cy="-2" rx="52" ry="9" fill={STRAW} />
        <path d="M-29 -3 C-29 -32 29 -32 29 -3 Z" fill={STRAW} />
        <path d="M-29 -10 C-14 -6 14 -6 29 -10 L29 -3 C14 1 -14 1 -29 -3 Z" fill="#C97A92" />
        <path d="M-45 -1 Q0 4 45 -1" stroke={STRAW_DARK} strokeWidth="0.9" fill="none" />
      </g>
      <Daisy x={84} y={29} scale={1.15} />
    </Character>
  );
}