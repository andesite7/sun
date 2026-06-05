import { SiteConfig, MaterialSpecs, SimulationResult } from "./types";

/**
 * Calculates solar position algorithms and engineering thermodynamic metrics
 */

// Approximate Day of Year for each month midpoint
const MONTH_MID_DAYS = [15, 45, 74, 105, 135, 162, 198, 228, 258, 288, 318, 344];

export function calculateSolarPosition(
  latitude: number,
  longitude: number,
  hour: number,
  month: number
): { altitude: number; azimuth: number } {
  const latRad = (latitude * Math.PI) / 180;
  const dayOfYear = MONTH_MID_DAYS[month];

  // 1. Solar Declination Angle (declination) in radians
  const declination = 23.45 * Math.sin(((2 * Math.PI) / 365) * (284 + dayOfYear)) * (Math.PI / 180);

  // 2. Hour Angle (H) in radians (15 degrees per hour from solar noon)
  const hourAngle = (15 * (hour - 12) * Math.PI) / 180;

  // 3. Solar Altitude (beta)
  const sinAltitude =
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
  
  let altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
  let altitudeDeg = (altitudeRad * 180) / Math.PI;

  if (altitudeDeg < 0) {
    altitudeDeg = 0; // Below horizon is 0 altitude
  }

  // 4. Solar Azimuth (phi)
  const cosAzimuth =
    (Math.sin(altitudeRad) * Math.sin(latRad) - Math.sin(declination)) /
    (Math.cos(altitudeRad) * Math.cos(latRad) || 0.001);

  let azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
  let azimuthDeg = (azimuthRad * 180) / Math.PI;

  // Adjust azimuth based on morning/afternoon
  if (hour > 12) {
    azimuthDeg = 360 - azimuthDeg;
  }

  return {
    altitude: altitudeDeg,
    azimuth: azimuthDeg,
  };
}

/**
 * Calculates thermal analysis and power estimations based on solar position and building materials.
 */
export function calculateAnalysisMetrics(
  site: SiteConfig,
  materials: MaterialSpecs,
  hour: number,
  month: number
): SimulationResult {
  const { altitude, azimuth } = calculateSolarPosition(site.latitude, site.longitude, hour, month);

  // Base Clear Sky Irradiance calculation (ASHRAE model estimate)
  // Irradiance is 0 at night (altitude = 0)
  const isDaytime = altitude > 0;
  const sinAlt = Math.sin((altitude * Math.PI) / 180);

  // Direct normal irradiance estimation (W/m²)
  // A is apparent solar constant, B is atmospheric extinction coefficient
  const A = 1100; // Summer/winter average solar constant
  const B = 0.17; // Atmosphere extinction constant
  const directSolarIrradiance = isDaytime 
    ? A * Math.exp(-B / (sinAlt + 0.0001)) 
    : 0;

  // Diffuse sky solar irradiance
  const C = 0.12; // Diffuse Sky Factor
  const diffuseSolarIrradiance = isDaytime 
    ? C * directSolarIrradiance 
    : 0;

  // Calculate facade heat gain (thermal load)
  // Combination of glass solar gain (SHGC) and opaque wall heat transfer (U-Value)
  const envelopeArea = 4500; // m² (estimated building façade surface area)
  const glassArea = envelopeArea * materials.glassRatio;
  const wallArea = envelopeArea * (1 - materials.glassRatio);

  const ambientTemp = getAmbientTemperature(hour, month);

  // Heat conductive flow (Q_cond) through wall and glass
  const indoorTemp = 22; // Comfort Target Temperature (°C)
  const tempDiff = ambientTemp - indoorTemp;
  const tConductive = (wallArea * materials.uValue * tempDiff + glassArea * 5.8 * tempDiff) / 1000; // kW (U-value of plain glass is ~5.8)

  // Solar Radiation Heat Gain (Q_solar) mostly through glass and absorption on walls
  // direct irradiance on facade depends on sun hit angle (approx. 40% aggregate angle index)
  const sunAngleFactor = sinAlt; // Simplified aggregate sun factor
  const rRadiative = isDaytime
    ? (glassArea * materials.shadingCoef * directSolarIrradiance +
       wallArea * materials.absorptionCoef * 0.2 * directSolarIrradiance) / 1000 // kW
    : 0;

  const thermalFacadeGain = Math.round(tConductive + rRadiative);

  // Estimated HVAC Heating/Cooling electrical demand (kW)
  // COP (Coefficient of Performance) for modern Heat Pumps
  const copCooling = 3.5;
  const copHeating = 4.0;
  let hvacPower = 0;

  if (thermalFacadeGain > 50) {
    // Cooling mode
    hvacPower = (thermalFacadeGain - 50) / copCooling;
  } else if (thermalFacadeGain < -50) {
    // Heating mode
    hvacPower = Math.abs(thermalFacadeGain + 50) / copHeating;
  }
  const baseBaseLoad = 45; // Base electrical load (lights, servers, etc. in kW)
  const energyConsumption = Math.round(baseBaseLoad + hvacPower);

  // Solar power PV generation on roof
  // Assuming a roof PV area of 800m², custom panel efficiency
  const pvArea = 800;
  const pvEfficiency = 0.21; // High efficiency PV panels
  const pvAngleFactor = isDaytime ? Math.sin(((altitude + 15) * Math.PI) / 180) : 0;
  const solarPowerGen = Math.round(
    isDaytime ? (pvArea * pvEfficiency * (directSolarIrradiance + diffuseSolarIrradiance) * pvAngleFactor) / 1000 : 0
  );

  return {
    hour,
    sunAltitude: altitude,
    sunAzimuth: azimuth,
    directSolarIrradiance: Math.round(directSolarIrradiance),
    diffuseSolarIrradiance: Math.round(diffuseSolarIrradiance),
    thermalFacadeGain,
    energyConsumption,
    solarPowerGen,
  };
}

// Generate approximate ambient temperatures for representative hours & seasons
function getAmbientTemperature(hour: number, month: number): number {
  // Sinusoidal day-night cycle, temperature peaks around 15:00
  const seasonalMidTemp = [0, 2, 8, 14, 21, 25, 29, 28, 22, 15, 7, 1][month]; // Peak values for Seoul/NY
  const dailyRange = [6, 6, 8, 10, 11, 11, 10, 9, 10, 9, 8, 7][month]; // Amplitude

  const hourlyNormalized = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
  return Math.round(seasonalMidTemp + hourlyNormalized * (dailyRange / 2));
}

// Generate complete 24-hour profile data
export function generateDayProfile(
  site: SiteConfig,
  materials: MaterialSpecs,
  month: number
): SimulationResult[] {
  const profile: SimulationResult[] = [];
  for (let i = 0; i <= 24; i += 1) {
    profile.push(calculateAnalysisMetrics(site, materials, i, month));
  }
  return profile;
}
