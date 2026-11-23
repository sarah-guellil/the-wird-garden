"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  ACCESSORIES,
  AVATAR_STORAGE_KEY,
  DEFAULT_LOOK,
  DRESS_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  HIJAB_COLORS,
  SKINS,
  type AvatarLook,
} from "@/lib/avatar";
import { estimateFinishDate, PLAN_STORAGE_KEY, type Plan } from "@/lib/plan";
import { saveStored, useStored } from "@/lib/useStored";
import { AccessoryShape, Avatar } from "@/components/characters/Avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { localeNames } from "@/i18n/config";

type Props = {
  t: Dictionary["profile"];
  onboarding: Dictionary["onboarding"];
  locale: Locale;
};

// Sustituye {clave} por su valor y elige singular/plural si el texto tiene "|"
function fill(text: string, vars: Record<string, string | number> = {}) {
  const [one, many = one] = text.split("|");
  const chosen = vars.n === 1 ? one : many;
  return chosen.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Fila de círculos de colores para elegir uno
function Swatches({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {colors.map((color, i) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={`${label} ${i + 1}`}
          onClick={() => onChange(color)}
          style={{ background: color }}
          className={`h-8 w-8 rounded-full border-2 border-surface transition-shadow ${
            value === color ? "shadow-[0_0_0_2.5px_var(--rose-deep)]" : "shadow-[0_0_0_1px_var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}

// Casilla cuadrada para elegir peinado o accesorio
function Tile({ selected, onClick, label, children }: { selected: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onClick}
      className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 transition-colors ${
        selected ? "border-rose-deep bg-rose-soft/50" : "border-border bg-background hover:border-rose"
      }`}
    >
      {children}
    </button>
  );
}

export function Profile({ t, onboarding, locale }: Props) {
  const savedPlan = useStored(PLAN_STORAGE_KEY);
  const savedLook = useStored(AVATAR_STORAGE_KEY);
  const plan = useMemo<Plan | null>(() => (savedPlan ? JSON.parse(savedPlan) : null), [savedPlan]);
  const stored = useMemo<AvatarLook>(() => (savedLook ? { ...DEFAULT_LOOK, ...JSON.parse(savedLook) } : DEFAULT_LOOK), [savedLook]);

  // Los cambios que está haciendo y aún no ha guardado (null = ninguno)
  const [draft, setDraft] = useState<AvatarLook | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const look = draft ?? stored;

  const change = (changes: Partial<AvatarLook>) => {
    setDraft({ ...look, ...changes });
    setJustSaved(false);
  };

  function save() {
    saveStored(AVATAR_STORAGE_KEY, look);
    setDraft(null);
    setJustSaved(true);
  }

  const label = "text-sm font-bold";
  const finish = plan ? estimateFinishDate(plan, new Date()) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-10">
      <h1 className="font-display text-4xl">{t.title}</h1>

      {/* Tu personaje: a la izquierda cómo queda, a la derecha las opciones */}
      <section className="mt-4 grid gap-5 md:grid-cols-[300px_1fr]">
        <div className="relative flex h-80 items-end justify-center rounded-3xl bg-gradient-to-b from-rose-soft/60 to-sage/15 pb-3 md:h-[400px]">
          {plan && <p className="absolute inset-x-0 top-4 text-center font-display text-2xl">{plan.name}</p>}
          <Avatar look={look} height={300} />
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">{t.character}</h2>

          {/* Con hijab / Sin hijab */}
          <div className="mt-3 inline-flex rounded-full bg-rose-soft/50 p-1" role="radiogroup" aria-label={t.character}>
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                role="radio"
                aria-checked={look.hijab === value}
                onClick={() => change({ hijab: value })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  look.hijab === value ? "bg-surface text-rose-deep shadow-sm" : "text-ink-soft"
                }`}
              >
                {value ? t.withHijab : t.withoutHijab}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className={label}>{t.skin}</p>
              <div className="mt-2">
                <Swatches colors={SKINS} value={look.skin} onChange={(skin) => change({ skin })} label={t.skin} />
              </div>
            </div>

            {look.hijab ? (
              <div>
                <p className={label}>{t.hijabColor}</p>
                <div className="mt-2">
                  <Swatches colors={HIJAB_COLORS} value={look.hijabColor} onChange={(hijabColor) => change({ hijabColor })} label={t.hijabColor} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className={label}>{t.hairStyle}</p>
                    <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t.hairStyle}>
                      {HAIR_STYLES.map((hair) => (
                        <Tile key={hair} selected={look.hair === hair} onClick={() => change({ hair })} label={t.hairStyles[hair]}>
                          <Avatar look={{ ...look, hair, accessory: "none" }} height={60} face />
                        </Tile>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={label}>{t.hairColor}</p>
                    <div className="mt-2">
                      <Swatches colors={HAIR_COLORS} value={look.hairColor} onChange={(hairColor) => change({ hairColor })} label={t.hairColor} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className={label}>{t.scarf}</p>
                  <div className="mt-2">
                    <Swatches colors={HIJAB_COLORS} value={look.scarf} onChange={(scarf) => change({ scarf })} label={t.scarf} />
                  </div>
                </div>
              </>
            )}

            <div>
              <p className={label}>{t.dress}</p>
              <div className="mt-2">
                <Swatches colors={DRESS_COLORS} value={look.dress} onChange={(dress) => change({ dress })} label={t.dress} />
              </div>
            </div>

            <div>
              <p className={label}>{t.accessory}</p>
              <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t.accessory}>
                {ACCESSORIES.map((accessory) => (
                  <Tile
                    key={accessory}
                    selected={look.accessory === accessory}
                    onClick={() => change({ accessory })}
                    label={t.accessories[accessory]}
                  >
                    {accessory === "none" ? (
                      <span className="text-[11px] text-ink-soft">{t.accessories.none}</span>
                    ) : (
                      <svg viewBox="-14 -14 28 28" width="34" height="34" aria-hidden="true">
                        <AccessoryShape type={accessory} />
                      </svg>
                    )}
                  </Tile>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!draft}
              className="rounded-2xl bg-rose-deep px-6 py-2.5 font-semibold text-surface transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.save}
            </button>
            {justSaved && (
              <p role="status" className="text-sm font-semibold text-sage">
                ✓ {t.saved}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.5fr_1fr]">
        {/* Tu plan, con un sobre de semillas en miniatura */}
        <section className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">{t.plan}</h2>
          {plan ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="relative h-24 w-[74px] shrink-0 -rotate-3 rounded-t-sm rounded-b-lg bg-[#E9D6B8] shadow-[0_5px_12px_rgba(90,62,43,0.18)] before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:bg-[repeating-linear-gradient(90deg,#DCC39D_0_4px,#E9D6B8_4px_8px)]">
                <div className="absolute inset-x-2.5 top-3 h-8 rounded-t-[50%] rounded-b-md border-[1.5px] border-[#C9A97F] bg-[#FBF3EA]" />
                <p className="absolute inset-x-0 bottom-2 text-center font-display text-[10px] leading-tight text-[#5A3E2B]">
                  {fill(onboarding.summary.packet.title, { name: plan.name })}
                </p>
              </div>
              <div className="min-w-48 flex-1 text-sm leading-relaxed">
                <p className="font-semibold">
                  {fill(onboarding.summary.varieties[plan.goal], { n: plan.juz })} · {onboarding.summary.methods[plan.method]}
                </p>
                <p>
                  {fill(onboarding.perDay.units[plan.method], { n: plan.perDay })} · {fill(onboarding.summary.packet.days, { n: plan.days })} ·{" "}
                  {onboarding.summary.packet.modes[plan.mode]}
                </p>
                {finish && (
                  <p className="text-ink-soft">
                    {t.finish}{" "}
                    {new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(finish)}
                  </p>
                )}
              </div>
              <Link href={`/${locale}/start`} className="basis-full font-semibold text-rose-deep hover:text-ink sm:basis-auto">
                {t.changePlan} →
              </Link>
            </div>
          ) : (
            <Link href={`/${locale}/start`} className="mt-3 inline-block font-semibold text-rose-deep hover:text-ink">
              {t.noPlan} →
            </Link>
          )}
        </section>

        {/* Invitación a crear cuenta (llegará con Supabase) */}
        <section className="rounded-3xl border-2 border-dashed border-rose bg-gradient-to-br from-rose-soft/40 to-sage/10 p-5">
          <h2 className="font-display text-2xl">{t.account.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t.account.text}</p>
          <button
            type="button"
            disabled
            className="mt-3 cursor-not-allowed rounded-xl bg-rose-deep/50 px-5 py-2 text-sm font-semibold text-surface"
          >
            {t.account.cta} · {t.soon}
          </button>
        </section>
      </div>

      {/* Ajustes */}
      <section className="mt-5 rounded-3xl border border-border bg-surface px-5 py-2">
        <div className="flex items-center justify-between border-b border-border py-3">
          <span>{t.settings.language}</span>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-rose-soft px-3 py-1.5 text-sm font-semibold text-rose-deep">{localeNames[locale]}</span>
            <LanguageSwitcher current={locale} />
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-border py-3">
          <span>{t.settings.reciter}</span>
          <span className="rounded-full bg-rose-soft/50 px-3 py-1 text-xs text-ink-soft">{t.soon}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span>{t.settings.reminders}</span>
          <span className="rounded-full bg-rose-soft/50 px-3 py-1 text-xs text-ink-soft">{t.soon}</span>
        </div>
      </section>
    </div>
  );
}