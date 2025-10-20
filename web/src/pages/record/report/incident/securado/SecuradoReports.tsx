import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useGetIncidentReport, useGetIRInfo } from "../../queries/reportFetch";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";

export default function SecuradoReports(): JSX.Element {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [selectedReport, setSelectedReport] = React.useState<string>("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: activeIRs, isLoading } = useGetIncidentReport(
    currentPage,
    20,
    debouncedSearch,
    false,
    true
  );
  const { data: IRInfo, isLoading: isLoadingIRInfo } =
    useGetIRInfo(selectedReport);

  const data = activeIRs?.results || [];
  const totalCount = activeIRs?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  console.log(IRInfo);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://tiles.openfreemap.org/styles/liberty`,
      center: [123.90608103742457, 10.293906040416475],
      zoom: 17,
    });

    const size = 200;

    const pulsingDot: any = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      onAdd() {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");
      },

      render() {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(255, 200, 200,${1 - t})`;
        context.fill();

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 100, 100, 1)";
        context.strokeStyle = "white";
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;

        map.triggerRepaint();

        return true;
      },
    };

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

    map.on("load", () => {
      map.setProjection({
        type: "globe",
      });

      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "points",
        type: "symbol",
        source: "points",
        layout: {
          "icon-image": "pulsing-dot",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
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
      const pointsSource = map.getSource("points") as maplibregl.GeoJSONSource;
      pointsSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "device" },
            geometry: {
              type: "Point",
              coordinates: [IRInfo.ir_track_lng, IRInfo.ir_track_lat],
            },
          },
          {
            type: "Feature",
            properties: { id: "owner" },
            geometry: {
              type: "Point",
              coordinates: [IRInfo.ir_track_user_lng, IRInfo.ir_track_user_lat],
            },
          },
        ],
      });
    }

    // Move camera to device location
    map.flyTo({
      center: [IRInfo.ir_track_lng, IRInfo.ir_track_lat],
      speed: 0.5,
      zoom: 17,
      pitch: 45
    });
  }, [selectedReport, IRInfo, mapRef]);

  return (
    <div className="w-full h-[85vh] flex justify-start relative gap-6">
      <div className="w-[400px] h-full rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <Label className="text-black">Reports</Label>
        </div>
        <Separator />
        <div className="flex flex-col">
          {data?.map((report: any) => (
            <Button
              variant={"link"}
              className="justify-start"
              onClick={() => setSelectedReport(report.ir_id)}
            >
              {report.ir_track_user_contact}
            </Button>
          ))}
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  );
}
