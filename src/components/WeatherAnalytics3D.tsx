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
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setApiKeyMissing(false);

        // Check if Google Maps API key is available
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setApiKeyMissing(true);
          setIsLoading(false);
          return;
        }

        // Load Google Maps API
        const { Loader } = await import('@googlemaps/js-api-loader');
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps', 'marker']
        });

        try {
          await loader.load();
        } catch (loadError: any) {
          console.error('Google Maps API loading error:', loadError);
          if (loadError.message?.includes('ApiProjectMapError') || 
              loadError.message?.includes('API key') ||
              loadError.message?.includes('billing')) {
            setError('Google Maps API configuration error. Please check your API key, enable required APIs (Maps JavaScript API, 3D Tiles API), and ensure billing is enabled in Google Cloud Console.');
          } else {
            setError(`Failed to load Google Maps API: ${loadError.message}`);
          }
          setIsLoading(false);
          return;
        }

        // Initialize the map with 3D view
        try {
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

        } catch (mapError: any) {
          console.error('Error creating map instance:', mapError);
          setError(`Failed to initialize 3D map: ${mapError.message}`);
          setIsLoading(false);
        }

      } catch (err) {
        console.error('Error initializing 3D map:', err);
        setError(`Failed to load 3D map: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
              <div className="font-mono text-sm text-gray-400 space-y-2">
                <p>To fix this issue:</p>
                <ol className="text-left list-decimal list-inside space-y-1">
                  <li>Get a Google Maps API key from Google Cloud Console</li>
                  <li>Enable Maps JavaScript API and 3D Tiles API</li>
                  <li>Enable billing for your Google Cloud project</li>
                  <li>Add the key to your .env file as VITE_GOOGLE_MAPS_API_KEY</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* API Key Missing Overlay */}
        {apiKeyMissing && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-yellow-400 max-w-md">
              <h3 className="font-mono text-lg mb-4">Google Maps API Key Required</h3>
              <p className="font-mono mb-4">3D weather analytics requires a Google Maps API key.</p>
              <div className="font-mono text-sm text-gray-400 space-y-2">
                <p>Setup steps:</p>
                <ol className="text-left list-decimal list-inside space-y-1">
                  <li>Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Cloud Console</a></li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable Maps JavaScript API and 3D Tiles API</li>
                  <li>Enable billing (required for 3D features)</li>
                  <li>Create an API key</li>
                  <li>Add VITE_GOOGLE_MAPS_API_KEY=your_key_here to .env file</li>
                </ol>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300"
              >
                Return to Globe View
              </button>
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