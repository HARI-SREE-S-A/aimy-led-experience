import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { Effects } from './Effects';
import { chapters } from '../content/chapters';

export function Scene() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 0, 18], fov: 35 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#050505']} />
      <ParticleField chapters={chapters} particleCount={8000} />
      <Effects />
    </Canvas>
  );
}
