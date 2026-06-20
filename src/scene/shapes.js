// Shape generators — one per chapter.
// Each function returns an Array<Float32Array> of length = particle count,
// where each Float32Array is [x, y, z] for that particle in chapter N.
//
// All coordinates are tuned to fit roughly inside a [-10, 10] cube so the
// camera (at z ≈ 18) frames the action without needing a per-shape frustum.

import * as THREE from 'three';

// 1) PANEL — a flat LED wall with a soft wave. The "default" rest state.
function panelShape(count) {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const spacing = 0.32;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = (c - cols / 2) * spacing;
    const y = (r - rows / 2) * spacing;
    // a tiny z wave so the panel isn't perfectly flat
    const z = Math.sin(c * 0.6) * 0.15 + Math.cos(r * 0.5) * 0.1;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// 2) INDIA — particles collapse into the word "INDIA" via a 2D text mask.
// This is the standard R3F text-particle trick: render the word to an
// offscreen canvas, threshold the alpha, then map every particle to a
// pixel that is on.
function indiaShape(count) {
  try {
    const padding = 20;
    const fontSize = 220;
    const width = 720;
    const height = 240;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('No 2d context');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${fontSize}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('INDIA', width / 2, height / 2);

    const data = ctx.getImageData(padding, padding, width - padding * 2, height - padding * 2).data;
    const w = width - padding * 2;
    const h = height - padding * 2;
    const samples = [];
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const a = data[(y * w + x) * 4];
        if (a > 128) {
          const px = ((x / w) - 0.5) * 14;
          const py = -((y / h) - 0.5) * 4.5;
          samples.push([px, py, 0]);
        }
      }
    }
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const s = samples[Math.floor(Math.random() * samples.length)] || [0, 0, 0];
      positions[i * 3 + 0] = s[0] + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = s[1] + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return positions;
  } catch (err) {
    console.error('Canvas read failed, falling back to panel', err);
    return panelShape(count);
  }
}

// 3) CIRCUIT — a circuit-board grid with two horizontal trace channels
// where particles line up tight to suggest conductive traces.
function circuitShape(count) {
  const positions = new Float32Array(count * 3);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const spacing = 0.34;
  // two horizontal "trace" rows at ±1.2
  const traceRows = new Set([
    Math.floor(rows / 2) - 3,
    Math.floor(rows / 2) + 3,
  ]);
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = (c - cols / 2) * spacing;
    let y = (r - rows / 2) * spacing;
    let z = 0;
    if (traceRows.has(r)) {
      // dense trace line, almost flat
      y = (r - rows / 2) * spacing;
      z = 0.05;
    } else {
      // sparse — every third particle
      const keep = (c + r) % 3 === 0;
      if (!keep) {
        // push off-grid, they'll be hidden / faint
        z = 6;
        y *= 0.2;
      }
    }
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// 4) DISC — a flat radial disc that pulses outward.
function discShape(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // golden-angle distribution gives a nice even disc
    const r = Math.sqrt(i / count) * 8;
    const theta = i * 2.39996323; // golden angle
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r * 0.7; // squash a bit
    const z = Math.sin(r * 1.4) * 0.2;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// 5) MARQUEE — an LED billboard. A vertical column of bright dots
// with sparse off-grid particles. The "shapes" suggest a tickertape.
function marqueeShape(count) {
  const positions = new Float32Array(count * 3);
  const cols = 24;
  const rows = Math.ceil(count / cols);
  const spacing = 0.42;
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = (c - cols / 2) * spacing;
    const y = (r - rows / 2) * spacing;
    // every 4th row is bright, others dim and pushed back
    const bright = r % 4 === 0;
    const z = bright ? 0 : 4 + Math.random() * 2;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// 6) CUBE — particles form a hollow rotating cube outline.
function cubeShape(count) {
  const positions = new Float32Array(count * 3);
  const size = 5;
  for (let i = 0; i < count; i++) {
    // pick a face of the cube
    const face = i % 6;
    const t = (Math.floor(i / 6) % Math.ceil(count / 36)) / Math.ceil(count / 36);
    const u = (i % 36) / 36;
    let x, y, z;
    switch (face) {
      case 0: x = -size / 2 + t * size; y = -size / 2;     z = -size / 2 + u * size; break; // bottom
      case 1: x = -size / 2 + t * size; y =  size / 2;     z = -size / 2 + u * size; break; // top
      case 2: x = -size / 2;            y = -size / 2 + t * size; z = -size / 2 + u * size; break; // left
      case 3: x =  size / 2;            y = -size / 2 + t * size; z = -size / 2 + u * size; break; // right
      case 4: x = -size / 2 + t * size; y = -size / 2 + u * size; z = -size / 2; break; // back
      default: x = -size / 2 + t * size; y = -size / 2 + u * size; z =  size / 2; break; // front
    }
    // small jitter to soften the lines
    const j = 0.12;
    positions[i * 3 + 0] = x + (Math.random() - 0.5) * j;
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * j;
    positions[i * 3 + 2] = z + (Math.random() - 0.5) * j;
  }
  return positions;
}

// 7) DOME — a breathing dome / arc. Like the rim of a light fixture.
function domeShape(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // bottom heavy, top sparse — like a parbolic dish
    const u = Math.random();
    const v = Math.random();
    const radius = 7 * Math.sqrt(u);
    const theta = v * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    // parabolic y: 0 at edges, taller in the middle
    const y = (1 - u) * 4 - 1;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// Dispatcher. Returns the right shape array given a chapter key.
export const SHAPES = {
  panel: panelShape,
  india: indiaShape,
  circuit: circuitShape,
  disc: discShape,
  marquee: marqueeShape,
  cube: cubeShape,
  dome: domeShape,
};

export function generateChapterTargets(chapters, particleCount) {
  // returns Float32Array of length = chapters * particleCount * 3,
  // arranged as [chapter0_particle0, chapter0_particle1, ..., chapter1_particle0, ...]
  const buffer = new Float32Array(chapters.length * particleCount * 3);
  for (let c = 0; c < chapters.length; c++) {
    const shapeFn = SHAPES[chapters[c].shape] || panelShape;
    const arr = shapeFn(particleCount);
    buffer.set(arr, c * particleCount * 3);
  }
  return buffer;
}
