import { ComingSoon } from "@/components/app/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";

export default async function ProfilePage() {
  const t = await getDictionary();
  return <ComingSoon title={t.nav.profile} text={t.comingSoon} />;
}