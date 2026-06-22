// Mirrors CITY_COORDINATES in the backend's services/graph_service.py exactly,
// so the map renders the same city graph the routing engine reasons about.

export const CITY_COORDINATES: Record<string, [number, number]> = {
  delhi: [28.7041, 77.1025],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  noida: [28.5355, 77.391],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  patna: [25.5941, 85.1376],
};

export const KNOWN_CITIES = Object.keys(CITY_COORDINATES).sort();

export function cityLabel(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

export function cityCoords(city: string): [number, number] | null {
  return CITY_COORDINATES[city.trim().toLowerCase()] ?? null;
}

// Default map center: roughly the centroid of the seeded city network (India).
export const MAP_DEFAULT_CENTER: [number, number] = [22.5, 79.0];
export const MAP_DEFAULT_ZOOM = 5;
