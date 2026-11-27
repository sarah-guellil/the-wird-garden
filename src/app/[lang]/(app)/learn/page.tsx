import Link from "next/link";
import { Suspense } from "react";
import { Memorize } from "@/components/learn/Memorize";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { ayahsInPortion, partsPerPage } from "@/lib/portion";
import { getPageAyahs, getTranslation } from "@/lib/quran";
import { SURAHS } from "@/lib/surahs";
import type { Method } from "@/lib/plan";

// Memorizar: /es/learn?page=582&method=third&part=1&perDay=1
// Está dentro de (app), así que tiene el menú de arriba (o de abajo en el móvil).
// Los datos del Corán se piden en el servidor (aquí), y la pantalla interactiva va en <Memorize>.
export default function LearnPage({
  searchParams,
}: PageProps<"/[lang]/learn">) {
  return (
    // Suspense: mientras llegan los datos de la API se ve el mensaje de carga
    <Suspense fallback={<Loading />}>
      <LearnContent searchParams={searchParams} />
    </Suspense>
  );
}

async function Loading() {
  const t = await getDictionary();
  return (
    <p className="flex flex-1 items-center justify-center py-20 text-ink-soft">
      {t.learn.loading}
    </p>
  );
}

const METHODS: Method[] = ["ayah", "third", "half", "page"];

async function LearnContent({
  searchParams,
}: Pick<PageProps<"/[lang]/learn">, "searchParams">) {
  const params = await searchParams;
  const t = await getDictionary();
  const locale = await getLocale();

  // Leemos y comprobamos lo que viene en la URL
  const page = Math.min(604, Math.max(1, Number(params.page) || 1));
  const method = METHODS.includes(params.method as Method)
    ? (params.method as Method)
    : "third";
  const part = Math.max(1, Number(params.part) || 1);
  const perDay = Math.max(1, Number(params.perDay) || 1);

  // Pedimos los datos. Si falla la API (sin claves, sin internet…), data se queda en null
  // y enseñamos un mensaje claro en vez de romper la página.
  let data: Awaited<ReturnType<typeof loadPortion>> | null = null;
  try {
    data = await loadPortion(locale, page, method, part, perDay);
  } catch (error) {
    console.error(error);
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-display text-3xl">{t.learn.error.title}</h1>
        <p className="mt-3 text-ink-soft">{t.learn.error.text}</p>
        <Link
          href={`/${locale}/today`}
          className="mt-6 font-semibold text-rose-deep"
        >
          ← {t.learn.back}
        </Link>
      </div>
    );
  }

  const fill = (text: string, vars: Record<string, string | number>) =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

  // Cabecera. Si hoy toca una sola sura: "Página 582 · aleyas 1–9" y "An-Naba".
  // Si toca más de una, cada sura con sus aleyas: "An-Nisa 176 · Al-Ma'idah 1–2".
  const { ayahs, translation } = data;
  const groups = new Map<number, typeof ayahs>();
  ayahs.forEach((a) =>
    groups.set(a.surah, [...(groups.get(a.surah) ?? []), a]),
  );
  const range = (list: typeof ayahs) =>
    list.length === 1
      ? `${list[0].number}`
      : `${list[0].number}–${list.at(-1)!.number}`;
  const title = [...groups]
    .map(([n, list]) =>
      groups.size > 1
        ? `${SURAHS[n - 1].name} ${range(list)}`
        : SURAHS[n - 1].name,
    )
    .join(" · ");
  const info =
    groups.size > 1
      ? fill(t.learn.pageOnly, { page })
      : fill(t.learn.info, { page, ayahs: range(ayahs) });
  const total = partsPerPage(method);
  const partInfo =
    method === "third" || method === "half"
      ? {
          label: fill(t.learn.partOf[method], { n: part, total }),
          n: part,
          total,
        }
      : null;

  return (
    <Memorize
      t={t.learn}
      info={info}
      title={title}
      part={partInfo}
      ayahs={ayahs}
      translator={translation?.name ?? null}
    />
  );
}

// Trae las aleyas de la página y se queda con las de la parte que toca
async function loadPortion(
  locale: string,
  page: number,
  method: Method,
  part: number,
  perDay: number,
) {
  const translation = await getTranslation(locale);
  const all = await getPageAyahs(page, translation?.id ?? null);
  const ayahs = ayahsInPortion(all, method, part, perDay);
  if (ayahs.length === 0)
    throw new Error("Esta parte de la página no tiene aleyas");
  return { ayahs, translation };
}