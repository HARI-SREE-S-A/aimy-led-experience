import React from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products.json';

export default function ProductsCatalog() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="container">
          <Link to="/" className="back-link">← Back to Experience</Link>
          <h1>Product Catalog</h1>
          <p>Explore our complete range of premium lighting solutions.</p>
        </div>
      </header>

      <main className="container section">
        <div className="product-grid">
          {products.map(product => (
            <Link key={product.id} to={`/products/${product.slug}`} className="product-card">
              <div className="product-card__image">
                <img 
                  src={product.gallery && product.gallery.length > 0 ? product.gallery[0] : product.image_url || '/woocommerce-placeholder.png'} 
                  alt={product.name} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                />
              </div>
              <div className="product-card__content">
                <span className="product-card__category">{product.categoryGroup}</span>
                <h3 className="product-card__title">{product.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
