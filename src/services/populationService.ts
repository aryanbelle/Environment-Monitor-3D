export interface PopulationData {
  id: string;
  name: string;
  population: number;
  iso_a2: string;
}

export class PopulationService {
  private baseUrl: string = 'https://restcountries.com/v3.1';
  private cacheExpiration: number = 0;
  private cachedData: PopulationData[] | null = null;

  async fetchPopulationData(): Promise<PopulationData[]> {
    // Use cached data if available and not expired (30 minutes cache)
    const now = Date.now();
    if (this.cachedData && this.cacheExpiration > now) {
      console.log('Using cached population data');
      return this.cachedData;
    }

    try {
      console.log('Fetching population data from API...');
      const response = await fetch(`${this.baseUrl}/all?fields=name,population,cca2`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch population data: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid population data format');
      }

      // Process and validate the data
      const processedData = data
        .filter((country: any) => 
          country && 
          country.cca2 && 
          country.name && 
          country.name.common && 
          typeof country.population === 'number'
        )
        .map((country: any) => ({
          id: country.cca2.toLowerCase(),
          name: country.name.common,
          population: country.population,
          iso_a2: country.cca2
        }));
      
      // Cache the data for 30 minutes
      this.cachedData = processedData;
      this.cacheExpiration = now + (30 * 60 * 1000);
      
      return processedData;
    } catch (error) {
      console.error('Error fetching population data:', error);
      // If we have cached data but it's expired, still use it as a fallback
      if (this.cachedData) {
        console.log('Using expired cached population data as fallback');
        return this.cachedData;
      }
      return this.generateMockData();
    }
  }

  private generateMockData(): PopulationData[] {
    // Fallback mock data for testing
    return [
      { id: 'us', name: 'United States', population: 331002651, iso_a2: 'US' },
      { id: 'cn', name: 'China', population: 1439323776, iso_a2: 'CN' },
      { id: 'in', name: 'India', population: 1380004385, iso_a2: 'IN' },
      { id: 'id', name: 'Indonesia', population: 273523615, iso_a2: 'ID' },
      { id: 'pk', name: 'Pakistan', population: 220892340, iso_a2: 'PK' },
      { id: 'br', name: 'Brazil', population: 212559417, iso_a2: 'BR' },
      { id: 'ng', name: 'Nigeria', population: 206139589, iso_a2: 'NG' },
      { id: 'bd', name: 'Bangladesh', population: 164689383, iso_a2: 'BD' },
      { id: 'ru', name: 'Russia', population: 145934462, iso_a2: 'RU' },
      { id: 'mx', name: 'Mexico', population: 128932753, iso_a2: 'MX' },
      { id: 'jp', name: 'Japan', population: 126476461, iso_a2: 'JP' },
      { id: 'et', name: 'Ethiopia', population: 114963588, iso_a2: 'ET' },
      { id: 'ph', name: 'Philippines', population: 109581078, iso_a2: 'PH' },
      { id: 'eg', name: 'Egypt', population: 102334404, iso_a2: 'EG' },
      { id: 'vn', name: 'Vietnam', population: 97338579, iso_a2: 'VN' },
      { id: 'cd', name: 'DR Congo', population: 89561403, iso_a2: 'CD' },
      { id: 'tr', name: 'Turkey', population: 84339067, iso_a2: 'TR' },
      { id: 'ir', name: 'Iran', population: 83992949, iso_a2: 'IR' },
      { id: 'de', name: 'Germany', population: 83783942, iso_a2: 'DE' },
      { id: 'th', name: 'Thailand', population: 69799978, iso_a2: 'TH' }
    ];
  }

  getPopulationColor(population: number): string {
    // Color scale for population visualization with higher opacity for better visibility
    if (population > 1000000000) return 'rgba(255, 0, 0, 0.8)'; // > 1B: Red
    if (population > 500000000) return 'rgba(255, 100, 0, 0.8)'; // > 500M: Orange
    if (population > 100000000) return 'rgba(255, 200, 0, 0.8)'; // > 100M: Yellow
    if (population > 50000000) return 'rgba(180, 255, 0, 0.8)'; // > 50M: Light green
    if (population > 10000000) return 'rgba(0, 255, 50, 0.8)'; // > 10M: Green
    if (population > 5000000) return 'rgba(0, 255, 150, 0.8)'; // > 5M: Teal
    if (population > 1000000) return 'rgba(0, 200, 255, 0.8)'; // > 1M: Cyan
    return 'rgba(100, 150, 255, 0.8)'; // < 1M: Light blue
  }

  formatPopulation(population: number): string {
    if (population >= 1000000000) {
      return `${(population / 1000000000).toFixed(2)}B`;
    } else if (population >= 1000000) {
      return `${(population / 1000000).toFixed(2)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(2)}K`;
    } else {
      return population.toString();
    }
  }
}

export const populationService = new PopulationService();