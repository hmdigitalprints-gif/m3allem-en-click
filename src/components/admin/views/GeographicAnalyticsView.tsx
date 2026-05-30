import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Globe, Info, RefreshCw, Layers, Sliders, Search, Plus, X, 
  MapPin, Star, TrendingUp, TrendingDown, Users, ShoppingCart, 
  DollarSign, Activity, Settings, ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the Geographic Metrics
interface CityMetric {
  city: string;
  country: string;
  lat: number;
  lng: number;
  providers: number;
  activeProviders: number;
  orders: number;
  completedJobs: number;
  revenue: number;
  growth: number;
  rating: number;
}

// Leaflet Map Bound Updater component
function MapBoundsUpdater({ 
  cities, 
  selectedCity, 
  targetBounds 
}: { 
  cities: CityMetric[]; 
  selectedCity: CityMetric | null; 
  targetBounds: Array<[number, number]> | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetBounds && targetBounds.length > 0) {
      // 1. Zoom to all markers in a specific country
      const lats = targetBounds.map(pt => pt[0]);
      const lngs = targetBounds.map(pt => pt[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Expand bounds slightly for better zoom layout padding
      const dLat = (maxLat - minLat) * 0.15 || 0.1;
      const dLng = (maxLng - minLng) * 0.15 || 0.1;

      map.fitBounds([
        [minLat - dLat, minLng - dLng],
        [maxLat + dLat, maxLng + dLng]
      ], { padding: [50, 50], animate: true, duration: 1.5 });
    } else if (selectedCity) {
      // 2. Smoothly zoom into the clicked city
      map.setView([selectedCity.lat, selectedCity.lng], 9.5, { animate: true, duration: 1.5 });
    } else if (cities && cities.length > 0) {
      // 3. Auto-fitbounds overlay for all detected database cities on init/new city addition
      const lats = cities.map(c => c.lat);
      const lngs = cities.map(c => c.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const dLat = (maxLat - minLat) * 0.12 || 0.1;
      const dLng = (maxLng - minLng) * 0.12 || 0.1;

      if (cities.length === 1) {
        map.setView([lats[0], lngs[0]], 8, { animate: true, duration: 1.2 });
      } else {
        map.fitBounds([
          [minLat - dLat, minLng - dLng],
          [maxLat + dLat, maxLng + dLng]
        ], { padding: [60, 60], animate: true, duration: 1.2 });
      }
    }
  }, [map, cities, selectedCity, targetBounds]);

  return null;
}

// Zoom Extent Tracker to drive real-time custom clustering dynamically
function MapZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    // Fetch initial zoom
    onZoomChange(map.getZoom());

    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

export default function GeographicAnalyticsView({ onAction }: { onAction?: (msg: string) => void }) {
  const [cities, setCities] = useState<CityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityMetric | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Controls & Configurations
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [targetBounds, setTargetBounds] = useState<Array<[number, number]> | null>(null);

  // New City Input Modal
  const [newCityName, setNewCityName] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [addingError, setAddingError] = useState('');

  // Fetch geographic analytics from backend
  const fetchGeographicData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/geographic-analytics', {
        credentials: 'include' as const
      });
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
        if (onAction) onAction("Real-time geographic analytics loaded successfully.");
      } else {
        console.error("Failed to load map data");
      }
    } catch (err) {
      console.error("Error fetching map data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeographicData();
  }, []);

  // Filter coordinates by live search criteria
  const filteredCities = cities.filter(c => 
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group cities by country
  const countryGroups = cities.reduce((acc: Record<string, CityMetric[]>, c) => {
    if (!acc[c.country]) acc[c.country] = [];
    acc[c.country].push(c);
    return acc;
  }, {});

  // Cluster algorithm (Euclidean space degree partitioning driven by current map zoom level)
  const getClusteredEntities = () => {
    // Zoom >= 7 renders high fidelity city details -> no clustering needed
    if (currentZoom >= 7) {
      return filteredCities.map(c => ({ isCluster: false, city: c }));
    }

    const clusters: any[] = [];
    const processedCities = new Set<string>();

    // Dynamic clustering boundaries
    const distanceThreshold = currentZoom <= 2 ? 6.5 : (currentZoom <= 4 ? 4.0 : 2.0);

    for (let i = 0; i < filteredCities.length; i++) {
      const c1 = filteredCities[i];
      if (processedCities.has(c1.city)) continue;

      const group = [c1];
      processedCities.add(c1.city);

      for (let j = i + 1; j < filteredCities.length; j++) {
        const c2 = filteredCities[j];
        if (processedCities.has(c2.city)) continue;

        const distance = Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
        if (distance < distanceThreshold) {
          group.push(c2);
          processedCities.add(c2.city);
        }
      }

      if (group.length > 1) {
        const avgLat = group.reduce((sum, c) => sum + c.lat, 0) / group.length;
        const avgLng = group.reduce((sum, c) => sum + c.lng, 0) / group.length;

        clusters.push({
          isCluster: true,
          id: `cluster-${group[0].city}`,
          lat: avgLat,
          lng: avgLng,
          cities: group,
          count: group.length,
          totalProviders: group.reduce((sum, c) => sum + c.providers, 0),
          totalOrders: group.reduce((sum, c) => sum + c.orders, 0),
          totalRevenue: group.reduce((sum, c) => sum + c.revenue, 0)
        });
      } else {
        clusters.push({
          isCluster: false,
          city: c1
        });
      }
    }

    return clusters;
  };

  // Add a new city triggered from our glassmorphic sidebar
  const handleAddNewCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    setIsAddingCity(true);
    setAddingError('');

    try {
      const response = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCityName.trim() }),
        credentials: 'include' as const
      });

      if (response.ok) {
        const newCity = await response.json();
        setNewCityName('');
        if (onAction) onAction(`City "${newCity.name}" registered in database successfully!`);
        
        // Trigger auto bounds re-fit on fetch complete
        setSelectedCity(null);
        setSelectedCountry(null);
        setTargetBounds(null);

        await fetchGeographicData();
      } else {
        const errData = await response.json();
        setAddingError(errData.error || "Failed to register city");
      }
    } catch (err) {
      setAddingError("Network error registration failed");
    } finally {
      setIsAddingCity(false);
    }
  };

  // Click handler for city
  const handleCitySelect = (city: CityMetric) => {
    setSelectedCountry(null);
    setTargetBounds(null);
    setSelectedCity(city);
  };

  // Click handler for country grouping (zooms out / bounds-fit)
  const handleCountrySelect = (countryName: string, cityMetrics: CityMetric[]) => {
    setSelectedCity(null);
    setSelectedCountry(countryName);
    
    // Fit map view coordinates dynamically
    const coords: Array<[number, number]> = cityMetrics.map(c => [c.lat, c.lng]);
    setTargetBounds(coords);
  };

  // Reset all map viewing states to global views
  const handleResetMapBounds = () => {
    setSelectedCity(null);
    setSelectedCountry(null);
    setTargetBounds(null);
  };

  // Format currencies nicely
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);
  };

  // Aggregated totals across all cities
  const totalGlobalProviders = cities.reduce((sum, c) => sum + c.providers, 0);
  const totalGlobalActive = cities.reduce((sum, c) => sum + c.activeProviders, 0);
  const totalGlobalOrders = cities.reduce((sum, c) => sum + c.orders, 0);
  const totalGlobalRevenue = cities.reduce((sum, c) => sum + c.revenue, 0);

  // Custom JSX Markers
  const activeClusterMarkers = getClusteredEntities();

  return (
    <div className="space-y-6 pt-4 pb-20 text-white font-sans">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Globe className="text-[#FFD700] animate-spin-slow w-8 h-8" />
            Interactive Geographic Analytics Map
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Real-time clustering & live activity heatmap indices across database registers.
          </p>
        </div>

        {/* Floating Toolbar Toggles */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <button 
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showHeatmap 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                : 'bg-slate-900/60 border-white/10 hover:border-white/25 text-slate-300'
            }`}
          >
            <Activity className={`w-4 h-4 ${showHeatmap ? 'animate-pulse' : ''}`} />
            {showHeatmap ? "Hide Heatmap Layer" : "Show Heatmap"}
          </button>

          <button 
            type="button"
            onClick={fetchGeographicData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 transition-all text-slate-300 hover:text-white cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Row: Map Left, Details & Groups Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Stunning Map Container with Dark Theme & Gloss Overlays */}
        <div className="lg:col-span-2 h-[650px] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-slate-950">
          
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-[#FFD700] animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Fetching latest metrics...</p>
            </div>
          )}

          {/* Leaflet map object */}
          <MapContainer 
            center={[31.7917, -7.0926]} 
            zoom={5} 
            maxZoom={12}
            minZoom={3}
            zoomControl={false} 
            style={{ height: '100%', width: '100%', background: '#090d16' }}
            className="z-0"
          >
            {/* Dark Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Live Glow Ring and Density Circle overlapping overlay (Heatmap effects) */}
            {showHeatmap && cities.map(city => {
              const radius = Math.min(22000, 5000 + (city.orders * 150));
              const intensity = Math.min(0.7, city.orders / 140);
              
              return (
                <Circle
                  key={`heat-${city.city}`}
                  center={[city.lat, city.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: '#ef4444',
                    fillOpacity: Math.max(0.12, intensity),
                    stroke: false,
                    interactive: false
                  }}
                />
              );
            })}

            {/* Custom Interactive Markers & Clusters */}
            {activeClusterMarkers.map((item, idx) => {
              if (item.isCluster) {
                const cluster = item;
                const icon = L.divIcon({
                  className: 'custom-interactive-cluster-marker',
                  html: `
                    <div class="relative flex items-center justify-center cursor-pointer">
                      <span class="absolute inline-flex h-14 w-14 rounded-full bg-amber-500 opacity-20 duration-1000 animate-pulse"></span>
                      <div class="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-950/90 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all transform hover:scale-115">
                        <span class="text-xs font-black text-amber-400">${cluster.count}</span>
                        <span class="text-[7px] font-extrabold text-amber-500/80 uppercase">CITIES</span>
                      </div>
                    </div>
                  `,
                  iconSize: [50, 50],
                  iconAnchor: [25, 25]
                });

                return (
                  <Marker
                    key={`cluster-${cluster.id}-${idx}`}
                    position={[cluster.lat, cluster.lng]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        // Zoom fit bounds on selected cluster
                        const coords: Array<[number, number]> = cluster.cities.map((c: any) => [c.lat, c.lng]);
                        setTargetBounds(coords);
                        if (onAction) onAction(`Zoomed into a cluster containing ${cluster.count} cities`);
                      }
                    }}
                  />
                );
              } else {
                const city = item.city;
                const isSelected = selectedCity?.city === city.city;
                
                const pingClass = isSelected ? "bg-[#FFD700] opacity-40 h-12 w-12" : "bg-emerald-400 opacity-20 h-10 w-10";
                const borderAccent = isSelected ? "border-[#FFD700] shadow-[#FFD700]/30 scale-125 z-20" : "border-emerald-500 shadow-emerald-500/20";
                const bgAccent = isSelected ? "bg-[#FFD700]" : "bg-emerald-500";
                const textAccent = isSelected ? "text-black" : "text-white";

                const icon = L.divIcon({
                  className: 'custom-interactive-city-marker',
                  html: `
                    <div class="relative flex items-center justify-center cursor-pointer">
                      <!-- Ping Ring -->
                      <span class="absolute inline-flex rounded-full animate-ping ${pingClass}"></span>
                      
                      <!-- Circular Marker -->
                      <div class="w-8 h-8 rounded-full border-2 ${borderAccent} ${bgAccent} shadow-xl flex items-center justify-center transition-all transform hover:scale-125">
                        <span class="text-[10px] font-black ${textAccent}">${city.providers}</span>
                      </div>
                      
                      <!-- Floating Label Title -->
                      <div class="absolute top-9 bg-slate-950/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded shadow-lg text-[8px] font-black tracking-wider uppercase whitespace-nowrap z-30">
                        ${city.city}
                      </div>
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                });

                return (
                  <Marker
                    key={`city-${city.city}`}
                    position={[city.lat, city.lng]}
                    icon={icon}
                    eventHandlers={{
                      click: () => handleCitySelect(city)
                    }}
                  />
                );
              }
            })}

            {/* Handlers to update zoom level state and bounds seamlessly */}
            <MapBoundsUpdater 
              cities={filteredCities} 
              selectedCity={selectedCity} 
              targetBounds={targetBounds} 
            />
            <MapZoomTracker onZoomChange={setCurrentZoom} />
          </MapContainer>

          {/* Map Overlay: Floating Lens Controls Dashboard (Glassmorphic) */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl max-w-xs space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Map View Lens
              </span>
              {(selectedCity || selectedCountry || targetBounds) && (
                <button 
                  type="button"
                  onClick={handleResetMapBounds}
                  className="text-[10px] bg-white/10 hover:bg-[#FFD700] hover:text-black hover:font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  Fit All Bounds
                </button>
              )}
            </div>

            <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
              <div className="flex justify-between">
                <span>Zoom Level:</span>
                <span className="text-[#FFD700] font-bold">{currentZoom}</span>
              </div>
              <div className="flex justify-between">
                <span>Heatmap Radius:</span>
                <span className="text-rose-400 font-bold">{showHeatmap ? "Dynamic Multi-Core" : "Inactive"}</span>
              </div>
              <div className="flex justify-between">
                <span>Total DB Cities:</span>
                <span className="text-white font-bold">{cities.length}</span>
              </div>
            </div>
          </div>

          {/* Static Glass Backdrop Info Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-950/85 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 truncate flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#FFD700]" />
              {selectedCity 
                ? `Currently showing focus details for ${selectedCity.city}, ${selectedCity.country}` 
                : selectedCountry 
                  ? `Viewport filtered into country aggregates: ${selectedCountry}`
                  : `Fit bounds containing all ${cities.length} detected database entities.`}
            </span>
            <div className="flex items-center gap-2 font-black shrink-0 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sandbox Sync
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Control Panel + Data aggregation */}
        <div className="space-y-6">

          {/* Search bar inside Glass Panel */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-3xl relative overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search systems by city/country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-[#FFD700] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none font-medium placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          {/* Aggregated Panels Display using Framer Motion */}
          <AnimatePresence mode="wait">
            
            {/* Case 1: Specific City Select Statistics */}
            {selectedCity ? (
              <motion.div
                key={`city-panel-${selectedCity.city}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/70 backdrop-blur-md border border-[#FFD700]/30 rounded-3xl p-6 relative overflow-hidden shadow-xl"
              >
                {/* Gold Highlight banner */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-amber-500" />
                <button 
                  type="button"
                  onClick={() => setSelectedCity(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* City Heading */}
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">City focus panel</span>
                <h3 className="text-2xl font-black text-slate-100 mt-1">{selectedCity.city}</h3>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  {selectedCity.country}
                </p>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  
                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Service Providers</span>
                    <span className="text-base font-black text-white mt-1 block flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      {selectedCity.providers}
                    </span>
                    <span className="text-[9px] text-[#FFD700] font-semibold mt-0.5 block">{selectedCity.activeProviders} Active Providers</span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                    <span className="text-base font-black text-white mt-1 block flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      {selectedCity.orders}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">{selectedCity.completedJobs} Completed Jobs</span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5 col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Revenue</span>
                    <span className="text-xl font-black text-[#FFD700] mt-1 block flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-[#FFD700] shrink-0" />
                      {formatCurrency(selectedCity.revenue)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rating Average</span>
                    <span className="text-base font-black text-white mt-1 block flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {selectedCity.rating.toFixed(1)} / 5.0
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Growth Index</span>
                    <span className="text-base font-black text-emerald-400 mt-1 block flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      +{selectedCity.growth}%
                    </span>
                  </div>

                </div>

                {/* Analytical summary */}
                <div className="mt-6 bg-slate-950/90 rounded-2xl p-4 border border-white/5 space-y-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                    Demand Density Report
                  </div>
                  <p>
                    {selectedCity.city} is registering positive growth of <span className="text-emerald-400 font-bold">+{selectedCity.growth}%</span>. 
                    With over <span className="text-white font-semibold">{selectedCity.providers} service providers</span> answering demand, 
                    the booking conversion is currently sitting robustly at <span className="text-amber-400 font-bold">{((selectedCity.completedJobs / selectedCity.orders) * 100 || 80).toFixed(0)}%</span>.
                  </p>
                </div>

                {/* Action button */}
                <button 
                  type="button"
                  onClick={() => onAction && onAction(`Navigated to provider matching view for ${selectedCity.city}`)}
                  className="w-full bg-[#FFD700] text-black font-black py-3 rounded-2xl text-xs hover:opacity-90 active:scale-95 transition-all mt-5 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFD700]/15"
                >
                  Manage Providers in {selectedCity.city}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : selectedCountry ? (
              
              /* Case 2: Grouped Country Select Statistics */
              <motion.div
                key={`country-panel-${selectedCountry}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/70 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                <button 
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Country Aggregated View</span>
                <h3 className="text-2xl font-black text-slate-100 mt-1 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-emerald-500" />
                  {selectedCountry}
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  
                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Providers</span>
                    <span className="text-base font-black text-white mt-1 block flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      {countryGroups[selectedCountry]?.reduce((sum, c) => sum + c.providers, 0)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
                    <span className="text-base font-black text-white mt-1 block flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                      {countryGroups[selectedCountry]?.reduce((sum, c) => sum + c.orders, 0)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5 col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Combined Gross Revenue</span>
                    <span className="text-xl font-black text-[#FFD700] mt-1 block flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-[#FFD700] shrink-0" />
                      {formatCurrency(countryGroups[selectedCountry]?.reduce((sum, c) => sum + c.revenue, 0) || 0)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Cities</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {countryGroups[selectedCountry]?.length} Active
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Growth</span>
                    <span className="text-base font-black text-emerald-400 mt-1 block flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{(countryGroups[selectedCountry]?.reduce((sum, c) => sum + c.growth, 0) / (countryGroups[selectedCountry]?.length || 1)).toFixed(1)}%
                    </span>
                  </div>

                </div>

                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block ml-0.5">Cities in {selectedCountry}</span>
                  <div className="bg-slate-950/90 rounded-2xl divide-y divide-white/5 max-h-40 overflow-y-auto pr-1 border border-white/5">
                    {countryGroups[selectedCountry]?.map((c) => (
                      <button
                        key={c.city}
                        type="button"
                        onClick={() => handleCitySelect(c)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-900 transition-all text-xs flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold text-slate-200">{c.city}</span>
                        <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
                          <span>{c.providers} artisans</span>
                          <span className="text-emerald-400 font-bold">{c.growth}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              
              /* Case 3: Global System Summaries */
              <motion.div
                key="global-summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Global system analytics</span>
                  <h3 className="text-lg font-black text-slate-100 mt-1">Platform Geography Summary</h3>
                </div>

                {/* Aggregation counts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Global Providers</span>
                    <span className="text-xl font-black text-slate-100 mt-1 block">
                      {totalGlobalProviders}
                    </span>
                    <span className="text-[9px] text-[#FFD700] font-semibold mt-0.5 block">
                      {((totalGlobalActive / (totalGlobalProviders || 1)) * 100).toFixed(0)}% Overall Active
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Global Booking Volume</span>
                    <span className="text-xl font-black text-slate-100 mt-1 block">
                      {totalGlobalOrders}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      {cities.length} dynamic center points
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-white/5 col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Aggregated Gross Volume</span>
                    <span className="text-2xl font-black text-emerald-400 mt-0.5 block flex items-center">
                      <DollarSign className="w-5.5 h-5.5 text-emerald-400 shrink-0" />
                      {formatCurrency(totalGlobalRevenue)}
                    </span>
                  </div>
                </div>

                {/* Country Group Selection triggers */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block ml-0.5">Filter map views by region</span>
                  <div className="bg-slate-950/90 rounded-2xl border border-white/5 divide-y divide-white/5 max-h-[180px] overflow-y-auto pr-1">
                    {Object.keys(countryGroups).map(countryName => {
                      const count = countryGroups[countryName].length;
                      return (
                        <button
                          key={countryName}
                          type="button"
                          onClick={() => handleCountrySelect(countryName, countryGroups[countryName])}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-900 transition-all flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-500" />
                            {countryName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold group-hover:text-amber-400 flex items-center gap-1 transition-all">
                            {count} {count === 1 ? 'City' : 'Cities'}
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline Add City Admin Control Portal */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD700] flex items-center gap-1.5 border-b border-white/10 pb-2.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Dynamic expansion registry
            </h4>

            <form onSubmit={handleAddNewCity} className="space-y-3">
              <div>
                <label htmlFor="cityNameInput" className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Insert City Name
                </label>
                <div className="flex gap-2">
                  <input 
                    id="cityNameInput"
                    type="text"
                    required
                    placeholder="e.g. Oujda, Paris, New York..."
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="flex-1 bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isAddingCity || !newCityName.trim()}
                    className="bg-[#FFD700] hover:bg-[#FFD700]/90 active:scale-95 hover:shadow-lg hover:shadow-[#FFD700]/15 disabled:opacity-50 text-black font-black px-4 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    Add
                  </button>
                </div>
              </div>

              {addingError && (
                <p className="text-[10px] text-rose-400 font-semibold mt-1">
                  ⚠️ {addingError}
                </p>
              )}

              <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
                * Newly added cities resolve coordinates dynamically, auto-extending map limits instantly.
              </p>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
