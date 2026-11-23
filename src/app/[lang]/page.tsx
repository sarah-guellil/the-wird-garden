import Image from "next/image";
import Link from "next/link";
import { GardenScene } from "@/components/garden/GardenScene";
import { BlossomTree, Daisy, Hydrangea, Rose } from "@/components/garden/plants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Una planta por tamaño de sura, de la más pequeña a la más grande
const gardenPlants = [
  { el: <Daisy />, viewBox: "-20 -56 40 60" },
  { el: <Rose />, viewBox: "-24 -72 48 76" },
  { el: <Hydrangea />, viewBox: "-34 -66 68 70" },
  { el: <BlossomTree />, viewBox: "-56 -146 112 150" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold tracking-[0.2em] text-mauve uppercase">
      {children}
    </p>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 rounded-2xl bg-rose-deep px-8 py-4 text-lg font-semibold text-surface shadow-lg shadow-rose/25 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      {children} 
    </Link>
  );
}

export default async function Home() {
  const t = await getDictionary();
  const locale = await getLocale();
  const appHref = `/${locale}/start`;

  return (
    <div className="min-h-screen">
      {/* Cabecera */}
      <header className="mx-auto flex h-24 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={48} height={48} className="rounded-xl" priority />
          <div>
            <p className="font-display text-xl leading-none whitespace-nowrap sm:text-2xl">The Wird Garden</p>
            <p className="mt-1 hidden text-xs tracking-[0.15em] text-mauve uppercase sm:block">
              {t.header.tagline}
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#how-it-works"
            className="hidden text-ink-soft transition-colors hover:text-ink md:block"
          >
            {t.header.howItWorks}
          </a>
          <LanguageSwitcher current={locale} />
          <Link href={appHref} className="font-semibold text-rose-deep transition-colors hover:text-ink">
            {t.header.signIn}
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col pt-4 sm:pt-10">
        {/* Hero: ocupa la pantalla entera para que el jardín se vea completo */}
        <section className="flex min-h-[calc(100svh-6rem)] flex-col overflow-hidden">
          <div className="mx-auto flex max-w-4xl flex-1 flex-col justify-center px-6 py-6 text-center">
            <p lang="ar" dir="rtl" className="font-display text-2xl leading-loose text-mauve lg:text-3xl">
              مِنَ الوِرْدِ إِلَى الوَرْدِ
            </p>
            <h1 className="mt-2 font-display text-[2.75rem] leading-[1.08] sm:text-6xl lg:text-[3.75rem]">
              {t.hero.titleStart}
              <br />
              <em className="text-rose-deep">{t.hero.titleEnd}</em>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t.hero.subtitle}
            </p>
            <div className="mt-7">
              <PrimaryButton href={appHref}>{t.hero.cta}</PrimaryButton>
            </div>
          </div>

          <div className="relative">
            <GardenScene />
            <div className="absolute right-4 bottom-4 hidden items-center gap-3 rounded-2xl bg-surface px-5 py-3 shadow-lg sm:flex lg:right-[8%]">
              <span className="text-2xl text-rose" aria-hidden="true">✿</span>
              <div>
                <p className="font-semibold text-rose-deep">{t.hero.badgeTitle}</p>
                <p className="text-sm text-ink-soft">{t.hero.badgeText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recita. Recuerda. Florece. */}
        <section id="how-it-works" className="bg-surface py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <Eyebrow>{t.steps.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-5xl">{t.steps.title}</h2>
            <ol className="mt-16 grid gap-6 text-start md:grid-cols-3">
              {t.steps.items.map((step, i) => (
                <li key={step.title} className="rounded-3xl bg-background p-8">
                  <span className="font-display text-5xl text-rose">{i + 1}</span>
                  <h3 className="mt-3 font-display text-3xl">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cada sura, una planta */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <Eyebrow>{t.garden.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-5xl">{t.garden.title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {t.garden.text}
          </p>
          <dl className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {t.garden.items.map((item, i) => (
              <div
                key={item.unit}
                className="flex flex-col items-center rounded-3xl border border-border bg-surface p-6"
              >
                <div className="flex h-36 items-end">
                  <svg
                    viewBox={gardenPlants[i].viewBox}
                    style={{ height: `${40 + i * 20}%` }}
                    className="w-auto"
                    aria-hidden="true"
                  >
                    {gardenPlants[i].el}
                  </svg>
                </div>
                <dt className="mt-4 text-ink-soft">{item.unit}</dt>
                <dd className="mt-1 font-display text-2xl">{item.becomes}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Del wird al ward */}
        <section className="bg-rose-soft/50 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Eyebrow>{t.name.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-5xl">{t.name.title}</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-surface p-8">
                <p lang="ar" className="pt-4 font-display text-6xl leading-[1.8] text-mauve">وِرْد</p>
                <p className="mt-3 font-display text-2xl italic">wird</p>
                <p className="mt-1 text-ink-soft">{t.name.wirdLabel}</p>
              </div>
              <div className="rounded-3xl bg-surface p-8">
                <p lang="ar" className="pt-4 font-display text-6xl leading-[1.8] text-rose-deep">وَرْد</p>
                <p className="mt-3 font-display text-2xl italic">ward</p>
                <p className="mt-1 text-ink-soft">{t.name.wardLabel}</p>
              </div>
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t.name.text}
            </p>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <Eyebrow>{t.features.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-5xl">{t.features.title}</h2>
            <div className="mt-14 grid gap-6 text-start sm:grid-cols-2">
              {t.features.items.map((f) => (
                <div key={f.title} className="rounded-3xl bg-background p-8">
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planta el Corán en tu corazón */}
        <section className="mx-auto max-w-6xl px-6 py-28 text-center">
          <h2 className="font-display text-5xl leading-tight lg:text-6xl">
            {t.closing.titleStart}
            <br />
            <em className="text-rose-deep">{t.closing.titleEnd}</em>
          </h2>
          <div className="mt-10">
            <PrimaryButton href={appHref}>{t.hero.cta}</PrimaryButton>
          </div>
        </section>
      </main>

      {/* Pie */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft">
          <p>The Wird Garden · 2026</p>
          <a
            href="https://github.com/sarah-guellil/the-wird-garden"
            className="transition-colors hover:text-ink"
          >
            {t.footer.source}
          </a>
        </div>
      </footer>
    </div>
  );
}