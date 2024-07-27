'use client'

import React, {useState} from 'react';
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

export const defaultMapContainerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '15px 0px 0px 15px',
};

const defaultMapCenter = {
  lat: 35.655439,
  lng: 139.54368
}

const defaultMapZoom = 18

const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'auto',
  mapTypeId: 'roadmap',  //sateliteなら衛星写真
};

const positionuec = {
  lat: 35.655439,
  lng: 139.54368,
};

const markerLabeluec = {
  color: "white",
  fontFamily: "sans-serif",
  fontSize: "15px",
  fontWeight: "100",
  text: "UEC!!!!",
};

const MapComponent = () => {
  const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        <Marker 
          position={positionuec} 
          // label={markerLabeluec} 
          onClick={() => setSelectedCenter(positionuec)}
        />

        {selectedCenter && (
          <InfoWindow
            onCloseClick={() => setSelectedCenter(null)}
            position={selectedCenter}
          >
            <div>  
              <p>hello there!</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
};

export { MapComponent };