/**
 * "Choose by series" groups, derived from model names so every brand works without
 * configuration. Examples:
 *   Apple   iPhone 17 Pro Max → "17 Series", iPhone Air → "Air Series", iPhone XS → "X Series"
 *   Google  Pixel 10 Pro Fold → "Pixel 10 Series"
 *   Samsung Galaxy S26 FE → "S Series", Galaxy Z Fold8 → "Z Fold Series", Galaxy A07 → "A Series"
 *   Xiaomi  Redmi Note 15 Pro → "Redmi Note Series", Redmi 17 → "Redmi Series", Xiaomi 17T → "Xiaomi Series"
 *   Oppo    Find X9 → "Find X Series", Reno16 → "Reno Series"; Tecno Camon 30 → "Camon Series"
 *   OnePlus 15R → "OnePlus Series", Realme 16 Pro → "Realme Series"
 */

export interface SeriesGroup {
  id: string;
  label: string;
  count: number;
}

const LEADING_NOISE = new Set(['galaxy', 'moto', 'motorola', 'google']);
/** Family words that are usually followed by a sub-line ("Redmi Note", "Find X", "Z Fold", "Nord CE"). */
const PAIR_HEADS = new Set(['z', 'x', 'redmi', 'find', 'nord', 'red', 'rog']);

const lettersOf = (token: string) => /^[A-Za-z]+/.exec(token)?.[0] || '';
const digitsOf = (token: string) => /^\d+/.exec(token)?.[0] || '';

/** Keeps the name's own casing (GT, CE, HOT, ZenFone) and capitalises the first letter (air → Air). */
const prettify = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

const tokensFor = (name: string, brandName: string) => {
  const brandWords = brandName.toLowerCase().split(/\s+/);
  const tokens = name.trim().split(/\s+/);
  while (tokens.length > 1) {
    const t = tokens[0].toLowerCase();
    if (brandWords.includes(t) || LEADING_NOISE.has(t)) tokens.shift();
    else break;
  }
  return tokens;
};

/** Series id + label for one model name. */
export const seriesOf = (name: string, brandName: string): { id: string; label: string } => {
  const tokens = tokensFor(name, brandName);
  const first = tokens[0] || '';
  const next = tokens[1] || '';
  const lower = first.toLowerCase();

  // Apple iPhones: one series per generation
  if (lower === 'iphone') {
    const n = next.toLowerCase();
    if (digitsOf(n)) return { id: `gen-${digitsOf(n)}`, label: `${digitsOf(n)} Series` };
    if (['x', 'xr', 'xs'].includes(n)) return { id: 'x', label: 'X Series' };
    if (n === 'se') return { id: 'se', label: 'SE Series' };
    if (n) return { id: n, label: `${prettify(next)} Series` };
  }

  // Google Pixels: one series per generation
  if (lower === 'pixel') {
    if (digitsOf(next)) return { id: `pixel-${digitsOf(next)}`, label: `Pixel ${digitsOf(next)} Series` };
    if (next) return { id: `pixel-${next.toLowerCase()}`, label: `Pixel ${prettify(next)} Series` };
  }

  // Number-led names (OnePlus 15R, Realme 16 Pro, Xiaomi 17T, iQOO 15) → the brand's own line
  if (digitsOf(first)) return { id: 'number', label: `${brandName} Series` };

  const head = lettersOf(first);
  if (!head) return { id: 'other', label: 'Other' };

  // "Galaxy Fold" (original) belongs with the Z Fold line
  if (head.toLowerCase() === 'fold' && !digitsOf(first.slice(head.length))) {
    return { id: 'z-fold', label: 'Z Fold Series' };
  }

  // Two-word families: head word on its own, followed by a word-led token
  const headIsWholeToken = head.length === first.length;
  if (headIsWholeToken && PAIR_HEADS.has(head.toLowerCase())) {
    const sub = lettersOf(next);
    if (sub) {
      const label = `${prettify(head)} ${prettify(sub)}`;
      return { id: label.toLowerCase().replace(/\s+/g, '-'), label: `${label} Series` };
    }
  }

  return { id: head.toLowerCase(), label: `${prettify(head)} Series` };
};

const appleOrder = (id: string) => {
  if (id.startsWith('gen-')) return Number(id.slice(4));
  if (id === 'air') return 16.9; // right after the 17 Series, like the reference
  if (id === 'x') return 10.9;
  if (id === 'se') return 0;
  return -1;
};

/** Ordered series for a brand's model list (list order, or by generation for Apple/Google). */
export const buildSeries = (models: Array<{ name: string }>, brandName: string): SeriesGroup[] => {
  const groups = new Map<string, SeriesGroup & { firstIndex: number }>();
  models.forEach((m, index) => {
    const s = seriesOf(m.name, brandName);
    const g = groups.get(s.id);
    if (g) g.count += 1;
    else groups.set(s.id, { ...s, count: 1, firstIndex: index });
  });

  const list = Array.from(groups.values());
  const brand = brandName.toLowerCase();
  if (brand === 'apple') {
    list.sort((a, b) => appleOrder(b.id) - appleOrder(a.id) || a.firstIndex - b.firstIndex);
  } else if (brand === 'google') {
    const gen = (id: string) => (id.startsWith('pixel-') && /^\d+$/.test(id.slice(6)) ? Number(id.slice(6)) : -1);
    list.sort((a, b) => gen(b.id) - gen(a.id) || a.firstIndex - b.firstIndex);
  } else {
    list.sort((a, b) => a.firstIndex - b.firstIndex);
  }
  return list.map(({ firstIndex: _ignored, ...g }) => g);
};
