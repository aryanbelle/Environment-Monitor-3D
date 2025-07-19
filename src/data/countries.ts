import { feature } from 'topojson-client';

// Define a fallback GeoJSON structure in case the fetch fails
const fallbackGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    // Just a few major countries as fallback
    {
      "type": "Feature",
      "properties": {
        "ADMIN": "United States of America",
        "ISO_A2": "US",
        "POP_EST": 331002651
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-125, 24], [-125, 49], [-66, 49], [-66, 24], [-125, 24]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "ADMIN": "China",
        "ISO_A2": "CN",
        "POP_EST": 1439323776
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[73, 18], [73, 53], [135, 53], [135, 18], [73, 18]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "ADMIN": "India",
        "ISO_A2": "IN",
        "POP_EST": 1380004385
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[68, 8], [68, 35], [97, 35], [97, 8], [68, 8]]]
      }
    }
  ]
};

// Function to fetch simplified GeoJSON for country boundaries
export async function fetchCountriesGeoJSON() {
  try {
    console.log('Fetching countries GeoJSON...');
    // Using world-atlas TopoJSON from a CDN
    const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch countries GeoJSON: ${response.status}`);
    }

    const topology = await response.json();
    
    if (!topology || !topology.objects || !topology.objects.countries) {
      throw new Error('Invalid TopoJSON structure');
    }
    
    // Convert TopoJSON to GeoJSON
    const countries = feature(topology, topology.objects.countries);
    
    // Validate the GeoJSON structure
    if (!countries || !countries.features || !Array.isArray(countries.features)) {
      throw new Error('Invalid GeoJSON structure after conversion');
    }
    
    // Ensure each feature has ISO_A2 and ADMIN properties
    countries.features.forEach(feature => {
      if (!feature.properties) {
        feature.properties = {};
      }
      
      if (!feature.properties.ISO_A2) {
        feature.properties.ISO_A2 = 'XX'; // Default unknown code
      }
      
      if (!feature.properties.ADMIN) {
        feature.properties.ADMIN = 'Unknown'; // Default unknown name
      }
    });
    
    console.log(`Successfully loaded ${countries.features.length} country features`);
    return countries;
  } catch (error) {
    console.error('Error fetching countries GeoJSON:', error);
    // Try the direct GeoJSON method
    try {
      return await fetchCountriesGeoJSONDirect();
    } catch (fallbackError) {
      console.error('All GeoJSON fetching methods failed, using minimal fallback data');
      return fallbackGeoJSON;
    }
  }
}

// Fetch countries GeoJSON from a reliable source
export const fetchCountriesGeoJSONDirect = async (): Promise<any> => {
  try {
    console.log('Trying alternative GeoJSON source...');
    // Using a reliable GeoJSON source that includes ISO_A2 and ADMIN properties
    const response = await fetch(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch countries GeoJSON: ${response.status}, using fallback data`);
      return fallbackGeoJSON;
    }
    
    const data = await response.json();
    
    // Validate the GeoJSON structure
    if (!data || !data.features || !Array.isArray(data.features) || data.features.length === 0) {
      console.warn('Invalid GeoJSON structure, using fallback data');
      return fallbackGeoJSON;
    }
    
    // Ensure each feature has the required properties
    data.features.forEach((feature: any) => {
      if (!feature.properties) {
        feature.properties = {};
      }
      
      // Ensure ISO_A2 property exists
      if (!feature.properties.ISO_A2) {
        feature.properties.ISO_A2 = 'XX';
      }
      
      // Ensure ADMIN property exists
      if (!feature.properties.ADMIN) {
        feature.properties.ADMIN = 'Unknown';
      }
    });
    
    console.log(`Successfully loaded ${data.features.length} country features from alternative source`);
    return data;
  } catch (error) {
    console.error('Error fetching countries GeoJSON:', error);
    console.warn('Using fallback GeoJSON data');
    return fallbackGeoJSON;
  }
};