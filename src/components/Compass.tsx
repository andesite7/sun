import React, { useRef, useState } from "react";
import { Compass as CompassIcon, Navigation } from "lucide-react";

interface CompassProps {
  value: number; // 0 to 360
  onChange: (val: number) => void;
}

export default function Compass({ value, onChange }: CompassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to calculate angle from pointer event
  const handlePointerUpdate = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Convert vector to angle in degrees (0 is North/up, rotating clockwise)
    let angleRad = Math.atan2(dx, -dy);
    let angleDeg = Math.round(angleRad * (180 / Math.PI));
    if (angleDeg < 0) {
      angleDeg += 360;
    }

    // Round to nearest 5 degrees for clean snapping, but can be 1
    const step = 5;
    const roundedAngle = Math.round(angleDeg / step) * step % 360;
    onChange(roundedAngle);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerUpdate(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.currentTarget.hasPointerCapture(e.pointerId)) {
      handlePointerUpdate(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Cardinal direction label helpers
  const getDirectionText = (angle: number) => {
    const directions = [
      { name: "북 (정북 N)", min: 337.5, max: 22.5 },
      { name: "북동 (NE)", min: 22.5, max: 67.5 },
      { name: "동 (정동 E)", min: 67.5, max: 112.5 },
      { name: "남동 (SE)", min: 112.5, max: 157.5 },
      { name: "남 (정남 S)", min: 157.5, max: 202.5 },
      { name: "남서 (SW)", min: 202.5, max: 247.5 },
      { name: "서 (정서 W)", min: 247.5, max: 292.5 },
      { name: "북서 (NW)", min: 292.5, max: 337.5 },
    ];

    const matched = directions.find((d) => {
      if (d.name.startsWith("북 (")) {
        return angle >= d.min || angle < d.max;
      }
      return angle >= d.min && angle < d.max;
    });

    return matched ? matched.name : `${angle}°`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 py-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4 shadow-sm transition-all duration-300">
      
      {/* Compass Interactive Body */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-44 h-44 rounded-full bg-white border-2 select-none cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow duration-200 ${
          isDragging 
            ? "border-sky-500 shadow-md shadow-sky-100/50" 
            : "border-slate-200 hover:border-slate-300 shadow-inner"
        }`}
        style={{ touchAction: "none" }}
        id="interactive-compass-dial"
      >
        {/* SVG Compass Overlay */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {/* Outer circle layout decoration */}
          <circle 
            cx="100" 
            cy="100" 
            r="92" 
            fill="none" 
            className="stroke-slate-100" 
            strokeWidth="1.5" 
          />
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            className="stroke-slate-100" 
            strokeWidth="1" 
            strokeDasharray="4 4"
          />

          {/* Compass ticks every 30 degrees */}
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = index * 30;
            const angleRad = (angle * Math.PI) / 180;
            const x1 = 100 + Math.sin(angleRad) * 78;
            const y1 = 100 - Math.cos(angleRad) * 78;
            const x2 = 100 + Math.sin(angleRad) * 85;
            const y2 = 100 - Math.cos(angleRad) * 85;
            
            const isCardinal = angle % 90 === 0;
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isCardinal ? "stroke-slate-400" : "stroke-slate-200"}
                strokeWidth={isCardinal ? 1.5 : 1}
              />
            );
          })}

          {/* Fixed Cardinal Direction Labels */}
          <text x="100" y="24" textAnchor="middle" className="text-[12px] font-black fill-slate-800 font-sans tracking-tight">N</text>
          <text x="100" y="186" textAnchor="middle" className="text-[12px] font-bold fill-slate-400 font-sans tracking-tight">S</text>
          <text x="180" y="104" textAnchor="middle" className="text-[12px] font-bold fill-slate-400 font-sans tracking-tight">E</text>
          <text x="20" y="104" textAnchor="middle" className="text-[12px] font-bold fill-slate-400 font-sans tracking-tight">W</text>

          {/* Guidelines showing the raw building center axes */}
          <line x1="100" y1="40" x2="100" y2="160" className="stroke-slate-100/70" strokeWidth="1" />
          <line x1="40" y1="100" x2="160" y2="100" className="stroke-slate-100/70" strokeWidth="1" />

          {/* Rotating Building Silhouette Visual Overlay to mimic structural orientation */}
          <g transform={`rotate(${value}, 100, 100)`}>
            {/* Simple isometric/flat design of a micro roof/building footprint */}
            <rect 
              x="82" 
              y="88" 
              width="36" 
              height="24" 
              rx="2.5" 
              className="fill-slate-100 stroke-slate-200" 
              strokeWidth="1.5" 
            />
            <path 
              d="M 80 88 L 100 74 L 120 88 Z" 
              className="fill-slate-200 stroke-slate-300" 
              strokeWidth="1" 
            />
            
            {/* The Compass Directional needle pointee facing high solar vector arrow */}
            {/* Northern Red Arrow Needle */}
            <path
              d="M 100 15 L 110 65 L 100 55 Z"
              fill="#ef4444"
              className="transition-colors duration-150"
            />
            {/* Southern Dark/Grey Needle */}
            <path
              d="M 100 185 L 110 135 L 100 145 Z"
              fill="#94a3b8"
            />
            
            {/* Connecting side shards for standard elegant nautical aesthetics */}
            <path
              d="M 100 15 L 90 65 L 100 55 Z"
              fill="#dc2626"
            />
            <path
              d="M 100 185 L 90 135 L 100 145 Z"
              fill="#cbd5e1"
            />

            {/* Glowing drag handles at the tip of the needle */}
            <circle
              cx="100"
              cy="15"
              r="6"
              className={`fill-white stroke-red-500 stroke-[2] ${
                isDragging ? "scale-125 stroke-sky-500" : ""
              } transition-transform`}
            />
          </g>

          {/* Compass Center Hub Cap representing solar azimuth origin */}
          <circle cx="100" cy="100" r="8" className="fill-white stroke-slate-300" strokeWidth="2" />
          <circle cx="100" cy="100" r="3" className="fill-slate-800" />
        </svg>

        {/* Center degrees numeric overlay, slightly above/below center to check value at a glance */}
        <div className="absolute top-[68%] flex flex-col items-center justify-center bg-white/90 px-2 py-0.5 rounded-full select-none">
          <span className="text-[10px] font-black text-slate-800 font-mono tracking-wide leading-none">{value}°</span>
        </div>
      </div>

      {/* Compass Value readout badge & guide helper */}
      <div className="w-full flex justify-between items-center px-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
          <Navigation size={12} className="text-slate-400 rotate-45" style={{ transform: `rotate(${value - 45}deg)`, transition: "transform 0.1s ease-out" }} />
          <span>현재 설치 방향:</span>
        </div>
        <span className="font-bold text-slate-800 bg-slate-200/60 font-sans px-2 py-0.5 rounded-md text-[11px]">
          {getDirectionText(value)}
        </span>
      </div>
      
      {/* Light helper caption */}
      <div className="text-[10px] text-slate-400 font-normal leading-relaxed text-center">
        나침반의 빨간 바늘(<span className="text-red-500 font-medium">N측</span>)을 드래그하거나 다이얼을 터치하여 건물의 회전 각도({value}°)를 정밀 지정할 수 있습니다.
      </div>
    </div>
  );
}
