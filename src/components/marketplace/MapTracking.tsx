import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../../services/socket';
import { X, MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for artisan
const artisanIcon = L.divIcon({
  className: 'custom-artisan-icon',
  html: `<div class="w-10 h-10 bg-[var(--accent)] rounded-full border-4 border-[var(--bg)] shadow-lg flex items-center justify-center text-[var(--accent-foreground)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords);
  }, [coords, map]);
  return null;
}

interface MapTrackingProps {
  artisanId: string;
  artisanName: string;
  clientLocation: [number, number];
  onClose: () => void;
}

export default function MapTracking({ artisanId, artisanName, clientLocation, onClose }: MapTrackingProps) {
  const [artisanLocation, setArtisanLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Listen for location updates
    const eventName = `location_${artisanId}`;
    socket.on(eventName, (data: { lat: number, lng: number }) => {
      if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') return;
      setArtisanLocation([data.lat, data.lng]);
    });

    return () => {
      socket.off(eventName);
    };
  }, [artisanId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg)]/60 backdrop-blur-sm">
      <div className="bg-[var(--card-bg)] w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl border border-[var(--border)] flex flex-col h-[80vh]">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
              <Navigation className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text)]">Tracking {artisanName}</h3>
              <p className="text-sm text-[var(--text-muted)]">Real-time location updates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--text)]/5 rounded-full transition-colors text-[var(--text)]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer 
            center={clientLocation} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Client Location */}
            <Marker position={clientLocation}>
              <Popup>Your Location</Popup>
            </Marker>

            {/* Artisan Location */}
            {artisanLocation && (
              <>
                <Marker position={artisanLocation} icon={artisanIcon}>
                  <Popup>{artisanName} is here</Popup>
                </Marker>
                <RecenterMap coords={artisanLocation} />
              </>
            )}
          </MapContainer>

          {!artisanLocation && (
            <div className="absolute inset-0 bg-[var(--bg)]/20 backdrop-blur-[2px] flex items-center justify-center z-[1000]">
              <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-xl border border-[var(--border)] text-center">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-[var(--text)]">Waiting for artisan's location...</p>
                <p className="text-sm text-[var(--text-muted)]">Updates will appear as soon as the artisan starts moving.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[var(--card-bg)] border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full" />
              <span className="text-[var(--text-muted)]">Artisan</span>
              <div className="w-3 h-3 bg-blue-600 rounded-full ml-4" />
              <span className="text-[var(--text-muted)]">You</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic">
              Location updates every few seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
