import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Galaxy base params
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 1,
    branches: 5,
    spin: 4,
    randomness: 3,
    randomnessPower: 5,
    insideColor: '#ff6030',
    outsideColor: '#0949f0'
};

let material, geometry, points;

// Generate galaxy
const generateGalaxy = () => {
    if (points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.pow(Math.random() * parameters.randomness, Math.random() * parameters.radius);
        const spinAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomSign = () => (Math.random() > 0.5 ? 1 : -1);
        const randomCoord = () => Math.pow(Math.random(), parameters.randomnessPower) * randomSign();

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomCoord();
        positions[i3 + 1] = randomCoord();
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomCoord();

        const mixedColor = colorInside.clone().lerp(colorOutside, Math.random() * radius / parameters.radius);
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

const starFieldParameters = {
  count: 500,
  size: 0.005,
  range: 10,
  color: '#ffffff'
};

let starFieldMaterial, starFieldGeometry, starFieldPoints;

// Generate star field
const generateStarField = () => {
  if (starFieldPoints) {
      starFieldGeometry.dispose();
      starFieldMaterial.dispose();
      scene.remove(starFieldPoints);
  }

  starFieldMaterial = new THREE.PointsMaterial({
      size: starFieldParameters.size,
      color: starFieldParameters.color
  });

  starFieldGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starFieldParameters.count * 3);

  for (let i = 0; i < starFieldParameters.count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * starFieldParameters.range * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * starFieldParameters.range * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * starFieldParameters.range * 2;
  }

  starFieldGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  starFieldPoints = new THREE.Points(starFieldGeometry, starFieldMaterial);
  scene.add(starFieldPoints);
};

generateStarField();


// Resizing
const sizes = { width: window.innerWidth, height: window.innerHeight };
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animation
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    controls.update();
    camera.position.x = Math.cos(elapsedTime * 0.05);
    camera.position.z = Math.sin(elapsedTime * 0.05);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
};
tick();

// GUI
const gui = new GUI();
gui.add(parameters, 'count', 10000, 200000, 1000).onChange(generateGalaxy).name('Star Count');
gui.add(parameters, 'radius', 0.1, 5, 0.1).onChange(generateGalaxy).name('Radius');
gui.add(parameters, 'branches', 1, 20, 1).onChange(generateGalaxy).name('Branches');
gui.add(parameters, 'spin', -5, 10, 0.5).onChange(generateGalaxy).name('Spin');
gui.add(parameters, 'randomness', 1, 10, 0.1).onChange(generateGalaxy).name('Randomness');
gui.add(parameters, 'randomnessPower', 1, 10, 0.1).onChange(generateGalaxy).name('Randomness Power');
gui.addColor(parameters, 'insideColor').onChange(generateGalaxy).name('Inside Color');
gui.addColor(parameters, 'outsideColor').onChange(generateGalaxy).name('Outside Color');
