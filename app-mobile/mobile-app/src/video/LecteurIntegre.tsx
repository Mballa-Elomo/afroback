import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type { LienVideo } from './lienVideo';
import { pageLecteur } from './pageLecteur';

/**
 * Lecteur YouTube / Vimeo (téléphone) : le lecteur AFROBACK (pageLecteur.ts)
 * dans une WebView. L'abonné ne touche jamais l'interface de YouTube/Vimeo
 * (ni logo, ni « Partager »), donc ne peut pas en récupérer le lien. La page
 * a pour origine le site AFROBACK : YouTube refuse une vidéo intégrée sans
 * origine identifiable. Toute navigation hors du lecteur est bloquée.
 * Version navigateur : LecteurIntegre.web.tsx.
 */
const ORIGINE = 'https://afroback-web.vercel.app/';

export function LecteurIntegre({ lien, style, titre }: { lien: LienVideo; style?: StyleProp<ViewStyle>; titre?: string }) {
  const [charge, setCharge] = useState(false);
  const html = pageLecteur(lien, { origine: ORIGINE, titre });
  if (!html) return null;
  return (
    <View style={[style, styles.cadre]}>
      <WebView
        source={{ html, baseUrl: ORIGINE }}
        style={styles.web}
        originWhitelist={['*']}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        allowsLinkPreview={false}
        setSupportMultipleWindows={false}
        onLoadEnd={() => setCharge(true)}
        onShouldStartLoadWithRequest={(r) => r.isTopFrame === false || r.url.startsWith(ORIGINE) || r.url.startsWith('about:')}
      />
      {!charge && (
        <View style={styles.attente} pointerEvents="none">
          <ActivityIndicator color="#F0C36B" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { backgroundColor: '#000', overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#000' },
  attente: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
