import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Scene } from './scene/Scene';
import { Overlay } from './ui/Overlay';
import { ErrorBoundary } from './ui/ErrorBoundary';
import ProductsCatalog from './ui/ProductsCatalog';
import ProductDetail from './ui/ProductDetail';

function Home() {
  return <Overlay />;
}

function SceneWrapper() {
  const location = useLocation();
  const isAmbient = location.pathname !== '/';
  
  return (
    <div className="scene-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Scene isAmbient={isAmbient} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SceneWrapper />
      <div className="app" style={{ position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsCatalog />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
