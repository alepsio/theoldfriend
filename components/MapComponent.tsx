'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  shopName: string;
}

const MapComponent = ({ latitude, longitude, shopName }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inizializza la mappa
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false, // Disabilita lo zoom con la rotella del mouse
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: true,
    }).setView([latitude, longitude], 15);

    // Aggiungi tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: #d4a574;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 20px;
            font-weight: bold;
          ">✂</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Aggiungi marker
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    // Popup
    marker.bindPopup(`
      <div style="text-align: center; font-family: 'Playfair Display', serif;">
        <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">${shopName}</h3>
        <p style="margin: 0; color: #6b5d4f;">La tua barberia di fiducia</p>
      </div>
    `).openPopup();

    // Animazione del marker
    let scale = 1;
    let growing = true;
    setInterval(() => {
      if (growing) {
        scale += 0.02;
        if (scale >= 1.2) growing = false;
      } else {
        scale -= 0.02;
        if (scale <= 1) growing = true;
      }
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.style.transform = `scale(${scale})`;
      }
    }, 50);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, shopName]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;