import { cookies, headers } from 'next/headers';
import { LANG_COOKIE, isLang, type Lang } from './lang';

/** Langue de la requête (cookie, sinon langue du navigateur, sinon français). */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(c)) return c;
  const accept = (await headers()).get('accept-language') ?? '';
  return /^en\b/i.test(accept.trim()) ? 'en' : 'fr';
}
