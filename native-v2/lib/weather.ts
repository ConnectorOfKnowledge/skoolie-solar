import type {
  AppSettings,
  DailyForecast,
  ForecastSnapshot,
  HourlyForecastPoint,
  SavedLocation,
} from '@/types/forecast';

type GeocodeResult = {
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  name: string;
};

type OpenMeteoResponse = {
  daily: {
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    time: string[];
    weathercode: number[];
  };
  hourly: {
    shortwave_radiation: number[];
    direct_radiation: number[];
    diffuse_radiation: number[];
    direct_normal_irradiance: number[];
    time: string[];
  };
  timezone_abbreviation: string;
};

export function getWeatherIcon(code: number) {
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 99) return 'Storm';
  return 'Weather';
}

export async function geocodeLocation(query: string): Promise<SavedLocation> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Location lookup failed (${response.status})`);
  }

  const data = (await response.json()) as { results?: GeocodeResult[] };
  const match = data.results?.[0];

  if (!match) {
    throw new Error('City not found');
  }

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    name: [match.name, match.admin1, match.country].filter(Boolean).join(', '),
  };
}

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<SavedLocation> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'SkoolieSolar/1.0' } });
    if (!response.ok) return { latitude, longitude, name: 'Current Location' };

    const data = (await response.json()) as {
      address?: { city?: string; town?: string; village?: string; state?: string };
    };

    const place = data.address?.city ?? data.address?.town ?? data.address?.village;
    const state = data.address?.state;
    const name = [place, state].filter(Boolean).join(', ') || 'Current Location';

    return { latitude, longitude, name };
  } catch {
    return { latitude, longitude, name: 'Current Location' };
  }
}

// Use shortwave_radiation as primary; direct + diffuse as cross-check fallback
function getIrradianceKw(shortwave: number, direct: number, diffuse: number): number {
  const primary = shortwave;
  const fallback = direct + diffuse;
  return (primary > 0 ? primary : fallback) / 1000;
}

function getEnergyFromIrradiance(irradianceKw: number, settings: AppSettings): number {
  const efficiency = (100 - settings.efficiencyLossPercent) / 100;
  return Math.max(0, irradianceKw * settings.solarArrayKw * efficiency);
}

function formatDayLabel(date: Date, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export async function fetchForecast(location: SavedLocation, settings: AppSettings): Promise<ForecastSnapshot> {
  const hourlyParams = [
    'shortwave_radiation',
    'direct_radiation',
    'diffuse_radiation',
    'direct_normal_irradiance',
  ].join(',');

  const dailyParams = [
    'weathercode',
    'temperature_2m_max',
    'temperature_2m_min',
    'sunrise',
    'sunset',
  ].join(',');

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&hourly=${hourlyParams}` +
    `&daily=${dailyParams}` +
    `&timezone=auto&forecast_days=16` +
    `&temperature_unit=${settings.temperatureUnit}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast download failed (${response.status})`);

  const data = (await response.json()) as OpenMeteoResponse;
  if (!data.daily || !data.hourly) throw new Error('Incomplete forecast data');

  const daily: DailyForecast[] = data.daily.time.map((dateString, dayIndex) => {
    const date = new Date(`${dateString}T12:00:00`);
    const hourlyStart = dayIndex * 24;
    const hourlyPoints: HourlyForecastPoint[] = [];
    let dayTotal = 0;

    for (let offset = 0; offset < 24; offset++) {
      const hourIndex = hourlyStart + offset;
      if (hourIndex >= data.hourly.time.length) continue;

      const irradianceKw = getIrradianceKw(
        data.hourly.shortwave_radiation[hourIndex],
        data.hourly.direct_radiation[hourIndex],
        data.hourly.diffuse_radiation[hourIndex],
      );
      const energyKw = getEnergyFromIrradiance(irradianceKw, settings);
      dayTotal += energyKw;

      const pointDate = new Date(data.hourly.time[hourIndex]);
      hourlyPoints.push({
        energyKw,
        hourLabel: pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        time: data.hourly.time[hourIndex],
      });
    }

    const batteryPercentGain =
      settings.batteryCapacityKwh > 0 ? Math.round((dayTotal / settings.batteryCapacityKwh) * 100) : null;

    return {
      batteryPercentGain,
      date: dateString,
      dayLabel: formatDayLabel(date, dayIndex),
      icon: getWeatherIcon(data.daily.weathercode[dayIndex]),
      index: dayIndex,
      kwh: Number(dayTotal.toFixed(1)),
      maxTemp: Math.round(data.daily.temperature_2m_max[dayIndex]),
      minTemp: Math.round(data.daily.temperature_2m_min[dayIndex]),
      shortDate: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      sunHours: settings.solarArrayKw > 0 ? Number((dayTotal / settings.solarArrayKw).toFixed(1)) : null,
      sunrise: new Date(data.daily.sunrise[dayIndex]).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      sunset: new Date(data.daily.sunset[dayIndex]).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  });

  const hourlyByDay = daily.map((_, dayIndex) => {
    const start = dayIndex * 24;
    return data.hourly.time.slice(start, start + 24).map((time, offset) => ({
      energyKw: getEnergyFromIrradiance(
        getIrradianceKw(
          data.hourly.shortwave_radiation[start + offset],
          data.hourly.direct_radiation[start + offset],
          data.hourly.diffuse_radiation[start + offset],
        ),
        settings,
      ),
      hourLabel: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      time,
    }));
  });

  return {
    daily,
    hourlyByDay,
    locationName: location.name,
    timezoneAbbreviation: data.timezone_abbreviation,
    updatedAt: new Date().toISOString(),
  };
}
