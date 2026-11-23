import { ComingSoon } from "@/components/app/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";

export default async function GardenPage() {
  const t = await getDictionary();
  return <ComingSoon title={t.nav.garden} text={t.comingSoon} />;
}