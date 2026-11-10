import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ExternalLink, 
  Compass, 
  Share2, 
  Copy, 
  Check, 
  Search,
  Star,
  Car,
  Plane,
  Building2,
  CheckCircle2,
  Maximize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

export interface MapProject {
  id: number | string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  completion: number;
  value?: string;
  carpetArea?: string;
  image?: string;
  proximityHighlights: { icon: string; label: string }[];
  googleMapsUrl: string;
}

export const BANGALORE_PROJECTS: MapProject[] = [
  {
    id: 1,
    name: 'Redhill Signature Towers',
    location: 'Whitefield, Bangalore',
    address: 'EPIP Zone, Near ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
    lat: 12.9850,
    lng: 77.7315,
    status: 'Under Construction (60%)',
    completion: 60,
    value: '₹450 Cr',
    carpetArea: '2,150 - 3,450 sq.ft. Boutique Residences',
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=85&w=1000',
    proximityHighlights: [
      { icon: 'metro', label: '3 mins to Hopefarm Metro' },
      { icon: 'tech', label: '5 mins to ITPL Tech Park' },
      { icon: 'airport', label: '45 mins to BLR Airport' }
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=ITPL+Whitefield+Bengaluru'
  },
  {
    id: 2,
    name: 'Redhill Emerald Gardens',
    location: 'Sarjapur Road, Bangalore',
    address: 'Sarjapur Main Road, Near Wipro Corporate Campus, Bengaluru, Karnataka 560035',
    lat: 12.9081,
    lng: 77.6872,
    status: 'Sanctions & Foundation (25%)',
    completion: 25,
    value: '₹280 Cr',
    carpetArea: '1,450 - 2,600 sq.ft. Courtyard Apartments',
    image: 'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=1000',
    proximityHighlights: [
      { icon: 'tech', label: '4 mins to Wipro Corporate SEZ' },
      { icon: 'metro', label: '10 mins to Outer Ring Road Metro' },
      { icon: 'school', label: '5 mins to International Schools' }
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sarjapur+Road+Bengaluru'
  },
  {
    id: 3,
    name: 'Redhill Pinnacle Heights',
    location: 'Hebbal / Airport Corridor, Bangalore',
    address: 'Bellary Road, Near Hebbal Flyover & Manyata Tech Park, Bengaluru, Karnataka 560024',
    lat: 13.0358,
    lng: 77.5970,
    status: 'Pre-Launch & Approvals (10%)',
    completion: 10,
    value: '₹620 Cr',
    carpetArea: '2,800 - 4,200 sq.ft. Terrace Apartments',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=85&w=1000',
    proximityHighlights: [
      { icon: 'airport', label: '20 mins to Kempegowda Airport' },
      { icon: 'tech', label: '6 mins to Manyata Tech Park' },
      { icon: 'lake', label: 'Panoramic Hebbal Lake View' }
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hebbal+Flyover+Bengaluru'
  },
  {
    id: 4,
    name: 'Redhill Sovereign Estates',
    location: 'Indiranagar / Domlur Corridor, Bangalore',
    address: '100 Feet Road Corridor, Off Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9719,
    lng: 77.6412,
    status: 'Exclusive Edition (15%)',
    completion: 15,
    value: '₹540 Cr',
    carpetArea: '3,600 - 4,800 sq.ft. Full-Floor Boutique Residences',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1000',
    proximityHighlights: [
      { icon: 'metro', label: '4 mins to Indiranagar Metro' },
      { icon: 'tech', label: '8 mins to Embassy GolfLinks' },
      { icon: 'highway', label: '15 mins to MG Road CBD' }
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Indiranagar+100+Feet+Road+Bengaluru'
  }
];

interface InteractiveMapProps {
  highlightProjectId?: number | string;
  onBookSiteVisit?: (project: MapProject) => void;
  standalone?: boolean;
}

export default function InteractiveMap({
  highlightProjectId,
  onBookSiteVisit,
  standalone = false
}: InteractiveMapProps) {
  const { showToast } = useToast();
  const [selectedProject, setSelectedProject] = useState<MapProject>(
    BANGALORE_PROJECTS.find(p => p.id === Number(highlightProjectId)) || BANGALORE_PROJECTS[0]
  );
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = standard roadmap, 'k' = satellite
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update selected project if highlightProjectId prop changes
  useEffect(() => {
    if (highlightProjectId) {
      const match = BANGALORE_PROJECTS.find(p => p.id === Number(highlightProjectId));
      if (match) setSelectedProject(match);
    }
  }, [highlightProjectId]);

  const filteredProjects = BANGALORE_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${selectedProject.lat}, ${selectedProject.lng}`);
    setCopied(true);
    showToast('GPS Coordinates copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Maps Embed URL dynamically centered on selected project coordinates
  const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedProject.lat},${selectedProject.lng}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-white border border-redhill-line shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full'
    }`}>
      {/* Top Header Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-redhill-line bg-redhill-sand-deep backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-redhill-red/10 border border-redhill-red/20 flex items-center justify-center text-redhill-red">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-redhill-charcoal font-serif flex items-center gap-2">
              <span>Google Maps Location</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 font-sans">
                Live GPS
              </span>
            </h3>
            <p className="text-xs text-redhill-muted">Accurate street view and aerial navigation for Redhill developments</p>
          </div>
        </div>

        {/* Map View & Layer Toggle (Standard Roadmap vs Satellite) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex bg-redhill-ivory p-1 rounded-xl border border-redhill-line text-xs font-bold">
            <button
              onClick={() => setMapType('m')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapType === 'm'
                  ? 'bg-redhill-red text-white shadow-md'
                  : 'text-redhill-muted hover:text-redhill-charcoal'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setMapType('k')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapType === 'k'
                  ? 'bg-redhill-red text-white shadow-md'
                  : 'text-redhill-muted hover:text-redhill-charcoal'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          <a
            href={selectedProject.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-redhill-sand/70 hover:bg-redhill-sand text-redhill-charcoal rounded-xl text-xs font-bold border border-redhill-line transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open in Google Maps App"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Open in Google Maps</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-redhill-sand/70 hover:bg-redhill-sand text-stone-700 hover:text-redhill-charcoal rounded-xl border border-redhill-line transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Project Selector Pills Bar */}
      <div className="px-4 sm:px-6 py-3 bg-redhill-ivory border-b border-redhill-line flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-xs text-redhill-muted font-bold uppercase tracking-wider shrink-0 mr-1">Select Project:</span>
        {BANGALORE_PROJECTS.map(p => {
          const isSelected = selectedProject.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-redhill-red text-white border-redhill-red shadow-lg shadow-redhill-red/25'
                  : 'bg-[#FBF9F5] text-stone-700 border-redhill-line hover:bg-redhill-sand hover:text-redhill-charcoal'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-redhill-charcoal' : 'text-amber-700'}`} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Map Container */}
      <div className="relative h-[480px] sm:h-[540px] w-full bg-[#10121A] overflow-hidden">
        {/* Real Embedded Google Maps View */}
        <iframe
          key={`${selectedProject.id}-${mapType}`}
          title={`Google Maps - ${selectedProject.name}`}
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Google Maps Style Location Card (Left / Bottom Overlay) */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[380px] bg-redhill-sand-deep backdrop-blur-2xl rounded-2xl p-5 border border-redhill-line shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-20">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-redhill-line">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedProject.location.split(',')[0]}
              </span>
              <h4 className="text-base font-bold text-redhill-charcoal font-serif mt-1">{selectedProject.name}</h4>
              <p className="text-xs text-redhill-muted mt-0.5 line-clamp-2">{selectedProject.address}</p>
            </div>
            <button
              onClick={handleCopyCoordinates}
              className="p-2 text-redhill-muted hover:text-redhill-charcoal hover:bg-redhill-sand rounded-lg transition-colors shrink-0"
              title="Copy GPS coordinates"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Key Proximity Highlights */}
          <div className="space-y-1.5 py-3 border-b border-redhill-line">
            {selectedProject.proximityHighlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <a
              href={selectedProject.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-redhill-sand/70 hover:bg-redhill-sand text-redhill-charcoal py-2.5 px-3 rounded-xl text-xs font-bold transition-all border border-redhill-line flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-700" />
              <span>Get Directions</span>
            </a>

            <button
              onClick={() => {
                if (onBookSiteVisit) onBookSiteVisit(selectedProject);
                else {
                  window.open(selectedProject.googleMapsUrl, '_blank');
                }
              }}
              className="bg-redhill-red hover:bg-red-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-redhill-red/25 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Visit Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
