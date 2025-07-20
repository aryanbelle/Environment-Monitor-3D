import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { touristPlaces, TouristPlace } from '../data/touristPlaces';
import { weatherService, WeatherData } from '../services/weatherService';
import { populationService, PopulationData } from '../services/populationService';
import { fetchCountriesGeoJSONDirect } from '../data/countries';
import { WeatherAnalytics3D } from './WeatherAnalytics3D';

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
  const [populationData, setPopulationData] = useState<PopulationData[]>([]);
  const [countriesGeoJSON, setCountriesGeoJSON] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected3DPlace, setSelected3DPlace] = useState<{place: TouristPlace, weather: WeatherData} | null>(null);

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
      // Configure polygon layer for population data (will only be shown when showPopulation is true)
      .polygonCapColor(feat => feat.properties.POP_EST ? 
        populationService.getPopulationColor(feat.properties.POP_EST) : 'rgba(200, 200, 200, 0.7)')
      .polygonSideColor(feat => feat.properties.POP_EST ? 
        populationService.getPopulationColor(feat.properties.POP_EST).replace('0.8', '0.3') : 'rgba(100, 100, 100, 0.3)')
      .polygonStrokeColor(() => '#fff')
      .polygonLabel(({ properties: d }) => `
        <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: #00ffff; border: 1px solid #00ffff; max-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${d.ADMIN} (${d.ISO_A2})</div>
          <div style="margin-bottom: 4px;">Population: ${d.POP_EST ? populationService.formatPopulation(d.POP_EST) : 'Unknown'}</div>
        </div>
      `)
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

    // Fetch data
    fetchWeatherData();
    fetchPopulationData();
    fetchCountriesData();

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

  const fetchPopulationData = async () => {
    try {
      const data = await populationService.fetchPopulationData();
      setPopulationData(data);
    } catch (error) {
      console.error('Error fetching population data:', error);
    }
  };

  const fetchCountriesData = async () => {
    try {
      const data = await fetchCountriesGeoJSONDirect();
      setCountriesGeoJSON(data);
    } catch (error) {
      console.error('Error fetching countries GeoJSON:', error);
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
        .onPointClick((point: WeatherData) => {
          if (showWeather) {
            const place = touristPlaces.find(p => p.id === point.id);
            if (place) {
              setSelected3DPlace({ place, weather: point });
            }
          }
        })
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
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #00ffff;">
              <small style="color: #00ffff;">💡 Click to explore in 3D</small>
            </div>
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

  // Update population data visualization
  useEffect(() => {
    if (!globeInstance.current || !countriesGeoJSON) return;
    
    try {
      if (showPopulation) {
        // Make a deep copy to avoid modifying the original data
        const geoJsonCopy = JSON.parse(JSON.stringify(countriesGeoJSON));
        
        // Validate the GeoJSON structure
        if (!geoJsonCopy || !geoJsonCopy.features || !Array.isArray(geoJsonCopy.features)) {
          console.error('Invalid GeoJSON structure');
          return;
        }
        
        // Filter out Antarctica (AQ) as it has no permanent population
        const features = geoJsonCopy.features.filter((d: any) => 
          d && d.properties && d.properties.ISO_A2 !== 'AQ'
        );
        
        // Merge population data with GeoJSON
        if (populationData && populationData.length > 0) {
          features.forEach((feature: any) => {
            if (!feature.properties) {
              feature.properties = {};
            }
            
            const countryData = populationData.find(d => 
              d.iso_a2 === feature.properties.ISO_A2
            );
            
            if (countryData) {
              feature.properties.POP_EST = countryData.population;
            } else {
              // Set a default population to avoid NaN errors
              feature.properties.POP_EST = 1000000; // Default 1M population
            }
          });
        }
        
        // Set polygon data with a small delay to ensure the globe is ready
        setTimeout(() => {
          if (!globeInstance.current) return;
          
          // Apply the data
          globeInstance.current.polygonsData(features);
          
          // Animate polygon altitude based on population with a more conservative scale
          setTimeout(() => {
            if (!globeInstance.current) return;
            
            globeInstance.current
              .polygonsTransitionDuration(4000)
              .polygonAltitude(feat => {
                try {
                  const population = feat.properties.POP_EST;
                  if (!population) return 0.01;
                  // Use a more conservative scale factor to prevent excessive heights
                  return Math.max(0.01, Math.min(0.2, Math.sqrt(population) * 3e-6));
                } catch (e) {
                  console.error('Error calculating polygon altitude:', e);
                  return 0.01; // Safe fallback
                }
              });
          }, 1000);
        }, 100);
      } else {
        // Clear polygons when population view is not selected
        globeInstance.current.polygonsData([]);
      }
    } catch (error) {
      console.error('Error processing population data:', error);
      // Clear polygons on error
      globeInstance.current.polygonsData([]);
    }
  }, [countriesGeoJSON, populationData, showPopulation]);

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
      
      {/* 3D Weather Analytics */}
      {selected3DPlace && (
        <WeatherAnalytics3D
          place={selected3DPlace.place}
          weatherData={selected3DPlace.weather}
          isVisible={!!selected3DPlace}
          onClose={() => setSelected3DPlace(null)}
        />
      )}
      
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
        {showWeather && (
          <div className="space-y-1 mb-3">
            <div className="text-sm font-semibold mb-1">Temperature</div>
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
        )}
        {showPopulation && (
          <div className="space-y-1">
            <div className="text-sm font-semibold mb-1">Population</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 0, 0, 0.8)' }}></div>
              <span>&gt; 1 Billion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 128, 0, 0.8)' }}></div>
              <span>&gt; 500 Million</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 0, 0.8)' }}></div>
              <span>&gt; 100 Million</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 0, 0.8)' }}></div>
              <span>&gt; 10 Million</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 255, 0.8)' }}></div>
              <span>&lt; 10 Million</span>
            </div>
          </div>
        )}
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