export interface TouristPlace {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  category: string;
}

export const touristPlaces: TouristPlace[] = [
  // Iconic Landmarks & Monuments
  { id: 'eiffel-tower', name: 'Eiffel Tower', country: 'France', lat: 48.8584, lng: 2.2945, category: 'Landmark' },
  { id: 'statue-liberty', name: 'Statue of Liberty', country: 'USA', lat: 40.6892, lng: -74.0445, category: 'Landmark' },
  { id: 'big-ben', name: 'Big Ben', country: 'UK', lat: 51.4994, lng: -0.1245, category: 'Landmark' },
  { id: 'colosseum', name: 'Colosseum', country: 'Italy', lat: 41.8902, lng: 12.4922, category: 'Historical' },
  { id: 'christ-redeemer', name: 'Christ the Redeemer', country: 'Brazil', lat: -22.9519, lng: -43.2105, category: 'Landmark' },
  { id: 'taj-mahal', name: 'Taj Mahal', country: 'India', lat: 27.1751, lng: 78.0421, category: 'Historical' },
  { id: 'great-wall', name: 'Great Wall of China', country: 'China', lat: 40.4319, lng: 116.5704, category: 'Historical' },
  { id: 'machu-picchu', name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lng: -72.5450, category: 'Historical' },
  { id: 'petra', name: 'Petra', country: 'Jordan', lat: 30.3285, lng: 35.4444, category: 'Historical' },
  { id: 'sydney-opera', name: 'Sydney Opera House', country: 'Australia', lat: -33.8568, lng: 151.2153, category: 'Landmark' },
  
  // Famous Museums & Cultural Sites
  { id: 'louvre', name: 'Louvre Museum', country: 'France', lat: 48.8606, lng: 2.3376, category: 'Cultural' },
  { id: 'vatican', name: 'Vatican City', country: 'Vatican', lat: 41.9029, lng: 12.4534, category: 'Cultural' },
  { id: 'acropolis', name: 'Acropolis of Athens', country: 'Greece', lat: 37.9715, lng: 23.7267, category: 'Historical' },
  { id: 'forbidden-city', name: 'Forbidden City', country: 'China', lat: 39.9163, lng: 116.3972, category: 'Historical' },
  { id: 'angkor-wat', name: 'Angkor Wat', country: 'Cambodia', lat: 13.4125, lng: 103.8670, category: 'Historical' },
  { id: 'sagrada-familia', name: 'Sagrada Familia', country: 'Spain', lat: 41.4036, lng: 2.1744, category: 'Cultural' },
  { id: 'neuschwanstein', name: 'Neuschwanstein Castle', country: 'Germany', lat: 47.5576, lng: 10.7498, category: 'Historical' },
  { id: 'mont-saint-michel', name: 'Mont Saint-Michel', country: 'France', lat: 48.6361, lng: -1.5115, category: 'Historical' },
  
  // Natural Wonders
  { id: 'grand-canyon', name: 'Grand Canyon', country: 'USA', lat: 36.1069, lng: -112.1129, category: 'Nature' },
  { id: 'niagara-falls', name: 'Niagara Falls', country: 'Canada', lat: 43.0962, lng: -79.0377, category: 'Nature' },
  { id: 'mount-fuji', name: 'Mount Fuji', country: 'Japan', lat: 35.3606, lng: 138.7274, category: 'Nature' },
  { id: 'uluru', name: 'Uluru (Ayers Rock)', country: 'Australia', lat: -25.3444, lng: 131.0369, category: 'Nature' },
  { id: 'victoria-falls', name: 'Victoria Falls', country: 'Zambia', lat: -17.9243, lng: 25.8572, category: 'Nature' },
  { id: 'iguazu-falls', name: 'Iguazu Falls', country: 'Argentina', lat: -25.6953, lng: -54.4367, category: 'Nature' },
  { id: 'yellowstone', name: 'Yellowstone National Park', country: 'USA', lat: 44.4280, lng: -110.5885, category: 'Nature' },
  { id: 'banff', name: 'Banff National Park', country: 'Canada', lat: 51.4968, lng: -115.9281, category: 'Nature' },
  { id: 'torres-del-paine', name: 'Torres del Paine', country: 'Chile', lat: -50.9423, lng: -73.4068, category: 'Nature' },
  
  // Tropical Paradises & Islands
  { id: 'maldives', name: 'Maldives', country: 'Maldives', lat: 3.2028, lng: 73.2207, category: 'Island' },
  { id: 'bora-bora', name: 'Bora Bora', country: 'French Polynesia', lat: -16.5004, lng: -151.7415, category: 'Island' },
  { id: 'santorini', name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615, category: 'Island' },
  { id: 'bali-temple', name: 'Tanah Lot Temple, Bali', country: 'Indonesia', lat: -8.6211, lng: 115.0868, category: 'Cultural' },
  { id: 'seychelles', name: 'Seychelles', country: 'Seychelles', lat: -4.6796, lng: 55.4920, category: 'Island' },
  { id: 'fiji-islands', name: 'Fiji Islands', country: 'Fiji', lat: -17.7134, lng: 178.0650, category: 'Island' },
  { id: 'hawaii-volcano', name: 'Hawaii Volcanoes National Park', country: 'USA', lat: 19.4194, lng: -155.2885, category: 'Nature' },
  
  // Urban Skylines & Modern Marvels
  { id: 'burj-khalifa', name: 'Burj Khalifa', country: 'UAE', lat: 25.1972, lng: 55.2744, category: 'Modern' },
  { id: 'empire-state', name: 'Empire State Building', country: 'USA', lat: 40.7484, lng: -73.9857, category: 'Landmark' },
  { id: 'cn-tower', name: 'CN Tower', country: 'Canada', lat: 43.6426, lng: -79.3871, category: 'Landmark' },
  { id: 'tokyo-tower', name: 'Tokyo Tower', country: 'Japan', lat: 35.6586, lng: 139.7454, category: 'Landmark' },
  { id: 'marina-bay', name: 'Marina Bay Sands', country: 'Singapore', lat: 1.2834, lng: 103.8607, category: 'Modern' },
  { id: 'golden-gate', name: 'Golden Gate Bridge', country: 'USA', lat: 37.8199, lng: -122.4783, category: 'Landmark' },
  { id: 'brooklyn-bridge', name: 'Brooklyn Bridge', country: 'USA', lat: 40.7061, lng: -73.9969, category: 'Landmark' },
  
  // Ancient Civilizations
  { id: 'pyramids-giza', name: 'Pyramids of Giza', country: 'Egypt', lat: 29.9792, lng: 31.1342, category: 'Historical' },
  { id: 'sphinx', name: 'Great Sphinx', country: 'Egypt', lat: 29.9753, lng: 31.1376, category: 'Historical' },
  { id: 'stonehenge', name: 'Stonehenge', country: 'UK', lat: 51.1789, lng: -1.8262, category: 'Historical' },
  { id: 'easter-island', name: 'Easter Island Moai', country: 'Chile', lat: -27.1127, lng: -109.3497, category: 'Historical' },
  { id: 'chichen-itza', name: 'Chichen Itza', country: 'Mexico', lat: 20.6843, lng: -88.5678, category: 'Historical' },
  { id: 'borobudur', name: 'Borobudur Temple', country: 'Indonesia', lat: -7.6079, lng: 110.2038, category: 'Historical' },
  
  // Religious & Spiritual Sites
  { id: 'golden-temple', name: 'Golden Temple', country: 'India', lat: 31.6200, lng: 74.8765, category: 'Religious' },
  { id: 'western-wall', name: 'Western Wall', country: 'Israel', lat: 31.7767, lng: 35.2345, category: 'Religious' },
  { id: 'mount-kailash', name: 'Mount Kailash', country: 'Tibet', lat: 31.0688, lng: 81.3108, category: 'Religious' },
  { id: 'varanasi-ghats', name: 'Varanasi Ghats', country: 'India', lat: 25.3176, lng: 82.9739, category: 'Religious' },
  { id: 'lumbini', name: 'Lumbini (Buddha Birthplace)', country: 'Nepal', lat: 27.4781, lng: 83.2751, category: 'Religious' },
  
  // Adventure & Extreme Destinations
  { id: 'everest-base', name: 'Everest Base Camp', country: 'Nepal', lat: 28.0026, lng: 86.8528, category: 'Adventure' },
  { id: 'kilimanjaro', name: 'Mount Kilimanjaro', country: 'Tanzania', lat: -3.0674, lng: 37.3556, category: 'Adventure' },
  { id: 'antarctica', name: 'Antarctica Peninsula', country: 'Antarctica', lat: -63.2467, lng: -57.0094, category: 'Adventure' },
  { id: 'sahara-desert', name: 'Sahara Desert', country: 'Morocco', lat: 31.6295, lng: -7.9811, category: 'Adventure' },
  { id: 'patagonia', name: 'Patagonia', country: 'Argentina', lat: -50.0364, lng: -73.1719, category: 'Adventure' },
  
  // Unique Cultural Experiences
  { id: 'venice-canals', name: 'Venice Canals', country: 'Italy', lat: 45.4408, lng: 12.3155, category: 'Cultural' },
  { id: 'kyoto-temples', name: 'Kyoto Temples', country: 'Japan', lat: 35.0116, lng: 135.7681, category: 'Cultural' },
  { id: 'marrakech-medina', name: 'Marrakech Medina', country: 'Morocco', lat: 31.6295, lng: -7.9811, category: 'Cultural' },
  { id: 'istanbul-hagia', name: 'Hagia Sophia', country: 'Turkey', lat: 41.0086, lng: 28.9802, category: 'Cultural' },
  { id: 'dubrovnik', name: 'Dubrovnik Old Town', country: 'Croatia', lat: 42.6420, lng: 18.1081, category: 'Cultural' },
  { id: 'prague-castle', name: 'Prague Castle', country: 'Czech Republic', lat: 50.0910, lng: 14.4016, category: 'Cultural' }
];