import React, { useState } from 'react';
import { GlobeComponent } from './components/Globe';
import { ControlPanel } from './components/ControlPanel';

function App() {
  const [showWeather, setShowWeather] = useState(true);
  const [showAQI, setShowAQI] = useState(false);
  const [showVegetation, setShowVegetation] = useState(false);
  const [showPopulation, setShowPopulation] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-black to-black"></div>
      
      {/* Globe component */}
      <GlobeComponent
        showWeather={showWeather}
        showAQI={showAQI}
        showVegetation={showVegetation}
        showPopulation={showPopulation}
        autoRotate={autoRotate}
      />
      
      {/* Control panel */}
      <ControlPanel
        showWeather={showWeather}
        showAQI={showAQI}
        showVegetation={showVegetation}
        showPopulation={showPopulation}
        autoRotate={autoRotate}
        onToggleWeather={() => setShowWeather(!showWeather)}
        onToggleAQI={() => setShowAQI(!showAQI)}
        onToggleVegetation={() => setShowVegetation(!showVegetation)}
        onTogglePopulation={() => setShowPopulation(!showPopulation)}
        onToggleRotation={() => setAutoRotate(!autoRotate)}
      />

      {/* Jarvis-style UI overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-400/50"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-cyan-400/50"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-cyan-400/50"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyan-400/50"></div>
        
        {/* Scanning lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse delay-1000"></div>
      </div>

      {/* Loading/scanning effect */}
      <div className="absolute bottom-4 right-4 text-cyan-400 font-mono text-xs opacity-70">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
          <span>SCANNING ENVIRONMENTAL DATA...</span>
        </div>
      </div>
    </div>
  );
}

export default App;