// Conexión con la API de Quran Foundation (Quran.com).
// SOLO se usa en el servidor: necesita el Client Secret, que nunca debe llegar al navegador.
//
// Cómo funciona:
// 1. Con QF_CLIENT_ID y QF_CLIENT_SECRET (de .env.local) se pide un "token", un pase que dura 1 hora.
// 2. Con ese token se piden los datos (las aleyas de una página, traducciones…).
// 3. Las respuestas se guardan en la caché de Next unos días ("use cache"). Las condiciones
//    de Quran Foundation no permiten guardar su contenido más de una semana.
import { cacheLife } from "next/cache";

const PRELIVE = process.env.QF_ENV === "prelive";
const AUTH_URL = process.env.QF_AUTH_URL ?? (PRELIVE ? "https://prelive-oauth2.quran.foundation" : "https://oauth2.quran.foundation");
const API_URL =
  process.env.QF_API_URL ??
  (PRELIVE ? "https://apis-prelive.quran.foundation/content/api/v4" : "https://apis.quran.foundation/content/api/v4");

// Permisos que pedimos al sacar el pase. Las apps nuevas no tienen "content" sino permisos
// más concretos: texto del Corán, traducciones, datos (listas de traducciones…) y audio.
// Si tu app tuviera otros, se pueden cambiar con QF_SCOPE en .env.local.
const SCOPE = process.env.QF_SCOPE ?? "content.quran.read content.translations.read content.metadata.read content.audio.read";
const TRANSLITERATION_ID = 57;

// ---------- Token ----------

let token: { value: string; expiresAt: number } | null = null;

async function getToken() {
  // Reutilizamos el token mientras le quede más de un minuto de vida
  if (token && token.expiresAt - 60_000 > Date.now()) return token.value;

  const id = process.env.QF_CLIENT_ID;
  const secret = process.env.QF_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Faltan QF_CLIENT_ID o QF_CLIENT_SECRET en .env.local");

  const response = await fetch(`${AUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: SCOPE }),
    cache: "no-store",
  });
  // Si falla, enseñamos el motivo que da Quran Foundation (nunca incluye tus claves)
  if (!response.ok) throw new Error(`No se pudo obtener el token (${response.status}): ${await response.text()}`);

  const data: { access_token: string; expires_in: number } = await response.json();
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

// Petición a la API con las dos cabeceras que exige: el token y el Client ID
async function qf<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "x-auth-token": await getToken(), "x-client-id": process.env.QF_CLIENT_ID ?? "" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Quran Foundation respondió ${response.status} en ${path}`);
  return response.json();
}

// ---------- Traducciones ----------

type TranslationResource = { id: number; name: string; author_name: string; language_name: string };

// Traducción de cada idioma de la app: buscamos por autor en la lista de la API
// en vez de escribir el número a mano (así no nos equivocamos de id).
const TRANSLATORS: Record<string, RegExp> = { es: /garc[ií]a/i, en: /saheeh/i };

export async function getTranslation(locale: string) {
  "use cache";
  cacheLife("days");
  const { translations } = await qf<{ translations: TranslationResource[] }>("/resources/translations");
  const found = translations.find((t) => TRANSLATORS[locale]?.test(`${t.author_name} ${t.name}`));
  return found ? { id: found.id, name: found.author_name || found.name } : null;
}

// ---------- Aleyas de una página ----------

type ApiWord = { position: number; line_number: number; page_number: number; char_type_name: string; text_uthmani: string };
type ApiVerse = {
  verse_key: string;
  verse_number: number;
  page_number: number;
  words: ApiWord[];
  translations?: { resource_id: number; text: string }[];
};

export type Ayah = {
  key: string; // "78:2"
  surah: number;
  number: number;
  words: { line: number; text: string }[]; // solo las palabras que están en esta página
  translation: string;
  transliteration: string;
};

// Quita las notas al pie (<sup>…</sup>) y cualquier etiqueta HTML de las traducciones
const cleanText = (html = "") =>
  html
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();

export async function getPageAyahs(page: number, translationId: number | null): Promise<Ayah[]> {
  "use cache";
  cacheLife("days");

  const translations = [translationId, TRANSLITERATION_ID].filter(Boolean).join(",");
  const { verses } = await qf<{ verses: ApiVerse[] }>(
    `/verses/by_page/${page}?words=true&word_fields=text_uthmani,line_number,page_number&translations=${translations}&per_page=50`,
  );

  return verses.map((verse) => ({
    key: verse.verse_key,
    surah: Number(verse.verse_key.split(":")[0]),
    number: verse.verse_number,
    // Las palabras normales; el número del final de la aleya lo dibujamos nosotras (la roseta)
    words: verse.words
      .filter((w) => w.char_type_name === "word" && w.page_number === page)
      .map((w) => ({ line: w.line_number, text: w.text_uthmani })),
    translation: cleanText(verse.translations?.find((t) => t.resource_id === translationId)?.text),
    transliteration: cleanText(verse.translations?.find((t) => t.resource_id === TRANSLITERATION_ID)?.text),
  }));
}