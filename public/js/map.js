document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  // Default coordinates if geometry missing
  let mapCenter = [28.6139, 77.2090]; // [lat, lng]
  let zoomLevel = 12;

  // Use listing.geometry if it exists
  if (listing.geometry && listing.geometry.coordinates) {
    const [lng, lat] = listing.geometry.coordinates; // GeoJSON order
    mapCenter = [lat, lng]; // Leaflet expects [lat, lng]
  }

  // Initialize map
  const map = L.map("map").setView(mapCenter, zoomLevel);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  if (listing.geometry && listing.geometry.coordinates) {
    const [lng, lat] = listing.geometry.coordinates;
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>${listing.title}</b><br>${listing.location}, ${listing.country}`)
      .openPopup();
  }
});
