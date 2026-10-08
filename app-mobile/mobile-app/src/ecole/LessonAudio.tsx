import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors, typography } from '../theme/tokens';
import { useI18n } from '../i18n';

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Lecteur de la narration d'une leçon de l'École des Héros (étape 2,
 * 2026-10-08) : gros bouton lecture / pause adapté aux enfants, barre de
 * progression qu'on touche pour avancer, temps écoulé et durée. Remplace
 * l'ancien bouton décoratif qui ne jouait rien.
 */
export function LessonAudio({ uri }: { uri: string }) {
  const { t } = useI18n();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const ended = status.duration > 0 && status.currentTime >= status.duration - 0.3 && !status.playing;

  // Changement de leçon : on recharge le lecteur.
  useEffect(() => {
    player.replace(uri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (ended) player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.96 }] }]}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? t('lesson.pause') : t('lesson.play')}
      >
        <Text style={styles.icon}>{status.playing ? '❚❚' : ended ? '↻' : '▶'}</Text>
      </Pressable>
      <Text style={styles.label}>{status.playing ? t('lesson.listening') : t('lesson.narration')}</Text>

      <Pressable
        style={styles.track}
        onPress={(e) => {
          if (status.duration > 0) player.seekTo((e.nativeEvent.locationX / 260) * status.duration);
        }}
        accessibilityRole="adjustable"
        accessibilityLabel={t('lesson.narration')}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </Pressable>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(status.currentTime)}</Text>
        <Text style={styles.time}>{formatTime(status.duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 26, gap: 12 },
  button: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#A0392C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A0392C',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  icon: { fontSize: 44, color: '#fff', fontFamily: typography.bodyExtraBold },
  label: { fontFamily: typography.bodySemiBold, fontSize: 15, color: colors.textBody },
  track: { width: 260, height: 12, borderRadius: 6, backgroundColor: 'rgba(237,227,212,.12)', overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 6, backgroundColor: colors.accentGoldBright },
  times: { width: 260, flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: typography.mono, fontSize: 12, color: colors.textMuted },
});
