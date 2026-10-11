import { useVideoPlayer, VideoView } from 'expo-video';
import type { StyleProp, ViewStyle } from 'react-native';
import { analyserLienVideo } from './lienVideo';
import { LecteurIntegre } from './LecteurIntegre';

/**
 * Lecteur vidéo unique de l'app (2026-10-11) : les vidéos sont désormais des
 * liens YouTube / Vimeo collés dans le back-office, lus par un lecteur
 * intégré ; les anciennes vidéos envoyées en fichier restent lues par
 * expo-video. Monter avec `key={uri}` pour changer de vidéo.
 */
export function LecteurVideo({ uri, style }: { uri: string; style?: StyleProp<ViewStyle> }) {
  const lien = analyserLienVideo(uri);
  if (lien && lien.type !== 'fichier') return <LecteurIntegre lien={lien} style={style} />;
  return <LecteurFichier uri={uri} style={style} />;
}

function LecteurFichier({ uri, style }: { uri: string; style?: StyleProp<ViewStyle> }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView style={style} player={player} allowsFullscreen allowsPictureInPicture nativeControls />;
}
