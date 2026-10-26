import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const THREE_JS_PLAYGROUND_META: ToolMeta = {
  slug: "three-js-playground",
  name: "Three.js 3D Scene Studio & Code Playground",
  description: "Write and test Three.js 3D scene code in real-time with 12+ pre-installed procedural 3D templates, PBR studio lighting, camera controls, and live WebGL preview.",
  category: "web-tools",
  tag: "3D",
  icon: "Box",
  keywords: [
    "three.js",
    "3d playground",
    "webgl studio",
    "3d scene editor",
    "threejs code editor",
    "pbr materials",
    "procedural 3d",
    "threejs templates"
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/ThreeJsPlayground')),
  about: {
    summary:
      "Three.js 3D Scene Studio & Code Playground allows developers and designers to write, test, and explore Three.js 3D scene code directly in the browser. Featuring 12+ pre-installed procedural templates across geometries, materials, animations, and product showcases, it provides a live WebGL 2 rendering environment with PBR studio lighting, camera controls, and zero external network calls.",
    useCases: [
      "Experimenting with Three.js code snippets and procedural geometry generation",
      "Exploring 12+ pre-installed 3D templates including Torus Knot Galaxies, crystal spires, and kinetic pistons",
      "Testing PBR materials, reflections, lighting rigs, and shader techniques",
      "Creating and prototyping 3D web visualizations quickly and privately"
    ],
    features: [
      "12+ pre-installed procedural 3D templates across 4 specialized categories",
      "Live WebGL 2 rendering with ACESFilmicToneMapping and SRGB color space",
      "Interactive code editor with instant execution and error feedback",
      "OrbitControls camera movement and RoomEnvironment studio reflections"
    ],
    tip: "Use the template selector to quickly load different styles of 3D scenes and customize their parameters in the code editor."
  },
  addedAt: "2026-10-26",
  complexity: "advanced",
  featured: true,
  isNew: true,
  status: "stable",
  seo: {
    title: "Three.js 3D Scene Studio & Code Playground — Live WebGL Editor",
    description: "Write and test Three.js 3D scene code in real-time with 12+ pre-installed procedural 3D templates, PBR studio lighting, and live WebGL preview. 100% client-side.",
    extraKeywords: [
      "three.js playground",
      "threejs code editor",
      "webgl 3d editor",
      "three.js studio",
      "procedural 3d generator",
      "threejs template gallery",
      "3d scene preview online"
    ]
  }
};
