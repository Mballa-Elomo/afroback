-- =====================================================================
-- AFROBACK — École des Héros : narration audio anglaise (2026-10-15)
-- Le back-office permet maintenant d'envoyer la narration de chaque leçon
-- en français ET en anglais ; l'app lit déjà `narration_audio_url_en`
-- quand elle existe. À exécuter dans le SQL Editor de Supabase. Idempotent.
-- =====================================================================

alter table public.ecole_lecons add column if not exists narration_audio_url_en text;
