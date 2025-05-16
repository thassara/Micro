import { useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

function Map({ center, zoom = 12, markers = [], polylinePath = [], driverLocation }) {
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // Update driver marker position
  useEffect(() => {
    if (!mapRef.current || !driverMarkerRef.current || !driverLocation) return;
    
    driverMarkerRef.current.setPosition(driverLocation);
    
    // Smoothly pan the map to follow the driver
    if (!mapRef.current.get('dragging')) {
      mapRef.current.panTo(driverLocation);
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
          icon={markers.find(m => m.title === 'Driver Location')?.icon}
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