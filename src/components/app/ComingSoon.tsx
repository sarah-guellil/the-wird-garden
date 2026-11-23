import { GardenScene } from "@/components/garden/GardenScene";

// Página provisional para las secciones que todavía no existen
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-xl flex-1 px-6 pt-10 text-center">
        <h1 className="font-display text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{text}</p>
      </div>
      <GardenScene />
    </div>
  );
}