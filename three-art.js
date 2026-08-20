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
  camera.position.z = 6.2;

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

  // Glass Material for morphing sphere (ultra clean, pearlescent reflection)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92,
    transmission: 0.95,
    roughness: 0.08,
    metalness: 0.02,
    thickness: 1.8,
    ior: 1.48,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide
  });

  // Morphing Sphere Geometry
  const sphereGeo = new THREE.SphereGeometry(1.05, 48, 48);
  
  // Store original positions for deformation math
  const originalPositions = [];
  const posAttr = sphereGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    originalPositions.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
  }

  const morphSphere = new THREE.Mesh(sphereGeo, glassMaterial);
  scene.add(morphSphere);

  // Nested Ring Gyroscope (Softer materials - silver & frosted glass)
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ringGeo = new THREE.TorusGeometry(1.8, 0.015, 16, 120);
  
  // Bright polished silver/chrome instead of dark grey/black
  const silverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdddddd,
    roughness: 0.08,
    metalness: 0.95,
    clearcoat: 1.0
  });
  
  // Frosted soft white glass
  const frostedMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    transmission: 0.85,
    roughness: 0.25,
    thickness: 0.8
  });

  const ring1 = new THREE.Mesh(ringGeo, silverMaterial);
  ringGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, frostedMaterial);
  ring2.scale.set(0.9, 0.9, 0.9);
  ring2.rotation.x = Math.PI / 3;
  ringGroup.add(ring2);

  const ring3 = new THREE.Mesh(ringGeo, silverMaterial);
  ring3.scale.set(0.8, 0.8, 0.8);
  ring3.rotation.y = Math.PI / 3;
  ringGroup.add(ring3);

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

    // 1. Deform Sphere (Organic Morphing)
    const pos = sphereGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const orig = originalPositions[i];
      const wave = Math.sin(orig.x * 2.5 + timeSec) * Math.cos(orig.y * 2.5 + timeSec) * 0.12;
      const offset = orig.clone().normalize().multiplyScalar(wave);
      const targetPos = orig.clone().add(offset);
      pos.setXYZ(i, targetPos.x, targetPos.y, targetPos.z);
    }
    pos.needsUpdate = true;
    sphereGeo.computeVertexNormals();

    // 2. Slow, comforting rotations
    morphSphere.rotation.y += 0.12 * delta;
    morphSphere.rotation.x += 0.04 * delta;

    ring1.rotation.z += 0.15 * delta;
    ring2.rotation.y -= 0.12 * delta;
    ring3.rotation.x += 0.18 * delta;

    // 3. Mouse Parallax (Interactive float)
    ringGroup.rotation.x = THREE.MathUtils.lerp(ringGroup.rotation.x, mouseY * 0.3, 0.05);
    ringGroup.rotation.y = THREE.MathUtils.lerp(ringGroup.rotation.y, mouseX * 0.3, 0.05);
    
    morphSphere.position.x = THREE.MathUtils.lerp(morphSphere.position.x, mouseX * 0.2, 0.05);
    morphSphere.position.y = THREE.MathUtils.lerp(morphSphere.position.y, mouseY * 0.2, 0.05);

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
