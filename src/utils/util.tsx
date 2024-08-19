'use client'
import { GeoPoint } from "firebase/firestore";

export const FLAG_WESTERN = 1 << 0;
export const FLAG_WASHLET = 1 << 1;
export const FLAG_HANDRAIL = 1 << 2;
export const FLAG_OSTOMATE = 1 << 3;

export const toLatLng = (obj: (GeoPoint | GeolocationPosition)) => {
    if (obj instanceof GeoPoint) {
        return new google.maps.LatLng(obj.latitude, obj.latitude);
    } else if (obj instanceof GeolocationPosition) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    } else {
        return new google.maps.LatLng();
    }
}