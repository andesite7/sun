import { useMemo } from "react";
import { SimulationResult } from "../types";
import { Sun, BatteryCharging, Flame, Zap, ShieldAlert } from "lucide-react";

interface ChartsProps {
  dayProfile: SimulationResult[];
  currentMetrics: SimulationResult;
  currentHour: number;
}

export default function Charts({ dayProfile, currentMetrics, currentHour }: ChartsProps) {
  // Memoize key values for custom high-contrast SVG path calculation
  const maxEnergy = useMemo(() => {
    return Math.max(...dayProfile.map((d) => d.energyConsumption), 100);
  }, [dayProfile]);

  const maxSolar = useMemo(() => {
    return Math.max(...dayProfile.map((d) => d.solarPowerGen), 50);
  }, [dayProfile]);

  const maxIrradiance = useMemo(() => {
    return Math.max(...dayProfile.map((d) => d.directSolarIrradiance), 500);
  }, [dayProfile]);

  // Translate 24-point dataset into SVG viewbox coordinates (width: 500, height: 200)
  const energyPoints = useMemo(() => {
    return dayProfile
      .map((d, index) => {
        const x = (index / 24) * 440 + 30;
        const y = 170 - (d.energyConsumption / maxEnergy) * 130;
        return `${x},${y}`;
      })
      .join(" ");
  }, [dayProfile, maxEnergy]);

  const solarPoints = useMemo(() => {
    return dayProfile
      .map((d, index) => {
        const x = (index / 24) * 440 + 30;
        const y = 170 - (d.solarPowerGen / maxSolar) * 130;
        return `${x},${y}`;
      })
      .join(" ");
  }, [dayProfile, maxSolar]);

  const irradiancePoints = useMemo(() => {
    return dayProfile
      .map((d, index) => {
        const x = (index / 24) * 440 + 30;
        const y = 170 - (d.directSolarIrradiance / maxIrradiance) * 130;
        return `${x},${y}`;
      })
      .join(" ");
  }, [dayProfile, maxIrradiance]);

  // Current hour marker X calculation
  const currentHourX = useMemo(() => {
    return (currentHour / 24) * 440 + 30;
  }, [currentHour]);

  // Carbon credits offset approximation (Tons of CO2 saved annually, using a simplified building grid replacement offset metric)
  const annualCarbonSavings = useMemo(() => {
    const totalDailySolarGenKwh = dayProfile.reduce((acc, d) => acc + d.solarPowerGen, 0);
    // 1 kWh solar replaces 0.45kg grid CO2
    const dailyCo2SavedKg = totalDailySolarGenKwh * 0.45;
    const annualSavedTons = (dailyCo2SavedKg * 365) / 1000;
    return annualSavedTons.toFixed(2);
  }, [dayProfile]);

  return (
    <div className="space-y-6">
      {/* 1. Numerical Real-Time Gauges (Live KPI Panel) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI: Ambient Solar Intensity */}
        <div className="p-3 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 shadow-inner">
            <Sun size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-tight">태양 일사 강도</span>
            <span className="text-sm font-bold text-slate-800">
              {currentMetrics.directSolarIrradiance} <span className="text-[10px] font-normal text-slate-500">W/m²</span>
            </span>
          </div>
        </div>

        {/* KPI: HVAC Thermal Load */}
        <div className="p-3 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 shadow-inner ${
            currentMetrics.thermalFacadeGain > 0 
              ? "bg-rose-50 text-rose-500" 
              : currentMetrics.thermalFacadeGain < 0 
                ? "bg-blue-50 text-blue-500" 
                : "bg-slate-50 text-slate-400"
          }`}>
            <Flame size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-tight">외벽 냉난방 열부하</span>
            <span className="text-sm font-bold text-slate-800">
              {currentMetrics.thermalFacadeGain > 0 ? "+" : ""}
              {currentMetrics.thermalFacadeGain} <span className="text-[10px] font-normal text-slate-500">kW</span>
            </span>
          </div>
        </div>

        {/* KPI: Building Energy Power Consumption */}
        <div className="p-3 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-500 rounded-lg shrink-0 shadow-inner">
            <Zap size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-tight">건물 전력 소모량</span>
            <span className="text-sm font-bold text-slate-800">
              {currentMetrics.energyConsumption} <span className="text-[10px] font-normal text-slate-500">kW</span>
            </span>
          </div>
        </div>

        {/* KPI: Solar Generation PV */}
        <div className="p-3 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-lg shrink-0 shadow-inner">
            <BatteryCharging size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-tight">태양광 옥상 전력</span>
            <span className="text-sm font-bold text-slate-800">
              {currentMetrics.solarPowerGen} <span className="text-[10px] font-normal text-slate-500">kW</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Custom 24-Hour Interactive System Balance Curve */}
      <div className="p-4 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">24시간 시스템 전력 배런싱 곡선 (kW)</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">실시간 시간대별 태양광 발전 vs 빌딩 전력 소비량 추이</p>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <span className="h-1.5 w-3 bg-sky-500 rounded-full inline-block"></span>
              빌딩 전력 부하
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <span className="h-1.5 w-3 bg-emerald-500 rounded-full inline-block"></span>
              태양에너지 생성
            </span>
          </div>
        </div>

        <div className="relative h-44 w-full">
          <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
            {/* Grid background lines */}
            <line x1="30" y1="40" x2="470" y2="40" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="105" x2="470" y2="105" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="170" x2="470" y2="170" stroke="#e2e8f0" strokeWidth="1" />

            {/* Grid label markers */}
            <text x="5" y="44" fill="#94a3b8" fontSize="8" fontFamily="monospace">MAX</text>
            <text x="5" y="109" fill="#94a3b8" fontSize="8" fontFamily="monospace">MID</text>
            <text x="5" y="174" fill="#94a3b8" fontSize="8" fontFamily="monospace">0 kW</text>

            {/* Time labels below axis */}
            <text x="30" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">00</text>
            <text x="140" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">06</text>
            <text x="250" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">12</text>
            <text x="360" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">18</text>
            <text x="470" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">24</text>

            {/* High-quality SVG curves */}
            {/* Building energy demand line */}
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={energyPoints}
              className="transition-all duration-300"
            />
            {/* Solar power PV line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={solarPoints}
              className="transition-all duration-300"
            />

            {/* Shaded baseline Area under curves to look polished */}
            <path
              d={`M 30,170 L ${energyPoints} L 470,170 Z`}
              fill="url(#energyGrad)"
              opacity="0.08"
            />
            <path
              d={`M 30,170 L ${solarPoints} L 470,170 Z`}
              fill="url(#solarGrad)"
              opacity="0.08"
            />

            {/* Current Hour Slider Marker vertical line */}
            <line
              x1={currentHourX}
              y1="25"
              x2={currentHourX}
              y2="170"
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <circle cx={currentHourX} cy={170 - (currentMetrics.energyConsumption / maxEnergy) * 130} r="4" fill="#0ea5e9" stroke="white" strokeWidth="1.5" />
            <circle cx={currentHourX} cy={170 - (currentMetrics.solarPowerGen / maxSolar) * 130} r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />

            {/* Gradient declarations */}
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 3. Solar Radiation curve and carbon credit forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Irradiance details */}
        <div className="p-4 bg-cardbg border border-slate-200/60 rounded-xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 space-y-2 col-span-2">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-semibold text-slate-700">시뮬레이션 태양 직접 일사량 곡선 (W/m²)</h5>
            <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
              Peak: {Math.round(maxIrradiance)} W/m²
            </span>
          </div>
          <div className="h-24 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="30" y1="10" x2="470" y2="10" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="110" x2="470" y2="110" stroke="#e2e8f0" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                points={irradiancePoints}
                className="transition-all duration-300"
              />
              <line
                x1={currentHourX}
                y1="10"
                x2={currentHourX}
                y2="110"
                stroke="#f43f5e"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Environmental sustainability impact */}
        <div className="p-4 bg-gradient-to-br from-emerald-950 to-teal-900 border border-emerald-900 rounded-xl text-emerald-100 flex flex-col justify-between shadow-soft-3d">
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">ESG 기후영향 상쇄 통계</h5>
            <span className="block text-xl font-bold mt-2">
              {annualCarbonSavings} <span className="text-xs font-normal text-emerald-300">Tons / CO₂</span>
            </span>
            <p className="text-[10px] text-emerald-200 mt-1 lines-clamp-2">
              본 자재사양(WWR, 단열관류율) 설치 시 태양 에너지 발전을 통해 연간 세이빙 가능한 예상 탄소 배출 절감 등가 지표입니다.
            </p>
          </div>
          
          <div className="pt-2 border-t border-emerald-800 flex items-center justify-between text-[10px]">
            <span>연간 대체 조림 면적</span>
            <span className="font-bold text-emerald-300">
              +{Math.round(parseFloat(annualCarbonSavings) * 15)} 그루
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
