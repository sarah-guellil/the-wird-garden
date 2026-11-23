// Mariposa que revolotea sobre el jardín, en la parte de abajo de la pantalla.
// El recorrido y el aleteo están en globals.css (butterfly-fly y butterfly-flap).

export function Butterfly() {
  return (
    <div
      className="butterfly pointer-events-none absolute"
      aria-hidden="true"
    >
      <svg viewBox="-20 -16 40 32" width="34" height="28">
        {/* Alas izquierdas */}
        <g className="butterfly-wing">
          <path d="M-1 -1 C-8 -16 -20 -12 -17 -2 C-15 3 -7 2 -1 -1 Z" fill="var(--rose)" />
          <path d="M-1 1 C-7 2 -14 6 -11 12 C-7 15 -2 9 -1 1 Z" fill="var(--mauve)" />
          <circle cx="-11" cy="-6" r="2" fill="#FFFFFF" opacity="0.7" />
        </g>
        {/* Alas derechas (las mismas, en espejo) */}
        <g transform="scale(-1 1)">
          <g className="butterfly-wing">
            <path d="M-1 -1 C-8 -16 -20 -12 -17 -2 C-15 3 -7 2 -1 -1 Z" fill="var(--rose)" />
            <path d="M-1 1 C-7 2 -14 6 -11 12 C-7 15 -2 9 -1 1 Z" fill="var(--mauve)" />
            <circle cx="-11" cy="-6" r="2" fill="#FFFFFF" opacity="0.7" />
          </g>
        </g>
        {/* Cuerpo y antenas */}
        <ellipse cx="0" cy="1" rx="1.6" ry="8" fill="var(--ink)" />
        <path
          d="M0 -6 C-2 -11 -4 -13 -6 -14 M0 -6 C2 -11 4 -13 6 -14"
          stroke="var(--ink)"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}