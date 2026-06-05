import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteConfig, MaterialSpecs, SimulationResult } from "../types";

interface ThreeCanvasProps {
  site: SiteConfig;
  materials: MaterialSpecs;
  metrics: SimulationResult;
  modelType: string;
  isHeatmap: boolean;
  orientation: number; // in degrees (0 = North, 90 = East, etc.)
}

export default function ThreeCanvas({
  materials,
  metrics,
  modelType,
  isHeatmap,
  orientation,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep references to animate & reconstruct scene dynamically
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

  // Building geometry/group references
  const buildingGroupRef = useRef<THREE.Group | null>(null);

  // Interactive camera states
  const [isRotating, setIsRotating] = useState(true);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Tailwind slate-100/slate-50 background for elegant light appearance
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(24, 18, 30);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Crucial for taking high-res screenshots for reports!
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 3. Grid & Helpers
    const gridHelper = new THREE.GridHelper(50, 50, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Cardinal direction indices on grid
    const fontCanvas = document.createElement("canvas");
    fontCanvas.width = 128;
    fontCanvas.height = 128;
    const ctx = fontCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, 0, 128, 128);
    }

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // slate-200
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.25); // Golden warm sunshine
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    const d = 30;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Compass ring representation
    const compassGeo = new THREE.RingGeometry(18, 18.2, 64);
    const compassMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide });
    const compass = new THREE.Mesh(compassGeo, compassMat);
    compass.rotation.x = Math.PI / 2;
    compass.position.y = 0.02;
    scene.add(compass);

    // Add Solar disk mesh to represent sun
    const sunGeom = new THREE.SphereGeometry(1.2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfdbb2d }); // Vivid solar yellow
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Create container group for procedural building
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // 5. Ambient & Animation loops
    let animationId = 0;
    let angle = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Auto rotation of platform if enabled
      if (isRotating && buildingGroupRef.current) {
        angle += 0.003;
        buildingGroupRef.current.rotation.y = angle;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [isRotating]);

  // Re-generate Parametric Buildings upon changing "modelType" or updating "materials" / "isHeatmap" / "orientation"
  useEffect(() => {
    const scene = sceneRef.current;
    const group = buildingGroupRef.current;
    if (!scene || !group) return;

    // Clear previous geometries
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    // Set rotation base based on initial orientation parameter
    group.rotation.y = (orientation * Math.PI) / 180;

    // Build the selected model type
    if (modelType === "commercial") {
      // 1. Podiums (Commercial Quad)
      const baseGeo = new THREE.BoxGeometry(12, 1.5, 12);
      const baseMats = getBuildingMaterials(isHeatmap, materials, "facade");
      const baseMesh = new THREE.Mesh(baseGeo, baseMats);
      baseMesh.position.y = 0.75;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // 2. High Rise Tower Block (Setback style)
      const towerGeo = new THREE.BoxGeometry(8, 12, 8);
      const towerMats = getBuildingMaterials(isHeatmap, materials, "highrise");
      const towerMesh = new THREE.Mesh(towerGeo, towerMats);
      towerMesh.position.y = 7.5; // (1.5 + 6.0 center point)
      towerMesh.castShadow = true;
      towerMesh.receiveShadow = true;
      group.add(towerMesh);

      // 3. Glazed atrium section (transparent mesh)
      const atriumGeo = new THREE.BoxGeometry(4, 5, 5);
      const atriumMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd, // light transparent blue
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.65,
      });
      const atriumMesh = new THREE.Mesh(atriumGeo, atriumMat);
      atriumMesh.position.set(6, 2.5, 0);
      atriumMesh.castShadow = true;
      atriumMesh.receiveShadow = true;
      group.add(atriumMesh);

      // 4. Photovoltaic solar array on tower roof
      const pvFrameGeo = new THREE.BoxGeometry(7, 0.2, 7);
      const pvFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pvFrame = new THREE.Mesh(pvFrameGeo, pvFrameMat);
      pvFrame.position.y = 13.6;
      group.add(pvFrame);

      const pvPanelsGeo = new THREE.BoxGeometry(6.4, 0.1, 6.4);
      const pvPanelsMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.8 });
      const pvPanels = new THREE.Mesh(pvPanelsGeo, pvPanelsMat);
      pvPanels.position.y = 13.7;
      group.add(pvPanels);
    } else if (modelType === "residential") {
      // Multiple staggered residential pavilions (Bento Box style)
      const heights = [8, 14, 11];
      const positions = [
        [-4, 0, -4],
        [3, 0, 3],
        [-2, 0, 5],
      ];
      const widths = [4, 5, 4.5];

      heights.forEach((h, i) => {
        const p = positions[i];
        const w = widths[i];
        const resGeo = new THREE.BoxGeometry(w, h, w);
        const resMats = getBuildingMaterials(isHeatmap, materials, "residential");
        const resMesh = new THREE.Mesh(resGeo, resMats);
        resMesh.position.set(p[0], h / 2, p[2]);
        resMesh.castShadow = true;
        resMesh.receiveShadow = true;
        group.add(resMesh);

        // Individual balconies
        for (let b = 2; b < h; b += 2.5) {
          const balcGeo = new THREE.BoxGeometry(w - 0.8, 0.2, 1);
          const balcMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
          const balc = new THREE.Mesh(balcGeo, balcMat);
          balc.position.set(p[0], b, p[2] + w / 2 + 0.4);
          balc.castShadow = true;
          group.add(balc);
        }
      });
    } else if (modelType === "pavilion") {
      // High design horizontal educational pavilion with overlapping slabs and structural columns
      const groundFloorGeo = new THREE.BoxGeometry(16, 2, 8);
      const resMats = getBuildingMaterials(isHeatmap, materials, "pavilion");
      const groundFloor = new THREE.Mesh(groundFloorGeo, resMats);
      groundFloor.position.set(0, 1, 0);
      groundFloor.castShadow = true;
      groundFloor.receiveShadow = true;
      group.add(groundFloor);

      const middleSlabGeo = new THREE.BoxGeometry(18, 0.5, 10);
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      const slab1 = new THREE.Mesh(middleSlabGeo, slabMat);
      slab1.position.set(0, 2.25, 0);
      slab1.castShadow = true;
      slab1.receiveShadow = true;
      group.add(slab1);

      // Glass pavilion columns
      const glassTopGeo = new THREE.BoxGeometry(12, 3, 6);
      const glassTopMats = getBuildingMaterials(isHeatmap, materials, "pavilion-glass");
      const glassTop = new THREE.Mesh(glassTopGeo, glassTopMats);
      glassTop.position.set(-2, 4, -1);
      glassTop.castShadow = true;
      glassTop.receiveShadow = true;
      group.add(glassTop);

      // Cantilevered overhang roof
      const roofGeo = new THREE.BoxGeometry(17, 0.4, 9);
      const roof = new THREE.Mesh(roofGeo, slabMat);
      roof.position.set(-1.5, 5.7, -1);
      roof.castShadow = true;
      group.add(roof);
    } else {
      // Default dome shape / Organic Eco-structure
      const domeGeo = new THREE.SphereGeometry(7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMats = getBuildingMaterials(isHeatmap, materials, "dome");
      const dome = new THREE.Mesh(domeGeo, domeMats);
      dome.castShadow = true;
      dome.receiveShadow = true;
      dome.position.y = 0;
      group.add(dome);

      // Circular ring foundation
      const foundationGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.4, 32);
      const foundMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const foundation = new THREE.Mesh(foundationGeo, foundMat);
      foundation.position.y = 0.2;
      foundation.receiveShadow = true;
      group.add(foundation);
    }

    // Add surrounding shadows/context elements (e.g. context simple buildings)
    const obst1Geo = new THREE.BoxGeometry(5, 8, 5);
    const obstMat = new THREE.MeshStandardMaterial({
      color: 0xdde1e5,
      roughness: 0.9,
      transparent: true,
      opacity: 0.5,
    });
    const obst1 = new THREE.Mesh(obst1Geo, obstMat);
    obst1.position.set(-15, 4, -10);
    obst1.castShadow = true;
    obst1.receiveShadow = true;
    scene.add(obst1);

    const obst2Geo = new THREE.BoxGeometry(6, 15, 6);
    const obts2 = new THREE.Mesh(obst2Geo, obstMat);
    obts2.position.set(16, 7.5, 12);
    obts2.castShadow = true;
    obts2.receiveShadow = true;
    scene.add(obts2);

    return () => {
      scene.remove(obst1);
      scene.remove(obts2);
      obst1Geo.dispose();
      obst2Geo.dispose();
    };
  }, [modelType, materials, isHeatmap, orientation]);

  // Handle dynamic solar recalculations (Updates sun lighting positions and intensities based on time of day)
  useEffect(() => {
    const sunLight = sunLightRef.current;
    const sunMesh = sunMeshRef.current;
    if (!sunLight || !sunMesh) return;

    const { sunAltitude: altitude, sunAzimuth: azimuth } = metrics;

    // Convert spherical sun altitude and azimuth to Cartesian coordinates
    // Three.js coordinates: +Y is Up, +X is East, +Z is South
    const r = 40; // solar orbit radius
    const altRad = (altitude * Math.PI) / 180;
    const azRad = ((azimuth - 180) * Math.PI) / 180; // center azimuth around north (180deg offset)

    const x = r * Math.cos(altRad) * Math.sin(azRad);
    const z = r * Math.cos(altRad) * Math.cos(azRad);
    const y = r * Math.sin(altRad);

    // Update real Directional Light position which casts shadows!
    sunLight.position.set(x, y, z);
    sunMesh.position.set(x, y, z);

    // Sun brightness depends heavily on altitude
    if (altitude <= 0) {
      sunLight.intensity = 0;
      sunLight.visible = false;
      sunMesh.visible = false;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x0f172a); // Slate-900 (Night Sky)
      }
    } else {
      sunLight.visible = true;
      sunMesh.visible = true;
      sunLight.intensity = Math.min(1.5, Math.max(0.1, Math.sin(altRad) * 1.5));
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0xf1f5f9); // Slate-100 (Daylight)
      }
    }

    // Adapt sun light colors dynamically for Sunrise (orange/gold), Noon (vibrant yellow), and Twilight
    if (altitude > 0 && altitude < 15) {
      sunLight.color.setHex(0xf97316); // orange-500 sunset/sunrise
      sunMesh.material.color.setHex(0xf97316);
    } else if (altitude >= 15 && altitude < 35) {
      sunLight.color.setHex(0xfbbf24); // amber-400
      sunMesh.material.color.setHex(0xfbbf24);
    } else {
      sunLight.color.setHex(0xfffbeb); // warm daylight white
      sunMesh.material.color.setHex(0xfef08a); // yellow-200
    }
  }, [metrics]);

  /**
   * Helper to return standard architectural materials or a visual solar thermal heatmap.
   */
  function getBuildingMaterials(
    heatmap: boolean,
    specs: MaterialSpecs,
    role: string
  ): THREE.Material | THREE.Material[] {
    const materialsList: THREE.Material[] = [];

    // Colors mapping representing infrared heatmap scale:
    // Cold values face away from sun (Dark Purple, Blue)
    // Dynamic values face directly towards sun (Bright Yellow, Red, Orange)
    const coldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Deep indigo
      emissive: 0x030712,
      roughness: 0.4,
    });

    const warmMaterial = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Rose-600
      emissive: 0x4c0519,
      roughness: 0.3,
    });

    const hotMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Yellow-400
      emissive: 0x78350f,
      roughness: 0.1,
    });

    // Materials dictionary for standard mode
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // slate-50 tile white panels
      roughness: 0.7,
      metalness: 0.1,
    });

    const brickMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Terrecotta panels
      roughness: 0.8,
    });

    const coreGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Azure glass
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.75,
    });

    // 6-sided block faces to support custom glass ratios per side
    for (let face = 0; face < 6; face++) {
      if (heatmap) {
        // Multi-directional thermal mapping depending on facade sun angle
        const isSunFacing = face === 2 || face === 4; // approximate sun hit orientation
        if (metrics.sunAltitude <= 0) {
          materialsList.push(coldMaterial);
        } else if (isSunFacing) {
          materialsList.push(specs.glassRatio > 0.6 ? hotMaterial : warmMaterial);
        } else {
          materialsList.push(specs.uValue > 1.2 ? warmMaterial : coldMaterial);
        }
      } else {
        // Standard high-architectural styling
        const isFacadeWindow = face === 4 || face === 5; // East & West facades
        if (isFacadeWindow) {
          // Mixed window mullion panel effect
          materialsList.push(
            specs.glassRatio > 0.55 ? coreGlassMat : concreteMat
          );
        } else {
          materialsList.push(role === "highrise" ? concreteMat : brickMat);
        }
      }
    }

    return materialsList;
  }

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span className="px-3 py-1 bg-white/95 backdrop-blur shadow-sm rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1.5 border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          WebGL Live Rendered
        </span>
        <span className="px-3 py-1 bg-white/95 backdrop-blur shadow-sm rounded-full text-xs font-medium text-slate-600 border border-slate-200">
          Alt: {metrics.sunAltitude.toFixed(1)}° | Az: {metrics.sunAzimuth.toFixed(1)}°
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-lg bg-white/95 hover:bg-slate-50 transition shadow-sm border border-slate-200 text-xs font-semibold flex items-center gap-1 text-slate-700`}
          title="Toggle rotation"
        >
          {isRotating ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-spin"></span>
              Auto Orbit ON
            </>
          ) : (
            "Orbit Static"
          )}
        </button>
      </div>

      {metrics.sunAltitude <= 0 && (
        <div className="absolute inset-0 bg-slate-900/30 pointer-events-none transition duration-500 flex items-center justify-center">
          <div className="px-4 py-2 bg-slate-950/80 backdrop-blur rounded-lg shadow border border-slate-800 text-slate-300 text-xs font-mono">
            🌙 NIGHTTIME SIMULATION (0% Solar Gain)
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Compass notation overlay */}
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-400 bg-white/80 px-2 py-1 rounded border border-slate-200 flex gap-2">
        <span>N ▲</span>
        <span>E ▶</span>
        <span>S ▼</span>
        <span>W ◀</span>
      </div>
    </div>
  );
}
