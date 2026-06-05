export interface SiteConfig {
  name: string;
  latitude: number;
  longitude: number;
  timezone: number;
  elevation: number; // in meters
}

export interface MaterialSpecs {
  glassRatio: number; // 0.1 to 0.9 (percentage of glass)
  uValue: number; // W/m²K (Insulation)
  shadingCoef: number; // 0.1 to 1.0 (Solar heat gain coefficient)
  absorptionCoef: number; // 0.1 to 0.9 (Facade absorption coefficient)
}

export interface SimulationResult {
  hour: number;
  sunAltitude: number;
  sunAzimuth: number;
  directSolarIrradiance: number; // W/m²
  diffuseSolarIrradiance: number; // W/m²
  thermalFacadeGain: number; // kW
  energyConsumption: number; // kWh (HVAC + lighting estimation)
  solarPowerGen: number; // kWh
}

export interface SimulationSession {
  id: string;
  name: string;
  date: string;
  modelType: string;
  site: SiteConfig;
  materials: MaterialSpecs;
  timeOfDay: number; // 0-24 decimal
  month: number; // 0-11
  notes?: string;
}
