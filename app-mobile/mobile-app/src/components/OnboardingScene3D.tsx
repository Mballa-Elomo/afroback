import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

/**
 * Vraie scène 3D (WebGL via `expo-gl` + `three.js`), remplace le
 * `<canvas id="afb-onb">` (scène Three.js non récupérable, script hors de
 * portée de la lecture à 256 Kio de la maquette — voir `app/onboarding/
 * index.tsx`). Composition originale, cohérente avec l'identité de marque
 * (or/bronze) : un champ de particules dorées, deux anneaux filaires
 * inclinés tournant à des vitesses différentes, un cœur lumineux pulsé.
 *
 * Intégration manuelle plutôt que via `expo-three` : ce paquet tire des
 * dépendances de tooling vulnérables (postcss/uuid/xcode) qui forceraient
 * une montée de version d'Expo cassant le SDK 54 nécessaire à Expo Go
 * (voir `context/AFROBACK.md`, 2026-09-26). `expo-gl` seul + `three` en
 * dépendance directe suffisent, sans cette contrainte.
 */
export function OnboardingScene3D({ height = 250 }: { height?: number }) {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const drawHeight = gl.drawingBufferHeight;

    // Canvas minimal requis par three.js quand on lui fournit déjà un
    // contexte WebGL réel (expo-gl) : il n'appelle jamais canvas.getContext
    // dans ce cas, mais lit/écrit toujours width/height/style et enregistre
    // des écouteurs d'événements — jamais fournis nativement par expo-gl.
    const fakeCanvas = {
      width,
      height: drawHeight,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientWidth: width,
      clientHeight: drawHeight,
    };

    const renderer = new THREE.WebGLRenderer({
      canvas: fakeCanvas as unknown as HTMLCanvasElement,
      context: gl as unknown as WebGLRenderingContext,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, drawHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / drawHeight, 0.1, 100);
    camera.position.z = 6;

    // Champ de particules dorées, dispersées en profondeur.
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 9;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xf0c36b,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Deux anneaux filaires inclinés, tailles/vitesses différentes.
    const ringOuter = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xe9be77, transparent: true, opacity: 0.45 })
    );
    ringOuter.rotation.x = Math.PI / 2.5;
    scene.add(ringOuter);

    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.01, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xf0c36b, transparent: true, opacity: 0.55 })
    );
    ringInner.rotation.x = Math.PI / 3.2;
    ringInner.rotation.y = Math.PI / 5;
    scene.add(ringInner);

    // Cœur lumineux, pulsé (respiration douce).
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xf7d98b, transparent: true, opacity: 0.22 })
    );
    scene.add(core);

    const start = Date.now();
    const render = () => {
      frameRef.current = requestAnimationFrame(render);
      const t = (Date.now() - start) / 1000;
      particles.rotation.y = t * 0.05;
      ringOuter.rotation.z = t * 0.12;
      ringInner.rotation.z = -t * 0.18;
      const pulse = 1 + Math.sin(t * 1.4) * 0.1;
      core.scale.setScalar(pulse);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return <GLView style={[styles.gl, { height }]} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  gl: {
    width: '100%',
  },
});
