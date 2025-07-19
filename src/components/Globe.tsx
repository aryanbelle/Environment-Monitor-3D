import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { touristPlaces, TouristPlace } from '../data/touristPlaces';
import { weatherService, WeatherData } from '../services/weatherService';

interface GlobeComponentProps {
  showWeather: boolean;
  showAQI: boolean;
  showVegetation: boolean;
  showPopulation: boolean;
  autoRotate: boolean;
}

export const GlobeComponent: React.FC<GlobeComponentProps> = ({
  showWeather,
  showAQI,
  showVegetation,
  showPopulation,
  autoRotate
}) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!globeRef.current) return;

    // Initialize Globe with proper chaining
    const globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .enablePointerInteraction(true)
      (globeRef.current);

    // Store the globe instance
    globeInstance.current = globe;

    // Add atmosphere
    globeInstance.current.scene().add(new THREE.AmbientLight(0xbbbbbb, 0.3));
    globeInstance.current.scene().add(new THREE.DirectionalLight(0xffffff, 0.8));

    // Auto-rotation (off by default)
    globeInstance.current.controls().autoRotate = false;
    globeInstance.current.controls().autoRotateSpeed = 1.5;
    
    // Add clouds layer
    const CLOUDS_IMG_URL = '//unpkg.com/three-globe/example/img/earth-clouds.png';
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

    new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(globeInstance.current.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
      );
      globeInstance.current.scene().add(clouds);
      
      // Animate clouds rotation
      (function rotateClouds() {
        if (clouds && globeInstance.current) {
          clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
          requestAnimationFrame(rotateClouds);
        }
      })();
    });

    // Fetch weather data
    fetchWeatherData();

    // Auto-refresh weather data every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (globeInstance.current) {
        // Use Globe.gl's built-in destroy method for proper cleanup
        globeInstance.current._destructor();
      }
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.fetchWeatherData(touristPlaces);
      setWeatherData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!globeInstance.current || !weatherData.length) return;

    // Update globe with weather data
    if (showWeather) {
      globeInstance.current
        .pointsData(weatherData)
        .pointColor((d: WeatherData) => weatherService.getTemperatureColor(d.temperature))
        .pointAltitude(0.02)
        .pointRadius((d: WeatherData) => Math.max(0.1, Math.abs(d.temperature) / 100))
        .pointLabel((d: WeatherData) => `
          <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: #00ffff; border: 1px solid #00ffff; max-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${d.name}, ${d.country}</div>
            <div style="margin-bottom: 4px;">🌡️ ${d.temperature}°C (feels like ${d.feelsLike}°C)</div>
            <div style="margin-bottom: 4px;">☁️ ${d.description}</div>
            <div style="margin-bottom: 4px;">💧 Humidity: ${d.humidity}%</div>
            <div style="margin-bottom: 4px;">💨 Wind: ${d.windSpeed} m/s</div>
            <div style="margin-bottom: 4px;">📊 Pressure: ${d.pressure} hPa</div>
            <div style="margin-bottom: 4px;">👁️ Visibility: ${d.visibility} km</div>
            <div style="margin-bottom: 4px;">☁️ Cloudiness: ${d.cloudiness}%</div>
            ${d.aqi ? `<div>🌬️ AQI: ${d.aqi} (${weatherService.getAQILabel(d.aqi)})</div>` : ''}
          </div>
        `);
    } else {
      globeInstance.current.pointsData([]);
    }

    // Update AQI visualization
    if (showAQI && weatherData.length) {
      const aqiData = weatherData.filter(d => d.aqi);
      globeInstance.current
        .ringsData(aqiData)
        .ringColor((d: WeatherData) => weatherService.getAQIColor(d.aqi || 0))
        .ringMaxRadius(2)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(800);
    } else {
      globeInstance.current.ringsData([]);
    }

    // Labels for cities
    if (showWeather) {
      globeInstance.current
        .labelsData(weatherData)
        .labelText((d: WeatherData) => d.name)
        .labelSize(0.5)
        .labelDotRadius(0.3)
        .labelColor(() => '#00ffff')
        .labelResolution(2);
    } else {
      globeInstance.current.labelsData([]);
    }
  }, [weatherData, showWeather, showAQI, showVegetation, showPopulation]);

  // Handle auto-rotation toggle
  useEffect(() => {
    if (!globeInstance.current) return;
    globeInstance.current.controls().autoRotate = autoRotate;
  }, [autoRotate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (globeInstance.current) {
        globeInstance.current
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={globeRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-400 text-lg font-mono">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            <span>Loading weather data...</span>
          </div>
        </div>
      )}

      {/* Data legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-cyan-400 font-mono text-sm">
        <div className="font-bold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Cold (&lt; 10°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Mild (10-20°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Warm (20-30°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Hot (&gt; 30°C)</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-cyan-400 font-mono text-sm">
        <div className="font-bold mb-2">Live Stats</div>
        <div>Monitoring: {weatherData.length} locations</div>
        <div>Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};