'use client'
import { GeoPoint } from "firebase/firestore";

export const FLAG_WESTERN = 1 << 0;
export const FLAG_WASHLET = 1 << 1;
export const FLAG_HANDRAIL = 1 << 2;
export const FLAG_OSTOMATE = 1 << 3;
export const DEFAULT_POSITION = new GeoPoint(35.65807613409312, 139.5435764020845);

export function toLatLng(obj: (GeoPoint | GeolocationPosition)): (google.maps.LatLng) {
    if (obj instanceof GeoPoint) {
        return new google.maps.LatLng(obj.latitude, obj.longitude);
    } else if (obj instanceof GeolocationPosition) {
        return new google.maps.LatLng(obj.coords.latitude, obj.coords.longitude);
    } else {
        console.log("error(objtoLatLng): Unexpected obj");
        return new google.maps.LatLng(DEFAULT_POSITION.latitude, DEFAULT_POSITION.longitude);
    }
}