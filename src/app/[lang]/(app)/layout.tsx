import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/app/AppNav";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Marco de la app para quien ya tiene su plan: cabecera con el logo y la
// navegación (Hoy, Mi jardín, Progreso, Perfil).
// La carpeta (app) va entre paréntesis: agrupa estas páginas sin cambiar la URL
// (sigue siendo /es/today, no /es/app/today).
export default async function AppLayout({ children }: LayoutProps<"/[lang]">) {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    // En ordenador la página mide justo la pantalla, para que el jardín se vea siempre
    <div className="flex min-h-svh flex-col pb-16 md:pb-0 lg:h-svh">
      <header className="mx-auto flex h-16 w-full max-w-6xl shrink-0 items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={40} height={40} className="rounded-xl" />
          <span className="font-display text-xl">The Wird Garden</span>
        </Link>
        <AppNav t={t.nav} locale={locale} />
      </header>
      <main className="flex flex-1 flex-col pt-2 lg:min-h-0">{children}</main>
    </div>
  );
}