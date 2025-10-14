import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface TrackingDevice {
  id: string;
  name: string;
  position: [number, number]; // [lng, lat] - MapLibre uses lng, lat order!
  speed: number;
  heading: number;
  lastUpdate: Date;
  status: 'online' | 'offline' | 'idle';
}

export default function TrackerMap(): JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [devices, setDevices] = useState<TrackingDevice[]>([
    {
      id: 'device-1',
      name: 'Vehicle 001',
      position: [123.8854, 10.3157], // [lng, lat] for MapLibre
      speed: 0,
      heading: 0,
      lastUpdate: new Date(),
      status: 'online'
    }
  ]);
  
  const [selectedDevice, setSelectedDevice] = useState<string | null>('device-1');
  const [isTracking, _setIsTracking] = useState<boolean>(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAP_TILE_API_KEY}`,
      center: [123.8854, 10.3157], // [lng, lat]
      zoom: 16
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Wait for map to load before adding sources
    map.on('load', () => {
      // Add source for tracking trail
      map.addSource('trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add trail layer
      map.addLayer({
        id: 'trail-line',
        type: 'line',
        source: 'trail',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      // Mark map as loaded so markers can be added
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Create custom marker element
  // const createMarkerElement = (device: TrackingDevice): HTMLDivElement => {
  //   const el = document.createElement('div');
  //   el.style.width = '40px';
  //   el.style.height = '40px';
  //   el.style.cursor = 'pointer';
    
  //   const color = device.status === 'online' ? '#22c55e' : 
  //                 device.status === 'offline' ? '#ef4444' : '#f59e0b';
    
  //   el.innerHTML = `
  //     <div style="
  //       position: relative;
  //       width: 100%;
  //       height: 100%;
  //     ">
  //       <div style="
  //         background-color: ${color};
  //         width: 32px;
  //         height: 32px;
  //         border-radius: 50%;
  //         border: 3px solid white;
  //         box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  //         display: flex;
  //         align-items: center;
  //         justify-content: center;
  //         position: absolute;
  //         top: 0;
  //         left: 4px;
  //       ">
  //         <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
  //           <path d="M8 0l-2 6h-6l5 4-2 6 5-4 5 4-2-6 5-4h-6z"/>
  //         </svg>
  //       </div>
  //       <div style="
  //         position: absolute;
  //         top: 36px;
  //         left: 50%;
  //         transform: translateX(-50%);
  //         background: rgba(0,0,0,0.8);
  //         color: white;
  //         padding: 2px 6px;
  //         border-radius: 4px;
  //         font-size: 10px;
  //         white-space: nowrap;
  //         font-weight: bold;
  //       ">${device.name}</div>
  //     </div>
  //   `;
    
  //   return el;
  // };

  // Update markers on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    console.log('Adding markers, map loaded:', mapLoaded);
    console.log('Devices:', devices);

    devices.forEach((device) => {
      console.log('Processing device:', device.id, 'at position:', device.position);
      let marker = markersRef.current.get(device.id);
      
      if (!marker) {
        console.log('Creating new marker at:', device.position);
        // Create marker exactly like MapLibre examples
        marker = new maplibregl.Marker()
          .setLngLat(device.position)
          .addTo(mapRef.current!);

        // Create popup
        const popup = new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div style="min-width: 200px; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${device.name}</h3>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Status:</strong> 
                <span style="color: ${
                  device.status === 'online' ? '#22c55e' : 
                  device.status === 'offline' ? '#ef4444' : '#f59e0b'
                }">${device.status.toUpperCase()}</span>
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Speed:</strong> ${device.speed.toFixed(1)} km/h
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Heading:</strong> ${device.heading}°
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                ${device.lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          `);

        marker.setPopup(popup);
        
        marker.getElement().addEventListener('click', () => {
          setSelectedDevice(device.id);
        });
        
        markersRef.current.set(device.id, marker);
      } else {
        console.log('Updating marker position to:', device.position);
        marker.setLngLat(device.position);
      }
    });

    // Auto-center on selected device
    if (selectedDevice) {
      const device = devices.find(d => d.id === selectedDevice);
      if (device && mapRef.current) {
        mapRef.current.easeTo({
          center: device.position,
          duration: 1000
        });
      }
    }
  }, [devices, selectedDevice, mapLoaded]);

  // Simulate real-time GPS updates
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setDevices(prevDevices => {
        return prevDevices.map(device => {
          const lngChange = (Math.random() - 0.5) * 0.002;
          const latChange = (Math.random() - 0.5) * 0.002;
          const newPosition: [number, number] = [
            device.position[0] + lngChange,
            device.position[1] + latChange
          ];
          
          const speedChange = (Math.random() - 0.5) * 10;
          const newSpeed = Math.max(0, Math.min(100, device.speed + speedChange));
          
          const heading = Math.atan2(lngChange, latChange) * (180 / Math.PI);
          
          return {
            ...device,
            position: newPosition,
            speed: newSpeed,
            heading: Math.round((heading + 360) % 360),
            lastUpdate: new Date(),
            status: newSpeed > 5 ? 'online' : newSpeed > 0 ? 'idle' : 'offline'
          };
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking, devices]);

  const focusOnDevice = (deviceId: string): void => {
    const device = devices.find(d => d.id === deviceId);
    if (device && mapRef.current) {
      mapRef.current.flyTo({
        center: device.position,
        zoom: 17,
        duration: 2000
      });
      setSelectedDevice(deviceId);
      
      const marker = markersRef.current.get(deviceId);
      marker?.togglePopup();
    }
  };

  if(process.env.NODE_ENV !== 'development') {
    return (
      <div className="max-w-2xl w-full text-center p-10 rounded-2xl bg-white/3 backdrop-blur-md shadow-lg">
        <img src="/logo192.png" alt="" className="mx-auto w-14 h-14 mb-4" />
        <h1 className="text-3xl font-semibold">We’re launching soon</h1>
        <p className="text-slate-300 mt-2">The page is under maintenance. We’ll be back shortly.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">
              Devices ({devices.length})
            </h2>
            
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => focusOnDevice(device.id)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedDevice === device.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{device.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : device.status === 'offline'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Speed: {device.speed.toFixed(1)} km/h</p>
                    <p>Heading: {device.heading}°</p>
                    <p>Updated: {device.lastUpdate.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}