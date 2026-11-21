// Cartel de madera en la entrada del jardín: "El jardín de Sarah"
export function GardenSign({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center" aria-label={text}>
      <div className="relative rounded-xl border-4 border-[#B08968] bg-[#E8D3B9] px-8 py-4 shadow-md">
        {/* Clavos */}
        <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-[#8C6A4F]" aria-hidden="true" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#8C6A4F]" aria-hidden="true" />
        <p className="font-display text-3xl text-[#5A3E2B] italic">{text}</p>
      </div>
      {/* Postes */}
      <div className="flex w-full max-w-48 justify-between px-8" aria-hidden="true">
        <span className="h-10 w-3 rounded-b bg-[#B08968]" />
        <span className="h-10 w-3 rounded-b bg-[#B08968]" />
      </div>
      {/* Hierba */}
      <div className="h-2 w-56 rounded-full bg-sage/50" aria-hidden="true" />
    </div>
  );
}