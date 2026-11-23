import { Profile } from "@/components/profile/Profile";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function ProfilePage() {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    // En ordenador la página mide justo la pantalla: el perfil se desplaza por dentro
    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
      <Profile t={t.profile} onboarding={t.onboarding} locale={locale} />
    </div>
  );
}