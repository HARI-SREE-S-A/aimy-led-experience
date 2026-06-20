import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import products from '../data/products.json';
import ProductSpecTable from './ProductSpecTable';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);

  // Collect all unique images for the gallery
  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (product.image_url) imgs.push(product.image_url);
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach(img => {
        if (!imgs.includes(img)) imgs.push(img);
      });
    }
    if (imgs.length === 0) imgs.push('/woocommerce-placeholder.png');
    return imgs;
  }, [product]);

  const [activeImage, setActiveImage] = useState(allImages[0]);

  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
  }, [allImages]);

  if (!product) {
    return (
      <div className="page-container">
        <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
          <h2>Product Not Found</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="container">
          <Link to="/products" className="back-link">← Back to Catalog</Link>
        </div>
      </header>

      <main className="container section">
        <div className="product-detail-grid">
          
          <div className="product-gallery">
            <div className="product-gallery__main">
              <img 
                src={activeImage} 
                alt={product.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="product-gallery__thumbs">
                {allImages.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className={`product-gallery__thumb ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                    style={{ borderColor: activeImage === imgUrl ? 'var(--brand)' : 'transparent' }}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${product.name} thumbnail ${idx + 1}`} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="product-info">
            <span className="product-info__category">{product.categoryGroup}</span>
            <h1 className="product-info__title">{product.name}</h1>
            <p className="product-info__desc">
              The {product.name} series offers premium performance and reliability. Designed for 
              efficiency and longevity, these fixtures are ideal for various applications within 
              the {product.categoryGroup.toLowerCase()} category.
            </p>
            
            <div className="product-info__actions">
              <a href="#specifications" className="btn btn-primary">View Specifications</a>
            </div>
          </div>
        </div>

        <div id="specifications" className="product-specs-section">
          <h2>Technical <span>Specifications</span></h2>
          
          {product.models && product.models.length > 0 ? (
            <ProductSpecTable models={product.models} />
          ) : (
            <div className="empty-specs">
              Detailed specifications are not available online. Please contact us for more information.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
