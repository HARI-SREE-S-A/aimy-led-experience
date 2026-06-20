import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Scene } from './scene/Scene';
import { Overlay } from './ui/Overlay';
import { ErrorBoundary } from './ui/ErrorBoundary';
import ProductsCatalog from './ui/ProductsCatalog';
import ProductDetail from './ui/ProductDetail';

function Home() {
  return <Overlay />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="scene-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </ErrorBoundary>
      </div>
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
