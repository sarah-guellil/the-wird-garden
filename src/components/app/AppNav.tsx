"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";

// Navegación de la app: arriba a la derecha en ordenador y
// como barra fija abajo en el móvil (como en cualquier app).

type Section = "today" | "garden" | "progress" | "profile";

// Iconos sencillos dibujados con SVG (sol, flor, libro y persona)
const ICONS: Record<Section, React.ReactNode> = {
  today: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  garden: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 16c-3 0-5-2-5-4 2 0 5 1 5 4Z" />
      <circle cx="12" cy="7.5" r="4" />
      <circle cx="12" cy="7.5" r="1.3" />
    </>
  ),
  progress: (
    <>
      <path d="M4 5.5c2.5-1.5 5.5-1.5 8 0v14c-2.5-1.5-5.5-1.5-8 0Z" />
      <path d="M20 5.5c-2.5-1.5-5.5-1.5-8 0v14c2.5-1.5 5.5-1.5 8 0Z" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
    </>
  ),
};

const SECTIONS: Section[] = ["today", "garden", "progress", "profile"];

export function AppNav({ t, locale }: { t: Dictionary["nav"]; locale: string }) {
  const pathname = usePathname();

  const items = SECTIONS.map((section) => {
    const href = `/${locale}/${section}`;
    return { section, href, label: t[section], active: pathname.startsWith(href) };
  });

  const icon = (section: Section) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[section]}
    </svg>
  );

  return (
    <>
      {/* Ordenador: pastillas arriba */}
      <nav aria-label={t.label} className="hidden gap-1 md:flex">
        {items.map(({ section, href, label, active }) => (
          <Link
            key={section}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-rose-soft text-rose-deep" : "text-ink-soft hover:text-ink"
            }`}
          >
            {icon(section)}
            {label}
          </Link>
        ))}
      </nav>

      {/* Móvil: barra fija abajo */}
      <nav
        aria-label={t.label}
        className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-border bg-surface md:hidden"
      >
        {items.map(({ section, href, label, active }) => (
          <Link
            key={section}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${active ? "text-rose-deep" : "text-ink-soft"}`}
          >
            {icon(section)}
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}