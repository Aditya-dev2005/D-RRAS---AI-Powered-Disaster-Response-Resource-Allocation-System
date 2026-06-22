"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CITY_COORDINATES,
  cityCoords,
  cityLabel,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
} from "@/lib/city-coordinates";
import type { RoadBlock, RouteResponse } from "@/lib/types";

const COLOR_OPEN_ROAD = "#2b3442";
const COLOR_BLOCKED_ROAD = "#ff4d5e";
const COLOR_CITY = "#5b9dff";
const COLOR_SOURCE = "#34d399";
const COLOR_DESTINATION = "#ff4d5e";
const COLOR_PATH = "#5b9dff";

function FitToBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(points, { padding: [32, 32], maxZoom: 6 });
  }, [map, points]);
  return null;
}

export default function RouteMap({
  roadBlocks,
  route,
  source,
  destination,
}: {
  roadBlocks: RoadBlock[];
  route: RouteResponse | null;
  source: string;
  destination: string;
}) {
  const knownCities = useMemo(() => {
    const set = new Set<string>();
    for (const r of roadBlocks) {
      if (cityCoords(r.city_from)) set.add(r.city_from.toLowerCase());
      if (cityCoords(r.city_to)) set.add(r.city_to.toLowerCase());
    }
    // Always include every city we have coordinates for, even if not yet
    // connected by a road segment, so the map reflects the full known network.
    Object.keys(CITY_COORDINATES).forEach((c) => set.add(c));
    return Array.from(set);
  }, [roadBlocks]);

  const allPoints = useMemo(
    () => knownCities.map((c) => cityCoords(c)).filter((c): c is [number, number] => c !== null),
    [knownCities]
  );

  const pathPoints = useMemo(() => {
    if (!route) return [];
    return route.path.map((c) => cityCoords(c)).filter((c): c is [number, number] => c !== null);
  }, [route]);

  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <FitToBounds points={allPoints.length > 0 ? allPoints : [MAP_DEFAULT_CENTER]} />

      {/* Road network edges */}
      {roadBlocks.map((r) => {
        const from = cityCoords(r.city_from);
        const to = cityCoords(r.city_to);
        if (!from || !to) return null;
        return (
          <Polyline
            key={r.id}
            positions={[from, to]}
            pathOptions={{
              color: r.is_blocked ? COLOR_BLOCKED_ROAD : COLOR_OPEN_ROAD,
              weight: r.is_blocked ? 2.5 : 1.75,
              dashArray: r.is_blocked ? "6 6" : undefined,
              opacity: r.is_blocked ? 0.85 : 0.55,
            }}
          >
            <Tooltip sticky>
              {cityLabel(r.city_from)} ↔ {cityLabel(r.city_to)} · {r.distance_km} km
              {r.is_blocked ? " · BLOCKED" : ` · traffic ${r.traffic_level}/10`}
            </Tooltip>
          </Polyline>
        );
      })}

      {/* Computed route, drawn on top with the animated dash treatment */}
      {pathPoints.length > 1 && (
        <Polyline
          positions={pathPoints}
          pathOptions={{
            color: COLOR_PATH,
            weight: 5,
            opacity: 0.95,
            className: "route-line-animated",
          }}
        />
      )}

      {/* City markers */}
      {knownCities.map((city) => {
        const coords = cityCoords(city);
        if (!coords) return null;
        const isSource = city === source.toLowerCase();
        const isDestination = city === destination.toLowerCase();
        const color = isSource ? COLOR_SOURCE : isDestination ? COLOR_DESTINATION : COLOR_CITY;

        return (
          <CircleMarker
            key={city}
            center={coords}
            radius={isSource || isDestination ? 8 : 5}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: isSource || isDestination ? 2 : 1,
            }}
          >
            <Tooltip permanent={isSource || isDestination} direction="top" offset={[0, -8]}>
              {cityLabel(city)}
              {isSource && " (source)"}
              {isDestination && " (destination)"}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
