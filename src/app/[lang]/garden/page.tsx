import Image from "next/image";
import Link from "next/link";
import { GardenScene } from "@/components/garden/GardenScene";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Jardín de la usuaria. De momento es una página de "muy pronto":
// aquí irán la primera lección, el repaso del día y su jardín.
export default async function GardenPage() {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl shrink-0 items-center px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={40} height={40} className="rounded-xl" />
          <span className="font-display text-xl">The Wird Garden</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-xl flex-1 px-6 pt-10 text-center">
          <h1 className="font-display text-4xl">{t.gardenPage.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{t.gardenPage.text}</p>
          <Link href={`/${locale}/start`} className="mt-8 inline-block font-semibold text-rose-deep hover:text-ink">
            {t.gardenPage.back}
          </Link>
        </div>
        <GardenScene />
      </main>
    </div>
  );
}