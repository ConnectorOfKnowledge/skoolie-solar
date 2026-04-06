import SunCalc from 'suncalc';

import type { SavedLocation, SolarCoordinates } from '@/types/forecast';

function normalizeAzimuth(degrees: number) {
  return (degrees + 360) % 360;
}

export function getSolarCoordinates(date: Date, location: SavedLocation): SolarCoordinates {
  const position = SunCalc.getPosition(date, location.latitude, location.longitude);

  return {
    azimuth: normalizeAzimuth((position.azimuth * 180) / Math.PI + 180),
    elevation: (position.altitude * 180) / Math.PI,
  };
}

export function getSolarTimes(date: Date, location: SavedLocation) {
  return SunCalc.getTimes(date, location.latitude, location.longitude);
}

export function getAlignmentDelta(target: number, current: number) {
  let delta = target - current;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
