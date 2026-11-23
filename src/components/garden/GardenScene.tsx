import {
  BlossomTree,
  Daisy,
  Hydrangea,
  Lavender,
  Rose,
  Tulip,
  Violet,
} from "./plants";

// Jardín panorámico. Las plantas brotan desde el centro (el arco) hacia
// los lados y luego se mecen suavemente, como con brisa.
// - progress (de 0 a 1): qué parte del jardín ha florecido. En la portada
//   vale 1 (todo); en el onboarding va creciendo con cada pregunta.
// - sign: texto del cartel que se cuelga en lo alto del arco ("El jardín de Sarah").
//   Si no se pasa, no hay cartel.
// - gate: si se pasa, aparece una valla de madera dentro del arco y un cartel en el
//   camino con el texto de "label". Al pulsar la valla (o Enter con el teclado) se
//   abren sus puertas y se llama a onEnter.
// - className: para cambiar el tamaño desde fuera. Por defecto ocupa todo el ancho
//   y mantiene sus proporciones.

type Plant = { x: number; y: number; s: number; el: React.ReactNode };

const CENTER = 600;

const plants: Plant[] = [
  // Izquierda
  { x: 120, y: 305, s: 0.9, el: <BlossomTree /> },
  { x: 60, y: 330, s: 1, el: <Daisy /> },
  { x: 205, y: 318, s: 1, el: <Lavender /> },
  { x: 255, y: 336, s: 1, el: <Daisy /> },
  { x: 300, y: 300, s: 0.9, el: <Tulip color="var(--mauve)" /> },
  { x: 345, y: 328, s: 1, el: <Rose /> },
  { x: 395, y: 296, s: 0.8, el: <Violet /> },
  { x: 430, y: 340, s: 1, el: <Daisy /> },
  { x: 470, y: 308, s: 0.9, el: <Tulip /> },
  { x: 505, y: 286, s: 0.75, el: <Violet /> },
  // Derecha
  { x: 695, y: 286, s: 0.75, el: <Violet /> },
  { x: 730, y: 310, s: 0.9, el: <Tulip /> },
  { x: 770, y: 340, s: 1, el: <Daisy /> },
  { x: 815, y: 300, s: 0.9, el: <Rose /> },
  { x: 865, y: 330, s: 1, el: <Tulip color="var(--mauve)" /> },
  { x: 930, y: 318, s: 1, el: <Hydrangea /> },
  { x: 990, y: 338, s: 1, el: <Daisy /> },
  { x: 1040, y: 304, s: 1, el: <Lavender /> },
  { x: 1110, y: 310, s: 0.85, el: <BlossomTree /> },
  { x: 1170, y: 336, s: 1, el: <Rose /> },
];

// Distancia al arco: las plantas más cercanas brotan primero
const distance = (p: Plant) => Math.abs(p.x - CENTER) / CENTER;
const byDistance = [...plants].sort((a, b) => distance(a) - distance(b));

export function GardenScene({
  progress = 1,
  sign,
  gate,
  className = "block h-[200px] w-full sm:h-auto",
}: {
  progress?: number;
  sign?: string;
  gate?: { label: string; onEnter: () => void };
  className?: string;
}) {
  const visible = byDistance.slice(0, Math.round(progress * plants.length));
  // En la portada, cada planta espera su turno; en el onboarding brotan al momento
  const staggered = progress === 1;

  return (
    <svg
      viewBox="0 140 1200 220"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      // Si hay valla, el jardín deja de ser solo decoración: la valla es un botón
      aria-hidden={gate ? undefined : true}
    >
      {/* Sol */}
      <circle cx="930" cy="190" r="28" fill="var(--gold)" opacity="0.35" />
      <circle cx="930" cy="190" r="18" fill="var(--gold)" opacity="0.5" />

      {/* Colinas */}
      <path d="M0 250 C200 200 380 225 600 215 C820 205 1000 190 1200 230 V360 H0 Z" fill="var(--sage)" opacity="0.18" />
      <path d="M0 290 C220 260 420 275 600 268 C800 262 1000 250 1200 280 V360 H0 Z" fill="var(--sage)" opacity="0.28" />

      {/* Camino */}
      <path d="M585 262 H615 L690 360 H510 Z" fill="var(--rose-soft)" opacity="0.8" />

      {/* Arco del jardín */}
      <g className="garden-grow" style={{ animationDelay: "0s" }}>
        <path
          d="M556 268 V216 a44 44 0 0 1 88 0 V268"
          fill="none"
          stroke="var(--sage)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {[[556, 232], [556, 254], [644, 224], [644, 250], [572, 186], [628, 186]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="var(--rose)" opacity="0.9" />
        ))}
      </g>

      {visible.map((p, i) => (
        <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          {/* Primero brota… */}
          <g
            className="garden-grow"
            style={{ animationDelay: staggered ? `${0.15 + distance(p) * 1.4}s` : "0s" }}
          >
            {/* …y después se mece, cada planta a su ritmo */}
            <g className="garden-sway" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
              {p.el}
            </g>
          </g>
        </g>
      ))}

      {/* Cartel con tu nombre, colgado en lo alto del arco */}
      {sign && (
        <g className="garden-grow">
          <rect x="510" y="150" width="180" height="32" rx="7" fill="#E8D3B9" stroke="#B08968" strokeWidth="3" />
          <text
            x="600"
            y="172"
            textAnchor="middle"
            className="font-display italic"
            fontSize="18"
            fill="#5A3E2B"
            // Si el nombre es largo, el texto se estrecha para caber en el cartel
            textLength={sign.length > 18 ? 164 : undefined}
            lengthAdjust="spacingAndGlyphs"
          >
            {sign}
          </text>
        </g>
      )}

      {/* Valla de madera dentro del arco + cartel en el camino. Todo junto es un botón. */}
      {gate && (
        <g
          className="garden-gate"
          role="button"
          tabIndex={0}
          aria-label={gate.label}
          onClick={gate.onEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              gate.onEnter();
            }
          }}
        >
          {/* Puertas: cada una gira sobre su bisagra cuando pasas el ratón */}
          {(["left", "right"] as const).map((side) => (
            <g key={side} className={`gate-door gate-door-${side}`}>
              {[0, 1, 2, 3].map((k) => {
                const x = (side === "left" ? 563 : 604) + k * 9.5;
                return (
                 <path key={k} d={`M${x} 266 V234 l3 -4 l3 4 V266 Z`} fill="#FFFDF9" stroke="#DCC7B5" strokeWidth="1.5" />
                );
              })}
              <rect x={side === "left" ? 561 : 602} y="240" width="37" height="4" rx="1" fill="#E9DACB" />
              <rect x={side === "left" ? 561 : 602} y="257" width="37" height="4" rx="1" fill="#E9DACB" />
            </g>
          ))}

          {/* Cartel en el camino, que se balancea un poco para llamar la atención */}
          <g className="garden-grow">
            <g className="gate-sign">
              <rect x="531" y="318" width="6" height="42" rx="2" fill="#E9DACB" />
              <rect x="663" y="318" width="6" height="42" rx="2" fill="#E9DACB" />
              <rect className="gate-sign-board" x="496" y="284" width="208" height="44" rx="9" fill="#FFFDF9" stroke="#DCC7B5" strokeWidth="3" />
              <text
                x="600"
                y="312"
                textAnchor="middle"
                className="font-display"
                fontSize="20"
                fontWeight="700"
                fill="var(--rose-deep)"
                textLength={gate.label.length > 20 ? 188 : undefined}
                lengthAdjust="spacingAndGlyphs"
              >
                {gate.label}
              </text>
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}