import Image from "next/image";
import Link from "next/link";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Onboarding: Aya hace unas preguntas y prepara el plan
export default async function StartPage() {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    // En ordenador la página mide justo la pantalla (lg:h-svh): así el jardín siempre se ve abajo
    <div className="flex min-h-svh flex-col lg:h-svh">
      <header className="mx-auto flex h-16 w-full max-w-6xl shrink-0 items-center px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={40} height={40} className="rounded-xl" />
          <span className="font-display text-xl">The Wird Garden</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col pt-2 lg:min-h-0">
        <Onboarding t={t.onboarding} locale={locale} />
      </main>
    </div>
  );
}