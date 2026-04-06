export function formatRelativeUpdate(isoString: string) {
  const date = new Date(isoString);
  return `Updated ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

export function formatTemperatureRange(min: number, max: number, unit: 'celsius' | 'fahrenheit') {
  const suffix = unit === 'fahrenheit' ? 'F' : 'C';
  return `${min}°/${max}° ${suffix}`;
}

export function formatBatteryText(value: number | null) {
  return value == null ? 'Battery --' : `Battery +${value}%`;
}

export function formatSunHours(value: number | null) {
  return value == null ? 'Sun -- hrs' : `Sun ${value.toFixed(1)} hrs`;
}
