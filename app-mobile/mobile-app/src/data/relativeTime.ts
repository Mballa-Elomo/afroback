/** Horodatage relatif court ("à l'instant", "il y a 2h", "il y a 3j") — pas de librairie externe pour un besoin aussi simple. */
import i18n from '../i18n';

export function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return i18n.t('time.now');
  if (minutes < 60) return i18n.t('time.min', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t('time.hours', { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return i18n.t('time.days', { n: days });
  const months = Math.floor(days / 30);
  if (months < 12) return i18n.t('time.months', { n: months });
  return i18n.t('time.years', { n: Math.floor(months / 12) });
}
