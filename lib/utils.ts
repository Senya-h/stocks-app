import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helpers for news fetching/formatting
export type DateRange = { from: string; to: string };

export function getDateRange(daysBack: number): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - Math.max(0, daysBack));

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export const formatDateToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
});

export function validateArticle(a?: RawNewsArticle | null): a is RawNewsArticle {
  if (!a) return false;
  const hasId = typeof a.id === 'number' && a.id >= 0;
  const headline = (a.headline || '').trim();
  const url = (a.url || '').trim();
  const dtOk = typeof a.datetime === 'number' && a.datetime > 0;
  const urlOk = /^https?:\/\//i.test(url);
  return hasId && headline.length > 0 && urlOk && dtOk;
}

export function formatArticle(
  a: RawNewsArticle,
  isCompanySpecific: boolean,
  symbol?: string,
  order?: number
): MarketNewsArticle {
  const headline = (a.headline || '').trim();
  const summary = (a.summary || '').trim();
  const source = (a.source || (isCompanySpecific ? (symbol || 'Company') : 'Market')).trim();
  const url = (a.url || '').trim();
  const datetime = a.datetime ?? Date.now();
  const image = a.image && a.image.startsWith('http') ? a.image : undefined;
  const related = isCompanySpecific && symbol ? symbol : (a.related || '');
  const category = isCompanySpecific ? 'company' : (a.category || 'general');

  return {
    id: typeof a.id === 'number' ? a.id : (order ?? 0),
    headline,
    summary,
    source,
    url,
    datetime,
    category,
    related,
    image,
  };
}
