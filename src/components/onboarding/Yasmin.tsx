// Yasmin, la jardinera que acompaña a la usuaria.
// De momento es un marcador de posición. Cuando tengas la ilustración:
// 1. Guárdala en public/yasmin.png
// 2. Sustituye el <div> de abajo por:
//    <Image src="/yasmin.png" alt="" width={size} height={size} className="rounded-full" />
//    (y añade import Image from "next/image"; arriba del todo)

export function Yasmin({ size = 72 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-rose-soft font-display text-3xl text-rose-deep"
    >
      Y
    </div>
  );
}