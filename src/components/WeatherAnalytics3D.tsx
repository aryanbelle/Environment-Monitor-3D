import React, { useEffect, useRef, useState } from 'react';
import { X, Thermometer, Wind, Eye, Droplets, Gauge, Cloud, Sun, ArrowLeft } from 'lucide-react';
import { WeatherData } from '../services/weatherService';
import { TouristPlace } from '../data/touristPlaces';

interface WeatherAnalytics3DProps {
  place: TouristPlace;
  weatherData: WeatherData;
  onClose: () => void;
  isVisible: boolean;
}

export const WeatherAnalytics3D: React.FC<WeatherAnalytics3DProps> = ({
  place,
  weatherData,
  onClose,
  isVisible
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load Google Maps API
        const { Loader } = await import('@googlemaps/js-api-loader');
        
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['maps', 'marker']
        });

        await loader.load();

        // Initialize the map with 3D view
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: place.lat, lng: place.lng },
          zoom: 18,
          mapId: 'photorealistic-3d-map', // Required for 3D tiles
          tilt: 67.5,
          heading: 0,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          backgroundColor: '#000'
        });

        // Add weather marker
        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstance,
          title: `${place.name} - ${weatherData.temperature}°C`,
          icon: {
            url: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
            scaledSize: new google.maps.Size(50, 50)
          }
        });

        // Add info window with weather details
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; font-family: monospace; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #0066cc;">${place.name}</h3>
              <div style="display: grid; gap: 5px;">
                <div>🌡️ ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)</div>
                <div>☁️ ${weatherData.description}</div>
                <div>💧 Humidity: ${weatherData.humidity}%</div>
                <div>💨 Wind: ${weatherData.windSpeed} m/s</div>
                <div>📊 Pressure: ${weatherData.pressure} hPa</div>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        setMap(mapInstance);
        setIsLoading(false);

        // Smooth zoom animation
        setTimeout(() => {
          mapInstance.setZoom(20);
          mapInstance.setTilt(75);
        }, 1000);

      } catch (err) {
        console.error('Error initializing 3D map:', err);
        setError('Failed to load 3D map. Please check your Google Maps API key.');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map) {
        // Cleanup map instance
        setMap(null);
      }
    };
  }, [isVisible, place, weatherData]);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('rain')) return <Droplets className="w-6 h-6" />;
    if (condition.includes('cloud')) return <Cloud className="w-6 h-6" />;
    if (condition.includes('clear')) return <Sun className="w-6 h-6" />;
    if (condition.includes('wind')) return <Wind className="w-6 h-6" />;
    return <Sun className="w-6 h-6" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-400';
    if (temp < 10) return 'text-cyan-400';
    if (temp < 20) return 'text-green-400';
    if (temp < 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm">Back to Globe</span>
            </button>
            <div className="text-cyan-400">
              <h1 className="font-mono text-xl font-bold">{place.name}</h1>
              <p className="text-sm text-gray-400">{place.country} • {place.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-red-500/20 border border-red-400 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Map Container */}
      <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-cyan-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="font-mono">Loading 3D Environment...</p>
              <p className="font-mono text-sm text-gray-400 mt-2">Initializing Photorealistic 3D Tiles</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-red-400 max-w-md">
              <p className="font-mono mb-4">{error}</p>
              <p className="font-mono text-sm text-gray-400">
                Please ensure you have a valid Google Maps API key with Maps JavaScript API enabled.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weather Analytics Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Temperature */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Thermometer className={`w-6 h-6 ${getTemperatureColor(weatherData.temperature)}`} />
              <span className="font-mono text-cyan-400 text-sm">Temperature</span>
            </div>
            <div className={`text-3xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
              {weatherData.temperature}°C
            </div>
            <div className="text-sm text-gray-400 font-mono">
              Feels like {weatherData.feelsLike}°C
            </div>
          </div>

          {/* Weather Condition */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              {getWeatherIcon(weatherData.description)}
              <span className="font-mono text-purple-400 text-sm">Condition</span>
            </div>
            <div className="text-lg font-bold text-purple-400 capitalize">
              {weatherData.description}
            </div>
            <div className="text-sm text-gray-400 font-mono">
              Cloudiness: {weatherData.cloudiness}%
            </div>
          </div>

          {/* Wind & Pressure */}
          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Wind className="w-6 h-6 text-green-400" />
              <span className="font-mono text-green-400 text-sm">Wind & Pressure</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {weatherData.windSpeed} m/s
            </div>
            <div className="text-sm text-gray-400 font-mono">
              {weatherData.pressure} hPa
            </div>
          </div>

          {/* Humidity & Visibility */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Droplets className="w-6 h-6 text-yellow-400" />
              <span className="font-mono text-yellow-400 text-sm">Humidity & Visibility</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">
              {weatherData.humidity}%
            </div>
            <div className="text-sm text-gray-400 font-mono">
              Visibility: {weatherData.visibility} km
            </div>
          </div>
        </div>

        {/* Air Quality Index */}
        {weatherData.aqi && (
          <div className="mt-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gauge className="w-6 h-6 text-red-400" />
                <span className="font-mono text-red-400">Air Quality Index</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">{weatherData.aqi}</div>
                <div className="text-sm text-gray-400 font-mono">
                  {weatherData.aqi <= 50 ? 'Good' : 
                   weatherData.aqi <= 100 ? 'Moderate' : 
                   weatherData.aqi <= 150 ? 'Unhealthy for Sensitive' : 
                   weatherData.aqi <= 200 ? 'Unhealthy' : 'Very Unhealthy'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Updates */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Last updated: {new Date(weatherData.timestamp).toLocaleTimeString()}</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3">
        <div className="text-cyan-400 text-xs font-mono font-bold mb-2">3D CONTROLS</div>
        <div className="space-y-1 text-xs text-gray-400 font-mono">
          <div>• Drag to rotate</div>
          <div>• Scroll to zoom</div>
          <div>• Right-click + drag to tilt</div>
          <div>• Ctrl + drag to pan</div>
        </div>
      </div>
    </div>
  );
};