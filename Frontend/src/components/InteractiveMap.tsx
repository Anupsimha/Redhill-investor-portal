import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Car, 
  Plane, 
  Train, 
  Building2, 
  Sparkles, 
  ExternalLink, 
  Maximize2, 
  Compass, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  X,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface MapProject {
  id: number | string;
  name: string;
  location: string;
  zone: 'North' | 'East' | 'South-East' | 'Central';
  coordinates: { x: number; y: number; lat: number; lng: number };
  status: string;
  completion: number;
  value?: string;
  carpetArea?: string;
  image?: string;
  highlights: string[];
  proximity: {
    airport: string;
    metro: string;
    techPark: string;
    cbd: string;
  };
}

export const BANGALORE_PROJECTS: MapProject[] = [
  {
    id: 1,
    name: 'Redhill Signature Towers',
    location: 'Whitefield, Bangalore',
    zone: 'East',
    coordinates: { x: 74, y: 52, lat: 12.9698, lng: 77.7499 },
    status: 'Under Construction (60%)',
    completion: 60,
    value: '₹450 Cr',
    carpetArea: '2,200 - 4,800 sq.ft.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    highlights: ['Adjacent to ITPL & EPIP Zone', '3 mins to Hopefarm Metro', 'Sky Lounge & Helipad Access'],
    proximity: {
      airport: '42 mins (36 km)',
      metro: '3 mins (900 m)',
      techPark: '5 mins to ITPL (1.8 km)',
      cbd: '30 mins (18 km)'
    }
  },
  {
    id: 2,
    name: 'Redhill Emerald Gardens',
    location: 'Sarjapur Road, Bangalore',
    zone: 'South-East',
    coordinates: { x: 68, y: 72, lat: 12.9121, lng: 77.6835 },
    status: 'Sanctions & Foundation (25%)',
    completion: 25,
    value: '₹280 Cr',
    carpetArea: '1,850 - 3,600 sq.ft.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    highlights: ['Prime Tech Corridor Frontage', 'Close to RGA & Wipro SEZ', '75% Open Green Landscape'],
    proximity: {
      airport: '55 mins (48 km)',
      metro: '12 mins to ORR Metro',
      techPark: '4 mins to RGA Tech Park',
      cbd: '35 mins (16 km)'
    }
  },
  {
    id: 3,
    name: 'Redhill Pinnacle Heights',
    location: 'Hebbal / Airport Corridor, Bangalore',
    zone: 'North',
    coordinates: { x: 48, y: 32, lat: 13.0358, lng: 77.5970 },
    status: 'Pre-Launch & Approvals (10%)',
    completion: 10,
    value: '₹620 Cr',
    carpetArea: '3,100 - 6,200 sq.ft.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000',
    highlights: ['Direct NH 44 Expressway Link', 'Panoramic Hebbal Lake View', 'Ultra-Luxury High-Rise'],
    proximity: {
      airport: '20 mins (26 km)',
      metro: '5 mins to Hebbal Metro',
      techPark: '6 mins to Manyata Embassy',
      cbd: '18 mins (10 km)'
    }
  },
  {
    id: 4,
    name: 'Redhill Sovereign Estates',
    location: 'Devanahalli / Aerotropolis, Bangalore',
    zone: 'North',
    coordinates: { x: 58, y: 15, lat: 13.2483, lng: 77.7126 },
    status: 'Exclusive Edition (15%)',
    completion: 15,
    value: '₹540 Cr',
    carpetArea: '4,500 - 8,500 sq.ft. Villas',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
    highlights: ['Beside KIADB Aerospace SEZ', 'Private Clubhouse & Helipad', '10 mins to Terminal 2 BLR'],
    proximity: {
      airport: '10 mins (12 km)',
      metro: '8 mins to Airport Metro Line',
      techPark: '5 mins to Aerospace Park',
      cbd: '45 mins (34 km)'
    }
  }
];

const LANDMARKS = [
  { name: 'Kempegowda Intl Airport (BLR)', x: 55, y: 8, icon: Plane, color: 'text-amber-400' },
  { name: 'Manyata Embassy Tech Park', x: 46, y: 38, icon: Building2, color: 'text-blue-400' },
  { name: 'MG Road / Central CBD', x: 50, y: 56, icon: Building2, color: 'text-emerald-400' },
  { name: 'ITPL Tech Hub', x: 78, y: 50, icon: Building2, color: 'text-purple-400' },
  { name: 'Outer Ring Road (ORR) Junction', x: 62, y: 64, icon: Navigation, color: 'text-cyan-400' },
  { name: 'Electronic City Phase 1', x: 52, y: 88, icon: Building2, color: 'text-rose-400' }
];

interface InteractiveMapProps {
  onSelectProjectDetail?: (project: MapProject) => void;
  onBookSiteVisit?: (project: MapProject) => void;
  standalone?: boolean;
  highlightProjectId?: number | string;
}

export default function InteractiveMap({
  onSelectProjectDetail,
  onBookSiteVisit,
  standalone = false,
  highlightProjectId
}: InteractiveMapProps) {
  const [selectedZone, setSelectedZone] = useState<'All' | 'North' | 'East' | 'South-East'>('All');
  const [activeProject, setActiveProject] = useState<MapProject>(
    BANGALORE_PROJECTS.find(p => p.id === Number(highlightProjectId)) || BANGALORE_PROJECTS[0]
  );
  const [viewMode, setViewMode] = useState<'gis' | 'satellite' | 'transit'>('gis');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredProjects = selectedZone === 'All'
    ? BANGALORE_PROJECTS
    : BANGALORE_PROJECTS.filter(p => p.zone === selectedZone);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181C26] via-[#141722] to-[#10121A] border border-white/[0.08] shadow-2xl transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-50 rounded-2xl" : "w-full"
    )}>
      {/* Top Map Control Bar */}
      <div className="p-4 sm:p-6 border-b border-white/[0.08] bg-[#1E222B]/90 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-[0.2em] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-redhill-red animate-ping" />
            <span>Interactive GIS Infrastructure Map</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-redhill-red" />
            Bangalore Strategic Real Estate Matrix
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.08] text-xs font-bold">
            <button
              onClick={() => setViewMode('gis')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'gis'
                  ? "bg-redhill-red text-white shadow-md shadow-redhill-red/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Vector</span>
            </button>
            <button
              onClick={() => setViewMode('satellite')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'satellite'
                  ? "bg-redhill-red text-white shadow-md shadow-redhill-red/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Satellite Tiles</span>
            </button>
            <button
              onClick={() => setViewMode('transit')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'transit'
                  ? "bg-redhill-red text-white shadow-md shadow-redhill-red/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Transit Radar</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 hover:text-white rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Zone Filter Pill Buttons */}
      <div className="px-4 sm:px-6 py-3 bg-black/30 border-b border-white/[0.04] flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Filter Zone:</span>
          {(['All', 'North', 'East', 'South-East'] as const).map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer whitespace-nowrap",
                selectedZone === zone
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-white/[0.03] text-gray-400 border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
              )}
            >
              {zone === 'All' ? 'All Bangalore Corridor' : `${zone} Sector`}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400 font-mono hidden md:flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-redhill-red animate-pulse" />
            <span>Redhill Development</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Key Transit Node</span>
          </span>
        </div>
      </div>

      {/* Main Map Interactive Canvas Area */}
      <div className="relative h-[480px] sm:h-[560px] w-full overflow-hidden select-none bg-[#0E1118]">
        {/* VIEW MODE 1: GIS VECTOR MAP */}
        {viewMode === 'gis' && (
          <div 
            className="absolute inset-0 transition-transform duration-500 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Custom SVG Vector Cartography */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* Glow Filters */}
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Radial Gradients */}
                <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E31E24" stopOpacity="0.08" />
                  <stop offset="60%" stopColor="#1E222B" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#0E1118" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background ambient mesh */}
              <rect width="100" height="100" fill="#0E1118" />
              <circle cx="50" cy="50" r="45" fill="url(#map-glow)" />

              {/* Grid Lines */}
              <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.2">
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
                  <React.Fragment key={v}>
                    <line x1={v} y1="0" x2={v} y2="100" />
                    <line x1="0" y1={v} x2="100" y2={v} />
                  </React.Fragment>
                ))}
              </g>

              {/* Major Highway Corridors & Arteries */}
              {/* Outer Ring Road (ORR) Loop */}
              <ellipse 
                cx="56" cy="56" rx="26" ry="24" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.25)" 
                strokeWidth="0.8" 
                strokeDasharray="2 1"
              />

              {/* NH 44 Airport Corridor (North-South Arterial) */}
              <path 
                d="M 55,5 L 52,25 L 50,45 L 50,75 L 52,95" 
                fill="none" 
                stroke="rgba(227, 30, 36, 0.4)" 
                strokeWidth="1.2" 
                filter="url(#glow-red)"
              />

              {/* Whitefield & East Tech Corridor (East-West) */}
              <path 
                d="M 50,56 L 65,54 L 75,52 L 88,50" 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.35)" 
                strokeWidth="1.0" 
              />

              {/* Sarjapur Road Arterial */}
              <path 
                d="M 56,60 L 64,68 L 72,74 L 85,82" 
                fill="none" 
                stroke="rgba(168, 85, 247, 0.35)" 
                strokeWidth="1.0" 
              />

              {/* Metro Purple Line Corridor */}
              <path 
                d="M 25,56 L 50,56 L 75,52" 
                fill="none" 
                stroke="rgba(16, 185, 129, 0.4)" 
                strokeWidth="0.6" 
                strokeDasharray="1 1"
              />

              {/* Active Project Radar Target Lines */}
              {activeProject && (
                <g>
                  <line 
                    x1="55" y1="8" 
                    x2={activeProject.coordinates.x} 
                    y2={activeProject.coordinates.y} 
                    stroke="rgba(245, 158, 11, 0.3)" 
                    strokeWidth="0.4" 
                    strokeDasharray="1.5 1.5"
                  />
                  <line 
                    x1="50" y1="56" 
                    x2={activeProject.coordinates.x} 
                    y2={activeProject.coordinates.y} 
                    stroke="rgba(255, 255, 255, 0.2)" 
                    strokeWidth="0.4" 
                    strokeDasharray="1.5 1.5"
                  />
                </g>
              )}
            </svg>

            {/* Render Public Landmarks */}
            {LANDMARKS.map((lm, i) => (
              <div 
                key={i} 
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none group z-10"
                style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shadow-lg">
                  <lm.icon className={cn("w-3 h-3", lm.color)} />
                </div>
                <span className="text-[9px] font-bold text-gray-400 bg-black/70 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap shadow-sm backdrop-blur-xs">
                  {lm.name}
                </span>
              </div>
            ))}

            {/* Render Interactive Redhill Project Pins */}
            {filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProject(p)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ left: `${p.coordinates.x}%`, top: `${p.coordinates.y}%` }}
                >
                  {/* Pulsing Outer Rings when selected */}
                  {isSelected && (
                    <>
                      <div className="absolute -inset-3 rounded-full bg-redhill-red/30 animate-ping" />
                      <div className="absolute -inset-6 rounded-full bg-amber-500/15 animate-pulse" />
                    </>
                  )}

                  {/* Main Pin Shield */}
                  <div className={cn(
                    "relative flex items-center gap-2 p-1.5 rounded-2xl transition-all duration-300 shadow-2xl",
                    isSelected
                      ? "bg-gradient-to-r from-redhill-red via-red-600 to-amber-600 text-white scale-110 border-2 border-amber-300 shadow-redhill-red/50"
                      : "bg-[#1E222B]/95 text-gray-200 border border-white/20 hover:border-amber-400/80 hover:scale-105"
                  )}>
                    <div className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shadow-md",
                      isSelected ? "bg-black/40 text-amber-300" : "bg-redhill-red/20 text-redhill-red"
                    )}>
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div className="pr-2 text-left">
                      <p className="text-[11px] font-extrabold leading-tight whitespace-nowrap font-serif">{p.name}</p>
                      <p className="text-[9px] opacity-80 leading-none">{p.location.split(',')[0]} • {p.completion}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: SATELLITE TILES / INTERACTIVE GOOGLE MAP */}
        {viewMode === 'satellite' && (
          <div className="absolute inset-0 w-full h-full bg-[#13161F]">
            <iframe
              title="Bangalore Real Estate Satellite View"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124419.04938634839!2d77.580643!3d12.971598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e1!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`}
              className="w-full h-full border-0 filter invert-[0.88] hue-rotate-[185deg] contrast-[1.1] saturate-[0.8] brightness-[0.9]"
              loading="lazy"
            />
            {/* Overlay Notice */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-amber-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Satellite Cartography Layer (Pan & Zoom Supported)</span>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: TRANSIT & PROXIMITY RADAR MATRIX */}
        {viewMode === 'transit' && (
          <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#181C26] to-[#12141C] flex flex-col justify-center">
            <div className="max-w-4xl mx-auto w-full space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-lg font-bold text-white font-serif">Transit & Commute Radar Analysis</h4>
                <p className="text-xs text-gray-400">Direct travel metrics between Redhill developments and key transport / economic hubs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BANGALORE_PROJECTS.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setActiveProject(p);
                      setViewMode('gis');
                    }}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer",
                      activeProject?.id === p.id
                        ? "bg-redhill-red/10 border-redhill-red shadow-lg shadow-redhill-red/20"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{p.zone} Sector</span>
                        <h5 className="text-sm font-bold text-white">{p.name}</h5>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {p.completion}% Done
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Plane className="w-3 h-3 text-amber-400" /> Airport:</span>
                        <p className="font-bold text-white mt-0.5">{p.proximity.airport}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Train className="w-3 h-3 text-emerald-400" /> Metro:</span>
                        <p className="font-bold text-white mt-0.5">{p.proximity.metro}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3 text-blue-400" /> Tech Hub:</span>
                        <p className="font-bold text-white mt-0.5">{p.proximity.techPark}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Navigation className="w-3 h-3 text-purple-400" /> CBD:</span>
                        <p className="font-bold text-white mt-0.5">{p.proximity.cbd}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Dynamic Project Card (When GIS view active) */}
        {viewMode === 'gis' && activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] bg-[#1E222B]/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-30"
          >
            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                <img
                  src={activeProject.image}
                  alt={activeProject.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-amber-300">
                  {activeProject.completion}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {activeProject.zone} Corridor
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{activeProject.value}</span>
                </div>
                <h4 className="text-base font-bold text-white font-serif truncate mt-1">{activeProject.name}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-redhill-red shrink-0" />
                  <span className="truncate">{activeProject.location}</span>
                </p>
              </div>
            </div>

            {/* Quick Proximity Transit Chips */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-gray-300">
              <div className="flex items-center gap-1.5 truncate">
                <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{activeProject.proximity.airport}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{activeProject.proximity.metro}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activeProject.coordinates.lat},${activeProject.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white/[0.06] hover:bg-white/[0.12] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all border border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>Directions</span>
              </a>

              <button
                onClick={() => {
                  if (onBookSiteVisit) onBookSiteVisit(activeProject);
                }}
                className="bg-gradient-to-r from-redhill-red to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-redhill-red/25 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Book Site Visit</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Zoom & Reset Floating Controls (Top Right of Canvas) */}
        {viewMode === 'gis' && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#1E222B]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/[0.1] shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Map Footer Bar with Infrastructure Highlights */}
      <div className="p-4 sm:p-5 bg-[#181C26] border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">Aerotropolis North</p>
            <p className="text-[10px] text-gray-400">10-20 min to BLR Airport</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">Metro Namma Link</p>
            <p className="text-[10px] text-gray-400">Phase 2 & Purple Line</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">IT Corridor East</p>
            <p className="text-[10px] text-gray-400">ITPL, ORR & EPIP Zone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">RERA & Land Titles</p>
            <p className="text-[10px] text-gray-400">100% Vetted Legal Deeds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
