import { shade, type Accessory, type AvatarLook, type HairStyle } from "@/lib/avatar";

// El personaje de la usuaria, con el mismo estilo que Aya.
// - look: cómo es (piel, hijab o pelo, ropa, pañuelo, accesorio).
// - face: si es true, solo se ve la cabeza (para usarlo como foto de perfil).
//
// Se dibuja por capas, de atrás hacia delante:
// abaya → cuello → pañuelo → melena → cara → parte de arriba del pelo → accesorio.
// Así el pelo cae por delante de la abaya y del pañuelo, y no parece calva.

// Cada peinado tiene dos capas: "back" va detrás de la cara (la melena, con un hueco en
// el centro para que se vea el cuello) y "front" va encima (el nacimiento del pelo).
const HAIR: Record<HairStyle, { back: (c: string) => React.ReactNode; front: (c: string) => React.ReactNode }> = {
  long: {
    back: (c) => (
      <path
        d="M100 48 C70 48 64 72 66 100 C67 130 62 158 58 182 C72 190 86 188 92 182 L89 98 L111 98 L108 182 C114 188 128 190 142 182 C138 158 133 130 134 100 C136 72 130 48 100 48Z"
        fill={c}
      />
    ),
    front: (c) => (
      <path d="M77 86 C74 60 86 50 100 50 C114 50 126 60 123 86 C121 74 114 66 104 64 C98 70 88 74 77 86 Z" fill={c} />
    ),
  },
  bob: {
    back: (c) => (
      <path
        d="M100 48 C70 48 64 72 66 98 C67 112 68 122 72 130 C80 134 86 132 88 128 L88 98 L112 98 L112 128 C114 132 120 134 128 130 C132 122 133 112 134 98 C136 72 130 48 100 48Z"
        fill={c}
      />
    ),
    front: (c) => (
      <path d="M77 90 C72 60 86 49 100 49 C116 49 128 60 123 90 C120 78 116 70 110 66 C102 72 90 70 84 66 C80 72 78 80 77 90 Z" fill={c} />
    ),
  },
  bun: {
    back: (c) => (
      <>
        <circle cx="100" cy="40" r="15" fill={c} />
        <path d="M76 92 C72 64 84 52 100 52 C116 52 128 64 124 92 C120 76 112 70 100 70 C88 70 80 76 76 92Z" fill={c} />
      </>
    ),
    front: (c) => (
      <path d="M77 84 C75 61 87 52 100 52 C113 52 125 61 123 84 C118 70 108 64 100 64 C92 64 82 70 77 84 Z" fill={c} />
    ),
  },
  curly: {
    back: (c) =>
      [[72, 70], [68, 90], [70, 110], [74, 128], [82, 140], [128, 70], [132, 90], [130, 110], [126, 128], [118, 140], [80, 56], [92, 48], [108, 48], [120, 56]].map(
        ([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill={c} />,
      ),
    front: (c) =>
      [[80, 68], [90, 60], [100, 58], [110, 60], [120, 68]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="9" fill={c} />),
  },
};

// Accesorios: se dibujan con el centro en (0, 0) y luego se colocan con translate
export function AccessoryShape({ type }: { type: Accessory }) {
  if (type === "daisy")
    return (
      <>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <ellipse key={r} cy="-4.6" rx="2.2" ry="4" fill="#FFFFFF" stroke="#EADDE2" strokeWidth="0.5" transform={`rotate(${r})`} />
        ))}
        <circle r="2.8" fill="#E7B84B" />
      </>
    );
  if (type === "rose")
    return (
      <>
        <circle r="6" fill="#D98BA0" />
        <path d="M-3 -1 C-3 -4 3 -4 3 0 C3 3 -1 3 -1 1" stroke="#AD5C76" strokeWidth="1.2" fill="none" />
        <ellipse cx="7" cy="3" rx="3.5" ry="1.8" fill="#8FA98B" transform="rotate(25 7 3)" />
      </>
    );
  if (type === "bow")
    return (
      <g transform="rotate(-15)">
        <path d="M0 0 C-6 -7 -13 -6 -12 0 C-13 6 -6 7 0 0 Z" fill="#D98BA0" />
        <path d="M0 0 C6 -7 13 -6 12 0 C13 6 6 7 0 0 Z" fill="#D98BA0" />
        <circle r="2.6" fill="#AD5C76" />
      </g>
    );
  return null;
}

export function Avatar({ look, height = 330, face = false }: { look: AvatarLook; height?: number; face?: boolean }) {
  const { hijab, skin, hijabColor, dress, hair, hairColor, scarf, accessory } = look;
  // Sin hijab, la cabeza baja un poco para quedar pegada a los hombros
  const drop = hijab ? 0 : 16;
  const viewBox = face ? `46 ${30 + drop} 108 108` : "0 0 200 330";
  const browColor = hijab ? "#8A6A5C" : shade(hairColor, 0.95);
  const accessoryAt = hijab ? [120, 62] : hair === "bun" ? [114, 50] : [119, 60];

  return (
    <svg viewBox={viewBox} height={height} width={face ? height : (height * 200) / 330} aria-hidden="true">
      {/* Cuerpo: suelo, zapatos, abaya y brazos */}
      {!face && (
        <>
          <ellipse cx="100" cy="312" rx="80" ry="12" fill="#8FA98B" opacity="0.25" />
          <ellipse cx="84" cy="306" rx="12" ry="6" fill="#6E5560" />
          <ellipse cx="116" cy="306" rx="12" ry="6" fill="#6E5560" />
          <path
            d="M66 138 C60 200 48 262 40 300 Q70 308 100 304 Q130 308 160 300 C152 262 140 200 134 138 Z"
            fill={dress}
            stroke={shade(dress, 0.88)}
          />
          <path d="M100 214 V302" stroke={shade(dress, 0.88)} strokeWidth="1.5" />
          <path d="M70 142 C60 175 58 210 62 236" stroke={shade(dress, 0.93)} strokeWidth="15" fill="none" strokeLinecap="round" />
          <path d="M130 142 C140 175 142 210 138 236" stroke={shade(dress, 0.93)} strokeWidth="15" fill="none" strokeLinecap="round" />
          <circle cx="62" cy="240" r="6.5" fill={skin} />
          <circle cx="138" cy="240" r="6.5" fill={skin} />
        </>
      )}

      {/* Cuello y pañuelo (solo sin hijab) */}
      {!hijab && (
        <>
          <rect x="93" y={104 + drop} width="14" height="16" rx="4" fill={shade(skin, 0.94)} />
          <path d="M80 125 Q100 131 120 125 L122 138 Q100 151 78 138 Z" fill={scarf} stroke={shade(scarf, 0.85)} strokeWidth="1" />
          <path d="M83 131 Q100 140 117 131" stroke={shade(scarf, 0.85)} strokeWidth="1" fill="none" />
          <path d="M110 143 C112 155 110 167 106 177 L114 179 C118 167 119 155 116 143 Z" fill={scarf} stroke={shade(scarf, 0.85)} />
          <path d="M114 143 C120 153 124 163 124 173 L131 169 C128 159 123 149 118 142 Z" fill={shade(scarf, 0.94)} stroke={shade(scarf, 0.85)} />
          <circle cx="113" cy="143" r="5" fill={shade(scarf, 0.92)} stroke={shade(scarf, 0.85)} />
        </>
      )}

      <g transform={`translate(0 ${drop})`}>
        {hijab ? (
          <>
            {/* Hijab, que cae sobre los hombros */}
            <path
              d="M100 42 C76 42 66 60 66 80 C66 98 70 110 62 130 C72 150 84 160 100 162 C116 160 128 150 138 130 C130 110 134 98 134 80 C134 60 124 42 100 42 Z"
              fill={hijabColor}
              stroke={shade(hijabColor, 0.88)}
            />
            <ellipse cx="100" cy="82" rx="22.5" ry="26.5" fill={shade(hijabColor, 0.9)} />
            <ellipse cx="100" cy="84" rx="20" ry="24" fill={skin} />
            <path d="M80 98 C86 112 114 112 120 98 C120 112 114 120 100 120 C86 120 80 112 80 98 Z" fill={hijabColor} />
          </>
        ) : (
          <>
            {HAIR[hair].back(hairColor)}
            <ellipse cx="100" cy="84" rx="20" ry="24" fill={skin} />
            <ellipse cx="80" cy="86" rx="3" ry="4.5" fill={shade(skin, 0.94)} />
            <ellipse cx="120" cy="86" rx="3" ry="4.5" fill={shade(skin, 0.94)} />
          </>
        )}

        {/* Cara: cejas, ojos, mejillas y sonrisa */}
        <path d="M88 76.5 Q92.5 74 96.5 76" stroke={browColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M103.5 76 Q107.5 74 112 76.5" stroke={browColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <g className="character-blink">
          <ellipse cx="92.5" cy="83" rx="2.1" ry="2.6" fill="#3D2B33" />
          <ellipse cx="107.5" cy="83" rx="2.1" ry="2.6" fill="#3D2B33" />
          <circle cx="93.2" cy="82.1" r="0.7" fill="#FFFFFF" />
          <circle cx="108.2" cy="82.1" r="0.7" fill="#FFFFFF" />
        </g>
        <ellipse cx="87.5" cy="90" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.5" />
        <ellipse cx="112.5" cy="90" rx="3.6" ry="2.4" fill="#EE9FB2" opacity="0.5" />
        <path d="M95.5 92.5 Q100 96.5 104.5 92.5" stroke="#B5647D" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {!hijab && HAIR[hair].front(hairColor)}

        <g transform={`translate(${accessoryAt[0]} ${accessoryAt[1]})`}>
          <AccessoryShape type={accessory} />
        </g>
      </g>
    </svg>
  );
}