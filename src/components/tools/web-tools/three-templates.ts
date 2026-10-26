import * as THREE from "three";

export interface SceneTemplate {
  id: string;
  name: string;
  category: "geometry" | "materials" | "animation" | "product";
  description: string;
  codePreview: string;
  builder: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => (delta: number, elapsed: number) => void;
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: "torus-galaxy",
    name: "Torus Knot Galaxy",
    category: "geometry",
    description: "A shimmering procedural torus knot with rotating glowing rings and dynamic particle field.",
    codePreview: `const group = new THREE.Group();\nconst geo = new THREE.TorusKnotGeometry(2.5, 0.75, 128, 32);\nconst mat = new THREE.MeshPhysicalMaterial({ color: 0x6366f1, metalness: 0.85, roughness: 0.15, clearcoat: 1.0 });\nconst mesh = new THREE.Mesh(geo, mat);\ngroup.add(mesh);\nscene.add(group);`,
    builder: (scene, camera) => {
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
        clearcoatRoughness: 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const particleCount = 600;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const r = 4 + Math.random() * 4;
        positions[i] = Math.cos(theta) * r;
        positions[i + 1] = (Math.random() - 0.5) * 3;
        positions[i + 2] = Math.sin(theta) * r;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({ size: 0.08, color: 0x818cf8, transparent: true, opacity: 0.8 });
      const particles = new THREE.Points(particleGeo, particleMat);
      group.add(particles);

      scene.add(group);

      return (delta, elapsed) => {
        mesh.rotation.x = elapsed * 0.4;
        mesh.rotation.y = elapsed * 0.6;
        particles.rotation.y = elapsed * -0.15;
      };
    }
  },
  {
    id: "crystal-spire",
    name: "Low-Poly Crystal Spire",
    category: "geometry",
    description: "Procedural faceted crystal cluster with faceted terrain and ambient mist.",
    codePreview: `const planeGeo = new THREE.PlaneGeometry(30, 30, 20, 20);\nconst planeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });\nconst crystalGeo = new THREE.ConeGeometry(1.2, 5, 5);\nconst crystalMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.85, ior: 2.2 });`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

      const group = new THREE.Group();
      const planeGeo = new THREE.PlaneGeometry(30, 30, 20, 20);
      const planeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.1 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      group.add(plane);

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
      };
    }
  },
  {
    id: "platonic-constellation",
    name: "Platonic Constellation",
    category: "geometry",
    description: "An orbiting arrangement of geometric solids connected in harmonious space.",
    codePreview: `const geometries = [new THREE.IcosahedronGeometry(1.2), new THREE.DodecahedronGeometry(1.1), new THREE.OctahedronGeometry(1.2)];\nmeshes.forEach(m => m.rotation.x += delta);`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x090d16);

      const group = new THREE.Group();
      const geometries = [
        new THREE.IcosahedronGeometry(1.2),
        new THREE.DodecahedronGeometry(1.1),
        new THREE.OctahedronGeometry(1.2),
        new THREE.TetrahedronGeometry(1.3)
      ];

      const meshes: { mesh: THREE.Mesh; speed: number }[] = [];
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
        meshes.forEach((item) => {
          item.mesh.rotation.x = elapsed * item.speed;
          item.mesh.rotation.y = elapsed * (item.speed * 0.8);
        });
      };
    }
  },
  {
    id: "chrome-gold-sculpture",
    name: "Chrome & Gold Sculptures",
    category: "materials",
    description: "Luxurious brushed gold and chrome reflective toroidal forms under studio lighting.",
    codePreview: `const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 0.98, roughness: 0.12 });\nconst chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.99, roughness: 0.05 });`,
    builder: (scene, camera) => {
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
      };
    }
  },
  {
    id: "transmissive-glass",
    name: "Transmissive Crystal Prism",
    category: "materials",
    description: "High-refraction glass prisms bending light with dispersion and chromatic feel.",
    codePreview: `const glassMat = new THREE.MeshPhysicalMaterial({ transmission: 0.95, thickness: 2.0, ior: 2.4 });\nconst prism = new THREE.Mesh(new THREE.CylinderGeometry(0, 2, 3.5, 4), glassMat);`,
    builder: (scene, camera) => {
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
      };
    }
  },
  {
    id: "cyberpunk-city",
    name: "Cyberpunk City Block",
    category: "materials",
    description: "Futuristic skyscraper cluster with emissive windows and atmospheric glow.",
    codePreview: `const grid = new THREE.GridHelper(30, 30, 0x3b82f6, 0x1e293b);\nconst bGeo = new THREE.BoxGeometry(w, h, d);\nconst neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.FogExp2(0x030712, 0.05);

      const group = new THREE.Group();
      const grid = new THREE.GridHelper(30, 30, 0x3b82f6, 0x1e293b);
      grid.position.y = -0.01;
      group.add(grid);

      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
          if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;
          const w = 0.8 + (Math.sin(x * z) * 0.4 + 0.4);
          const d = 0.8 + (Math.cos(x * z) * 0.4 + 0.4);
          const h = 3 + Math.abs(x + z) * 1.5;
          
          const bGeo = new THREE.BoxGeometry(w, h, d);
          const bMesh = new THREE.Mesh(bGeo, buildingMat);
          bMesh.position.set(x * 2.2, h / 2, z * 2.2);
          bMesh.castShadow = true;
          bMesh.receiveShadow = true;
          group.add(bMesh);

          const nGeo = new THREE.BoxGeometry(w * 0.9, 0.1, d * 0.9);
          const nMesh = new THREE.Mesh(nGeo, neonMat);
          nMesh.position.set(x * 2.2, h + 0.05, z * 2.2);
          group.add(nMesh);
        }
      }

      scene.add(group);

      return (delta, elapsed) => {
        group.rotation.y = elapsed * 0.05;
      };
    }
  },
  {
    id: "particle-vortex",
    name: "Interactive Particle Vortex",
    category: "animation",
    description: "Thousands of colorful glowing particles swirling in a majestic energy vortex.",
    codePreview: `const count = 3000;\nconst geometry = new THREE.BufferGeometry();\nconst material = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, blending: THREE.AdditiveBlending });`,
    builder: (scene, camera) => {
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
        positions[i + 1] = (Math.random() - 0.5) * 8;
        positions[i + 2] = Math.sin(theta) * radius;

        color.setHSL(Math.random(), 0.8, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
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
      };
    }
  },
  {
    id: "kinetic-pistons",
    name: "Kinetic Pistons Engine",
    category: "animation",
    description: "Synchronized multi-part mechanical piston assembly in rhythmic motion.",
    codePreview: `const pistons = [];\nfor(let i=0; i<4; i++) {\n  p.group.position.y = 1.5 + Math.sin(elapsed * 4 + offset) * 0.8;\n}`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x1e1e24);

      const group = new THREE.Group();
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });

      const pistonHeads: THREE.Mesh[] = [];
      for (let i = 0; i < 4; i++) {
        const pGroup = new THREE.Group();
        pGroup.position.set((i - 1.5) * 1.8, 0, 0);

        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3, 32, 1, true), darkMat);
        sleeve.position.y = 1.5;
        pGroup.add(sleeve);

        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1, 32), metalMat);
        head.position.y = 1.5;
        head.castShadow = true;
        pGroup.add(head);

        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16), brassMat);
        rod.position.y = 0;
        pGroup.add(rod);

        group.add(pGroup);
        pistonHeads.push(head);
      }

      scene.add(group);

      return (delta, elapsed) => {
        pistonHeads.forEach((head, idx) => {
          head.position.y = 1.5 + Math.sin(elapsed * 4 + idx * Math.PI * 0.5) * 0.8;
        });
      };
    }
  },
  {
    id: "dna-helix",
    name: "Floating DNA Double Helix",
    category: "animation",
    description: "Interlocking procedural molecular strands rotating smoothly in space.",
    codePreview: `const count = 20;\nfor(let i=0; i<count; i++) {\n  const y = (i - count / 2) * 0.4;\n  const angle = i * 0.4;\n}`,
    builder: (scene, camera) => {
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
      };
    }
  },
  {
    id: "watch-showcase",
    name: "Modern Minimalist Watch",
    category: "product",
    description: "Composite procedural wristwatch showcase with casing, dial, hands, and bevels.",
    codePreview: `const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 64), caseMat);\nhourHand.rotation.z = -elapsed * 0.1;`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x18181b);

      const group = new THREE.Group();
      const caseMat = new THREE.MeshPhysicalMaterial({ color: 0xe4e4e7, metalness: 0.95, roughness: 0.1, clearcoat: 1 });
      const dialMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
      const handMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

      const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 64), caseMat);
      caseMesh.castShadow = true;
      group.add(caseMesh);

      const dialMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.52, 64), dialMat);
      group.add(dialMesh);

      const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.05), handMat);
      hourHand.position.set(0, 0.3, 0.7);
      hourHand.geometry.translate(0, 0.7, 0);
      group.add(hourHand);

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
      };
    }
  },
  {
    id: "starfighter-drone",
    name: "Futuristic Starfighter",
    category: "product",
    description: "Composite multi-part procedural spacecraft with swept wings and dual thrusters.",
    codePreview: `const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 8), hullMat);\nconst wings = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 1.5), wingMat);`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x090a0f);

      const group = new THREE.Group();
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 8), hullMat);
      body.rotation.x = Math.PI / 2;
      body.castShadow = true;
      group.add(body);

      const wingGeo = new THREE.BoxGeometry(5, 0.1, 1.5);
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0, 0.5);
      wings.castShadow = true;
      group.add(wings);

      const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 16), glowMat);
      engine.rotation.x = Math.PI / 2;
      engine.position.set(0, 0, -2);
      group.add(engine);

      scene.add(group);

      return (delta, elapsed) => {
        group.rotation.y = elapsed * 0.5;
        group.rotation.z = Math.sin(elapsed * 2) * 0.2;
        group.position.y = Math.sin(elapsed * 3) * 0.3;
      };
    }
  },
  {
    id: "zen-garden",
    name: "Zen Garden & Lantern",
    category: "product",
    description: "Procedural stone lantern, zen meditation stones, and raked ground pattern.",
    codePreview: `const sand = new THREE.Mesh(new THREE.PlaneGeometry(12, 12, 32, 32), sandMat);\nconst lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), stoneMat);`,
    builder: (scene, camera) => {
      scene.clear();
      scene.background = new THREE.Color(0x111827);

      const group = new THREE.Group();
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 });
      const sand = new THREE.Mesh(new THREE.PlaneGeometry(12, 12, 32, 32), sandMat);
      sand.rotation.x = -Math.PI / 2;
      sand.receiveShadow = true;
      group.add(sand);

      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.7 });
      const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), stoneMat);
      lanternBase.position.set(2, 0.25, -2);
      lanternBase.castShadow = true;
      group.add(lanternBase);

      const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), stoneMat);
      lanternRoof.position.set(2, 1.6, -2);
      lanternRoof.castShadow = true;
      group.add(lanternRoof);

      const stoneGeo = new THREE.DodecahedronGeometry(0.8, 1);
      const stone1 = new THREE.Mesh(stoneGeo, stoneMat);
      stone1.position.set(-2, 0.4, 1);
      stone1.scale.set(1.2, 0.8, 1.5);
      stone1.castShadow = true;
      group.add(stone1);

      scene.add(group);

      return (delta, elapsed) => {
        group.rotation.y = elapsed * 0.15;
      };
    }
  }
];
