'use client'

import {GoogleMap} from "@react-google-maps/api";

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
  mapTypeId: 'roadmap',  //sateliteなら衛星写真に
};

const MapComponent = () => {
  return (
    <div className = "w-full">
      <GoogleMap 
      mapContainerStyle={defaultMapContainerStyle}
      Marker position={positionAkiba}
      center={defaultMapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
      >
      </GoogleMap>
    </div>
  )
};

export { MapComponent };