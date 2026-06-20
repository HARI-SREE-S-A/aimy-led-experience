import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

// Post-processing stack — the signature LED look:
//   Bloom         → makes bright pixels glow into halos
export function Effects({ isMobile }) {
  if (isMobile) {
    // Ultra-light post-processing is STILL too heavy for older phones.
    // Disabling completely for buttery smooth 60fps.
    return null;
  }

  return (
    <EffectComposer disableNormalPass multisampling={4}>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={2.5} 
        mipmapBlur 
      />
      <ChromaticAberration 
        offset={new Vector2(0.0015, 0.0015)} 
        blendFunction={BlendFunction.NORMAL} 
      />
      <Noise 
        opacity={0.05} 
        blendFunction={BlendFunction.OVERLAY} 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={1.1} 
        blendFunction={BlendFunction.NORMAL} 
      />
    </EffectComposer>
  );
}
