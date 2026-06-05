import React from "react";
import { Layers, Flame, Sun, Sparkles, HelpCircle } from "lucide-react";

interface CurtainWallSectionProps {
  glassRatio: number;      // 0.1 to 0.9 (WWR)
  uValue: number;          // 0.1 to 2.50 (W/m²K)
  shadingCoef: number;      // 0.1 to 1.0 (SHGC)
  absorptionCoef: number;   // 0.1 to 0.95 (α)
}

export default function CurtainWallSection({
  glassRatio,
  uValue,
  shadingCoef,
  absorptionCoef
}: CurtainWallSectionProps) {
  
  // 1. Determine glass system and label based on U-Value
  const getGlassSystem = (uVal: number) => {
    if (uVal <= 0.8) {
      return {
        panes: 3,
        name: "최고단열 삼중 로이유리 (Low-E Triple)",
        gas: "아르곤(Ar) 가스 충전",
        efficiency: "1등급 패시브수준",
        color: "stroke-cyan-500 fill-cyan-50/30"
      };
    } else if (uVal <= 1.5) {
      return {
        panes: 2,
        name: "기본 복층 로이유리 (Double Glazing)",
        gas: "공기층/아르곤 혼합",
        efficiency: "2~3등급 일반 단열",
        color: "stroke-sky-400 fill-sky-50/20"
      };
    } else {
      return {
        panes: 1,
        name: "일반 단판 투명유리 (Single Glazing)",
        gas: "공기층 없음 (열교 발생)",
        efficiency: "등급 외 (에너지 손실 우려)",
        color: "stroke-slate-300 fill-slate-50/10"
      };
    }
  };

  const glassSystem = getGlassSystem(uValue);

  // 2. Determine spandrel backpan color based on solar absorption rate
  const getSpandrelProperties = (absVal: number) => {
    // Low absorption: super reflective metallic silver/white
    // High absorption: dark coal/black granite
    if (absVal <= 0.3) {
      return {
        panelFill: "#f8fafc", // slate-50
        panelStroke: "#cbd5e1",
        absorbedHeat: "반사율 매우 높음 (차가운 표면)",
        label: "고반사 메탈 화이트"
      };
    } else if (absVal <= 0.6) {
      return {
        panelFill: "#94a3b8", // slate-400
        panelStroke: "#64748b",
        absorbedHeat: "중간 태양열 축적",
        label: "알루미늄 아노다이징 그레이"
      };
    } else {
      return {
        panelFill: "#1e293b", // slate-800 original dark
        panelStroke: "#0f172a",
        absorbedHeat: "표면 축열 극대화 (고온 변형 유의)",
        label: "다크 세라믹/다크 그레이"
      };
    }
  };

  const spandrel = getSpandrelProperties(absorptionCoef);

  // 3. Shading efficiency notes
  const getShadingInfo = (sc: number) => {
    if (sc <= 0.3) {
      return "고성능 특수 반사 코팅 (실내 쾌적)";
    } else if (sc <= 0.6) {
      return "반사/차양 필름 부착 상태";
    } else {
      return "무차양 투명 창 (여름철 일사 유입 과다)";
    }
  };

  // 4. Calculate relative spatial heights for SVG elements based on glassRatio (WWR)
  // Total usable canvas height inside layout is 180px for the wall.
  // We distribute between upper spandrel, middle window, and lower spandrel/kneewall.
  const wallTotalHeight = 160;
  const windowHeight = wallTotalHeight * glassRatio;
  const spandrelHeight = wallTotalHeight - windowHeight;
  
  // Center the window in the vertical space
  const wallTop = 30; // Starts below header slab
  const windowTop = wallTop + spandrelHeight / 2;
  const windowBottom = windowTop + windowHeight;
  const spandrelTopPartHeight = spandrelHeight / 2;
  const spandrelBottomPartHeight = spandrelHeight / 2;

  return (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-4 shadow-md mt-4 transition-all duration-300">
      {/* Title & Metadata Headers */}
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-sky-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            커튼월 실시간 단면 상세도
          </span>
        </div>
        <span className="text-[9px] font-mono bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-900">
          Scale Multi-Layer
        </span>
      </div>

      {/* SVG Canvas Workspace */}
      <div className="relative w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col items-center">
        {/* Sky Background indicator glow based on absorption / solar variables */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.06),transparent_60%)] pointer-events-none" />

        <svg className="w-full h-[220px]" viewBox="0 0 320 220" id="curtainwall-vector">
          {/* Definitions for textures and markers */}
          <defs>
            {/* Diagonal hatch pattern for concrete slabs */}
            <pattern id="concrete-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="1" />
              <circle cx="3" cy="3" r="0.75" fill="#475569" />
            </pattern>
            {/* Dash line marker for solar rays */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Guidelines and Zones */}
          <text x="10" y="24" className="text-[8px] font-semibold fill-slate-500 tracking-wider">실외 (OUTSIDE)</text>
          <text x="310" y="24" textAnchor="end" className="text-[8px] font-semibold fill-slate-500 tracking-wider">실내 (INSIDE)</text>

          {/* 1. STRUCTURAL CONCRETE SLABS (Top and Bottom) */}
          {/* Top Floor Slab */}
          <rect x="180" y="0" width="140" height="25" fill="url(#concrete-hatch)" className="stroke-slate-800" strokeWidth="1" />
          <line x1="180" y1="25" x2="320" y2="25" className="stroke-slate-700" strokeWidth="1.5" />
          {/* Bottom Floor Slab */}
          <rect x="180" y="195" width="140" height="25" fill="url(#concrete-hatch)" className="stroke-slate-800" strokeWidth="1" />
          <line x1="180" y1="195" x2="320" y2="195" className="stroke-slate-700" strokeWidth="1.5" />

          {/* Slab description */}
          <text x="250" y="17" textAnchor="middle" className="text-[8px] font-bold fill-slate-400 font-sans">바닥 슬래브(Con'c Slabs)</text>
          <text x="250" y="212" textAnchor="middle" className="text-[8px] font-bold fill-slate-400 font-sans">외주부 바닥 슬래브</text>

          {/* 2. ALUMINUM VERTICAL MULLION FRAME (Main spine of Curtain Wall) */}
          {/* Runs vertically at x=140 */}
          <rect x="135" y="25" width="20" height="170" fill="#334155" className="stroke-slate-700" strokeWidth="1" />
          {/* Back anchors attaching frame to concrete slab */}
          <rect x="155" y="90" width="25" height="15" fill="#475569" className="stroke-slate-600" />
          <line x1="180" y1="97" x2="155" y2="97" className="stroke-slate-400" strokeWidth="2" />
          <text x="182" y="101" className="text-[8px] fill-slate-400 font-medium">슬래브 패스트너</text>

          {/* 3. DYNAMIC WINDOW GLAZING ELEMENT */}
          {/* Window Frame Holder */}
          <rect x="125" y={windowTop - 4} width="20" height="8" fill="#1e293b" className="stroke-slate-600" />
          <rect x="125" y={windowBottom - 4} width="20" height="8" fill="#1e293b" className="stroke-slate-600" />

          {/* Drawn panes dynamically based on glassSystem.panes */}
          {Array.from({ length: glassSystem.panes }).map((_, idx) => {
            // Distribute glass lines slightly inside the frame width x=128 to 134
            const offset = idx * 4;
            const glassX = 127 + offset;
            return (
              <g key={idx}>
                {/* Micro glass pane line */}
                <line
                  x1={glassX}
                  y1={windowTop}
                  x2={glassX}
                  y2={windowBottom}
                  className={`stroke-[1.5] ${glassSystem.color}`}
                />
              </g>
            );
          })}
          {/* Filling/shading dynamic glass block space for better visual feedback */}
          <rect
            x="126"
            y={windowTop}
            width={4 + (glassSystem.panes - 1) * 4}
            height={windowHeight}
            className="fill-sky-400/10 pointer-events-none"
          />

          {/* 4. DYNAMIC SPANDREL (OPAQUE WALL) PANEL */}
          {/* Top Spandrel section */}
          {spandrelTopPartHeight > 5 && (
            <g>
              {/* External Metal/Ceramic Wall panel */}
              <rect
                x="125"
                y={wallTop}
                width="10"
                height={spandrelTopPartHeight - 4}
                fill={spandrel.panelFill}
                stroke={spandrel.panelStroke}
                strokeWidth="1.5"
                className="transition-colors duration-500"
              />
              {/* Back insulation hatch pattern (Mineral Wool / Glass Fiber backing) */}
              <rect
                x="145"
                y={wallTop}
                width="15"
                height={spandrelTopPartHeight - 4}
                fill="none"
                stroke="#d97706"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-40"
              />
              <path
                d={`M 148 ${wallTop} L 158 ${wallTop + spandrelTopPartHeight - 4}`}
                stroke="#b45309"
                strokeWidth="0.5"
                strokeDasharray="2 3"
              />
            </g>
          )}

          {/* Bottom Spandrel section (Spandrel panel / Kneewall) */}
          {spandrelBottomPartHeight > 5 && (
            <g>
              {/* External Opaque Panel */}
              <rect
                x="125"
                y={windowBottom + 4}
                width="10"
                height={spandrelBottomPartHeight - 4}
                fill={spandrel.panelFill}
                stroke={spandrel.panelStroke}
                strokeWidth="1.5"
                className="transition-colors duration-500"
              />
              {/* Insulation layer backing */}
              <rect
                x="145"
                y={windowBottom + 4}
                width="15"
                height={spandrelBottomPartHeight - 4}
                fill="none"
                stroke="#d97706"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-40"
              />
              <path
                d={`M 148 ${windowBottom + 4} L 158 ${windowBottom + spandrelBottomPartHeight - 4}`}
                stroke="#b45309"
                strokeWidth="0.5"
                strokeDasharray="2 3"
              />
            </g>
          )}

          {/* 5. VISUALIZING SUNLIGHT INFLOW (SHGC / shadingCoef) */}
          {/* Animated solar ray dashed arrows penetrating or bouncing */}
          {/* Outer ray coming down */}
          <path
            d="M 15 45 L 85 95"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            markerEnd="url(#arrow)"
            className="animate-[dash_2s_linear_infinite]"
          />
          <text x="35" y="47" className="text-[7px] font-bold fill-amber-400 font-mono">태양 일사 (Solar Load)</text>

          {/* Reflective rebound ray based on shading Coefficient (shadingCoef) */}
          {/* Low shadingCoef = highly reflective. High SC = low reflection. */}
          {shadingCoef < 0.8 && (
            <path
              d="M 85 95 L 45 135"
              stroke="#fbbf24"
              strokeWidth={Math.max(1, (1 - shadingCoef) * 2.5)}
              className="opacity-80"
              markerEnd="url(#arrow)"
            />
          )}
          {shadingCoef < 0.6 && (
            <text x="25" y="145" className="text-[7px] font-bold fill-yellow-500 font-mono">
              반사/차단 {Math.round((1 - shadingCoef) * 100)}%
            </text>
          )}

          {/* Transmitted ray entering room */}
          {/* Thickness of inside ray depends directly on shadingCoef (higher SC = thicker transmission) */}
          <path
            d="M 132 95 L 180 135"
            stroke="#f59e0b"
            strokeWidth={Math.max(0.75, shadingCoef * 3)}
            strokeDasharray={shadingCoef > 0.6 ? "none" : "3 3"}
            className="opacity-75"
            markerEnd="url(#arrow)"
          />
          <text x="185" y="142" className="text-[7px] font-bold fill-amber-500 font-mono">
            {shadingCoef > 0.6 ? "⚠️ 대량 태양열 복사" : `감쇠 이입 (${shadingCoef.toFixed(2)} SC)`}
          </text>

          {/* 6. HEAT LOSS / GAIN FLUX ARROWS (uValue) */}
          {/* Heat transfer arrow through glass block */}
          {/* High U-Value = aggressive heat transfer (thick red/blue double lines) */}
          {/* Low U-Value = robust insulated thermal barrier */}
          <g>
            {/* Real-time heat transfer visualization */}
            {uValue > 1.4 ? (
              // Heat loss/gain leakage (High Uvalue)
              <g>
                <path
                  d="M 105 155 Q 125 155 145 160"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  fill="none"
                  markerEnd="url(#arrow-red)"
                  className="animate-pulse"
                />
                <path
                  d="M 165 160 Q 185 165 210 165"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  fill="none"
                  markerEnd="url(#arrow-red)"
                  className="animate-pulse"
                />
                {/* Flame icon or Warning badge representing thermal leak */}
                <text x="150" y="180" textAnchor="middle" className="text-[7px] font-bold fill-rose-500 font-sans">
                  ⚠️ 단열 취약 (열교 현상)
                </text>
              </g>
            ) : uValue > 0.8 ? (
              // Moderate heat transfer
              <g>
                <path
                  d="M 110 155 Q 125 155 140 158"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  fill="none"
                  markerEnd="url(#arrow-red)"
                />
                <path
                  d="M 155 158 Q 175 160 195 160"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  fill="none"
                  markerEnd="url(#arrow-red)"
                />
              </g>
            ) : (
              // Ultra High Efficiency (Blocked/Shielded Heat Transfer)
              <g>
                {/* Glow ring of protection around mullion to show premium barrier */}
                <ellipse cx="140" cy="155" rx="10" ry="15" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 1" />
                <path
                  d="M 105 155 Q 120 155 125 150"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#arrow-blue)"
                />
                <path
                  d="M 125 150 Q 120 145 105 145"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  fill="none"
                />
                <text x="145" y="182" textAnchor="middle" className="text-[7.5px] font-extrabold fill-emerald-500 font-sans">
                  🛡️ 단열 장벽 (U-value 우수)
                </text>
              </g>
            )}
          </g>

          {/* 7. DETAILED GRAPHIC OVERLAYS & LEGEND HUD */}
          {/* Dynamic absorption coef visual heating glow */}
          {absorptionCoef > 0.6 && (
            <g>
              {/* Highlight red flame/heat circles around the external spandrel node to denote high solar absorption */}
              <circle cx="120" cy={wallTop + spandrelTopPartHeight/2} r="4" fill="#ef4444" className="animate-ping opacity-60 pointer-events-none" />
              <text x="110" y={wallTop + spandrelTopPartHeight/2 + 2} textAnchor="end" className="text-[6.5px] font-bold fill-red-400">
                흡수 고온
              </text>
            </g>
          )}

          {/* Dimension Lines representing WWR glass proportion vs Opaque height */}
          <line x1="100" y1={wallTop} x2="100" y2={windowTop} stroke="#475569" strokeWidth="0.75" />
          <line x1="97" y1={wallTop} x2="103" y2={wallTop} stroke="#475569" strokeWidth="1" />
          <line x1="97" y1={windowTop} x2="103" y2={windowTop} stroke="#475569" strokeWidth="1" />
          <text x="92" y={(wallTop + windowTop)/2 + 2} textAnchor="end" className="text-[6px] fill-slate-500 font-mono">
            {Math.round((1 - glassRatio) * 50)}% 
          </text>

          <line x1="100" y1={windowTop} x2="100" y2={windowBottom} stroke="#0284c7" strokeWidth="1" />
          <line x1="96" y1={windowTop} x2="104" y2={windowTop} stroke="#0284c7" strokeWidth="1" />
          <line x1="96" y1={windowBottom} x2="104" y2={windowBottom} stroke="#0284c7" strokeWidth="1" />
          <text x="92" y={(windowTop + windowBottom)/2 + 3} textAnchor="end" className="text-[7.5px] font-black fill-sky-400 font-mono">
            WWR {Math.round(glassRatio * 100)}%
          </text>

          <line x1="100" y1={windowBottom} x2="100" y2={windowBottom + spandrelBottomPartHeight} stroke="#475569" strokeWidth="0.75" />
          <line x1="97" y1={windowBottom} x2="103" y2={windowBottom} stroke="#475569" strokeWidth="1" />
          <line x1="97" y1={windowBottom + spandrelBottomPartHeight} x2="103" y2={windowBottom + spandrelBottomPartHeight} stroke="#475569" strokeWidth="1" />
          <text x="92" y={(windowBottom * 2 + spandrelBottomPartHeight)/2 + 2} textAnchor="end" className="text-[6px] fill-slate-500 font-mono">
            {Math.round((1 - glassRatio) * 50)}%
          </text>
        </svg>

        {/* Global Keyframe CSS overrides embedded specifically inside this section */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dash {
            to {
              stroke-dashoffset: -20;
            }
          }
        `}} />
      </div>

      {/* Dynamic Properties Explanations (Korean) */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Glass System Spec */}
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800 space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-3 bg-sky-400 rounded-sm" />
            <span className="font-bold text-slate-300">유리 사양 디테일</span>
          </div>
          <span className="block text-sky-300 font-medium leading-tight">
            {glassSystem.name}
          </span>
          <span className="block text-slate-400 text-[9px] leading-none">
            {glassSystem.gas} • <span className="text-sky-400/80">{glassSystem.efficiency}</span>
          </span>
        </div>

        {/* Spandrel Absorption Spec */}
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800 space-y-1">
          <div className="flex items-center gap-1">
            <div 
              className="w-1.5 h-3 rounded-sm transition-colors duration-500" 
              style={{ backgroundColor: spandrel.panelFill, border: `1px solid ${spandrel.panelStroke}` }} 
            />
            <span className="font-bold text-slate-300">외벽 패널 화학물성</span>
          </div>
          <span className="block text-amber-200 font-medium leading-tight">
            {spandrel.label} ({Math.round(absorptionCoef * 100)}% α)
          </span>
          <span className="block text-slate-400 text-[9px] leading-none">
            {spandrel.absorbedHeat}
          </span>
        </div>

        {/* Shading efficiency */}
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800 space-y-1 col-span-2">
          <div className="flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1 text-slate-300 font-bold">
              <Sun size={11} className="text-amber-400" />
              <span>차양제어 / 로이 기능</span>
            </div>
            <span className="text-amber-300 font-bold font-mono">SC: {shadingCoef.toFixed(2)}</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-relaxed">
            {getShadingInfo(shadingCoef)}
          </p>
        </div>
      </div>
    </div>
  );
}
