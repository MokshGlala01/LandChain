export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const MAPBOX_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-v9",
  hybrid: "mapbox://styles/mapbox/satellite-streets-v12",
};

export const DEFAULT_CENTER: [number, number] = [77.2090, 28.6139]; // Default centered on New Delhi, India
export const DEFAULT_ZOOM = 11;

export function isMapboxConfigured(): boolean {
  return typeof MAPBOX_TOKEN === "string" && MAPBOX_TOKEN.trim().length > 0;
}
