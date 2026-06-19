import { Suspense, useRef, useMemo, forwardRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Float, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { Heart, Activity, Brain, Scale, Download } from "lucide-react";
import { 
  bpStatus, 
  hrStatus, 
  bmiStatus, 
  fatigueStatus, 
  bmiLabel, 
  cn 
} from "@/lib/utils";

const colors = {
  ok: { hex: "#10b981", border: "border-emerald-500/40", text: "text-emerald-400" },
  warn: { hex: "#fbbf24", border: "border-amber-500/40", text: "text-amber-400" },
  critical: { hex: "#f87171", border: "border-red-500/40", text: "text-red-400" }
};

function createHUDTexture(label, value, statusText, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 12;
  ctx.strokeRect(0, 0, 512, 256);
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 36px monospace';
  ctx.fillText(label, 40, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 85px monospace';
  ctx.fillText(value, 40, 165);
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 32px monospace';
  ctx.fillText(statusText, 40, 225);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function HUDMarker({ position, label, value, status, icon: Icon, offset }) {
  const colorData = colors[status] || colors.ok;
  const [xOffset, yOffset] = offset;
  const width = Math.abs(xOffset);
  const height = Math.abs(yOffset);

  const svgStyle = {
    position: "absolute",
    width: `${width}px`,
    height: `${height || 2}px`,
    left: xOffset > 0 ? "0px" : `${xOffset}px`,
    top: yOffset < 0 ? `${yOffset}px` : "0px",
    pointerEvents: "none",
  };

  const cardStyle = {
    position: "absolute",
    left: xOffset > 0 ? `${xOffset}px` : `${xOffset - 145}px`,
    top: `${yOffset - 22}px`,
    width: "145px",
  };

  const xStart = xOffset > 0 ? 0 : width;
  const yStart = yOffset < 0 ? height : 0;
  const xEnd = xOffset > 0 ? width : 0;
  const yEnd = yOffset < 0 ? 0 : height;

  const targetArray = new Float32Array([0, 0, 0, xOffset * 0.005, -yOffset * 0.005, 0.5]);

  return (
    <group position={position} userData={{ isHUDContainer: true }}>
      <group userData={{ isHTMLHUD: true }}>
        <mesh>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={colorData.hex} depthWrite={false} />
        </mesh>
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={colorData.hex} transparent opacity={0.25} depthWrite={false} />
        </mesh>
        <Html distanceFactor={5.5} center>
          <div className="relative w-0 h-0 font-mono text-xs">
            <svg style={svgStyle} className="overflow-visible">
              <line x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke={colorData.hex} strokeWidth="1.2" opacity="0.85" />
              <circle cx={xEnd} cy={yEnd} r="2.5" fill={colorData.hex} />
            </svg>
            <div
              style={{ ...cardStyle, boxShadow: `0 0 10px -3px ${colorData.hex}40` }}
              className={cn(
                "flex items-center gap-2 rounded border bg-slate-950/90 p-2.5 border-slate-800 transition-all duration-300",
                colorData.border
              )}
            >
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-slate-400">
                  <Icon className={cn("h-3 w-3 shrink-0", colorData.text)} />
                  <span>{label}</span>
                </div>
                <div className="text-[12px] font-bold text-slate-100 leading-none mt-0.5">{value}</div>
                <div className={cn("text-[8.5px] font-bold leading-none uppercase tracking-wider mt-0.5", colorData.text)}>
                  {status === "ok" ? "● Estable" : status === "warn" ? "▲ Vigilancia" : "■ Alerta"}
                </div>
              </div>
            </div>
          </div>
        </Html>
      </group>

      <group userData={{ isExportHUD: true }} visible={false}>
        <mesh>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color={colorData.hex} />
        </mesh>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={targetArray} count={2} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={colorData.hex} />
        </line>
        <mesh position={[xOffset * 0.005, -yOffset * 0.005, 0.49]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial
            map={useMemo(() => createHUDTexture(label, value, status === "ok" ? "ESTABLE" : status === "warn" ? "VIGILANCIA" : "ALERTA", colorData.hex), [label, value, status, colorData.hex])}
            transparent={true}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function FlooringRings({ color }) {
  return (
    <group position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[0.55, 0.56, 64]} /><meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
      <mesh><ringGeometry args={[0.38, 0.39, 64]} /><meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh><ringGeometry args={[0.2, 0.21, 64]} /><meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
      <mesh><ringGeometry args={[0, 0.08, 32]} /><meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

// ============================================================
// OPERADOR REALISTA
// ============================================================
const RealisticOperator = forwardRef(({ color, driver }, externalRef) => {
  const internalGroup = useRef();
  const group = externalRef || internalGroup;
  const { scene } = useGLTF("/models/male_optimized.glb");

  useMemo(() => {
    scene.traverse((o) => {
      if (o.isBone || o.isSkeletonHelper || o.type === 'Bone' || o.type === 'SkeletonHelper') {
        o.visible = false;
      }
      if (o.isMesh && o.geometry) {
        const count = o.geometry.attributes.position?.count || 0;
        if (count < 50) o.visible = false;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  const { center, size, min } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    return { center, size, min: box.min };
  }, [scene]);

  const current = driver?.current || { bpSys: 120, bpDia: 80, bmi: 22.0, hr: 70, fatigue: 15, stress: 10 };

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uGridSpacing: { value: 0.06 },
        uLineWidth: { value: 0.012 },
        uFillOpacity: { value: 0.06 },
        uBodyOpacity: { value: 1.0 },
        uStress: { value: current.stress || 0 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uGridSpacing;
        uniform float uLineWidth;
        uniform float uFillOpacity;
        uniform float uBodyOpacity;
        uniform float uStress;
        varying vec3 vWorldPos;

        void main() {
          vec3 coord = vWorldPos / uGridSpacing;
          vec3 grid = abs(fract(coord - 0.5) - 0.5);
          vec3 line = grid / fwidth(coord);
          float minLine = min(min(line.x, line.y), line.z);
          float gridAlpha = 1.0 - min(minLine, 1.0);
          
          float alpha = max(gridAlpha * 0.7, uFillOpacity) * uBodyOpacity;
          vec3 finalColor = uColor;

          if (uStress > 40.0) {
            float stressFactor = clamp((uStress - 40.0) / 60.0, 0.0, 1.0);
            float headDist = distance(vWorldPos, vec3(0.0, 1.5, 0.0));
            float chestDist = distance(vWorldPos, vec3(0.0, 1.15, 0.1));
            float heat = exp(-headDist * 3.5) * 1.5; 
            heat += exp(-chestDist * 2.5) * 1.0;
            vec3 heatColor = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 0.1, 0.1), clamp(heat, 0.0, 1.0));
            float blend = clamp(heat * stressFactor, 0.0, 1.0);
            finalColor = mix(finalColor, heatColor, blend);
            alpha = max(alpha, blend * 0.85);
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
  }, [color, current.stress]);

  const bodyScale = useMemo(() => {
    const bmi = current.bmi || 22;
    const clampedBmi = Math.min(Math.max(bmi, 15), 38);
    return 0.92 + ((clampedBmi - 15) / (38 - 15)) * (1.18 - 0.92);
  }, [current.bmi]);

  const gridScene = useMemo(() => {
    const c = scene.clone();
    const fatigue = current.fatigue || 0;
    const isTired = fatigue > 50;
    const slouchAmount = isTired ? ((fatigue - 50) / 50) * 0.18 : 0;
    const globalBox = new THREE.Box3().setFromObject(scene);
    const globalMinY = globalBox.min.y;
    const globalH = (globalBox.max.y - globalMinY) || 1;

    c.traverse((o) => {
      if (o.isMesh && o.visible) {
        o.geometry = o.geometry.clone();
        const pos = o.geometry.attributes.position;
        if (!pos) return;

        for (let i = 0; i < pos.count; i++) {
          let origY = pos.getY(i);
          let x = pos.getX(i) * bodyScale;
          let y = origY;
          let z = pos.getZ(i) * bodyScale;
          const normalY = (y - globalMinY) / globalH;
          if (normalY > 0.45 && slouchAmount > 0) {
            const bendFactor = Math.pow(normalY - 0.45, 1.8);
            z += bendFactor * slouchAmount * globalH;
            y -= bendFactor * slouchAmount * globalH * 0.4;
          }
          pos.setXYZ(i, x, y, z);
        }
        pos.needsUpdate = true;
        o.geometry.computeVertexNormals();
        o.geometry.computeBoundingSphere();

        const colorsArray = new Float32Array(pos.count * 3);
        const baseColor = new THREE.Color("#0ea5e9");
        const uStress = current.stress || 0;

        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          let finalColor = baseColor.clone();

          if (uStress > 40.0) {
            const stressFactor = Math.min((uStress - 40.0) / 60.0, 1.0);
            const headDist = Math.hypot(x - 0, y - 1.5, z - 0);
            const chestDist = Math.hypot(x - 0, y - 1.15, z - 0.1);
            let heat = Math.exp(-headDist * 3.5) * 1.5 + Math.exp(-chestDist * 2.5) * 1.0;
            heat = Math.min(Math.max(heat, 0), 1.0);
            const heatColor = new THREE.Color(1.0, 0.6, 0.0).lerp(new THREE.Color(1.0, 0.1, 0.1), heat);
            const blend = Math.min(heat * stressFactor, 1.0);
            finalColor.lerp(heatColor, blend);
          }

          colorsArray[i * 3]     = finalColor.r;
          colorsArray[i * 3 + 1] = finalColor.g;
          colorsArray[i * 3 + 2] = finalColor.b;
        }
        o.geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        o.material = gridMaterial;
      }
    });
    return c;
  }, [scene, gridMaterial, current.fatigue, current.stress, color, bodyScale]);

  const statusBp      = bpStatus(current.bpSys, current.bpDia);
  const statusHr      = hrStatus(current.hr);
  const statusBmi     = bmiStatus(current.bmi);
  const statusFatigue = fatigueStatus(current.fatigue);
  const labelBmi      = bmiLabel(current.bmi);

  return (
    <group ref={group} position={[0, -1.3, 0]} scale={1.55}>
      <mesh position={[0, size.y / 2, 0]} userData={{ isHTMLHUD: true }}>
        <boxGeometry args={[size.x * 1.25 * bodyScale, size.y * 1.05, size.z * 1.25 * bodyScale]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <group position={[-center.x, -min.y, -center.z]}>
        <primitive object={gridScene} />
      </group>

      <HUDMarker
        position={[0, size.y * 0.90, size.z * 0.05]}
        label="FATIGA"
        value={`${current.fatigue}%`}
        status={statusFatigue}
        icon={Brain}
        offset={[130, -50]}
      />
      <HUDMarker
        position={[-size.x * 0.12, size.y * 0.72, size.z * 0.15]}
        label="FREC. CARDÍACA"
        value={`${current.hr} bpm`}
        status={statusHr}
        icon={Heart}
        offset={[140, 10]}
      />
      <HUDMarker
        position={[-size.x * 0.28, size.y * 0.60, size.z * 0.05]}
        label="PRESIÓN ART."
        value={`${current.bpSys}/${current.bpDia}`}
        status={statusBp}
        icon={Activity}
        offset={[-180, -30]}
      />
      <HUDMarker
        position={[0, size.y * 0.44, size.z * 0.15]}
        label="IMC CORPORAL"
        value={`${current.bmi.toFixed(1)} (${labelBmi})`}
        status={statusBmi}
        icon={Scale}
        offset={[130, 70]}
      />
    </group>
  );
});

// ============================================================
// MODELO ANATÓMICO (Texturizado IA con Mapa de Calor)
// ============================================================
const AnatomyModel = forwardRef(({ driver }, externalRef) => {
  const internalGroup = useRef();
  const group = externalRef || internalGroup;
  
  // Clonar la escena para evitar mutar el caché original de ThreeJS
  const { scene: originalScene } = useGLTF("/models/Meshy_AI_Anatomy_Illustration_0618034359_texture_optimized.glb");
  const scene = useMemo(() => originalScene.clone(true), [originalScene]);

  const { center, size, min } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    return { center, size, min: box.min };
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) {
        group.current.rotation.y += delta * 0.15;
        // La escala se mantiene constante; la obesidad se maneja a nivel de vértices (inflación de normales)
        const baseScale = 1.8 / size.y;
        group.current.scale.set(baseScale, baseScale, baseScale);
    }
  });

  const scale = 1.8 / size.y; // Escala inicial

  // Mapa de Calor y Deformación Anatómica Dinámica
  const lastStatsRef = useRef("");
  useFrame(() => {
    const current = driver?.current || { bpSys: 120, bpDia: 80, bmi: 22.0, hr: 70, fatigue: 15, stress: 10 };
    const fatStat = fatigueStatus(current.fatigue);
    const hrStat = hrStatus(current.hr);
    const bpStat = bpStatus(current.bpSys, current.bpDia);
    const bmiStat = bmiStatus(current.bmi);
    
    // Solo actualizar si cambian los estados médicos o el IMC exacto
    const statsStr = `${fatStat}-${hrStat}-${bpStat}-${bmiStat}-${current.bmi}`;
    if (lastStatsRef.current === statsStr) return;
    lastStatsRef.current = statsStr;

    const heatNodes = [
      { y: 0.90, status: fatStat, radius: 0.15 },
      { y: 0.70, status: hrStat, radius: 0.15 },
      { y: 0.60, status: bpStat, radius: 0.15 },
      { y: 0.45, status: bmiStat, radius: 0.15 }
    ];

    const getStatusColor = (status) => {
        if (status === 'critical') return new THREE.Color("#ff0b3a");
        if (status === 'warn') return new THREE.Color("#fbbf24");
        return new THREE.Color("#ffffff");
    };

    // Parámetros de obesidad (BMI por encima de 24)
    const excessBmi = Math.max(0, current.bmi - 24);

    scene.traverse((child) => {
      if (child.isMesh) {
        if (!child.userData.materialConfigured) {
            child.material = child.material.clone();
            child.material.vertexColors = true;
            child.material.color.setHex(0xffffff);
            child.userData.materialConfigured = true;
        }

        // Pérdida de definición muscular para cuerpos robustos
        child.material.roughness = Math.min(0.9, 0.5 + (excessBmi * 0.02)); // Más opaco/suave
        child.material.metalness = Math.max(0.0, 0.1 - (excessBmi * 0.005));
        child.material.envMapIntensity = Math.max(0.5, 1.5 - (excessBmi * 0.05));
        child.material.emissive = new THREE.Color(0x111111);
        
        if (child.material.normalScale) {
            // Suavizar el mapa de normales (elimina los "cuadritos" y músculos marcados)
            const normalStr = Math.max(0.1, 1.0 - (excessBmi * 0.06));
            child.material.normalScale.setScalar(normalStr);
        }

        const geometry = child.geometry;
        
        // Guardar posiciones y normales originales si no lo hemos hecho (Protección HMR)
        if (!geometry.attributes.basePosition) {
            geometry.setAttribute('basePosition', geometry.attributes.position.clone());
        }
        if (!geometry.attributes.baseNormal) {
            if (!geometry.attributes.normal) geometry.computeVertexNormals();
            geometry.setAttribute('baseNormal', geometry.attributes.normal.clone());
        }
        
        const positions = geometry.attributes.position.array;
        const basePositions = geometry.attributes.basePosition.array;
        const baseNormals = geometry.attributes.baseNormal.array;
        
        if (!geometry.attributes.color) {
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(positions.length), 3));
        }
        const colorsArray = geometry.attributes.color.array;

        if (!geometry.boundingBox) geometry.computeBoundingBox();
        const gMinY = geometry.boundingBox.min.y;
        const gMaxY = geometry.boundingBox.max.y;
        const height = gMaxY - gMinY || 1;

        let colorIndex = 0;
        for (let i = 0; i < positions.length; i += 3) {
            // 1. Calcular color de vértice (Mapa de Calor)
            const y = basePositions[i + 1];
            const ny = (y - gMinY) / height;
            
            let vColor = new THREE.Color("#ffffff");
            let maxInfluence = 0;
            let targetHeatColor = null;

            for (let node of heatNodes) {
                if (node.status !== 'ok') {
                    const dist = Math.abs(ny - node.y);
                    if (dist < node.radius) {
                        const rawIntensity = 1 - (dist / node.radius);
                        const smoothIntensity = rawIntensity * rawIntensity * (3 - 2 * rawIntensity);
                        if (smoothIntensity > maxInfluence) {
                            maxInfluence = smoothIntensity;
                            targetHeatColor = getStatusColor(node.status);
                        }
                    }
                }
            }

            if (maxInfluence > 0 && targetHeatColor) {
                vColor.lerpHSL(targetHeatColor, maxInfluence * 0.9);
            }
            
            colorsArray[colorIndex++] = vColor.r;
            colorsArray[colorIndex++] = vColor.g;
            colorsArray[colorIndex++] = vColor.b;

            // 2. Deformación Realista de Todo el Cuerpo (Inflado por Normales)
            let bx = basePositions[i];
            let by = basePositions[i + 1];
            let bz = basePositions[i + 2];
            
            let nx = baseNormals[i];
            let ny_norm = baseNormals[i + 1];
            let nz = baseNormals[i + 2];

            if (excessBmi > 0) {
                // Curvas Gaussianas para distribución de grasa (Patrón Masculino)
                // Panza (Y~0.50): Acumulación extrema (Gut)
                const belly = Math.exp(-Math.pow((ny - 0.50) / 0.12, 2.0)) * 2.2;
                // Pecho y espalda alta (Y~0.70): Acumulación media
                const chest = Math.exp(-Math.pow((ny - 0.70) / 0.15, 2.0)) * 0.8;
                // Muslos/Caderas (Y~0.35): Acumulación muy baja (Evita el efecto extraño de "saddlebags")
                const thighs = Math.exp(-Math.pow((ny - 0.35) / 0.12, 2.0)) * 0.4;
                // Papada (Y~0.85): Acumulación leve
                const neck = Math.exp(-Math.pow((ny - 0.85) / 0.08, 2.0)) * 0.3;
                
                let inflationFactor = belly + chest + thighs + neck;
                
                // Máscara Basada en Bounding Box (Aísla las manos a prueba de fallos)
                // En una pose A, las manos son siempre los puntos más anchos de la malla (extremos X)
                // nx_x va de 0.0 (punta de los dedos izquierdos) a 1.0 (punta de los dedos derechos)
                const nx_x = (bx - geometry.boundingBox.min.x) / (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                
                let handMask = 1.0;
                
                // Solo protegemos por debajo de los hombros (ny < 0.70)
                if (ny < 0.70) {
                    if (nx_x < 0.25) {
                        // Brazo Izquierdo (0% a 25% del ancho total)
                        let distFromEdge = nx_x;
                        if (distFromEdge < 0.10) {
                            handMask = 0.0; // El 10% más externo (Manos y dedos) tiene 0.0 inflación absoluta
                        } else {
                            // Del 10% al 25% (Antebrazo) se suaviza la inflación
                            let falloff = 1.0 - ((distFromEdge - 0.10) / 0.15);
                            let penalty = falloff * falloff * (3 - 2 * falloff);
                            handMask = 1.0 - penalty;
                        }
                    } else if (nx_x > 0.75) {
                        // Brazo Derecho (75% a 100% del ancho total)
                        let distFromEdge = 1.0 - nx_x;
                        if (distFromEdge < 0.10) {
                            handMask = 0.0; // Manos y dedos derechos en 0.0
                        } else {
                            let falloff = 1.0 - ((distFromEdge - 0.10) / 0.15);
                            let penalty = falloff * falloff * (3 - 2 * falloff);
                            handMask = 1.0 - penalty;
                        }
                    }
                }
                
                inflationFactor *= handMask;
                
                const pushAmount = inflationFactor * excessBmi * 0.0015 * height;
                
                // Expansión anisotrópica:
                // Prioriza el empuje Frontal (Z) y reduce el empuje Lateral (X).
                // Esto genera una "panza de cerveza" realista en lugar de inflarlo como un globo esférico.
                bx += nx * pushAmount * 0.5;   // 50% expansión hacia los lados (evita caderas anchas)
                by += ny_norm * pushAmount * 0.2;  // 20% expansión hacia arriba/abajo
                bz += nz * pushAmount * 1.3;   // 130% expansión hacia el frente/atrás (panza)
                
                // Gravedad: La panza frontal cuelga hacia abajo
                // Es vital multiplicar por handMask para evitar que los dedos (que están a la misma altura que la panza) se "derritan" hacia abajo.
                if (nz > 0.4 && belly > 0.5) { 
                    by -= belly * excessBmi * 0.001 * height * handMask; 
                }
            }

            positions[i] = bx;
            positions[i + 1] = by;
            positions[i + 2] = bz;
        }
        
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals(); // Recalcular iluminación para la panza nueva
      }
    });
  });

  return (
    <group ref={group} position={[0, -1.31, 0]} scale={scale}>
      {/* Luces extra dedicadas solo para el modelo anatómico para darle nitidez y brillo */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 2, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-3, 0, -3]} intensity={0.5} color="#4fc3f7" />
      
      {/* El ajuste -min.y en el eje Y coloca sus pies exactamente en Y=0 del grupo local */}
      <primitive object={scene} position={[-center.x, -min.y, -center.z]} />
    </group>
  );
});

useGLTF.preload("/models/male_optimized.glb");
useGLTF.preload("/models/Meshy_AI_Anatomy_Illustration_0618034359_texture_optimized.glb");

const statusHex = { ok: "#10b981", warn: "#fbbf24", critical: "#f87171" };

export default function HoloViewer({ status = "ok", driverName, driver }) {
  const modelRef = useRef();
  const [anatomyMode, setAnatomyMode] = useState(false);
  const color = statusHex[status] ?? "#22d3ee";

  const handleExportGLB = async () => {
    if (!modelRef.current) return;
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    const { SimplifyModifier } = await import('three/examples/jsm/modifiers/SimplifyModifier.js');
    const { mergeVertices } = await import('three/examples/jsm/utils/BufferGeometryUtils.js');
    const exporter = new GLTFExporter();
    const modifier = new SimplifyModifier();
    
    const current = driver?.current || { bpSys: 120, bpDia: 80, bmi: 22.0, hr: 70, fatigue: 15, stress: 10 };
    const fatStat = fatigueStatus(current.fatigue);
    const hrStat = hrStatus(current.hr);
    const bpStat = bpStatus(current.bpSys, current.bpDia);
    const bmiStat = bmiStatus(current.bmi);

    // Clonamos el modelo para no afectar el renderizado en vivo
    const exportModel = modelRef.current.clone();

    // Eliminar elementos de la interfaz HUD para la exportación
    const toRemove = [];
    exportModel.traverse((child) => {
      if (child.userData?.isHTMLHUD || child.userData?.isHUDContainer || child.userData?.isExportHUD) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(c => c.parent?.remove(c));

    // Convertir todas las mallas en LineSegments (Wireframe) reducido con Mapa de Calor
    // SOLO para el holograma de alambre. El modelo anatómico se exporta con su malla y textura original.
    if (!anatomyMode) {
    const replacements = [];
    exportModel.traverse((child) => {
      if (child.isMesh) {
        let edges;
        try {
          // Fusionar vértices duplicados (costuras UV) para que SimplifyModifier no falle
          let cleanGeometry = mergeVertices(child.geometry);
          cleanGeometry.computeVertexNormals();

          // Reducir la geometría al 15% de sus vértices (eliminamos el 85%)
          const vertexCount = cleanGeometry.attributes.position.count;
          const removeCount = Math.floor(vertexCount * 0.85);
          
          let simplifiedGeometry = cleanGeometry;
          if (vertexCount > 500) {
              simplifiedGeometry = modifier.modify(cleanGeometry, removeCount);
          }
          
          edges = new THREE.WireframeGeometry(simplifiedGeometry);
        } catch (error) {
          console.warn("SimplifyModifier falló incluso con mergeVertices, usando EdgesGeometry", error);
          edges = new THREE.EdgesGeometry(child.geometry, 15);
        }

        // --- INYECCIÓN DE MAPA DE CALOR BIOMÉTRICO DETALLADO (Vertex Colors) ---
        edges.computeBoundingBox();
        const minY = edges.boundingBox.min.y;
        const maxY = edges.boundingBox.max.y;
        const height = maxY - minY || 1;

        const positions = edges.attributes.position.array;
        const colorsArray = [];
        
        const colorDarkBlue = new THREE.Color("#001133");
        const colorCyan = new THREE.Color("#0ea5e9");
        
        // Puntos de calor basados en la Imagen 3
        const heatNodes = [
          { y: 0.90, status: fatStat, radius: 0.15 }, // Cabeza: Fatiga
          { y: 0.70, status: hrStat, radius: 0.15 },  // Pecho: Frecuencia Cardíaca
          { y: 0.60, status: bpStat, radius: 0.15 },  // Torso bajo/Brazos: Presión Arterial
          { y: 0.45, status: bmiStat, radius: 0.15 }  // Cintura/Abdomen: IMC
        ];

        const getStatusColor = (status) => {
            if (status === 'critical') return new THREE.Color("#ff0b3a"); // Rojo Neón intenso
            if (status === 'warn') return new THREE.Color("#fbbf24"); // Ámbar/Naranja
            return new THREE.Color("#0ea5e9"); // Cian (Estable)
        };

        for (let i = 0; i < positions.length; i += 3) {
            const y = positions[i + 1];
            const ny = (y - minY) / height; // Normalizado de 0 a 1
            
            let vColor = new THREE.Color();
            
            // 1. Degradado base (Pies oscuros -> Resto Cian)
            if (ny < 0.3) {
                vColor.lerpColors(colorDarkBlue, colorCyan, ny / 0.3);
            } else {
                vColor.copy(colorCyan);
            }
            
            // 2. Aplicar nodos de calor con mezcla HSL para evitar colores "sucios" (magenta/gris)
            let maxInfluence = 0;
            let targetHeatColor = null;

            for (let node of heatNodes) {
                if (node.status !== 'ok') {
                    const dist = Math.abs(ny - node.y);
                    if (dist < node.radius) {
                        // Calcular intensidad suave (Smoothstep)
                        const rawIntensity = 1 - (dist / node.radius);
                        const smoothIntensity = rawIntensity * rawIntensity * (3 - 2 * rawIntensity);
                        
                        if (smoothIntensity > maxInfluence) {
                            maxInfluence = smoothIntensity;
                            targetHeatColor = getStatusColor(node.status);
                        }
                    }
                }
            }

            if (maxInfluence > 0 && targetHeatColor) {
                // lerpHSL interpola a través del espectro de color (Cian -> Verde -> Amarillo -> Rojo)
                vColor.lerpHSL(targetHeatColor, maxInfluence * 0.9);
            }
            
            colorsArray.push(vColor.r, vColor.g, vColor.b);
        }
        
        edges.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3));

        // Material configurado para usar Vertex Colors y un grosor base
        const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 1 });
        const line = new THREE.LineSegments(edges, lineMat);
        
        // Copiar transformaciones exactas
        line.position.copy(child.position);
        line.rotation.copy(child.rotation);
        line.scale.copy(child.scale);
        
        replacements.push({ parent: child.parent, oldChild: child, newChild: line });
      }
    });

    // Aplicar los reemplazos
    replacements.forEach(({ parent, oldChild, newChild }) => {
      if (parent) {
        parent.remove(oldChild);
        parent.add(newChild);
      }
    });
    } // Fin del if (!anatomyMode)

    exporter.parse(
      exportModel,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = `humanoide_detallado_${driverName || 'modelo'}.glb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (error) => { console.error("Error al exportar:", error); },
      { binary: true, maxTextureSize: 1024 }
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800/80 bg-[#060a11]">
      <div className="pointer-events-none absolute inset-0 z-10">
        <h2 className="absolute left-4 top-4 text-[#0891b2] text-xs font-mono tracking-widest flex items-center gap-2">
          <span className="w-0.5 h-3 bg-[#06b6d4]"></span>
          PROYECCIÓN BIOMÉTRICA 3D
        </h2>
        
        <div className="absolute top-4 right-4 z-10 flex gap-4 items-center">
          <button 
            onClick={() => setAnatomyMode(!anatomyMode)}
            className={`pointer-events-auto transition-all px-2 py-1 rounded-sm border flex items-center gap-1.5 text-xs font-mono cursor-pointer ${anatomyMode ? 'bg-[#0891b2]/30 text-white border-[#0891b2]' : 'text-[#0891b2] hover:text-[#06b6d4] hover:bg-[#0891b2]/20 bg-[#0891b2]/10 border-[#0891b2]/30'}`}
            title="Alternar vista anatómica / wireframe"
          >
            <Brain size={13} />
            <span>Anatomía</span>
          </button>

          <button 
            onClick={handleExportGLB}
            className="pointer-events-auto text-[#0891b2] hover:text-[#06b6d4] hover:bg-[#0891b2]/20 transition-all bg-[#0891b2]/10 px-2 py-1 rounded-sm border border-[#0891b2]/30 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Exportar humanoide 3D actual"
          >
            <Download size={13} />
            <span>Exportar</span>
          </button>
          <div className="text-[#0891b2] text-xs font-mono tracking-widest flex items-center gap-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></div>
            LIVE TELEMETRY
          </div>
        </div>

        <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500">
          {driverName} · render holográfico
        </div>
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-slate-500">
          arrastra · scroll = zoom
        </div>
        
        <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-cyan-500/10 to-transparent animate-scan" />
      </div>

      <Canvas camera={{ position: [3.3, 0.8, 4.0], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#060a11"]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 8, 5]} intensity={0.9} />
        <pointLight position={[-5, 5, -3]} intensity={0.4} color="#4fc3f7" />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <FlooringRings color={color} />
            {anatomyMode ? (
              <AnatomyModel ref={modelRef} driver={driver} />
            ) : (
              <RealisticOperator color={color} driver={driver} ref={modelRef} />
            )}
          </Float>
          <Grid
            position={[0, -1.31, 0]}
            args={[12, 12]}
            cellColor="#1e293b"
            sectionColor="#0891b2"
            fadeDistance={18}
            infiniteGrid
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
    </div>
  );
}
