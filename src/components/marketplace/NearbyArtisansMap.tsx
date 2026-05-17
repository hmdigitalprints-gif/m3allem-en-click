import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, User, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const artisanIcon = L.divIcon({
  className: 'custom-artisan-icon',
  html: `<div class="w-10 h-10 bg-[var(--accent)] rounded-full border-4 border-[var(--bg)] shadow-lg flex items-center justify-center text-[var(--accent-foreground)] overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export default function NearbyArtisansMap({ artisans, center = [33.5731, -7.5898] }: { artisans: any[], center?: [number, number] }) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full min-h-[500px] rounded-[32px] overflow-hidden border border-[var(--border)] relative shadow-inner">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {artisans?.filter(a => a.latitude && a.longitude).map((artisan) => (
          <Marker 
            key={artisan.id} 
            position={[Number(artisan.latitude), Number(artisan.longitude)]} 
            icon={artisanIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden border border-[var(--accent)]/20">
                    {artisan.avatar_url ? (
                      <img src={artisan.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User size={18} className="text-[var(--accent)]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight m-0">{artisan.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                       <Star size={10} fill="currentColor" /> {artisan.rating}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{artisan.bio || 'Professional artisan ready to help.'}</p>
                <button 
                  onClick={() => navigate(`/artisan/${artisan.id}`)}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                >
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {artisans?.length === 0 && (
        <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center z-10">
           <div className="bg-[var(--card-bg)] px-6 py-3 rounded-full border border-[var(--border)] shadow-xl animate-pulse">
              <p className="text-sm font-bold text-[var(--text-muted)]">No artisans found in this area</p>
           </div>
        </div>
      )}
    </div>
  );
}
