import React from 'react';
import { Globe, Thermometer, Wind, Leaf, Users, RotateCw } from 'lucide-react';

interface ControlPanelProps {
  showWeather: boolean;
  showAQI: boolean;
  showVegetation: boolean;
  showPopulation: boolean;
  autoRotate: boolean;
  onToggleWeather: () => void;
  onToggleAQI: () => void;
  onToggleVegetation: () => void;
  onTogglePopulation: () => void;
  onToggleRotation: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  showWeather,
  showAQI,
  showVegetation,
  showPopulation,
  autoRotate,
  onToggleWeather,
  onToggleAQI,
  onToggleVegetation,
  onTogglePopulation,
  onToggleRotation
}) => {
  const ToggleButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
  }> = ({ isActive, onClick, icon, label, disabled = false }) => (
    <div 
      className={`
        group relative flex items-center space-x-2 p-2 rounded-lg border transition-all duration-300 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isActive && !disabled
          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20' 
          : 'bg-black/40 border-gray-600 text-gray-400 hover:border-cyan-400/50 hover:text-cyan-300'
        }
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className={`transition-all duration-300 ${isActive && !disabled ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-mono whitespace-nowrap">{label}</span>
      
      {/* Glow effect for active state */}
      {isActive && !disabled && (
        <div className="absolute inset-0 rounded-lg bg-cyan-400/10 animate-pulse"></div>
      )}
      
      {/* Coming soon indicator */}
      {disabled && (
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1 rounded-full font-mono">
          SOON
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute top-4 left-4 z-10">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 mb-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Globe className="w-5 h-5" />
          <h1 className="font-mono text-sm font-bold">ENVIRONMENTAL MONITOR</h1>
        </div>
        <div className="text-xs text-gray-400 font-mono mt-1">Real-time global data visualization</div>
      </div>

      {/* Control toggles */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3">
        <div className="text-cyan-400 text-xs font-mono font-bold mb-3">DATA LAYERS</div>
        <div className="space-y-2">
          <ToggleButton
            isActive={showWeather}
            onClick={onToggleWeather}
            icon={<Thermometer className="w-4 h-4" />}
            label="Weather (3D)"
          />
          <ToggleButton
            isActive={showAQI}
            onClick={onToggleAQI}
            icon={<Wind className="w-4 h-4" />}
            label="AQI"
          />
          <ToggleButton
            isActive={showVegetation}
            onClick={onToggleVegetation}
            icon={<Leaf className="w-4 h-4" />}
            label="Vegetation"
            disabled={true}
          />
          <ToggleButton
            isActive={showPopulation}
            onClick={onTogglePopulation}
            icon={<Users className="w-4 h-4" />}
            label="Population"
          />
        </div>
      </div>

      {/* Globe settings */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 mt-3">
        <div className="text-cyan-400 text-xs font-mono font-bold mb-3">GLOBE SETTINGS</div>
        <div className="space-y-2">
          <ToggleButton
            isActive={autoRotate}
            onClick={onToggleRotation}
            icon={<RotateCw className="w-4 h-4" />}
            label="Auto-Rotation"
          />
        </div>
      </div>

      {/* System status */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 mt-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-green-400">SYSTEM ONLINE</span>
        </div>
        <div className="text-xs text-gray-400 font-mono mt-1">
          API Status: Operational
        </div>
      </div>
    </div>
  );
};