"use client";

import { useCallback, useRef } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const GLOBE_ZOOM_THRESHOLD = 4;

interface BucketPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  displayName: string;
  achieved: boolean;
}

interface Props {
  pins: BucketPin[];
  onPinClick: (pin: BucketPin) => void;
}

function PinMarker({
  pin,
  onClick,
}: {
  pin: BucketPin;
  onClick: (pin: BucketPin) => void;
}) {
  const size = pin.achieved ? 12 : 10;
  const color = pin.achieved ? "#f59e0b" : "#64748b";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(pin);
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "rotate(-45deg) scale(1.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "rotate(-45deg) scale(1)";
      }}
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        cursor: "pointer",
        boxShadow: `0 0 6px ${color}80`,
        transition: "transform 0.15s cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}

export function MapView({ pins, onPinClick }: Props) {
  const mapRef = useRef<MapRef>(null);

  const toggleLabels = useCallback((zoom: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const visibility = zoom < GLOBE_ZOOM_THRESHOLD ? "none" : "visible";
    map.getStyle().layers.forEach((layer) => {
      if (layer.type === "symbol") {
        map.setLayoutProperty(layer.id, "visibility", visibility);
      }
    });
  }, []);

  const handleLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setProjection({ type: "globe" } as any);
    toggleLabels(map.getZoom());
  };

  const handleZoom = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    toggleLabels(map.getZoom());
  }, [toggleLabels]);

  return (
    <Map
      ref={mapRef}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      initialViewState={{ longitude: 126.9, latitude: 37.5, zoom: 2 }}
      onLoad={handleLoad}
      onZoom={handleZoom}
      style={{ width: "100%", height: "100%", filter: "saturate(4.0)" }}
    >
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          latitude={pin.lat}
          longitude={pin.lng}
          anchor="bottom"
        >
          <PinMarker pin={pin} onClick={onPinClick} />
        </Marker>
      ))}
    </Map>
  );
}
