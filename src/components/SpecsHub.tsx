import { useState } from "react";
import { 
  FileText, Network, Server, Database, Code, Cpu, Compass
} from "lucide-react";

export default function SpecsHub() {
  const [activeTab, setActiveTab] = useState<string>("prd");

  const sections = [
    { id: "prd", label: "1. PRD (제품 요구 사항)", icon: FileText },
    { id: "ia", label: "2. 정보 구조 (IA)", icon: Compass },
    { id: "dataflow", label: "3. 데이터 흐름 (Data Flow)", icon: Network },
    { id: "api", label: "4. 주요 API 및 DB 스키마", icon: Server },
    { id: "state", label: "5. 프론트엔드 상태 설계", icon: Code },
    { id: "deepdive", label: "6. 기술적 딥 다이브 (태양/최적화)", icon: Cpu },
  ];

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
      {/* Specs Left Nav */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">명세서 인덱스</h3>
          <p className="text-[10px] text-slate-400 mt-1">AEC-SIM Technical Specs & Docs</p>
        </div>
        <nav className="space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium rounded-lg transition-all ${
                  activeTab === sec.id
                    ? "bg-slate-900 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={14} className={activeTab === sec.id ? "text-slate-100" : "text-slate-500"} />
                {sec.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Docs Content Frame */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[580px] prose prose-slate">
        {activeTab === "prd" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 1</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">AEC-SIM 제품 요구 사양서 (PRD)</h2>
              <p className="text-xs text-slate-500 mt-1">Interactive AEC Data Simulator Specification</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">1. Target (대상 사용자 및 취업 대상 기업)</h4>
                <p className="text-slate-600 mt-1">
                  • <strong>AEC(건축·엔지니어링·시공) 산업 도메인 IT 기업</strong>: BIM 소프트웨어 개발사, 빌딩 에너지 시뮬레이션 시스템 개발 사업자.<br />
                  • <strong>친환경 설계 사무소 / 프롭테크 플랫폼</strong>: 기후 변화 대응 및 친환경 건축 인증 툴(LEED)을 통합하려는 디지털 건축 인큐베이션 부서.<br />
                  • <strong>빌딩 매니지먼트(BMS) 기업</strong>: 실시간 IoT 센서 데이터와 건물의 3D 공간 데이터를 융합 분석하려는 제어 엔지니어 및 기술 관리자.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">2. Problem Statement (기존 현업 솔루션의 페인 포인트)</h4>
                <p className="text-slate-600 mt-1">
                  • <strong>설계 소프트웨어의 웹 접근성 부족</strong>: 기존 친환경 분석 도구(Ecotect, EnergyPlus, Ladybug)는 고사양 로컬 PC와 무거운 데스크톱 라이선스를 필수로 요구하여 협업 능력이 떨어집니다.<br />
                  • <strong>비실시간 처리 및 정적 2D 차트의 한계</strong>: 조도 분석 및 일사에 의한 온도 부하 데이터 연산에 수 시간의 렌더링 시간이 필요하며, 3D 표면 및 단면과 실시간 연동되지 않아 사용성이 매우 떨어집니다.<br />
                  • <strong>데이터 사일로화 및 보고서 수동 생성</strong>: 엔지니어링 계산 결과와 디자인 시뮬레이션 산출물이 통합되지 않아, 클라이언트 납품용 보고서(PDF) 작성을 위해 수만 개의 스프레드시트 값을 수동으로 복사·붙여넣기 해야 합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">3. Solution (AEC-SIM의 가치 제안 및 해결 방식)</h4>
                <p className="text-slate-600 mt-1">
                  • <strong>Zero-Install 3D Web 시뮬레이션</strong>: WebGL(Three.js)을 활용하여 최신 웹 브라우저만 있으면 언제 어디서든 BIM 데이터 원본을 3D로 로딩하고 가시화할 수 있습니다.<br />
                  • <strong>실시간 Solar/Thermal 연동 알고리즘</strong>: 슬라이더 조작 시 1초 미만에 실시간으로 태양의 고도와 방위각을 천문학 공식으로 계산하고, Facade(입면) 표면의 입사각을 내적곱 한 후 열량 부하(kW)와 에너지 손실을 즉각 시각화합니다.<br />
                  • <strong>원클릭 통합 PDF 리포트 인프라</strong>: 시뮬레이션된 순간의 물리 수치, 외장 단열 자재 정보, 탄소 배출 경감 지표 및 실시간 3D 뷰포트 스크린샷 렌더 이미지를 취합한 리포트를 자동 발행합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">4. 핵심 사용자 시나리오 (User Journey Map)</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                  <li><strong>건물 모델 & 위치 선택</strong>: 사용자가 대화식 위젯으로 대상 사이트(예: 서울 위도 37.5°, 뉴욕 40.7°)와 외벽 유리 면적 비율(Glass Ratio) 등의 단열 사양을 설정합니다.</li>
                  <li><strong>시계열 일사 및 열량 확인</strong>: 시간 슬라이더를 00:00부터 24:00까지 조작하면서 3D 파사드 표면이 냉/난방 에너지 피크 시 부하에 도달하는 모습을 확인합니다.</li>
                  <li><strong>데이터 매칭 모니터링</strong>: 우측 대시보드에서 실시간 동기화되는 월간 냉난방 에너지, 태양광 발전 전력, 탄소 상쇄 절감액 차트 모니터를 분석합니다.</li>
                  <li><strong>공유 및 PDF 출력</strong>: 보고서 인쇄 탭에서 PDF 저장 버튼을 클릭하여 시뮬레이션 설계 대안을 로컬 저장 후 클라이언트 컴플라이언스 자료로 제출합니다.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ia" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 2</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">웹사이트 메뉴 & 정보 구조 (Information Architecture)</h2>
              <p className="text-xs text-slate-500 mt-1">Information Hierarchy map of AEC-SIM Tool</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-slate-600">
                AEC-SIM 대시보드는 <strong>단일 페이지 구조(SPA) 내 4단계 탭 계층</strong>과 데이터 조작용 레이아웃으로 설계되었습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h5 className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> 1. 글로벌 컨트롤 레이아웃
                  </h5>
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-[11px] text-slate-600">
                    <li><strong>최상단 글로벌 바</strong>: 프로토타입 상태(WebGL 활성화), 건물 종류 선택(상업 업무용, 주거 타워, 전시 파빌리온 등), 날짜/월 선택 및 건물 정북 방향 회전각 오프셋(0° ~ 360°) 설정 기능을 갖췄습니다.</li>
                    <li><strong>사이즈 프리셋</strong>: 아시아 태평양 허브 사이트(서울, 싱가포르, 도쿄, 시드니) 지리 정보 포함.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h5 className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> 2. 메인 시뮬레이션 3D 캔버스 (중앙)
                  </h5>
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-[11px] text-slate-600">
                    <li><strong>실시간 태양 조명 시스템</strong>: 시각에 따른 부드러운 하향 그림자(Shadow Map) 묘사.</li>
                    <li><strong>온도분포 열지도 토글</strong>: 입면 표면 외장재 태양 방사열 투영.</li>
                    <li><strong>오토 궤도 회전</strong>: BIM 모델 원근 확인을 위한 자동 저속 궤도 카메라 제어 장치.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h5 className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> 3. 파라메트릭 자재 입력 제어반 (좌측)
                  </h5>
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-[11px] text-slate-600">
                    <li><strong>유리/외장 비율(WWR)</strong>: 외벽 전면 유리화 수준을 정의 (0.1 ~ 0.9).</li>
                    <li><strong>열관류율 (U-Value)</strong>: 단열성 수준 조절 (에너지 소비에 직결).</li>
                    <li><strong>차양 계수 (SC 값)</strong>과 <strong>외벽 흡수율</strong> 바.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h5 className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> 4. 엔지니어링 미터링 패널 (우측)
                  </h5>
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-[11px] text-slate-600">
                    <li><strong>실시간 수치 대시보드</strong>: 순시 태양 도달 에너지(W/m²), 냉난방 부하, 발전 효율.</li>
                    <li><strong>그림 일사 강도 차트</strong>: 시간별 일사 거동 추이 SVG 도표 표시.</li>
                    <li><strong>월간 종합 누적 지표</strong>: 에너지 절감 분석 통계 시각화 및 비교 분석.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dataflow" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 3</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">AEC-SIM 아키텍처 및 데이터 흐름 (Data Flow Diagram)</h2>
              <p className="text-xs text-slate-500 mt-1">High-level full-stack integration pathways</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-slate-600">
                본 프로토타입은 프론트엔드 반응형 데이터스토어(Zustand), WebGL 뷰포트(Three.js) 및 가상 DB 백엔드 간 상호 동기화를 통해 완벽히 설계되었습니다.
              </p>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-2">데이터 통신 흐름도 (ASCII Diagram)</h4>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto font-mono text-[10px] leading-relaxed select-all">
{`+-----------------------------------------------------------------------------------------+
|                                  [ FRONTEND WORKSPACE ]                                 |
|                                                                                         |
|  +---------------------------+   State Change   +------------------------------------+  |
|  |     Parameters Control    | ---------------> |           Zustand Store            |  |
|  |  (Lat/Long, Hour, Material)|                  |  (Active state metadata container) |  |
|  +---------------------------+                  +------------------------------------+  |
|                                                                    |                    |
|                                     +------------------------------+                    |
|                                     |                              |                    |
|                                     v                              v                    |
|                      +------------------------------+     +----------------------+|     |
|                      |   WebGL Engine (Three.js)    |     |   Analytical SVG     ||     |
|                      |  - Rotates Directional Sun   |     |   Charts Dashboard   ||     |
|                      |  - Updates shadow-map angle  |     |  - Direct Irradiance ||     |
|                      |  - Projects thermal colors   |     |  - Cop consumption   ||     |
|                      +------------------------------+     +----------------------+|     |
+--------------------------------------------------------------------|--------------------+
                                                                     | Save Session
                                                                     | (JSON API Payloads)
                                                                     v
+-----------------------------------------------------------------------------------------+
|                                    [ BACKEND SERVER ]                                   |
|                                                                                         |
|  +---------------------------+  Saves Schema   +-------------------------------------+  |
|  |       Express app.ts      | --------------> |        PostgreSQL Database          |  |
|  |  - Auth/Session API Endp. |                 |  (Stored profiles, material specs,  |  |
|  |  - Puppeteer PDF Printer  |                 |   monthly log histories)            |  |
|  +---------------------------+                 +-------------------------------------+  |
+-----------------------------------------------------------------------------------------+`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-xs">주요 흐름 상세 단계 설명</h4>
                <ul className="list-disc pl-4 mt-2 space-y-1.5 text-slate-600">
                  <li><strong>1 단계</strong>: 사용자가 파사드 속성(WWR, U-Value)이나 현재 시간(Hour) 슬라이더를 움직이면 Zustand 단일 스토리지의 글로벌 전역 상태를 지속적으로 변경시킵니다.</li>
                  <li><strong>2 단계</strong>: 상태 스토리지 변경 이벤트 리스너가 작동하여 <strong>ThreeCanvas</strong>와 <strong>DashboardCharts</strong> 컴포넌트가 각각 독립적으로 재연산을 트리거합니다.</li>
                  <li><strong>3 단계</strong>: Three.js는 기존 건물의 면(Faces)에 바인딩된 머티리얼 그룹의 태양 광원 투사각을 내부 셰이더 혹은 벡터 내적으로 계산 후 실시간으로 고연색 열지도(Infrared heat map representation) 컬러 어레이로 동적 도색합니다.</li>
                  <li><strong>4 단계</strong>: 저장/완료 액션 시, 파라미터 JSON 구조체가 세션 백엔드 컨트롤러로 전송되어 영구 DB에 저장 및 기록됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 4</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">주요 백엔드 API 엔드포인트 및 데이터베이스 스키마</h2>
              <p className="text-xs text-slate-500 mt-1">Full stack interface schema design specification</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">1. PostgreSQL Relational Database Schema (DDL)</h4>
                <p className="text-slate-600 mb-2">시뮬레이션 정보 보존과 전역 분석 자재 메타데이터를 저장하기 위한 정적 최적화 스키마입니다.</p>
                <pre className="bg-slate-900 text-blue-300 p-3.5 rounded-lg overflow-x-auto font-mono text-[10px] leading-relaxed">
{`-- 1. 사용자 프로젝트 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 시뮬레이션 마스터 테이블
CREATE TABLE simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(150) NOT NULL,
  model_type VARCHAR(50) NOT NULL DEFAULT 'commercial',
  
  -- 지리적 좌표 파라미터 
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  elevation DECIMAL(6, 1) DEFAULT 0.0,
  
  -- 머티리얼 및 단열 성능
  glass_ratio DECIMAL(3, 2) NOT NULL, -- WWR (0.10 ~ 0.90)
  u_value DECIMAL(4, 2) NOT NULL,      -- 열관류율 (W/m²K)
  shading_coefficient DECIMAL(3, 2),   -- 차양계수
  absorption_coefficient DECIMAL(3, 2), -- 외벽흡수율
  
  -- 상태값 보존
  time_of_day DECIMAL(4, 2) NOT NULL,  -- 0.00 ~ 24.00
  simulation_month INTEGER NOT NULL,   -- 1 ~ 12
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 고속 조회를 위한 인덱스 생성
CREATE INDEX idx_sessions_user_id ON simulation_sessions(user_id);
CREATE INDEX idx_sessions_created ON simulation_sessions(created_at DESC);`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">2. Core REST API Endpoints</h4>
                <p className="text-slate-600 mb-3">설계 세션 저장, 리스트 조회 및 PDF 렌더 요청을 담당하는 주요 API 설계 사양입니다.</p>

                <div className="space-y-4">
                  {/* Endpoint 1 */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">POST</span>
                    <strong className="ml-2 font-mono text-slate-900 text-xs">/api/v1/simulations/save</strong>
                    <p className="text-[11px] text-slate-500 mt-1">현재 시뮬레이션 설정 파라미터 상태를 DB 스택에 보존 요청.</p>
                    <div className="mt-2 text-[10px] font-semibold text-slate-700">Request Body JSON Schema:</div>
                    <pre className="bg-slate-50 p-2 rounded text-slate-600 font-mono text-[9px] mt-1">
{`{
  "name": "강남 오피스타워 대안설계_A",
  "modelType": "commercial",
  "site": {
    "latitude": 37.5665,
    "longitude": 126.9780,
    "timezone": 9,
    "elevation": 38.0
  },
  "materials": {
    "glassRatio": 0.45,
    "uValue": 0.24,
    "shadingCoef": 0.42,
    "absorptionCoef": 0.70
  },
  "timeOfDay": 14.5,
  "month": 7
}`}
                    </pre>
                  </div>

                  {/* Endpoint 2 */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-bold uppercase">GET</span>
                    <strong className="ml-2 font-mono text-slate-900 text-xs">/api/v1/simulations/history</strong>
                    <p className="text-[11px] text-slate-500 mt-1">사용자가 과거에 진행했던 파라메트릭 시뮬레이션 대형 데이터 세션 리스틀 검색(무한스크롤 대응).</p>
                    <div className="mt-2 text-[10px] font-semibold text-slate-700">Response JSON Example:</div>
                    <pre className="bg-slate-50 p-2 rounded text-slate-600 font-mono text-[9px] mt-1">
{`[
  {
    "id": "e6a2b8e3-0bfa-4c55-bc50-bf415ec83d1c",
    "name": "강남 오피스타워 대안설계_A",
    "date": "2026-06-05T04:26:21Z",
    "modelType": "commercial",
    "site": { "latitude": 37.5665, "longitude": 126.978 },
    "materials": { "glassRatio": 0.45, "uValue": 0.24 }
  }
]`}
                    </pre>
                  </div>

                  {/* Endpoint 3 */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase">POST</span>
                    <strong className="ml-2 font-mono text-slate-900 text-xs">/api/v1/report/pdf</strong>
                    <p className="text-[11px] text-slate-500 mt-1">
                      <strong>서버측 PDF 생성</strong>: 백엔드 노드에서 headless 브라우저(Puppeteer)를 구동하여, 시뮬레이션 지표 및 3D 뷰포트의 WebGL 캡처 데이터 URI를 조합한 전문 건축 인증 심사용 공식 PDF 보고서를 자동 생성하여 바이너리 스트림으로 리턴합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "state" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 5</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">프론트엔드 상태 관리 구조 (State Management)</h2>
              <p className="text-xs text-slate-500 mt-1">Zustand & TanStack Query Production-ready code model</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 text-sm">Zustand 전역 반응 스토어 구조 설계 예제</h4>
              <p className="text-slate-600">
                프론트엔드의 실시간 렌더링 응답을 보장하기 위해 렌더링 파라미터를 단일 전역 스토어인 `useSimStore`로 정의하였습니다.
              </p>
              <pre className="bg-slate-900 text-yellow-200 p-3 rounded-lg overflow-x-auto font-mono text-[9px] leading-relaxed">
{`import create from "zustand";
import { SiteConfig, MaterialSpecs } from "./types";

interface SimState {
  modelType: string;
  timeOfDay: number; // 0.00 to 24.00
  month: number;     // 0 to 11
  orientation: number; // 0 to 360
  site: SiteConfig;
  materials: MaterialSpecs;
  isHeatmap: boolean;
  
  // 상태 변경 액션들
  setModelType: (type: string) => void;
  setTimeOfDay: (time: number) => void;
  setMonth: (month: number) => void;
  setOrientation: (deg: number) => void;
  updateMaterials: (newSpecs: Partial<MaterialSpecs>) => void;
  updateSite: (newSite: Partial<SiteConfig>) => void;
  toggleHeatmap: () => void;
}

export const useSimStore = create<SimState>((set) => ({
  modelType: "commercial",
  timeOfDay: 12.0, // Default solar noon
  month: 5,        // Default June (longest day)
  orientation: 0,  // 正北 (North Face)
  isHeatmap: false,
  site: {
    name: "Seoul Central Hub",
    latitude: 37.5665,
    longitude: 126.9780,
    timezone: 9,
    elevation: 38.0
  },
  materials: {
    glassRatio: 0.40,
    uValue: 0.35,      // W/m²K
    shadingCoef: 0.50, // SHGC
    absorptionCoef: 0.60
  },
  
  setModelType: (type) => set({ modelType: type }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setMonth: (month) => set({ month }),
  setOrientation: (orientation) => set({ orientation }),
  updateMaterials: (newSpecs) => set((state) => ({ 
    materials: { ...state.materials, ...newSpecs } 
  })),
  updateSite: (newSite) => set((state) => ({ 
    site: { ...state.site, ...newSite } 
  })),
  toggleHeatmap: () => set((state) => ({ isHeatmap: !state.isHeatmap })),
}));`}
              </pre>

              <h4 className="font-semibold text-slate-900 text-sm mt-4">TanStack Query (React Query) 비동기 DB 상호작용</h4>
              <p className="text-slate-600">
                서버 세션 목록 동기화 관리를 효율적으로 수행하고 인메모리 캐싱을 사용하기 위한 모범적인 REST 데이터 전송 코드입니다.
              </p>
              <pre className="bg-slate-900 text-yellow-200 p-3 rounded-lg overflow-x-auto font-mono text-[9px] leading-relaxed">
{`import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// 1. 과거 시뮬레이션 세션 기록 쿼리 조회
export function useGetSimulationQuery() {
  return useQuery({
    queryKey: ["simulations", "history"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/simulations/history");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale margin
  });
}

// 2. 새로운 시뮬레이션 세션 DB 저장 액션 뮤테이션
export function useSaveSimulationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSessionPayload: any) => {
      const { data } = await axios.post("/api/v1/simulations/save", newSessionPayload);
      return data;
    },
    onSuccess: () => {
      // 캐시 갱신 및 과거 목록 백그라운드 리패치
      queryClient.invalidateQueries({ queryKey: ["simulations", "history"] });
    }
  });
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "deepdive" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTION 6</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">기술적 딥 다이브 (태양광 알고리즘 & 대용량 BIM 모델 최적화)</h2>
              <p className="text-xs text-slate-500 mt-1">Solar Trigonometry math and WebGL compression techniques</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">1. 실시간 태양 경로 및 일사 계산 핵심 수학 공식</h4>
                <p className="text-slate-600 mt-1">
                  태양의 기하학적 3차원 광원 벡터를 구하기 위해, 지구의 자전축 오프셋 경사각(23.45°), 위도($L$), 연중 날짜 오수($n$), 시간 각($H$)을 삼각함수로 모델링합니다.
                </p>

                <div className="bg-slate-50 p-4 rounded-lg my-3 space-y-2.5 font-mono text-slate-700">
                  <div className="text-xs">
                    <strong className="text-slate-900">공식 (1): 태양 적위각 (Solar Declination Angle, $\delta$)</strong>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1 flex justify-center">
                      δ = 23.45 * sin( 360/365 * (284 + n) )
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans block mt-1">• 지구 자전 경사면으로 인해 태양이 정동서로부터 북/남으로 휘는 각도 (겨울: -23.45°, 여름: +23.45°)</span>
                  </div>

                  <div className="text-xs mt-3">
                    <strong className="text-slate-900">공식 (2): 태양 고도각 (Solar Altitude, $\beta$)</strong>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1 flex justify-center">
                      sin(β) = sin(L)*sin(δ) + cos(L)*cos(δ)*cos(H)
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans block mt-1">• $L$은 사이트 위도(Latitude), $H$는 시간각(Hour Angle)으로, 정오(12:00) 기준 1시간당 15° 회전각($H = 15° \times [Hour - 12]$).</span>
                  </div>

                  <div className="text-xs mt-3">
                    <strong className="text-slate-900">공식 (3): 태양 방위각 (Solar Azimuth, $\phi$)</strong>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1 flex justify-center">
                      cos(ϕ) = [ sin(β)*sin(L) - sin(δ) ] / [ cos(β)*cos(L) ]
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">2. 프론트엔드 대용량 건축 BIM 데이터 렌더링 최적화 기술안</h4>
                <p className="text-slate-600 mt-1">
                  BIM 모델은 수백만 개의 버텍스와 복잡한 배관, 미세 내장 가구를 포함하여 브라우저에서 로딩 시 고성능 GPU 메모리 부하와 프레임 드랍을 일으킵니다. 이를 극복하는 핵심 전문 아키텍처는 다음과 같습니다:
                </p>

                <ul className="list-disc pl-4 mt-2 space-y-1.5 text-slate-600">
                  <li>
                    <strong>meshopt 및 Draco 압축 (glTF-Pipeline)</strong>:<br />
                    건축 협업 소프트웨어(Revit 등)에서 내보낸 glTF 원본 바이너리를 <strong>Draco 압축 헤더</strong> 알고리즘을 사용해 용량을 최대 85%까지 절감합니다. 웹 백그라운드 워커 기반 디코더를 연결해 메인 브라우저 스레드가 얼지 않고 기가바이트급 건물을 파싱할 수 있게 지원합니다.
                  </li>
                  <li>
                    <strong>Level of Detail (LOD) 지형 및 객체 기법</strong>:<br />
                    카메라 거리 기반 렌더 텍스처 레벨을 계층화시킵니다. 근거리에서는 유리 프레임의 나사못까지 상세하게 그리며, 원거리에서는 건물의 육면체 박스 쉘만 표시해 GPU 버텍스 오버헤드를 동적 관리합니다.
                  </li>
                  <li>
                    <strong>Draw Call 배칭 (InstancedMesh)</strong>:<br />
                    수천 개의 빌딩 창문, 균일한 조명, 공사 기둥, 조경 수목 등을 개별 오브젝트로 렌더링하지 않고 단 하나(1회)의 GPU 명령어로 그릴 수 있는 <strong>`THREE.InstancedMesh`</strong>로 병합 처리하여 60FPS의 부드러움과 최상의 메터리얼을 제공합니다.
                  </li>
                  <li>
                    <strong>이중 오프스크린 캔버스 레이아웃 (OffscreenCanvas)</strong>:<br />
                    3D 뷰포트 물리 피드백 갱신 작업을 Web Worker 스레드에 비동기로 위임하여, 메인 화면 UI 인터페이스(슬라이더, 탭 버튼)가 어떠한 상황에서도 즉각적이고 반응성이 느껴지도록 설계합니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
