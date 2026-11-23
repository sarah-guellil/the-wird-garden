import { ComingSoon } from "@/components/app/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";

// Aquí irá la pantalla de memorizar (texto, audio y contador)
export default async function LearnPage() {
  const t = await getDictionary();
  return <ComingSoon title={t.today.memorize} text={t.comingSoon} />;
}