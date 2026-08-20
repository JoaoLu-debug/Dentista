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
  camera.position.z = 6;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Pastel colored lights for subtle chromatic reflections
  const redPointLight = new THREE.PointLight(0xffb3b3, 1.5, 10);
  redPointLight.position.set(-3, 3, 2);
  scene.add(redPointLight);

  const bluePointLight = new THREE.PointLight(0xb3e6ff, 1.5, 10);
  bluePointLight.position.set(3, -3, 2);
  scene.add(bluePointLight);

  // Glass Material for morphing sphere
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    transmission: 0.9,
    roughness: 0.1,
    metalness: 0.05,
    thickness: 1.5,
    ior: 1.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });

  // Morphing Sphere Geometry
  const sphereGeo = new THREE.SphereGeometry(1.1, 48, 48);
  
  // Store original positions for deformation math
  const originalPositions = [];
  const posAttr = sphereGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    originalPositions.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
  }

  const morphSphere = new THREE.Mesh(sphereGeo, glassMaterial);
  scene.add(morphSphere);

  // Nested Ring Gyroscope
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ringGeo = new THREE.TorusGeometry(1.9, 0.015, 16, 120);
  
  const ringMaterial1 = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a1a,
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 1.0
  });
  
  const ringMaterial2 = new THREE.MeshPhysicalMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.6,
    transmission: 0.7,
    roughness: 0.15,
    thickness: 0.5
  });

  const ring1 = new THREE.Mesh(ringGeo, ringMaterial1);
  ringGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMaterial2);
  ring2.scale.set(0.9, 0.9, 0.9);
  ring2.rotation.x = Math.PI / 3;
  ringGroup.add(ring2);

  const ring3 = new THREE.Mesh(ringGeo, ringMaterial1);
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

    // 1. Deform Sphere (Organic Morphing)
    const pos = sphereGeo.attributes.position;
    const timeSec = time * 0.001;

    for (let i = 0; i < pos.count; i++) {
      const orig = originalPositions[i];
      // Wave function based on original coordinates and time
      const wave = Math.sin(orig.x * 2.5 + timeSec) * Math.cos(orig.y * 2.5 + timeSec) * 0.12;
      const offset = orig.clone().normalize().multiplyScalar(wave);
      const targetPos = orig.clone().add(offset);
      pos.setXYZ(i, targetPos.x, targetPos.y, targetPos.z);
    }
    pos.needsUpdate = true;
    sphereGeo.computeVertexNormals();

    // 2. Slow Rotations
    morphSphere.rotation.y += 0.15 * delta;
    morphSphere.rotation.x += 0.05 * delta;

    ring1.rotation.z += 0.2 * delta;
    ring2.rotation.y -= 0.15 * delta;
    ring3.rotation.x += 0.25 * delta;

    // 3. Mouse Parallax (Interactive float)
    ringGroup.rotation.x = THREE.MathUtils.lerp(ringGroup.rotation.x, mouseY * 0.4, 0.05);
    ringGroup.rotation.y = THREE.MathUtils.lerp(ringGroup.rotation.y, mouseX * 0.4, 0.05);
    
    morphSphere.position.x = THREE.MathUtils.lerp(morphSphere.position.x, mouseX * 0.25, 0.05);
    morphSphere.position.y = THREE.MathUtils.lerp(morphSphere.position.y, mouseY * 0.25, 0.05);

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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(4, 4, 4);
  scene.add(dirLight);

  const purpleLight = new THREE.PointLight(0xe6ccff, 1.2, 10);
  purpleLight.position.set(-2, -2, 2);
  scene.add(purpleLight);

  // Blades Group
  const bladesGroup = new THREE.Group();
  scene.add(bladesGroup);

  const bladeCount = 14;
  const blades = [];

  const bladeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf5f5f5,
    transparent: true,
    opacity: 0.75,
    transmission: 0.9,
    roughness: 0.15,
    thickness: 1.2,
    clearcoat: 1.0,
    side: THREE.DoubleSide
  });

  // Build the layered curved blades (rib structure)
  for (let i = 0; i < bladeCount; i++) {
    // Generate a arc segment torus as a blade
    const radius = 1.0 + (i * 0.08);
    const tubeRadius = 0.08;
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 80, Math.PI * 0.85);
    const blade = new THREE.Mesh(geometry, bladeMaterial);
    
    // Position them in a row forming the ribbed shape
    blade.position.z = (i - bladeCount / 2) * 0.16;
    blade.rotation.z = i * 0.09;
    blade.rotation.y = i * 0.03;
    
    bladesGroup.add(blade);
    blades.push(blade);
  }

  // Tilt the entire group for editorial look
  bladesGroup.rotation.x = 0.4;
  bladesGroup.rotation.y = -0.5;

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
      const wave = Math.sin(timeSec * 1.2 + index * 0.25) * 0.04;
      blade.scale.set(1 + wave, 1 + wave, 1);
      blade.position.y = Math.cos(timeSec * 0.8 + index * 0.2) * 0.03;
    });

    // Slow rotation
    bladesGroup.rotation.z = timeSec * 0.08;

    // Cursor interaction
    bladesGroup.rotation.x = THREE.MathUtils.lerp(bladesGroup.rotation.x, 0.4 + mouseY * 0.3, 0.05);
    bladesGroup.rotation.y = THREE.MathUtils.lerp(bladesGroup.rotation.y, -0.5 + mouseX * 0.3, 0.05);

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
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-3, 4, 3);
  scene.add(dirLight);

  const cyanPointLight = new THREE.PointLight(0xd6f5f5, 1.5, 8);
  cyanPointLight.position.set(2, -2, 2);
  scene.add(cyanPointLight);

  // Frosted Tubular Torus Knot
  const geometry = new THREE.TorusKnotGeometry(0.75, 0.22, 100, 16, 2, 3);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    transmission: 0.85,
    roughness: 0.25,
    metalness: 0.1,
    thickness: 1.0,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.2
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

    // Continuous slow rotations
    knot.rotation.y += 0.2 * delta;
    knot.rotation.x += 0.1 * delta;

    // Follow mouse position slightly
    knot.position.x = THREE.MathUtils.lerp(knot.position.x, mouseX * 0.3, 0.05);
    knot.position.y = THREE.MathUtils.lerp(knot.position.y, mouseY * 0.3, 0.05);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
