import { Sun, Cloud, CloudRain, RefreshCcw, MapPin } from 'lucide-react';
import { Card } from './Card';
import { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  precip: number;
  locName: string;
  isDay: number;
  cloudCover: number;
}

/** Reverse geocode lat/lon → city/town name via Nominatim (no API key needed). */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json();
    const a = data?.address ?? {};
    // Try increasingly broad place names until one is found
    return (
      a.city      ??
      a.town      ??
      a.village   ??
      a.county    ??
      a.state     ??
      'My Location'
    );
  } catch {
    return 'My Location';
  }
}

const DEFAULT_WEATHER: WeatherData = {
  temp: 0, humidity: 0, wind: 0, precip: 0,
  locName: '—', isDay: 1, cloudCover: 0,
};

export function WeatherWidget() {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const snap = localStorage.getItem('weatherSnapshot');
      if (snap) return JSON.parse(snap) as WeatherData;
    } catch { /* ignore */ }
    return DEFAULT_WEATHER;
  });

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('coords');
      // Default to a generic location only as an absolute last resort
      let lat = 20.5937; // centre of India – better default than California
      let lon = 78.9629;

      if (stored) {
        const coords = JSON.parse(stored) as { lat: number; lon: number };
        lat = coords.lat;
        lon = coords.lon;
      }

      // Fetch weather and reverse-geocode in parallel
      const [weatherRes, locName] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m`,
        ),
        reverseGeocode(lat, lon),
      ]);

      const data = await weatherRes.json();

      if (data?.current) {
        const payload: WeatherData = {
          temp:      Math.round(data.current.temperature_2m),
          humidity:  data.current.relative_humidity_2m,
          wind:      Math.round(data.current.wind_speed_10m),
          precip:    data.current.precipitation > 0 ? 100 : 0,
          locName,
          isDay:     data.current.is_day,
          cloudCover: data.current.cloud_cover,
        };
        setWeather(payload);
        localStorage.setItem('weatherSnapshot', JSON.stringify(payload));
      }
    } catch (err) {
      console.error('[WeatherWidget] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if no cached data, or if location just changed
  useEffect(() => {
    const noCache   = !localStorage.getItem('weatherSnapshot');
    const hasCoords = !!localStorage.getItem('coords');
    const cachedLoc = weather.locName;
    const isDefault = cachedLoc === '—' || cachedLoc === 'My Location';

    if (noCache || (hasCoords && isDefault)) {
      fetchWeather();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const WeatherIcon = weather.precip > 0 ? CloudRain : weather.cloudCover > 50 ? Cloud : Sun;
  const hasData     = weather.temp !== 0 || weather.locName !== '—';

  return (
    <Card dark className="weather-widget">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)',
            marginBottom: '0.3rem', fontWeight: 600,
          }}>
            CURRENT ENVIRONMENT
          </p>

          {/* Temperature */}
          <div style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1, margin: '0.4rem 0' }}>
            {hasData ? weather.temp : '—'}
            <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>°C</span>
          </div>

          {/* Condition + location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <MapPin size={12} color="rgba(255,255,255,0.7)" />
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              {weather.cloudCover > 50 ? 'Overcast' : 'Clear Skies'}
              {' • '}
              {weather.locName}
            </p>
            <button
              onClick={fetchWeather}
              disabled={loading}
              aria-label="Refresh weather"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', padding: '2px' }}
            >
              <RefreshCcw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Extra stats row */}
          {hasData && (
            <div style={{
              display: 'flex', gap: '1rem', marginTop: '0.75rem',
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)',
            }}>
              <span>💧 {weather.humidity}%</span>
              <span>💨 {weather.wind} km/h</span>
              {weather.precip > 0 && <span>🌧️ Rain</span>}
            </div>
          )}
        </div>

        {/* Weather icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '0.5rem' }}>
          <WeatherIcon size={52} color={weather.isDay ? '#FFD700' : '#e0e7ff'} />
        </div>
      </div>
    </Card>
  );
}