import React from 'react';

export default function ProductSpecTable({ models }) {
  if (!models || models.length === 0) return null;

  // Extract all unique spec categories
  const specCategories = new Set();
  models.forEach(model => {
    if (model.specs) {
      Object.keys(model.specs).forEach(cat => specCategories.add(cat));
    }
  });

  const categories = Array.from(specCategories);

  return (
    <div className="spec-table-wrapper">
      <table className="spec-table">
        <thead>
          <tr>
            <th>Specification</th>
            {models.map((m, i) => (
              <th key={i}>{m.modelCode || `Model ${i+1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* General Specs */}
          <tr><td colSpan={models.length + 1} className="category-header">General Data</td></tr>
          <tr>
            <td className="spec-label">Category</td>
            {models.map((m, i) => <td key={i}>{m.category || '-'}</td>)}
          </tr>
          <tr>
            <td className="spec-label">Shapes</td>
            {models.map((m, i) => <td key={i}>{m.shapes || '-'}</td>)}
          </tr>
          <tr>
            <td className="spec-label">Rated Wattage</td>
            {models.map((m, i) => <td key={i}>{m.wattage || '-'}</td>)}
          </tr>
          <tr>
            <td className="spec-label">Warranty</td>
            {models.map((m, i) => <td key={i}>{m.warranty || '-'}</td>)}
          </tr>
          <tr>
            <td className="spec-label">MRP</td>
            {models.map((m, i) => <td key={i}>{m.mrp || '-'}</td>)}
          </tr>

          {/* Categorized Specs */}
          {categories.map(cat => {
            // Get all unique spec keys for this category across all models
            const keys = new Set();
            models.forEach(m => {
              if (m.specs && m.specs[cat]) {
                Object.keys(m.specs[cat]).forEach(k => keys.add(k));
              }
            });

            return (
              <React.Fragment key={cat}>
                <tr><td colSpan={models.length + 1} className="category-header">{cat}</td></tr>
                {Array.from(keys).map(key => (
                  <tr key={key}>
                    <td className="spec-label">{key}</td>
                    {models.map((m, i) => (
                      <td key={i}>{(m.specs && m.specs[cat] && m.specs[cat][key]) || '-'}</td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
