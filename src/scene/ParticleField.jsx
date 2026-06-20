import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ledFragmentShader, ledVertexShader } from './ledShader.js';
import { generateChapterTargets } from './shapes.js';
import { useScrollStore } from '../scroll/store.js';

// Per-chapter visual presets. The shader reads these and the
// choreographer blends between adjacent chapters.
const CHAPTER_PALETTES = [
  { a: '#E31E24', b: '#FF4D52', c: '#FFE9B0', base: '#1a0303', chase: 0.7, intensity: 1.05 },
  { a: '#E31E24', b: '#D4A853', c: '#FFE9B0', base: '#1a0a02', chase: 0.4, intensity: 1.0  },
  { a: '#7CC8FF', b: '#E31E24', c: '#FFFFFF', base: '#020a1a', chase: 0.6, intensity: 1.0  },
  { a: '#D4A853', b: '#E31E24', c: '#FFE9B0', base: '#1a0e02', chase: 0.8, intensity: 1.0  },
  { a: '#FF4D52', b: '#FFE9B0', c: '#FFFFFF', base: '#1a0203', chase: 0.5, intensity: 1.0  },
  { a: '#FFFFFF', b: '#E31E24', c: '#FFE9B0', base: '#0a0a0a', chase: 1.0, intensity: 1.0  },
  { a: '#7CC8FF', b: '#D4A853', c: '#FFFFFF', base: '#02080f', chase: 0.3, intensity: 1.0  },
  { a: '#E31E24', b: '#FFE9B0', c: '#FFFFFF', base: '#1a0303', chase: 0.6, intensity: 1.05 },
];

const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ParticleField({ chapters, particleCount = 8000, isAmbient, isMobile }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);

  // Build the geometry once, in one place. The shader reads `position`
  // (used for the per-instance base position before morph), `aTargetA`,
  // `aTargetB` (per-chapter targets), and `aIndex`/`aRandom` (per-particle
  // seeds for shimmer and twinkle).
  const geometry = useMemo(() => {
    // Mobile optimization: Detail 0 = 20 faces. Detail 1 = 80 faces.
    // This prevents iOS Safari from instantly killing the WebGL context.
    const detail = isMobile ? 0 : 1;
    const geo = new THREE.IcosahedronGeometry(0.16, detail);

    // Base position: a flat panel grid. The shader morphs *toward*
    // aTargetA, so this acts as the "settle from" pose.
    const cols = Math.ceil(Math.sqrt(particleCount));
    const spacing = 0.32;
    const position = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      position[i * 3 + 0] = (c - cols / 2) * spacing;
      position[i * 3 + 1] = (r - cols / 2) * spacing;
      position[i * 3 + 2] = 0;
    }
    geo.setAttribute('aPanelPos', new THREE.InstancedBufferAttribute(position, 3));

    const indexes = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      indexes[i] = i;
      randoms[i] = Math.random();
    }
    geo.setAttribute('aIndex', new THREE.InstancedBufferAttribute(indexes, 1));
    geo.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));

    // Two target slots — A and B. We swap them on the fly as the user
    // scrolls between chapters, so we never have to reallocate.
    const allTargets = generateChapterTargets(chapters, particleCount);
    const targetA = new Float32Array(
      allTargets.subarray(0, particleCount * 3)
    );
    const targetB = new Float32Array(
      allTargets.subarray(0, particleCount * 3)
    );
    geo.setAttribute('aTargetA', new THREE.InstancedBufferAttribute(targetA, 3));
    geo.setAttribute('aTargetB', new THREE.InstancedBufferAttribute(targetB, 3));

    // Stash the master buffer on the geometry so the useFrame closure
    // can read it without re-deriving it.
    geo.userData.allTargets = allTargets;
    return geo;
  }, [chapters, particleCount, isMobile]);

  // Cached THREE.Color objects we mutate in place per frame to avoid GC.
  const colorScratch = useMemo(
    () => ({
      a: new THREE.Color(),
      b: new THREE.Color(),
      c: new THREE.Color(),
      base: new THREE.Color(),
    }),
    []
  );

  // Memoize the uniforms object so R3F doesn't recreate it each render.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorphA: { value: 0 },
      uMorphB: { value: 0 },
      uDispersion: { value: 0 },
      uChapterProgress: { value: 0 },
      uIntro: { value: 0 },
      uOutro: { value: 0 },
      uSize: { value: isMobile ? 1.6 : 1.0 },
      uColorA: { value: new THREE.Color(CHAPTER_PALETTES[0].a) },
      uColorB: { value: new THREE.Color(CHAPTER_PALETTES[0].b) },
      uColorC: { value: new THREE.Color(CHAPTER_PALETTES[0].c) },
      uColorBase: { value: new THREE.Color(CHAPTER_PALETTES[0].base) },
      uIntensity: { value: 1.0 },
      uChaseStrength: { value: 0.5 },
      uPixelRatio: { value: 1.0 },
    }),
    []
  );

  // Palette hexes converted once to THREE.Color so we can lerp cheaply.
  const palettes = useMemo(
    () =>
      CHAPTER_PALETTES.map((p) => ({
        a: new THREE.Color(p.a),
        b: new THREE.Color(p.b),
        c: new THREE.Color(p.c),
        base: new THREE.Color(p.base),
        intensity: p.intensity,
        chase: p.chase,
      })),
    []
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    const t = state.clock.elapsedTime;
    let { progress, chapter, chapterProgress, intro, outro } = useScrollStore.getState();

    if (isAmbient) {
      chapterProgress = 0;
      intro = 1;
      outro = 0;
    }

    const nextChapter = Math.min(chapter + 1, chapters.length - 1);
    const hasNext = nextChapter !== chapter;

    // PERFORMANCE FIX: Only upload geometry targets to the GPU when the chapter actually changes!
    // Uploading every frame was causing mobile devices to hang and overheat.
    if (mesh.userData.lastChapter !== chapter || mesh.userData.lastNextChapter !== nextChapter) {
      const attrA = mesh.geometry.getAttribute('aTargetA');
      const attrB = mesh.geometry.getAttribute('aTargetB');
      const allTargets = mesh.geometry.userData.allTargets;

      attrA.array.set(allTargets.subarray(chapter * particleCount * 3, (chapter + 1) * particleCount * 3));
      attrB.array.set(allTargets.subarray(nextChapter * particleCount * 3, (nextChapter + 1) * particleCount * 3));
      attrA.needsUpdate = true;
      attrB.needsUpdate = true;
      mesh.userData.lastChapter = chapter;
      mesh.userData.lastNextChapter = nextChapter;
    }

    const morphA = isAmbient ? 1.0 : smoothstep(0.0, 0.15, chapterProgress);
    const morphB = (hasNext && !isAmbient) ? smoothstep(0.5, 1.0, chapterProgress) : 0.0;
    const dispersion = (hasNext && !isAmbient) ? Math.sin(chapterProgress * Math.PI) : 0.0;

    mat.uniforms.uTime.value = t;
    mat.uniforms.uMorphA.value = morphA;
    mat.uniforms.uMorphB.value = morphB;
    mat.uniforms.uDispersion.value = dispersion;
    mat.uniforms.uChapterProgress.value = chapterProgress;
    mat.uniforms.uIntro.value = intro;
    mat.uniforms.uOutro.value = outro;
    mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);

    // Palette crossfade — between current chapter and next, weighted
    // by chapterProgress past 0.5. This is what makes the lighting
    // feel like a smooth light-show transition.
    const curr = palettes[chapter];
    const next = palettes[nextChapter] || curr;
    const blend = (hasNext && !isAmbient) ? smoothstep(0.4, 0.9, chapterProgress) : 0;
    colorScratch.a.copy(curr.a).lerp(next.a, blend);
    colorScratch.b.copy(curr.b).lerp(next.b, blend);
    colorScratch.c.copy(curr.c).lerp(next.c, blend);
    colorScratch.base.copy(curr.base).lerp(next.base, blend);
    mat.uniforms.uColorA.value.copy(colorScratch.a);
    mat.uniforms.uColorB.value.copy(colorScratch.b);
    mat.uniforms.uColorC.value.copy(colorScratch.c);
    mat.uniforms.uColorBase.value.copy(colorScratch.base);
    // On mobile, because we disabled Bloom post-processing, the particles appear very dark and tiny.
    // We manually multiply the intensity by 3.5 to fake the glowing halo effect directly in the shader.
    let baseIntensity = THREE.MathUtils.lerp(curr.intensity, next.intensity, blend);
    if (isMobile) baseIntensity *= 3.5;
    mat.uniforms.uIntensity.value = baseIntensity;
    mat.uniforms.uChaseStrength.value = THREE.MathUtils.lerp(curr.chase, next.chase, blend);

    // Slow whole-scene rotation driven by overall scroll progress —
    // gives the impression of looking around the panel as you read.
    const rotSpeed = isAmbient ? (t * 0.05) : (progress * Math.PI * 0.6);
    mesh.rotation.y = Math.sin(rotSpeed) * 0.25;
    mesh.rotation.x = Math.cos(rotSpeed * 0.7) * 0.1;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, particleCount]}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={ledVertexShader}
        fragmentShader={ledFragmentShader}
        uniforms={uniforms}
        transparent={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
