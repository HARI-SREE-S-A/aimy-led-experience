// LED diode shader.
// Vertex: morphs between origin and chapter target, adds shimmer noise.
// Fragment: dome highlight + chasing-light band + palette per chapter.

export const ledVertexShader = /* glsl */ `
  attribute vec3 aPanelPos;
  attribute vec3 aTargetA;
  attribute vec3 aTargetB;
  attribute float aIndex;
  attribute float aRandom;

  uniform float uTime;
  uniform float uMorphA;     // 0 = origin, 1 = targetA
  uniform float uMorphB;     // 0 = targetA, 1 = targetB
  uniform float uDispersion; // extra chaos for in-between moments
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vIndex;
  varying float vRandom;
  varying vec3  vWorldPos;
  varying float vDistanceFromTarget;
  varying float vLocalY;     // -1..1, useful for hue mixing

  // hash-based pseudo-noise per particle
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    // Smoothly blend targetA -> targetB for chapter transitions
    vec3 target = mix(aTargetA, aTargetB, uMorphB);

    // Base instance position is the panel grid; we morph toward target
    // by uMorphA. We always keep a tiny bit of the panel for visual anchor.
    vec3 instancePos = mix(aPanelPos, target, uMorphA);

    // Brief explosion outward at the moment of chapter transition
    float burst = sin(uMorphB * 3.14159) * uDispersion;
    instancePos += normalize(target - aPanelPos) * burst * 0.3;

    // The final vertex position is the instance position PLUS the scaled icosahedron vertex
    vec3 pos = instancePos + (position * uSize);

    // Per-particle shimmer driven by time + index
    float n = hash(aIndex) * 6.2831853;
    float shimmer = sin(uTime * 1.6 + n) * 0.5 + cos(uTime * 0.7 + n * 1.7) * 0.5;
    pos += normal * shimmer * 0.08;

    // Local Y for hue mixing (which "row" of the panel is this particle on)
    vLocalY = clamp(target.y / 5.0, -1.0, 1.0);

    vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vIndex = aIndex;
    vRandom = aRandom;
    vDistanceFromTarget = length(target - instancePos);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const ledFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uChapterProgress; // 0..1 within current chapter
  uniform float uIntro;
  uniform float uOutro;
  uniform vec3  uColorA;          // primary brand
  uniform vec3  uColorB;          // accent
  uniform vec3  uColorC;          // warm white
  uniform vec3  uColorBase;       // dim "off" LED
  uniform float uIntensity;       // overall brightness multiplier
  uniform float uChaseStrength;   // 0..1 chasing light band

  varying float vIndex;
  varying float vRandom;
  varying vec3  vWorldPos;
  varying float vDistanceFromTarget;
  varying float vLocalY;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    // Reconstruct normal in object space — instanceMatrix is on the
    // model matrix, and we want a *fake* dome highlight on each LED
    // regardless of the world normal. We do this from the local position
    // to keep it cheap.
    vec3 localPos = normalize(vWorldPos - vWorldPos); // noop trick
    // Instead: use the world position gradient as a fake light direction
    vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float ndotl = clamp(dot(lightDir, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    // Dome term — bright at top of each sphere
    float dome = pow(ndotl, 1.6);

    // Per-particle twinkle. Some LEDs flicker individually, like a
    // real WS2812 strip with a few dead pixels.
    float twinkleSeed = hash(vIndex * 12.345);
    float twinkle = 0.85 + 0.15 * sin(uTime * (2.0 + twinkleSeed * 3.0) + vIndex);
    // ~3% of LEDs are "stuck" dim
    if (twinkleSeed > 0.97) {
      twinkle *= 0.45;
    }

    // Chasing light band — a horizontal pulse moving left to right
    float chaseX = sin(uTime * 0.9 - vWorldPos.x * 0.18) * 0.5 + 0.5;
    float chaseY = sin(uTime * 0.7 + vWorldPos.y * 0.22) * 0.5 + 0.5;
    float chase = pow(chaseX * chaseY, 2.0) * uChaseStrength;

    // Color blending — palette rotates based on local Y so the panel
    // has a top-to-bottom gradient of brand → accent → warm white.
    float t = clamp(vLocalY * 0.5 + 0.5, 0.0, 1.0);
    vec3 palette = mix(uColorA, uColorB, smoothstep(0.0, 0.5, t));
    palette = mix(palette, uColorC, smoothstep(0.5, 1.0, t));

    // Mix in the "off" base color for non-active particles
    float distFade = smoothstep(2.5, 0.0, vDistanceFromTarget);
    vec3 col = mix(uColorBase, palette, distFade);

    // Build final brightness
    float baseBrightness = 0.55 + 0.45 * dome;
    baseBrightness *= twinkle;
    baseBrightness += chase * 0.8;
    baseBrightness *= uIntensity;
    baseBrightness *= mix(1.0, mix(uIntro, 1.0 - uOutro, 0.5), 0.5);

    col *= baseBrightness;

    // Add a small white core to the brightest pixels — this is what
    // makes a real LED feel like a diode and not a glowing sphere.
    float core = smoothstep(0.7, 1.0, baseBrightness);
    col += vec3(core) * 0.6;

    // Final dim floor so the LEDs never go fully black, just like a
    // dark LED panel that you can still see the structure of.
    col = max(col, uColorBase * 0.04);

    gl_FragColor = vec4(col, 1.0);
  }
`;
