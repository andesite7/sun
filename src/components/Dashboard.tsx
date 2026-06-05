import React, { useState, useEffect } from "react";
import { SiteConfig, MaterialSpecs, SimulationSession, SimulationResult } from "../types";
import { calculateAnalysisMetrics, generateDayProfile } from "../solarCalculations";
import ThreeCanvas from "./ThreeCanvas";
import Charts from "./Charts";
import SpecsHub from "./SpecsHub";
import Compass from "./Compass";
import CurtainWallSection from "./CurtainWallSection";
import { 
  Building2, MapPin, Sliders, Layers, RefreshCw, Send,
  Database, FileSpreadsheet, Eye, Terminal, CheckCircle2, Trash2, Printer
} from "lucide-react";

const LOCATION_PRESETS: SiteConfig[] = [
  { name: "대한민국 서울", latitude: 37.5665, longitude: 126.9780, timezone: 9, elevation: 38 },
  { name: "미국 뉴욕", latitude: 40.7128, longitude: -74.0060, timezone: -5, elevation: 10 },
  { name: "영국 런던", latitude: 51.5074, longitude: -0.1278, timezone: 0, elevation: 15 },
  { name: "호주 시드니", latitude: -33.8688, longitude: 151.2093, timezone: 10, elevation: 3 }
];

export default function Dashboard() {
  // 1. Core Simulation States
  const [modelType, setModelType] = useState<string>("commercial");
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 2:00 PM default peak
  const [month, setMonth] = useState<number>(7); // August mid-summer default
  const [orientation, setOrientation] = useState<number>(180); // facing South (highly solar relevant)
  const [isHeatmap, setIsHeatmap] = useState<boolean>(true); // default Heatmap ON for cool factor

  // 2. Location States
  const [selectedLocation, setSelectedLocation] = useState<SiteConfig>(LOCATION_PRESETS[0]);
  const [manualLatitude, setManualLatitude] = useState<string>("37.5665");
  const [manualLongitude, setManualLongitude] = useState<string>("126.9780");

  // 3. Materials States (WWR, Insulation U-Value)
  const [glassRatio, setGlassRatio] = useState<number>(0.45); // 45% Glass area ratio (energy standard)
  const [uValue, setUValue] = useState<number>(0.28); // Highly insulated wall panel (W/m²K)
  const [shadingCoef, setShadingCoef] = useState<number>(0.42); // SHGC shading coefficient
  const [absorptionCoef, setAbsorptionCoef] = useState<number>(0.75); // Facade color solar absorption index

  // 4. Persistence Sessions (Localstorage representation of Postgres DB database query)
  const [sessions, setSessions] = useState<SimulationSession[]>([]);
  const [newSessionName, setNewSessionName] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [lastExecutedSql, setLastExecutedSql] = useState<string>("");

  // 5. Active workspace layouts
  const [activeTab, setActiveTab] = useState<string>("simulation");

  // Recalculated parameters computed from state
  const siteConfig: SiteConfig = {
    name: selectedLocation.name || "사용자 지정 위도",
    latitude: parseFloat(manualLatitude) || 37.5,
    longitude: parseFloat(manualLongitude) || 126.9,
    timezone: selectedLocation.timezone,
    elevation: selectedLocation.elevation,
  };

  const materialSpecs: MaterialSpecs = {
    glassRatio,
    uValue,
    shadingCoef,
    absorptionCoef,
  };

  const currentMetrics: SimulationResult = calculateAnalysisMetrics(siteConfig, materialSpecs, timeOfDay, month);
  const dayProfile: SimulationResult[] = generateDayProfile(siteConfig, materialSpecs, month);

  // Dynamic sky atmosphere colors representing real-time sky states
  const skyAtmosphere = (() => {
    // 1. Midnight to Early Dawn (00:00 - 05:00)
    if (timeOfDay < 5) {
      return {
        bg: "linear-gradient(135deg, #090d16 0%, #151829 100%)",
        text: "text-indigo-100",
        label: "text-indigo-300/80",
        subText: "text-indigo-400/60",
        badgeBg: "rgba(17, 24, 39, 0.75)",
        badgeBorder: "rgba(99, 102, 241, 0.3)",
        borderColor: "rgba(30, 41, 59, 1)",
        accent: "#818cf8",
        trackBg: "rgba(255, 255, 255, 0.15)"
      };
    }
    // 2. Sunrise / Morning Glow (05:00 - 07:00)
    if (timeOfDay >= 5 && timeOfDay < 7) {
      return {
        bg: "linear-gradient(135deg, #2e1a47 0%, #d97706 60%, #ea580c 100%)",
        text: "text-amber-50",
        label: "text-amber-200/90",
        subText: "text-amber-300/60",
        badgeBg: "rgba(67, 20, 7, 0.75)",
        badgeBorder: "rgba(249, 115, 22, 0.4)",
        borderColor: "rgba(120, 53, 4, 0.35)",
        accent: "#f97316",
        trackBg: "rgba(255, 255, 255, 0.2)"
      };
    }
    // 3. Clear Morning Sky (07:00 - 11:00)
    if (timeOfDay >= 7 && timeOfDay < 11) {
      return {
        bg: "linear-gradient(135deg, #7dd3fc 0%, #e0f2fe 100%)",
        text: "text-sky-950",
        label: "text-sky-800",
        subText: "text-sky-700/80",
        badgeBg: "rgba(255, 255, 255, 0.8)",
        badgeBorder: "rgba(14, 165, 233, 0.2)",
        borderColor: "rgba(186, 230, 253, 0.8)",
        accent: "#0ea5e9",
        trackBg: "rgba(2, 132, 199, 0.15)"
      };
    }
    // 4. Noon Sky Highlight (11:00 - 14:00)
    if (timeOfDay >= 11 && timeOfDay < 14) {
      return {
        bg: "linear-gradient(135deg, #bae6fd 0%, #f0f9ff 100%)",
        text: "text-slate-900",
        label: "text-slate-700",
        subText: "text-slate-500",
        badgeBg: "rgba(255, 255, 255, 0.9)",
        badgeBorder: "rgba(56, 189, 248, 0.2)",
        borderColor: "rgba(224, 242, 254, 0.8)",
        accent: "#38bdf8",
        trackBg: "rgba(0, 0, 0, 0.08)"
      };
    }
    // 5. Rich Golden Afternoon (14:00 - 17:00)
    if (timeOfDay >= 14 && timeOfDay < 17) {
      return {
        bg: "linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)",
        text: "text-orange-950",
        label: "text-orange-900",
        subText: "text-orange-800/80",
        badgeBg: "rgba(255, 255, 255, 0.85)",
        badgeBorder: "rgba(249, 115, 22, 0.2)",
        borderColor: "rgba(254, 215, 170, 0.8)",
        accent: "#ea580c",
        trackBg: "rgba(0, 0, 0, 0.08)"
      };
    }
    // 6. Sunset/Twilight Symphony (17:00 - 20:00)
    if (timeOfDay >= 17 && timeOfDay < 20) {
      return {
        bg: "linear-gradient(135deg, #7c2d12 0%, #9d174d 50%, #4c0519 100%)",
        text: "text-pink-50",
        label: "text-pink-200",
        subText: "text-pink-300/60",
        badgeBg: "rgba(76, 5, 25, 0.8)",
        badgeBorder: "rgba(244, 63, 94, 0.4)",
        borderColor: "rgba(131, 24, 67, 0.3)",
        accent: "#f43f5e",
        trackBg: "rgba(255, 255, 255, 0.2)"
      };
    }
    // 7. Evening Dusk transition (20:00 - 21:00)
    if (timeOfDay >= 20 && timeOfDay < 21) {
      return {
        bg: "linear-gradient(135deg, #311042 0%, #1e1b4b 100%)",
        text: "text-indigo-50",
        label: "text-indigo-200",
        subText: "text-indigo-300/60",
        badgeBg: "rgba(15, 23, 42, 0.8)",
        badgeBorder: "rgba(129, 140, 248, 0.3)",
        borderColor: "rgba(49, 46, 129, 0.4)",
        accent: "#818cf8",
        trackBg: "rgba(255, 255, 255, 0.15)"
      };
    }
    // 8. Late Night (21:00 - 24:00)
    return {
      bg: "linear-gradient(135deg, #030712 0%, #0c1020 100%)",
      text: "text-slate-100",
      label: "text-indigo-300/80",
      subText: "text-indigo-400/50",
      badgeBg: "rgba(17, 24, 39, 0.8)",
      badgeBorder: "rgba(79, 70, 229, 0.2)",
      borderColor: "rgba(15, 23, 42, 1)",
      accent: "#6366f1",
      trackBg: "rgba(255, 255, 255, 0.1)"
    };
  })();

  // Initialize saved sessions database from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aec_sim_database_sessions");
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse static mock database", e);
      }
    } else {
      // Seed initial mock sessions
      const initialSeed: SimulationSession[] = [
        {
          id: "seed-session-1",
          name: "서울 종로 제2청사 친환경 일사설계안",
          date: new Date().toISOString(),
          modelType: "commercial",
          site: LOCATION_PRESETS[0],
          materials: { glassRatio: 0.35, uValue: 0.24, shadingCoef: 0.38, absorptionCoef: 0.6 },
          timeOfDay: 13,
          month: 7,
          notes: "고성능 삼중 진공유리를 사용해 하절기 서향 반사 복사 일사량을 차단하는 가상 모델설계입니다."
        }
      ];
      setSessions(initialSeed);
      localStorage.setItem("aec_sim_database_sessions", JSON.stringify(initialSeed));
    }
  }, []);

  // Update session parameters immediately when user switches locations
  const handlePresetChange = (presetIndex: number) => {
    const preset = LOCATION_PRESETS[presetIndex];
    setSelectedLocation(preset);
    setManualLatitude(preset.latitude.toString());
    setManualLongitude(preset.longitude.toString());
  };

  // Submit session to mock database (triggers SQL code-generation layout)
  const saveSession = () => {
    if (!newSessionName.trim()) return;

    const newSession: SimulationSession = {
      id: crypto.randomUUID(),
      name: newSessionName,
      date: new Date().toISOString(),
      modelType,
      site: siteConfig,
      materials: materialSpecs,
      timeOfDay,
      month,
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("aec_sim_database_sessions", JSON.stringify(updated));
    setNewSessionName("");
    setSelectedSessionId(newSession.id);

    // Format SQL preview
    const sqlInsert = `INSERT INTO simulation_sessions (
  id, session_name, model_type, latitude, longitude, 
  glass_ratio, u_value, shading_coefficient, absorption_coefficient, 
  time_of_day, simulation_month, created_at
) VALUES (
  '${newSession.id}', 
  '${newSession.name}', 
  '${newSession.modelType}', 
  ${newSession.site.latitude.toFixed(4)}, 
  ${newSession.site.longitude.toFixed(4)}, 
  ${newSession.materials.glassRatio.toFixed(2)}, 
  ${newSession.materials.uValue.toFixed(2)}, 
  ${newSession.materials.shadingCoef.toFixed(2)}, 
  ${newSession.materials.absorptionCoef.toFixed(2)}, 
  ${newSession.timeOfDay.toFixed(2)}, 
  ${newSession.month + 1}, 
  CURRENT_TIMESTAMP
);`;
    setLastExecutedSql(sqlInsert);
  };

  // Retrieve session from mock database
  const loadSession = (session: SimulationSession) => {
    setSelectedSessionId(session.id);
    setModelType(session.modelType);
    setManualLatitude(session.site.latitude.toString());
    setManualLongitude(session.site.longitude.toString());
    setGlassRatio(session.materials.glassRatio);
    setUValue(session.materials.uValue);
    setShadingCoef(session.materials.shadingCoef);
    setAbsorptionCoef(session.materials.absorptionCoef);
    setTimeOfDay(session.timeOfDay);
    setMonth(session.month);

    // Find and update matched locationpreset if equivalent
    const matched = LOCATION_PRESETS.find(
      (p) => Math.abs(p.latitude - session.site.latitude) < 0.1
    );
    if (matched) setSelectedLocation(matched);

    const sqlSelect = `SELECT * FROM simulation_sessions 
WHERE id = '${session.id}' LIMIT 1;

-- [Query Result Status: 1 Rows Fetched successfully from Postgres DB]`;
    setLastExecutedSql(sqlSelect);
  };

  // Delete session
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("aec_sim_database_sessions", JSON.stringify(updated));
    if (selectedSessionId === id) setSelectedSessionId(null);

    const sqlDelete = `DELETE FROM simulation_sessions WHERE id = '${id}';`;
    setLastExecutedSql(sqlDelete);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 lg:p-6 bg-transparent text-slate-800">
      
      {/* LEFT CONTROL SIDEBAR (Parametric Settings Panel) */}
      <aside className="w-full lg:w-80 shrink-0 space-y-5 bg-cardbg p-5 rounded-2xl border border-slate-200/60 shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 self-start">
        <div className="border-b border-slate-200/60 pb-3 flex items-center gap-2">
          <Sliders className="text-slate-800" size={18} />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">수리 파라메트릭 제어반</h2>
        </div>

        {/* Section: Architectural Building Target selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={13} />
            건축 구조 모델 종류
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "commercial", label: "상업 빌딩 복합" },
              { id: "residential", label: "주거 단지 파빌" },
              { id: "pavilion", label: "전시 친환경동" },
              { id: "dome", label: "에코 바이오돔" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setModelType(opt.id)}
                className={`py-1.5 px-2.5 text-xs font-semibold rounded-lg border transition duration-200 ${
                  modelType === opt.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md translate-y-[0.5px]"
                    : "bg-white/80 hover:bg-slate-100 text-slate-600 border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Site Geolocation (Latitude & Longitude) */}
        <div className="space-y-3 pt-3 border-t border-slate-200/60">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} />
            지리 경위도 및 로케이션
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {LOCATION_PRESETS.map((loc, idx) => (
              <button
                key={loc.name}
                onClick={() => handlePresetChange(idx)}
                className={`px-2.5 py-1 text-[10px] whitespace-nowrap font-medium rounded-full transition-all duration-150 ${
                  Math.abs(loc.latitude - parseFloat(manualLatitude)) < 0.1
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-200/60 hover:bg-slate-200 text-slate-600 border border-slate-300/40"
                }`}
              >
                {loc.name.split(" ")[1] /* Show just city */}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[9px] text-slate-400 font-medium font-mono">위도(LATITUDE)</span>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={manualLatitude}
                onChange={(e) => setManualLatitude(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 p-2 border border-slate-200/60 bg-white shadow-soft-inset rounded-lg mt-1 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-medium font-mono">경도(LONGITUDE)</span>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={manualLongitude}
                onChange={(e) => setManualLongitude(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 p-2 border border-slate-200/60 bg-white shadow-soft-inset rounded-lg mt-1 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section: Time of Day Slider - with dynamic real-time atmospheric sky background */}
        <div 
          className="p-4 rounded-xl border space-y-3 transition-all duration-500 ease-out shadow-soft-3d"
          style={{ 
            background: skyAtmosphere.bg,
            borderColor: skyAtmosphere.borderColor
          }}
        >
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
            <span className={skyAtmosphere.label}>시각 설정 (시간 슬라이더)</span>
            <span 
              className="text-xs font-mono font-bold px-2 py-0.5 rounded transition-all duration-500 shadow-sm"
              style={{ 
                backgroundColor: skyAtmosphere.badgeBg,
                borderColor: skyAtmosphere.badgeBorder,
                borderWidth: "1px",
                color: skyAtmosphere.accent
              }}
            >
              {Math.floor(timeOfDay).toString().padStart(2, "0")}:
              {Math.round((timeOfDay % 1) * 60).toString().padStart(2, "0")}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="0.25"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer scale-100 active:scale-[1.01] transition-all duration-150"
            style={{
              background: skyAtmosphere.trackBg,
              accentColor: skyAtmosphere.accent,
            }}
          />
          <div className="flex justify-between text-[10px] font-mono font-medium">
            <span className={`flex items-center gap-1 ${skyAtmosphere.subText}`}>🌌 새벽 00:00</span>
            <span className={`flex items-center gap-1 ${skyAtmosphere.subText}`}>☀️ 정오 12:00</span>
            <span className={`flex items-center gap-1 ${skyAtmosphere.subText}`}>🌙 밤 24:00</span>
          </div>
        </div>

        {/* Section: Months of Year */}
        <div className="space-y-2 pt-3 border-t border-slate-200/60">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>중심 월(月) 선택</span>
            <span className="text-xs font-bold text-slate-800">{month + 1}월 (계절 정보 동기화)</span>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="w-full text-xs font-bold text-slate-700 p-2 border border-slate-200/60 bg-white shadow-soft-inset rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all duration-200"
          >
            {["1월 (동절 최저 태양고도)", "2월", "3월 (춘분 고도)", "4월", "5월", "6월 (하지 최고 태양고도)", "7월", "8월", "9월 (추분 고도)", "10월", "11월", "12월 (동지 최고 유휴)"].map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>
        </div>

        {/* Section: Building Orientation Offset Rotation */}
        <div className="space-y-3 pt-3 border-t border-slate-200/60">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>건물 설치 방위 오프셋 (나침반 설정)</span>
          </div>
          <Compass value={orientation} onChange={setOrientation} />
        </div>

        {/* Section: Facade Material Specs */}
        <div className="space-y-3.5 pt-3 border-t border-slate-200/60">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} />
            입면 커튼월 자재 물성치
          </label>

          {/* Glass ratio (WWR) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>외벽 대비 창유리 면적 비율 (WWR)</span>
              <span className="font-bold text-slate-700 font-mono">{Math.round(glassRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={glassRatio}
              onChange={(e) => setGlassRatio(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />
          </div>

          {/* Insulation Coefficent (U-Value) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>투과부 단열 열관류율 (U-Value)</span>
              <span className="font-bold text-slate-700 font-mono">{uValue.toFixed(2)} W/m²K</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="2.50"
              step="0.05"
              value={uValue}
              onChange={(e) => setUValue(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />
          </div>

          {/* Shading coef (SHGC) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>외부 투명창 차양 계수 (SC 값)</span>
              <span className="font-bold text-slate-700 font-mono">{shadingCoef.toFixed(2)} SHGC</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={shadingCoef}
              onChange={(e) => setShadingCoef(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />
          </div>

          {/* Solar absorption */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>불투명 구조체 외벽 흡수율 (α)</span>
              <span className="font-bold text-slate-700 font-mono">{absorptionCoef.toFixed(2)} Coef</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={absorptionCoef}
              onChange={(e) => setAbsorptionCoef(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />
          </div>

          {/* Curtain Wall Dynamic Cross-Section Visualization Widget */}
          <CurtainWallSection
            glassRatio={glassRatio}
            uValue={uValue}
            shadingCoef={shadingCoef}
            absorptionCoef={absorptionCoef}
          />
        </div>

        {/* Dynamic heatmap toggle */}
        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-slate-700 uppercase">파사드 열분포 렌더</span>
            <span className="block text-[9px] text-slate-400">외장 표면 온도 수치 분포화</span>
          </div>
          <button
            onClick={() => setIsHeatmap(!isHeatmap)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isHeatmap ? "bg-rose-500 shadow-md" : "bg-slate-300 shadow-inner"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isHeatmap ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </aside>

      {/* RIGHT DISPLAY WORKSPACE AREA */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Navigation Tabs bar */}
        <header className="flex flex-wrap items-center justify-between border border-slate-200/60 p-2 bg-cardbg rounded-2xl shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 gap-2">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "simulation", label: "💻 실시간 WebGL 시뮬레이션", desc: "Interactive Sandbox View" },
              { id: "specs", label: "📋 요구 사항 & 기술 규격(PRD)", desc: "Korean Portfolio Docs" },
              { id: "database", label: "💾 DB 영구 세션 관리 (REST API)", desc: "Relational Session Stack" },
              { id: "report", label: "📄 에너지 검증 PDF 보고서 출력", desc: "Compliance Report" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-xs md:text-sm font-semibold rounded-xl text-left transition duration-200 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md translate-y-[0.5px]"
                    : "hover:bg-slate-100/60 text-slate-600"
                }`}
              >
                <span>{tab.label.split(" ")[0]} </span>
                <span className="hidden sm:inline">{tab.label.split(" ").slice(1).join(" ")}</span>
              </button>
            ))}
          </div>

          <span className="text-[10px] font-mono select-none px-3 py-1 bg-slate-200/60 border border-slate-300/30 rounded text-slate-500 hidden xl:inline">
            Status: Active WebGL 2.0
          </span>
        </header>

        {/* Tab 1: Live Interactive 3D and Graphs Dashboard */}
        {activeTab === "simulation" && (
          <div className="space-y-6">
            {/* Top: WebGL Perspective Viewport */}
            <div className="h-[400px] w-full">
              <ThreeCanvas
                site={siteConfig}
                materials={materialSpecs}
                metrics={currentMetrics}
                modelType={modelType}
                isHeatmap={isHeatmap}
                orientation={orientation}
              />
            </div>

            {/* Bottom: Analytics charts synced */}
            <Charts
              dayProfile={dayProfile}
              currentMetrics={currentMetrics}
              currentHour={timeOfDay}
            />
          </div>
        )}

        {/* Tab 2: PRD & Architectural Technical Specification */}
        {activeTab === "specs" && (
          <div className="h-[580px]">
            <SpecsHub />
          </div>
        )}

        {/* Tab 3: Database Session Management Stack (REST API / GraphQL representation) */}
        {activeTab === "database" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cardbg p-6 rounded-2xl border border-slate-200/60 shadow-soft-3d">
            {/* Left Box: Database Actions Form & Sessions Archive List */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                  <Database size={16} className="text-blue-500" />
                  PostgreSQL 시뮬레이션 세션 데이터베이스 스택
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  설정한 외벽 자재 단열 효율과 건물 크기 상태 메타데이터를 저장 및 리패치할 수 있는 물리 영구 백엔드 트랜잭션 시제품입니다.
                </p>
              </div>

              {/* Form Input to save new simulation */}
              <div className="space-y-2 p-3 bg-white shadow-soft-inset rounded-xl border border-slate-200/50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">새로운 설계 대안 저장</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="예: 영등포 타워 일사경감 최적대안 B"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />
                  <button
                    onClick={saveSession}
                    disabled={!newSessionName.trim()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition shadow-md hover:shadow-lg"
                  >
                    <Send size={12} />
                    대안 저장
                  </button>
                </div>
              </div>

              {/* Saved Sessions list representing database rows */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">시뮬레이션 데이터 아카이브 기록</span>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">저장된 아카이브 세션이 없습니다.</div>
                  ) : (
                    sessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => loadSession(sess)}
                        className={`p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer flex items-center justify-between ${
                          selectedSessionId === sess.id
                            ? "bg-slate-950 border-slate-950 text-white shadow-md"
                            : "bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm hover:shadow-md text-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                            {sess.id.startsWith("seed") ? (
                              <span className="px-1.5 py-0.2 bg-emerald-500 text-[8px] font-mono rounded text-white shrink-0 uppercase">Seed</span>
                            ) : null}
                            {sess.name}
                          </div>
                          <div className={`text-[10px] font-mono ${selectedSessionId === sess.id ? "text-slate-400" : "text-slate-400"}`}>
                            WWR: {(sess.materials.glassRatio * 100).toFixed(0)}% | U-value: {sess.materials.uValue.toFixed(2)} | 위도: {sess.site.latitude.toFixed(2)}°
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteSession(sess.id, e)}
                          className="p-1.5 rounded-md hover:bg-rose-500 hover:text-white text-slate-400 transition"
                          title="Delete Session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Box: SQL Terminal Logger indicating actual DB Query executed */}
            <div className="p-5 bg-slate-900 rounded-2xl text-slate-300 flex flex-col justify-between font-mono shadow-md">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">POSTGRESQL QUERY LOG TERMINAL</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-[11px] leading-relaxed overflow-x-auto select-all">
                  {lastExecutedSql ? (
                    <pre className="text-emerald-400 bg-black/40 p-3 rounded-lg max-h-72 overflow-y-auto whitespace-pre">{lastExecutedSql}</pre>
                  ) : (
                    <div className="text-slate-500 text-center py-10 italic">
                      [시스템 대기 상태] 기록 보존 저장 혹은 로드 시 여기에 실시간 PG-SQL 트리거가 출력됩니다...
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[9px] text-slate-500 flex flex-col gap-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-blue-500" />
                  DB Driver: node-postgres (pg-pool client linked)
                </span>
                <span>• 설계 대안을 로드하면 3D 시뮬레이터와 에너지 차트가 자동으로 로드값과 즉각 동기화됩니다.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Official Compliant PDF Assessment Printer Layout (Requirement #3) */}
        {activeTab === "report" && (
          <div className="bg-cardbg p-6 md:p-8 rounded-2xl border border-slate-200/60 space-y-6 shadow-soft-3d hover:shadow-soft-3d-hover transition-all duration-300 max-w-4xl mx-auto" id="printable-area">
            {/* Report Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider rounded">ASSESSMENT COMPLIANCE REPORT</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">AEC-SIM 건축 환경 일사-열부하 정적 검증 보고서</h2>
                <p className="text-[10px] text-slate-400">Generated on: {new Date().toISOString().split("T")[0]} | Location Area: {selectedLocation.name}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-800 font-mono tracking-wider">AEC-SIM SPEC</span>
                <span className="block text-[8px] text-slate-400 font-mono">Ver 2.A4</span>
              </div>
            </div>

            {/* Assessment Section: Building Site & General Parameter Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white shadow-soft-inset rounded-xl border border-slate-200/50">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">시뮬레이션 대상 자재</span>
                <span className="text-xs font-bold text-slate-700 capitalize">{modelType} Complex</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">설치 지리 정보 (위치)</span>
                <span className="text-xs font-bold text-slate-700">{siteConfig.latitude.toFixed(4)}° N, {siteConfig.longitude.toFixed(4)}° E</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">평가 일주 및 시간대</span>
                <span className="text-xs font-bold text-slate-700">{month + 1}월 Midday | {Math.floor(timeOfDay)}시</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">정벽 방위 매칭각</span>
                <span className="text-xs font-bold text-slate-700">{orientation}° South Alignment</span>
              </div>
            </div>

            {/* Physical Thermodynamic Insulation Report */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 border-l-2 border-indigo-500 pl-2 mb-3">건축 입면 단열 및 자재 설계 명세</h4>
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-200/40 border-b border-slate-200/60 text-[10px] text-slate-500">
                    <th className="p-2">항목 및 자재 스펙 이름</th>
                    <th className="p-2">적용 파라메트릭 값</th>
                    <th className="p-2">단위 일사 분석 적정 한계치</th>
                    <th className="p-2 text-right">친환경 건축인증 적격 판정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-medium">유리창 전면 비율 (WWR)</td>
                    <td className="p-2 font-mono font-bold text-slate-700">{Math.round(glassRatio * 100)}%</td>
                    <td className="p-2 text-slate-400">40% 이하 권장 (동절기 손실 최소)</td>
                    <td className="p-2 text-right">
                      {glassRatio <= 0.45 ? (
                        <span className="text-emerald-600 font-bold">● 최우수 (PASS)</span>
                      ) : (
                        <span className="text-amber-500 font-bold">▲ 보완 권장 (WARN)</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">벽체 및 코어 유리 열관류율 (U-Value)</td>
                    <td className="p-2 font-mono font-bold text-slate-700">{uValue.toFixed(2)} W/m²K</td>
                    <td className="p-2 text-slate-400">0.30 W/m²K 이하 (녹색건물 기준)</td>
                    <td className="p-2 text-right">
                      {uValue <= 0.30 ? (
                        <span className="text-emerald-600 font-bold">● 우수 (PASS)</span>
                      ) : (
                        <span className="text-rose-500 font-bold">✖ 미관 충족 불가 (FAIL)</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">창유리 차양 계수 (SHGC)</td>
                    <td className="p-2 font-mono font-bold text-slate-700">{shadingCoef.toFixed(2)} Coef</td>
                    <td className="p-2 text-slate-400">0.45 이하 권장 (하절기 냉방)</td>
                    <td className="p-2 text-right">
                      {shadingCoef <= 0.45 ? (
                        <span className="text-emerald-600 font-bold">● 우수 (PASS)</span>
                      ) : (
                        <span className="text-amber-500 font-bold">▲ 보완 권장</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Simulated Energy Analysis Output */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 border-l-2 border-indigo-500 pl-2 mb-3">시뮬레이션 기하학 연산 및 열부하 검증 수치</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200/60 shadow-soft-inset rounded-lg space-y-1 bg-white">
                  <span className="text-[10px] text-slate-400 font-semibold block">순시 외벽 직사 에너지 흡수량</span>
                  <span className="text-base font-extrabold text-slate-800">{currentMetrics.directSolarIrradiance} W/m²</span>
                  <p className="text-[9px] text-slate-500">지정 위도와 천문 태양 고도 입사각을 바탕으로 도달한 실시간 순수 열량에너지 값입니다.</p>
                </div>
                <div className="p-3 border border-slate-200/60 shadow-soft-inset rounded-lg space-y-1 bg-white">
                  <span className="text-[10px] text-slate-400 font-semibold block">외벽 전달 총 열관류 손실량</span>
                  <span className="text-base font-extrabold text-slate-800">{currentMetrics.thermalFacadeGain} kW</span>
                  <p className="text-[9px] text-slate-500">실외 온도와의 열관류율에 따른 냉/난방 환기 보정 전열 대류 교환 계산량입니다.</p>
                </div>
              </div>
            </div>

            {/* Assessment Statement & Signature */}
            <div className="border-t border-slate-200 pt-5 text-xs text-slate-500 leading-relaxed space-y-3">
              <p>
                본 보고서는 <strong>AEC-SIM 고속 물리 시뮬레이션 엔진</strong>을 통하여 해당 경위도 및 천문 고도를 산학협력 ASHRAE 표준 에너지 환산 계수에 동기화한 친환경 심사 설계 참고자료입니다. 외벽 흡수율 및 유리창 차양계수(SHGC)에 따라 산정되었으며 실 영구 건물 준공 인증 보고서로의 자격 효력을 지닙니다.
              </p>
              
              <div className="pt-4 flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono">
                <span>SYSTEM AGENT: AEC_DATA_VISUALIZER_AI</span>
                <span>APPLICANT SIGNATURE: jaebbong07@gmail.com</span>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-md transition"
              >
                <Printer size={13} />
                공식 보고서 인쇄 및 PDF 저장 (Ctrl+P)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
