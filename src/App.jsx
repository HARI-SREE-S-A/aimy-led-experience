import React, { Suspense } from 'react';
import { Scene } from './scene/Scene';
import { Overlay } from './ui/Overlay';

import { ErrorBoundary } from './ui/ErrorBoundary';

export default function App() {
  return (
    <div className="app">
      <div className="scene-canvas">
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </ErrorBoundary>
      </div>
      <Overlay />
    </div>
  );
}
