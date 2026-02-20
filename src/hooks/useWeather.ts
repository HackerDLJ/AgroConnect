import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  rain: number;
  isLoading: boolean;
  error: string | null;
  description: string;
  alert: string | null;
}

// WMO weather codes to human-readable descriptions
function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 9) return "Fog";
  if (code <= 19) return "Drizzle";
  if (code <= 29) return "Rain";
  if (code <= 39) return "Snow";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 94) return "Thunderstorm";
  return "Heavy storm";
}

function getWeatherAlert(temp: number, rain: number, windspeed: number): string | null {
  if (temp > 40) return "Extreme heat alert! Protect crops & livestock.";
  if (temp > 35) return "Heat stress risk. Shade net recommended.";
  if (rain > 20) return "Heavy rain forecast. Check drainage.";
  if (rain > 10) return "Likely rain Thu. Skip irrigation.";
  if (windspeed > 40) return "Strong winds. Secure nets & structures.";
  return null;
}

export function useWeather(lat = 11.0168, lon = 76.9558) {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    windspeed: 0,
    weathercode: 0,
    rain: 0,
    isLoading: true,
    error: null,
    description: "Clear sky",
    alert: null,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=precipitation_sum&forecast_days=3&timezone=Asia/Kolkata`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = await res.json();

        const cw = data.current_weather;
        const rain = data.daily?.precipitation_sum?.[1] ?? 0; // tomorrow's rain
        const description = getWeatherDescription(cw.weathercode);
        const alert = getWeatherAlert(cw.temperature, rain, cw.windspeed);

        setWeather({
          temperature: Math.round(cw.temperature),
          windspeed: Math.round(cw.windspeed),
          weathercode: cw.weathercode,
          rain: Math.round(rain),
          isLoading: false,
          error: null,
          description,
          alert,
        });
      } catch (e) {
        setWeather((prev) => ({
          ...prev,
          isLoading: false,
          error: "Could not load weather",
        }));
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  return weather;
}
