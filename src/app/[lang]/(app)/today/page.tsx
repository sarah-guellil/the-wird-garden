import { Today } from "@/components/today/Today";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Hoy: cómo vas y qué toca hoy. Es la pantalla principal de quien ya tiene plan.
export default async function TodayPage() {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <Today
      t={t.today}
      units={t.onboarding.perDay.units}
      varieties={t.onboarding.summary.varieties}
      locale={locale}
    />
  );
}