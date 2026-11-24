// Número de aleya dentro de una roseta dorada, como los adornos del mushaf pero en forma de flor.
// Mide 1.1em: crece y encoge con el texto que tiene al lado.
export function AyahMarker({ number }: { number: number }) {
  return (
    <svg viewBox="-12 -12 24 24" width="1.1em" height="1.1em" className="mx-1 inline-block align-middle" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <ellipse key={r} cy="-6.5" rx="3.6" ry="5.2" fill="none" stroke="#C9A86A" strokeWidth="0.9" transform={`rotate(${r})`} />
      ))}
      <circle r="6.3" fill="#FFFDF8" stroke="#C9A86A" strokeWidth="0.9" />
      <text y="2.6" textAnchor="middle" fontSize={number > 99 ? 6 : 7.5} fill="#8C6A4F" fontFamily="var(--font-sans)">
        {number}
      </text>
    </svg>
  );
}