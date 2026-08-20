/**
 * DENTIS LAB - Interactive WebGL 3D Compositions (Three.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroScene();
  initStatementScene();
  initPhilosophyScene();
});

// Mouse coordinates for global mouse tracking
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('mouseleave', () => {
  mouseX = 0;
  mouseY = 0;
});

/**
 * 1. HERO SCENE: Morphing Glass Sphere + Gyroscopic Nested Rings
 */
function initHeroScene() {
  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 500;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 7.0;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Pastel colored lights for subtle chromatic reflections (calming peach and light blue)
  const peachPointLight = new THREE.PointLight(0xffeedd, 1.5, 12);
  peachPointLight.position.set(-3, 3, 2);
  scene.add(peachPointLight);

  const icePointLight = new THREE.PointLight(0xe0f7fa, 1.8, 12);
  icePointLight.position.set(3, -3, 2);
  scene.add(icePointLight);

  // Platinum Chrome Material for morphing tooth (matching the outer rings)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdddddd,
    roughness: 0.1,
    metalness: 0.95, // High metalness for chrome look
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide
  });

  // Tooth 2D Silhouette Shape (Matching the provided molar template)
  const toothShape = new THREE.Shape();
  toothShape.moveTo(0, 3.2);
  
  // Top-left cusp curve
  toothShape.bezierCurveTo(-1.5, 3.3, -2.5, 4.2, -3.5, 4.0);
  // Left side of crown
  toothShape.bezierCurveTo(-4.5, 3.8, -4.8, 2.5, -4.5, 1.0);
  // Left neck narrowing
  toothShape.bezierCurveTo(-4.2, -0.2, -3.5, -1.0, -3.2, -1.5);
  // Left root outer curve
  toothShape.bezierCurveTo(-2.8, -2.5, -2.5, -4.0, -2.2, -5.2);
  // Left root tip curve
  toothShape.bezierCurveTo(-2.0, -5.8, -1.4, -5.8, -1.2, -5.0);
  // Left root inner curve going up to bottom cleft
  toothShape.bezierCurveTo(-0.9, -3.5, -0.6, -2.0, 0, -1.6); // bottom cleft apex
  
  // Right root inner curve going down from bottom cleft
  toothShape.bezierCurveTo(0.6, -2.0, 0.9, -3.5, 1.2, -5.0);
  // Right root tip curve
  toothShape.bezierCurveTo(1.4, -5.8, 2.0, -5.8, 2.2, -5.2);
  // Right root outer curve
  toothShape.bezierCurveTo(2.8, -2.5, 3.5, -1.0, 3.2, -1.5);
  // Right neck narrowing
  toothShape.bezierCurveTo(3.5, -1.0, 4.2, -0.2, 4.5, 1.0);
  // Right side of crown
  toothShape.bezierCurveTo(4.8, 2.5, 4.5, 3.8, 3.5, 4.0);
  // Top-right cusp curve
  toothShape.bezierCurveTo(2.5, 4.2, 1.5, 3.3, 0, 3.2);

  const extrudeSettings = {
    depth: 1.0,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.55,
    bevelThickness: 0.55
  };

  const toothGeo = new THREE.ExtrudeGeometry(toothShape, extrudeSettings);
  toothGeo.center();
  
  // Store original positions for deformation math
  const originalPositions = [];
  const posAttr = toothGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    originalPositions.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
  }

  const morphSphere = new THREE.Mesh(toothGeo, glassMaterial);
  // Scale down the mesh to fit perfectly inside the outer ring
  morphSphere.scale.set(0.18, 0.18, 0.18);
  scene.add(morphSphere);

  // Outer Ring Gyroscope (Silver & polished chrome)
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ringGeo = new THREE.TorusGeometry(1.4, 0.015, 16, 120);
  
  // Bright polished silver/chrome
  const silverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdddddd,
    roughness: 0.08,
    metalness: 0.95,
    clearcoat: 1.0
  });

  const ring1 = new THREE.Mesh(ringGeo, silverMaterial);
  ringGroup.add(ring1);

  // Resize Handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation Loop
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);

    const delta = (time - lastTime) * 0.001;
    lastTime = time;

    const timeSec = time * 0.001;

    // 1. Deform Tooth (Organic Morphing)
    const pos = toothGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const orig = originalPositions[i];
      const wave = Math.sin(orig.x * 0.3 + timeSec) * Math.cos(orig.y * 0.3 + timeSec) * 0.25;
      const offset = orig.clone().normalize().multiplyScalar(wave);
      const targetPos = orig.clone().add(offset);
      pos.setXYZ(i, targetPos.x, targetPos.y, targetPos.z);
    }
    pos.needsUpdate = true;
    toothGeo.computeVertexNormals();

    // 2. Slow, comforting rotations (removed auto rotation on tooth, spin the outer ring like a wheel)
    ring1.rotation.z += 0.08 * delta;

    // 3. Mouse Parallax (Interactive float and tilt)
    // Rotate ring Group based on mouse
    ringGroup.rotation.x = THREE.MathUtils.lerp(ringGroup.rotation.x, mouseY * 0.2, 0.05);
    ringGroup.rotation.y = THREE.MathUtils.lerp(ringGroup.rotation.y, mouseX * 0.2, 0.05);
    
    // Rotate/tilt tooth based on mouse position (maximum 23 degrees tilt, no random auto-rotation)
    morphSphere.rotation.x = THREE.MathUtils.lerp(morphSphere.rotation.x, mouseY * 0.4, 0.05);
    morphSphere.rotation.y = THREE.MathUtils.lerp(morphSphere.rotation.y, mouseX * 0.4, 0.05);
    
    // Position float offset based on mouse
    morphSphere.position.x = THREE.MathUtils.lerp(morphSphere.position.x, mouseX * 0.12, 0.05);
    morphSphere.position.y = THREE.MathUtils.lerp(morphSphere.position.y, mouseY * 0.12, 0.05);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

/**
 * 2. STATEMENT SCENE: Layered curved ribbed structure (similar to references)
 */
function initStatementScene() {
  const container = document.getElementById('statement-3d-container');
  if (!container) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(4, 4, 4);
  scene.add(dirLight);

  const warmLight = new THREE.PointLight(0xfff5eb, 1.5, 10);
  warmLight.position.set(-2, -2, 2);
  scene.add(warmLight);

  // Blades Group
  const bladesGroup = new THREE.Group();
  scene.add(bladesGroup);

  const bladeCount = 14;
  const blades = [];

  const bladeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfafafa,
    transparent: true,
    opacity: 0.8,
    transmission: 0.92,
    roughness: 0.12,
    thickness: 1.4,
    clearcoat: 1.0,
    side: THREE.DoubleSide
  });

  // Build the layered curved blades (rib structure)
  for (let i = 0; i < bladeCount; i++) {
    const radius = 1.05 + (i * 0.075);
    const tubeRadius = 0.07;
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 80, Math.PI * 0.82);
    const blade = new THREE.Mesh(geometry, bladeMaterial);
    
    // Position them in a row forming the ribbed shape
    blade.position.z = (i - bladeCount / 2) * 0.15;
    blade.rotation.z = i * 0.085;
    blade.rotation.y = i * 0.025;
    
    bladesGroup.add(blade);
    blades.push(blade);
  }

  // Tilt the entire group for editorial look
  bladesGroup.rotation.x = 0.35;
  bladesGroup.rotation.y = -0.45;

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation Loop
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);

    const delta = (time - lastTime) * 0.001;
    lastTime = time;

    const timeSec = time * 0.001;

    // Wavily animate the blades slightly
    blades.forEach((blade, index) => {
      const wave = Math.sin(timeSec * 1.0 + index * 0.25) * 0.035;
      blade.scale.set(1 + wave, 1 + wave, 1);
      blade.position.y = Math.cos(timeSec * 0.7 + index * 0.2) * 0.025;
    });

    // Slow rotation
    bladesGroup.rotation.z = timeSec * 0.06;

    // Cursor interaction
    bladesGroup.rotation.x = THREE.MathUtils.lerp(bladesGroup.rotation.x, 0.35 + mouseY * 0.25, 0.05);
    bladesGroup.rotation.y = THREE.MathUtils.lerp(bladesGroup.rotation.y, -0.45 + mouseX * 0.25, 0.05);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

/**
 * 3. PHILOSOPHY SCENE: Smooth tubular torus knot
 */
function initPhilosophyScene() {
  const container = document.getElementById('philosophy-3d-container');
  if (!container) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 350;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 4.3;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(-3, 4, 3);
  scene.add(dirLight);

  const softBlueLight = new THREE.PointLight(0xe0f7fa, 1.5, 8);
  softBlueLight.position.set(2, -2, 2);
  scene.add(softBlueLight);

  // Frosted Tubular Torus Knot (Very clean, medical-grade glass effect)
  const geometry = new THREE.TorusKnotGeometry(0.72, 0.21, 100, 16, 2, 3);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    transmission: 0.9,
    roughness: 0.2,
    metalness: 0.05,
    thickness: 1.2,
    ior: 1.48,
    clearcoat: 1.0,
    clearcoatRoughness: 0.15
  });

  const knot = new THREE.Mesh(geometry, material);
  scene.add(knot);

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation Loop
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);

    const delta = (time - lastTime) * 0.001;
    lastTime = time;

    // Continuous slow, reassuring rotations
    knot.rotation.y += 0.15 * delta;
    knot.rotation.x += 0.08 * delta;

    // Follow mouse position slightly
    knot.position.x = THREE.MathUtils.lerp(knot.position.x, mouseX * 0.25, 0.05);
    knot.position.y = THREE.MathUtils.lerp(knot.position.y, mouseY * 0.25, 0.05);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
