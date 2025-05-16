import { useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

function Map({ center, zoom, markers, polylinePath, driverLocation }) {
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // Update driver marker position
  useEffect(() => {
    if (!driverLocation || !mapRef.current) return;

    const position = {
      lat: driverLocation.latitude,
      lng: driverLocation.longitude,
    };

    if (driverMarkerRef.current) {
      // Smoothly transition to new position
      const currentPos = driverMarkerRef.current.position;
      if (currentPos) {
        const startLat = currentPos.lat;
        const startLng = currentPos.lng;
        const endLat = position.lat;
        const endLng = position.lng;
        const steps = 10;
        let step = 0;

        const animate = () => {
          if (step >= steps) return;

          const progress = step / steps;
          const interpolatedLat = startLat + (endLat - startLat) * progress;
          const interpolatedLng = startLng + (endLng - startLng) * progress;

          driverMarkerRef.current.position = {
            lat: interpolatedLat,
            lng: interpolatedLng,
          };

          // Update map view if not user-controlled
          if (!mapRef.current.get('dragging')) {
            mapRef.current.panTo({ lat: interpolatedLat, lng: interpolatedLng });
          }

          step++;
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      } else {
        driverMarkerRef.current.position = position;
      }
    }
  }, [driverLocation]);

  return (
    <GoogleMap
      mapContainerStyle={{ height: '500px', width: '100%' }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          title={marker.title}
          icon={marker.icon}
        />
      ))}
      {driverLocation && (
        <Marker
          position={driverLocation}
          title="Driver Location"
          icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          onLoad={(marker) => {
            driverMarkerRef.current = marker;
          }}
        />
      )}
      {polylinePath.length > 0 && (
        <Polyline
          path={polylinePath}
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
          }}
        />
      )}
    </GoogleMap>
  );
}

export default Map;