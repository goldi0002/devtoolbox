import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import SectionPanel from "../../../components/ui/SectionPanel";
import CopyButton from "../../../components/CopyButton";
import CodeInput from "../../../components/CodeInput";
import { Play, RotateCcw, Sparkles, Layers, Box, Cpu, Compass, CheckCircle2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "geometry" | "materials" | "animation" | "product";
  description: string;
  code: string;
}

const TEMPLATES: Template[] = [
  {
    id: "torus-galaxy",
    name: "Torus Knot Galaxy",
    category: "geometry",
    description: "A shimmering procedural torus knot with rotating glowing rings and dynamic lighting.",
    code: `// Torus Knot Galaxy Template
scene.clear();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

const group = new THREE.Group();

const geometry = new THREE.TorusKnotGeometry(2.5, 0.75, 128, 32);
const material = new THREE.MeshPhysicalMaterial({
  color: 0x6366f1,
  metalness: 0.85,
  roughness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  wireframe: false
});
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
group.add(mesh);

// Add surrounding ring particles
const particleCount = 600;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for(let i = 0; i < particleCount * 3; i += 3) {
  const theta = Math.random() * Math.PI * 2;
  const r = 4 + Math.random() * 4;
  positions[i] = Math.cos(theta) * r;
  positions[i+1] = (Math.random() - 0.5) * 3;
  positions[i+2] = Math.sin(theta) * r;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ size: 0.08, color: 0x818cf8, transparent: true, opacity: 0.8 });
const particles = new THREE.Points(particleGeo, particleMat);
group.add(particles);

scene.add(group);

// Animation logic returned as tick function
return (delta, elapsed) => {
  mesh.rotation.x = elapsed * 0.4;
  mesh.rotation.y = elapsed * 0.6;
  particles.rotation.y = elapsed * -0.15;
};`
  },
  {
    id: "crystal-spire",
    name: "Low-Poly Crystal Spire",
    category: "geometry",
    description: "Procedural faceted crystal cluster with faceted terrain and ambient mist.",
    code: `// Low-Poly Crystal Spire Template
scene.clear();
scene.background = new THREE.Color(0x0f172a);
scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

const group = new THREE.Group();

// Ground
const planeGeo = new THREE.PlaneGeometry(30, 30, 20, 20);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.1 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
group.add(plane);

// Central Spire and Crystals
const crystalColors = [0x38bdf8, 0x818cf8, 0xc084fc, 0xf472b6];
for (let i = 0; i < 9; i++) {
  const radius = i === 0 ? 1.2 : 0.5 + Math.random() * 0.8;
  const height = i === 0 ? 5 : 2 + Math.random() * 3;
  const geo = new THREE.ConeGeometry(radius, height, 5);
  const mat = new THREE.MeshPhysicalMaterial({
    color: crystalColors[i % crystalColors.length],
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 1.2,
    ior: 2.2
  });
  const crystal = new THREE.Mesh(geo, mat);
  const angle = (i / 8) * Math.PI * 2;
  const dist = i === 0 ? 0 : 2 + Math.random() * 3;
  crystal.position.set(Math.cos(angle) * dist, height / 2, Math.sin(angle) * dist);
  crystal.rotation.y = Math.random() * Math.PI;
  crystal.castShadow = true;
  group.add(crystal);
}

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.1;
};`
  },
  {
    id: "platonic-constellation",
    name: "Platonic Constellation",
    category: "geometry",
    description: "An orbiting arrangement of geometric solids connected in harmonious space.",
    code: `// Platonic Constellation Template
scene.clear();
scene.background = new THREE.Color(0x090d16);

const group = new THREE.Group();

const geometries = [
  new THREE.IcosahedronGeometry(1.2),
  new THREE.DodecahedronGeometry(1.1),
  new THREE.OctahedronGeometry(1.2),
  new THREE.TetrahedronGeometry(1.3)
];

const meshes = [];
for (let i = 0; i < 8; i++) {
  const geo = geometries[i % geometries.length];
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color().setHSL(i / 8, 0.8, 0.6),
    metalness: 0.9,
    roughness: 0.2,
    wireframe: i % 2 === 1
  });
  const mesh = new THREE.Mesh(geo, mat);
  const angle = (i / 8) * Math.PI * 2;
  mesh.position.set(Math.cos(angle) * 3.5, Math.sin(i * 1.5) * 1.5, Math.sin(angle) * 3.5);
  mesh.castShadow = true;
  group.add(mesh);
  meshes.push({ mesh, speed: 0.5 + i * 0.2 });
}

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.2;
  meshes.forEach((item, idx) => {
    item.mesh.rotation.x = elapsed * item.speed;
    item.mesh.rotation.y = elapsed * (item.speed * 0.8);
  });
};`
  },
  {
    id: "chrome-gold-sculpture",
    name: "Chrome & Gold Sculptures",
    category: "materials",
    description: "Luxurious brushed gold and chrome reflective toroidal forms under studio lighting.",
    code: `// Chrome & Gold Sculptures Template
scene.clear();
scene.background = new THREE.Color(0x111111);

const group = new THREE.Group();

const goldMat = new THREE.MeshPhysicalMaterial({
  color: 0xffd700,
  metalness: 0.98,
  roughness: 0.12,
  clearcoat: 1.0
});

const chromeMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.99,
  roughness: 0.05,
  clearcoat: 1.0
});

const torus1 = new THREE.Mesh(new THREE.TorusGeometry(2, 0.6, 64, 64), goldMat);
torus1.rotation.x = Math.PI / 4;
torus1.castShadow = true;
group.add(torus1);

const torus2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.4, 64, 64), chromeMat);
torus2.rotation.y = Math.PI / 3;
torus2.castShadow = true;
group.add(torus2);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), goldMat);
sphere.castShadow = true;
group.add(sphere);

scene.add(group);

return (delta, elapsed) => {
  torus1.rotation.z = elapsed * 0.3;
  torus2.rotation.x = elapsed * 0.2;
  sphere.position.x = Math.sin(elapsed) * 1.5;
};`
  },
  {
    id: "transmissive-glass",
    name: "Transmissive Crystal Prism",
    category: "materials",
    description: "High-refraction glass prisms bending light with dispersion and chromatic feel.",
    code: `// Transmissive Crystal Prism Template
scene.clear();
scene.background = new THREE.Color(0x0f172a);

const group = new THREE.Group();

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.95,
  thickness: 2.0,
  ior: 2.4,
  clearcoat: 1.0
});

const prismGeo = new THREE.CylinderGeometry(0, 2, 3.5, 4);
const prism = new THREE.Mesh(prismGeo, glassMat);
prism.castShadow = true;
group.add(prism);

const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
const sphereMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 });
const innerSphere = new THREE.Mesh(sphereGeo, sphereMat);
innerSphere.position.y = -0.5;
group.add(innerSphere);

scene.add(group);

return (delta, elapsed) => {
  prism.rotation.y = elapsed * 0.4;
  prism.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
  innerSphere.position.y = -0.5 + Math.sin(elapsed * 2) * 0.4;
};`
  },
  {
    id: "cyberpunk-city",
    name: "Cyberpunk City Block",
    category: "materials",
    description: "Futuristic skyscraper cluster with emissive windows and atmospheric glow.",
    code: `// Cyberpunk City Block Template
scene.clear();
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.FogExp2(0x030712, 0.05);

const group = new THREE.Group();

// Ground grid
const grid = new THREE.GridHelper(30, 30, 0x3b82f6, 0x1e293b);
grid.position.y = -0.01;
group.add(grid);

const buildingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

for (let x = -3; x <= 3; x++) {
  for (let z = -3; z <= 3; z++) {
    if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;
    const w = 0.8 + Math.random() * 0.8;
    const d = 0.8 + Math.random() * 0.8;
    const h = 2 + Math.random() * 8;
    
    const bGeo = new THREE.BoxGeometry(w, h, d);
    const bMesh = new THREE.Mesh(bGeo, buildingMat);
    bMesh.position.set(x * 2.2, h / 2, z * 2.2);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    group.add(bMesh);

    // Add neon strip on top
    const nGeo = new THREE.BoxGeometry(w * 0.9, 0.1, d * 0.9);
    const nMesh = new THREE.Mesh(nGeo, neonMat);
    nMesh.position.set(x * 2.2, h + 0.05, z * 2.2);
    group.add(nMesh);
  }
}

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.05;
};`
  },
  {
    id: "particle-vortex",
    name: "Interactive Particle Vortex",
    category: "animation",
    description: "Thousands of colorful glowing particles swirling in a majestic energy vortex.",
    code: `// Interactive Particle Vortex Template
scene.clear();
scene.background = new THREE.Color(0x050508);

const count = 3000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const color = new THREE.Color();

for (let i = 0; i < count * 3; i += 3) {
  const radius = Math.random() * 6;
  const theta = Math.random() * Math.PI * 2;
  positions[i] = Math.cos(theta) * radius;
  positions[i+1] = (Math.random() - 0.5) * 8;
  positions[i+2] = Math.sin(theta) * radius;

  color.setHSL(Math.random(), 0.8, 0.6);
  colors[i] = color.r;
  colors[i+1] = color.g;
  colors[i+2] = color.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.08,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

return (delta, elapsed) => {
  particles.rotation.y = elapsed * 0.2;
  particles.rotation.z = Math.sin(elapsed * 0.5) * 0.1;
};`
  },
  {
    id: "kinetic-pistons",
    name: "Kinetic Pistons Engine",
    category: "animation",
    description: "Synchronized multi-part mechanical piston assembly in rhythmic motion.",
    code: `// Kinetic Pistons Engine Template
scene.clear();
scene.background = new THREE.Color(0x1e1e24);

const group = new THREE.Group();

const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });

const pistons = [];
for (let i = 0; i < 4; i++) {
  const pGroup = new THREE.Group();
  pGroup.position.set((i - 1.5) * 1.8, 0, 0);

  // Cylinder sleeve
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3, 32, 1, true), darkMat);
  sleeve.position.y = 1.5;
  pGroup.add(sleeve);

  // Piston head
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1, 32), metalMat);
  head.position.y = 1.5;
  head.castShadow = true;
  pGroup.add(head);

  // Connecting rod
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16), brassMat);
  rod.position.y = 0;
  pGroup.add(rod);

  group.add(pGroup);
  pistons.push({ group: head, offset: i * Math.PI * 0.5 });
}

scene.add(group);

return (delta, elapsed) => {
  pistons.forEach((p, idx) => {
    p.group.position.y = 1.5 + Math.sin(elapsed * 4 + p.offset) * 0.8;
  });
};`
  },
  {
    id: "dna-helix",
    name: "Floating DNA Double Helix",
    category: "animation",
    description: "Interlocking procedural molecular strands rotating smoothly in space.",
    code: `// Floating DNA Double Helix Template
scene.clear();
scene.background = new THREE.Color(0x020617);

const group = new THREE.Group();

const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
const matA = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.8 });
const matB = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.8 });

const count = 20;

for (let i = 0; i < count; i++) {
  const y = (i - count / 2) * 0.4;
  const angle = i * 0.4;

  const sphere1 = new THREE.Mesh(sphereGeo, matA);
  sphere1.position.set(Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5);
  group.add(sphere1);

  const sphere2 = new THREE.Mesh(sphereGeo, matB);
  sphere2.position.set(Math.cos(angle + Math.PI) * 1.5, y, Math.sin(angle + Math.PI) * 1.5);
  group.add(sphere2);
}

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.4;
};`
  },
  {
    id: "watch-showcase",
    name: "Modern Minimalist Watch",
    category: "product",
    description: "Composite procedural wristwatch showcase with casing, dial, hands, and bevels.",
    code: `// Modern Minimalist Watch Showcase Template
scene.clear();
scene.background = new THREE.Color(0x18181b);

const group = new THREE.Group();

const caseMat = new THREE.MeshPhysicalMaterial({ color: 0xe4e4e7, metalness: 0.95, roughness: 0.1, clearcoat: 1 });
const dialMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
const handMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

// Watch case
const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 64), caseMat);
caseMesh.castShadow = true;
group.add(caseMesh);

// Dial face
const dialMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.52, 64), dialMat);
group.add(dialMesh);

// Hour hand
const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.05), handMat);
hourHand.position.set(0, 0.3, 0.7);
hourHand.geometry.translate(0, 0.7, 0);
group.add(hourHand);

// Minute hand
const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 0.05), handMat);
minHand.position.set(0, 0.32, 0.75);
minHand.geometry.translate(0, 1.0, 0);
group.add(minHand);

group.rotation.x = Math.PI / 6;
scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.2;
  hourHand.rotation.z = -elapsed * 0.1;
  minHand.rotation.z = -elapsed * 1.2;
};`
  },
  {
    id: "starfighter-drone",
    name: "Futuristic Starfighter",
    category: "product",
    description: "Composite multi-part procedural spacecraft with swept wings and dual thrusters.",
    code: `// Futuristic Starfighter Template
scene.clear();
scene.background = new THREE.Color(0x090a0f);

const group = new THREE.Group();

const hullMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

// Fuselage
const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 8), hullMat);
body.rotation.x = Math.PI / 2;
body.castShadow = true;
group.add(body);

// Wings
const wingGeo = new THREE.BoxGeometry(5, 0.1, 1.5);
const wings = new THREE.Mesh(wingGeo, wingMat);
wings.position.set(0, 0, 0.5);
wings.castShadow = true;
group.add(wings);

// Engine Glow
const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 16), glowMat);
engine.rotation.x = Math.PI / 2;
engine.position.set(0, 0, -2);
group.add(engine);

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.5;
  group.rotation.z = Math.sin(elapsed * 2) * 0.2;
  group.position.y = Math.sin(elapsed * 3) * 0.3;
};`
  },
  {
    id: "zen-garden",
    name: "Zen Garden & Lantern",
    category: "product",
    description: "Procedural stone lantern, zen meditation stones, and raked ground pattern.",
    code: `// Zen Garden & Lantern Template
scene.clear();
scene.background = new THREE.Color(0x111827);

const group = new THREE.Group();

// Ground bed
const sandMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 });
const sand = new THREE.Mesh(new THREE.PlaneGeometry(12, 12, 32, 32), sandMat);
sand.rotation.x = -Math.PI / 2;
sand.receiveShadow = true;
group.add(sand);

// Lantern
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.7 });
const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), stoneMat);
lanternBase.position.set(2, 0.25, -2);
lanternBase.castShadow = true;
group.add(lanternBase);

const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), stoneMat);
lanternRoof.position.set(2, 1.6, -2);
lanternRoof.castShadow = true;
group.add(lanternRoof);

// Zen Stones
const stoneGeo = new THREE.DodecahedronGeometry(0.8, 1);
const stone1 = new THREE.Mesh(stoneGeo, stoneMat);
stone1.position.set(-2, 0.4, 1);
stone1.scale.set(1.2, 0.8, 1.5);
stone1.castShadow = true;
group.add(stone1);

scene.add(group);

return (delta, elapsed) => {
  group.rotation.y = elapsed * 0.15;
};`
  }
];

// Memoized Template Card component to prevent unnecessary re-renders
const TemplateCard = React.memo(({ template, isActive, onSelect }: { template: Template; isActive: boolean; onSelect: (t: Template) => void }) => {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between group hover:scale-[1.01] ${
        isActive
          ? "bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40"
          : "bg-slate-900/90 border-slate-800 hover:bg-slate-800/95 hover:border-slate-700"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
            {template.category}
          </span>
          {isActive && (
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          )}
        </div>
        <h4 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">{template.name}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{template.description}</p>
      </div>
      <div className="mt-4 text-[11px] text-indigo-400 font-mono font-medium flex items-center gap-1">
        Load Template &rarr;
      </div>
    </button>
  );
});

TemplateCard.displayName = "TemplateCard";

export function ThreeJsPlayground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTemplate, setActiveTemplate] = useState<Template>(TEMPLATES[0]);
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const tickFnRef = useRef<((delta: number, elapsed: number) => void) | null>(null);
  const reqIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const executeCode = useCallback((sourceCode: string) => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    setError(null);
    try {
      const userFn = new Function(
        "THREE",
        "scene",
        "camera",
        "renderer",
        "container",
        "clock",
        sourceCode
      );
      const result = userFn(
        THREE,
        sceneRef.current,
        cameraRef.current,
        rendererRef.current,
        mountRef.current,
        clockRef.current
      );

      if (typeof result === "function") {
        tickFnRef.current = result;
      } else {
        tickFnRef.current = null;
      }
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2000);
    } catch (err: any) {
      setError(err.message || String(err));
      tickFnRef.current = null;
    }
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    ambientLight.position.set(0, 20, 0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    executeCode(activeTemplate.code);

    const clock = clockRef.current;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (tickFnRef.current) {
        try {
          tickFnRef.current(delta, elapsed);
        } catch {
          // suppress tick errors in loop
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
    };
  }, [activeTemplate.code, executeCode]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setActiveTemplate(template);
    setCode(template.code);
    executeCode(template.code);
  }, [executeCode]);

  const handleRun = useCallback(() => {
    executeCode(code);
  }, [executeCode, code]);

  const handleReset = useCallback(() => {
    setCode(activeTemplate.code);
    executeCode(activeTemplate.code);
  }, [activeTemplate.code, executeCode]);

  const filteredTemplates = useMemo(() => {
    return selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <SectionPanel title="Three.js 3D Scene Studio & Code Playground">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Interactive 3D Scene Editor & Template Gallery
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Select from 12+ pre-installed procedural 3D templates or write custom Three.js code with live WebGL preview, PBR studio lighting, and OrbitControls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={code} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Categories:
          </span>
          {[
            { id: "all", label: "All Templates (12)" },
            { id: "geometry", label: "Procedural & Geometry (3)" },
            { id: "materials", label: "Materials & Lighting (3)" },
            { id: "animation", label: "Animation & FX (3)" },
            { id: "product", label: "Product & Showcases (3)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isActive={activeTemplate.id === t.id}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Three.js Code Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs flex items-center gap-1 transition-colors"
                  title="Reset to template default"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={handleRun}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Code
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[400px] flex flex-col">
              <CodeInput
                value={code}
                onChange={setCode}
                language="javascript"
                placeholder="Write Three.js code here..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 font-mono">
                <strong>Runtime Error:</strong> {error}
              </div>
            )}

            {successMsg && (
              <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scene compiled and running successfully!
              </div>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2 text-xs text-slate-300 shadow-md">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>OrbitControls Active (Drag to rotate, scroll to zoom)</span>
            </div>

            <div
              ref={mountRef}
              className="w-full h-[540px] bg-gradient-to-b from-slate-950 to-slate-900 cursor-grab active:cursor-grabbing"
            />

            <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Active Template: <strong className="text-white">{activeTemplate.name}</strong>
              </span>
              <span>WebGL2 • PBR Lighting • ACESFilmic</span>
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
export default ThreeJsPlayground;
