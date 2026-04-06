export type TemperatureUnit = 'celsius' | 'fahrenheit';

export type AppSettings = {
  batteryAmpHours: number;
  batteryCapacityKwh: number;
  batteryCount: number;
  batteryVolts: number;
  efficiencyLossPercent: number;
  manualLocation: string;
  solarArrayKw: number;
  temperatureUnit: TemperatureUnit;
};

export type SavedLocation = {
  latitude: number;
  longitude: number;
  name: string;
};

export type DailyForecast = {
  batteryPercentGain: number | null;
  date: string;
  dayLabel: string;
  icon: string;
  index: number;
  kwh: number;
  maxTemp: number;
  minTemp: number;
  shortDate: string;
  sunHours: number | null;
  sunrise: string;
  sunset: string;
};

export type HourlyForecastPoint = {
  energyKw: number;
  hourLabel: string;
  time: string;
};

export type ForecastSnapshot = {
  daily: DailyForecast[];
  hourlyByDay: HourlyForecastPoint[][];
  locationName: string;
  timezoneAbbreviation: string;
  updatedAt: string;
};

export type SolarCoordinates = {
  azimuth: number;
  elevation: number;
};
