import { useCallback, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";

const MAP_STYLE = {
  width: "100%",
  height: "280px",
  borderRadius: "16px",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
    { featureType: "poi.medical", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  ],
};

function MapContainer({ center, zoom, doctors, onMapLoad, highlightedId, onMarkerClick }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const handleLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (onMapLoad) onMapLoad(map);
    },
    [onMapLoad],
  );

  useEffect(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapRef.current;
    if (!map || !doctors.length) return;

    const bounds = new window.google.maps.LatLngBounds();

    doctors.forEach((doctor) => {
      if (!doctor.lat || !doctor.lng) return;

      const isHighlighted = doctor.id === highlightedId;

      const marker = new window.google.maps.Marker({
        position: { lat: doctor.lat, lng: doctor.lng },
        map,
        title: doctor.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isHighlighted ? 12 : 9,
          fillColor: isHighlighted ? "#0ea5e9" : "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:Inter,sans-serif;padding:6px 2px;max-width:220px">
          <p style="font-weight:700;margin:0 0 4px;color:#0f172a;font-size:14px">${doctor.name}</p>
          <p style="margin:0;font-size:12px;color:#64748b">${doctor.specialty}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#0ea5e9;font-weight:600">${doctor.clinic}</p>
        </div>`,
      });

      marker.addListener("click", () => {
        info.open(map, marker);
        if (onMarkerClick) onMarkerClick(doctor.id);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (markersRef.current.length > 1) {
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    }
  }, [doctors, highlightedId, onMarkerClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && center) {
      map.panTo(center);
    }
  }, [center]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)",
        padding: "6px",
      }}
    >
      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={center}
        zoom={zoom}
        onLoad={handleLoad}
        options={MAP_OPTIONS}
      />
    </div>
  );
}

export default MapContainer;
