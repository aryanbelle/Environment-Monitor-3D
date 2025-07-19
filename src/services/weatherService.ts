export interface WeatherData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  aqi?: number;
  timestamp: number;
  icon: string;
  feelsLike: number;
  cloudiness: number;
}

export class WeatherService {
  private apiKey: string = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5/weather';
  private aqiUrl: string = 'https://api.openweathermap.org/data/2.5/air_pollution';

  constructor() {
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not found. Please add VITE_OPENWEATHER_API_KEY to your environment variables.');
    }
  }

  async fetchWeatherData(places: any[]): Promise<WeatherData[]> {
    if (!this.apiKey) {
      console.warn('Using mock data - API key not configured');
      return this.generateMockData(places);
    }

    const weatherPromises = places.map(place => this.fetchSingleWeatherData(place.lat, place.lng, place));
    const results = await Promise.allSettled(weatherPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<WeatherData> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  async fetchSingleWeatherData(lat: number, lng: number, place?: any): Promise<WeatherData> {
    if (!this.apiKey) {
      return this.generateMockWeatherData(place || { id: 'temp', name: 'Location', country: 'Unknown', lat, lng });
    }

    try {
      const weatherUrl = `${this.baseUrl}?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
      const aqiUrl = `${this.aqiUrl}?lat=${lat}&lon=${lng}&appid=${this.apiKey}`;

      const [weatherResponse, aqiResponse] = await Promise.allSettled([
        fetch(weatherUrl),
        fetch(aqiUrl)
      ]);

      let weatherData: any = null;
      let aqiData: any = null;

      if (weatherResponse.status === 'fulfilled' && weatherResponse.value.ok) {
        weatherData = await weatherResponse.value.json();
      }

      if (aqiResponse.status === 'fulfilled' && aqiResponse.value.ok) {
        aqiData = await aqiResponse.value.json();
      }

      if (!weatherData) {
        throw new Error('Failed to fetch weather data');
      }

      return {
        id: place?.id || 'temp',
        name: place?.name || weatherData.name,
        country: place?.country || weatherData.sys.country,
        lat,
        lng,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 10) / 10,
        pressure: weatherData.main.pressure,
        visibility: Math.round((weatherData.visibility || 10000) / 1000),
        cloudiness: weatherData.clouds.all,
        uvIndex: undefined, // UV data requires separate API call
        aqi: aqiData?.list?.[0]?.main?.aqi ? this.convertAQIToUS(aqiData.list[0].main.aqi) : undefined,
        timestamp: Date.now(),
        icon: weatherData.weather[0].icon
      };
    } catch (error) {
      console.error(`Error fetching weather data for ${place?.name || 'location'}:`, error);
      return this.generateMockWeatherData(place || { id: 'temp', name: 'Location', country: 'Unknown', lat, lng });
    }
  }

  private convertAQIToUS(europeanAQI: number): number {
    // Convert European AQI (1-5) to US AQI scale (0-500)
    const conversion = {
      1: 25,   // Good
      2: 75,   // Fair
      3: 125,  // Moderate
      4: 175,  // Poor
      5: 275   // Very Poor
    };
    return conversion[europeanAQI as keyof typeof conversion] || 100;
  }

  private generateMockData(places: any[]): WeatherData[] {
    return places.map(place => this.generateMockWeatherData(place));
  }

  private generateMockWeatherData(place: any): WeatherData {
    const weatherConditions = [
      { desc: 'clear sky', icon: '01d' },
      { desc: 'few clouds', icon: '02d' },
      { desc: 'scattered clouds', icon: '03d' },
      { desc: 'broken clouds', icon: '04d' },
      { desc: 'shower rain', icon: '09d' },
      { desc: 'rain', icon: '10d' },
      { desc: 'thunderstorm', icon: '11d' },
      { desc: 'snow', icon: '13d' },
      { desc: 'mist', icon: '50d' }
    ];

    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const baseTemp = this.getRegionalBaseTemp(place.lat);
    const tempVariation = (Math.random() - 0.5) * 20; // ±10°C variation
    const temperature = Math.round(baseTemp + tempVariation);
    
    return {
      id: place.id,
      name: place.name,
      country: place.country,
      lat: place.lat,
      lng: place.lng,
      temperature,
      feelsLike: temperature + Math.round((Math.random() - 0.5) * 6),
      description: randomCondition.desc,
      humidity: Math.floor(Math.random() * 60) + 20,
      windSpeed: Math.round((Math.random() * 15 + 1) * 10) / 10,
      pressure: Math.floor(Math.random() * 50) + 1000,
      visibility: Math.floor(Math.random() * 10) + 5,
      cloudiness: Math.floor(Math.random() * 100),
      uvIndex: Math.floor(Math.random() * 11),
      aqi: Math.floor(Math.random() * 150) + 50,
      timestamp: Date.now(),
      icon: randomCondition.icon
    };
  }

  private getRegionalBaseTemp(lat: number): number {
    // Approximate temperature based on latitude
    const absLat = Math.abs(lat);
    if (absLat < 23.5) return 28; // Tropical
    if (absLat < 35) return 22;   // Subtropical
    if (absLat < 50) return 15;   // Temperate
    if (absLat < 66.5) return 5;  // Subarctic
    return -10; // Arctic
  }

  getTemperatureColor(temperature: number): string {
    if (temperature < -10) return '#001f3f';    // Navy for extreme cold
    if (temperature < 0) return '#0074D9';      // Blue for freezing
    if (temperature < 10) return '#39CCCC';     // Teal for cold
    if (temperature < 20) return '#2ECC40';     // Green for mild
    if (temperature < 25) return '#FFDC00';     // Yellow for warm
    if (temperature < 30) return '#FF851B';     // Orange for hot
    if (temperature < 35) return '#FF4136';     // Red for very hot
    return '#85144b';                           // Maroon for extreme heat
  }

  getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#00e400';            // Good - Green
    if (aqi <= 100) return '#ffff00';           // Moderate - Yellow
    if (aqi <= 150) return '#ff7e00';           // Unhealthy for sensitive - Orange
    if (aqi <= 200) return '#ff0000';           // Unhealthy - Red
    if (aqi <= 300) return '#8f3f97';           // Very unhealthy - Purple
    return '#7e0023';                           // Hazardous - Maroon
  }

  getAQILabel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }
}

export const weatherService = new WeatherService();