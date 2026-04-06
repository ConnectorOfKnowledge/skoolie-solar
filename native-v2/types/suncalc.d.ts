declare module 'suncalc' {
  export type SunPosition = {
    altitude: number;
    azimuth: number;
  };

  export type SunTimes = {
    sunrise: Date;
    sunset: Date;
    solarNoon: Date;
  };

  const SunCalc: {
    getPosition(date: Date, latitude: number, longitude: number): SunPosition;
    getTimes(date: Date, latitude: number, longitude: number): SunTimes;
  };

  export default SunCalc;
}
