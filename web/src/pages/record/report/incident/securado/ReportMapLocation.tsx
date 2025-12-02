import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import TrackerIcon from "@/assets/images/tracker_icon.svg";
import UserIcon from "@/assets/images/user_icon.svg";

export default function ReportMapLocation({
  IRInfo,
  selectedReport,
}: {
  IRInfo: Record<string, any>;
  selectedReport: string;
}): JSX.Element {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Preload images before creating markers
    const trackerImg = new Image();
    const userImg = new Image();
    let imagesLoaded = 0;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        initializeMap();
      }
    };

    trackerImg.onload = onImageLoad;
    userImg.onload = onImageLoad;
    trackerImg.src = TrackerIcon;
    userImg.src = UserIcon;

    function initializeMap() {
      if (!mapContainerRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://tiles.openfreemap.org/styles/liberty`,
        center: [123.90608103742457, 10.293906040416475],
        zoom: 17,
      });

      const size = 400;

      const createMarker = (img: HTMLImageElement, color: string, radiusMultiplier: number) => {
        return {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),
          context: null as CanvasRenderingContext2D | null,

          onAdd() {
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext("2d");
          },

          render() {
            if (!this.context) return false;

            const duration = 1000;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * radiusMultiplier * t + radius;
            const context = this.context;

            context.clearRect(0, 0, this.width, this.height);

            // Draw pulsing outer circle
            context.beginPath();
            context.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
            );
            context.fillStyle = `rgb(${color}, ${1 - t})`;
            context.fill();

            // Draw SVG icon (image is already loaded)
            const iconSize = radius * 1.5;
            const x = this.width / 2 - iconSize / 2;
            const y = this.height / 2 - iconSize / 2;

            context.drawImage(img, x, y, iconSize, iconSize + 15);

            this.data = context.getImageData(
              0,
              0,
              this.width,
              this.height
            ).data as any;

            map.triggerRepaint();

            return true;
          },
        };
      };

      const deviceMarker = createMarker(trackerImg, '255, 100, 100', 0.4);
      const userMarker = createMarker(userImg, '59, 130, 246', 0.1);

      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");

      map.on("load", () => {
        map.setProjection({
          type: "globe",
        });

        map.addSource("device", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addSource("user", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addImage("device-marker", deviceMarker, { pixelRatio: 2 });
        map.addImage("user-marker", userMarker, { pixelRatio: 2 });

        map.addLayer({
          id: "device-point",
          type: "symbol",
          source: "device",
          layout: {
            "icon-image": "device-marker",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });

        map.addLayer({
          id: "user-point",
          type: "symbol",
          source: "user",
          layout: {
            "icon-image": "user-marker",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedReport || !IRInfo) return;

    if (!map.isStyleLoaded()) {
      map.once("load", updateMap);
    } else {
      updateMap();
    }

    // Show points of selected report
    function updateMap() {
      if (!map || !IRInfo) return;
      const deviceSource = map.getSource("device") as maplibregl.GeoJSONSource;
      const userSource = map.getSource("user") as maplibregl.GeoJSONSource;

      if (!deviceSource || !userSource) return;

      deviceSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [IRInfo.ir_track_lng, IRInfo.ir_track_lat],
        },
      });

      userSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [IRInfo.ir_track_user_lng, IRInfo.ir_track_user_lat],
        },
      });
    }

    // Move camera to device location
    map.flyTo({
      center: [IRInfo.ir_track_lng, IRInfo.ir_track_lat],
      speed: 0.5,
      zoom: 17,
      pitch: 45,
    });
  }, [selectedReport, IRInfo]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
    />
  );
}