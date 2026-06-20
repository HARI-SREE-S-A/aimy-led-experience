import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { Effects } from './Effects';
import { chapters } from '../content/chapters';

export function Scene({ isAmbient }) {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile === null) return null;

  const particleCount = isMobile ? 600 : 8000;
  const dpr = isMobile ? [1, 1] : [1, 2];

  return (
    <Canvas
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 18], fov: 35 }}
      dpr={dpr}
    >
      <color attach="background" args={['#050505']} />
      <ParticleField chapters={chapters} particleCount={particleCount} isAmbient={isAmbient} isMobile={isMobile} />
      <Effects isMobile={isMobile} />
    </Canvas>
  );
}
