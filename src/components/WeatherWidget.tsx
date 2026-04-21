import { Sun, Cloud, CloudRain, RefreshCcw, HelpCircle } from 'lucide-react';
import { Card } from './Card';
import { useEffect, useState } from 'react';

export function WeatherWidget() {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(() => {
    try {
      const snap = localStorage.getItem('weatherSnapshot');
      if (snap) return JSON.parse(snap);
    } catch { /* ignore parse error */ }
    return { temp: 24, humidity: 42, wind: 12, precip: 0, locName: 'Salinas Valley', isDay: 1, cloudCover: 0 };
  });

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('coords');
      let lat = 36.6777;
      let lon = -121.6555;
      const pName = localStorage.getItem('farmName') || 'Research Farm';
      
      if (stored) {
        const coords = JSON.parse(stored);
        lat = coords.lat; lon = coords.lon;
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data?.current) {
        const payload = {
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          precip: data.current.precipitation > 0 ? 100 : 0,
          locName: pName,
          isDay: data.current.is_day,
          cloudCover: data.current.cloud_cover,
        };
        setWeather(payload);
        localStorage.setItem('weatherSnapshot', JSON.stringify(payload));
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('weatherSnapshot')) {
      fetchWeather();
    }
  }, []);

  // Safety: If weather is undefined, default to HelpCircle instead of crashing
  const Icon = weather?.precip > 0 ? CloudRain : (weather?.cloudCover > 50 ? Cloud : Sun) || HelpCircle;

  return (
    <Card dark className="weather-widget">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem', fontWeight: 600 }}>
            CURRENT<br />ENVIRONMENT
          </p>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, margin: '0.5rem 0' }}>
            {weather?.temp || 0}<span style={{ fontSize: '2rem', verticalAlign: 'top' }}>°C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              {weather?.cloudCover > 50 ? 'Overcast' : 'Clear Skies'} • {weather?.locName}
            </p>
            <button onClick={fetchWeather} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
              <RefreshCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icon size={48} color={weather?.isDay ? '#FFD700' : 'white'} />
        </div>
      </div>
    </Card>
  );
}