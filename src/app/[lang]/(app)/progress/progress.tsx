import { ComingSoon } from "@/components/app/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";

export default async function ProgressPage() {
  const t = await getDictionary();
  return <ComingSoon title={t.nav.progress} text={t.comingSoon} />;
}