// Las 114 suras: número, nombre transliterado y página donde empieza
// en el mushaf de Medina (604 páginas).

export type Surah = { number: number; name: string; startPage: number; ayahs: number };

const NAMES = [
  "Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf",
  "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
  "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj",
  "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas",
  "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf",
  "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid",
  "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun",
  "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah",
  "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah",
  "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar",
  "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah",
  "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
  "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah",
  "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
  "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

const START_PAGES = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293,
  305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434,
  440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523,
  526, 528, 531, 534, 537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566,
  568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590, 591,
  591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601,
  601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604,
];

// Número de aleyas de cada sura (6236 en total)
const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89,
  59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30,
  52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15,
  21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

export const SURAHS: Surah[] = NAMES.map((name, i) => ({
  number: i + 1,
  name,
  startPage: START_PAGES[i],
  ayahs: AYAH_COUNTS[i],
}));

// Total de aleyas de una lista de suras: [112, 113, 114] → 15
export const countAyahs = (numbers: number[]) =>
  numbers.reduce((sum, n) => sum + AYAH_COUNTS[n - 1], 0);

// Rango de suras de cada bloque, para los atajos
export const JUZ_AMMA = { from: 78, to: 114 };
export const JUZ_TABARAK = { from: 67, to: 77 };

export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// Posición de inicio de cada sura en páginas, con decimales: cuando
// varias suras empiezan en la misma página, la página se reparte entre ellas.
const START_POSITIONS = START_PAGES.map((page, i) => {
  const group = START_PAGES.filter((p) => p === page).length;
  const indexInGroup = START_PAGES.slice(0, i).filter((p) => p === page).length;
  return page + indexInGroup / group;
});

// Páginas que ocupa una sura, como intervalo [inicio, fin)
export function surahPages(number: number): [number, number] {
  const start = START_POSITIONS[number - 1];
  const end = number < 114 ? START_POSITIONS[number] : 605;
  return [start, end];
}

// Convierte "1, 18, 67, 78-114" en [1, 18, 67, 78, …, 114]
export function parseSurahList(text: string): number[] {
  const result = new Set<number>();
  for (const part of text.split(/[,\s]+/)) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) continue;
    const from = Number(match[1]);
    const to = Number(match[2] ?? match[1]);
    for (let n = Math.min(from, to); n <= Math.max(from, to); n++) {
      if (n >= 1 && n <= 114) result.add(n);
    }
  }
  return [...result].sort((a, b) => a - b);
}