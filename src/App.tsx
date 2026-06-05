import Dashboard from "./components/Dashboard";
import { Compass, Cpu } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-pagebg flex flex-col font-sans transition-colors duration-500">
      {/* AEC Premium Global Navigation Brand Bar */}
      <header className="w-full bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500 rounded-lg text-slate-900 shadow-inner">
            <Compass size={18} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              AEC-SIM
              <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">v2.4.0 PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">건축 입면 일사-단열 에너지 물리 3D 시뮬레이션 시스템</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 sm:mt-0">
          {/* Environment telemetry metrics for professional look without unneeded clutter */}
          <div className="text-right hidden sm:block">
            <span className="block text-[8px] text-slate-500 font-mono">ASTROPHYSICS COMPUTATION MATRIX</span>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono tracking-tight flex items-center gap-1">
              <Cpu size={12} />
              SOLAR PATH RESOLVED
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-200">System Connected</span>
          </div>
        </div>
      </header>

      {/* Main Interactive Dashboard Viewport */}
      <div className="flex-1 w-full bg-pagebg/40">
        <Dashboard />
      </div>

      {/* Humble Footer */}
      <footer className="bg-pagebg border-t border-slate-200/60 py-5 text-center text-[10px] text-slate-400 font-medium">
        © 2026 AEC-SIM. Designed with structural engineering physics models & customized 3D Three.js.
      </footer>
    </div>
  );
}

