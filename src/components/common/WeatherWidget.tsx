import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: string;
  condition: string;
  wind: string;
  humidity: string;
}

const weatherIcons: Record<string, React.ElementType> = {
  Sunny: Sun, Clear: Sun, 'Partly cloudy': Cloud, Cloudy: Cloud,
  Overcast: Cloud, Rain: CloudRain, Snow: Snowflake, Fog: Cloud,
};

export default function WeatherWidget({ location }: { location: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
        const data = await res.json();
        const current = data.current_condition?.[0];
        if (current) {
          setWeather({
            temp: current.temp_C,
            condition: current.weatherDesc?.[0]?.value || 'Unknown',
            wind: current.windspeedKmph,
            humidity: current.humidity,
          });
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchWeather();
  }, [location]);

  if (loading || !weather) return null;

  const Icon = weatherIcons[weather.condition] || Cloud;

  return (
    <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Current Weather</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{weather.temp}°C</span>
          <span className="text-xs text-muted-foreground">{weather.condition}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5"><Wind className="w-3 h-3" />{weather.wind} km/h</span>
          <span>{weather.humidity}% humidity</span>
        </div>
      </div>
    </div>
  );
}
