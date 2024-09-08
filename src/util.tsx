'use client'
import { GeoPoint } from "firebase/firestore";
import { Timestamp } from 'firebase/firestore';
import { DateRange } from '@/types';

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
        throw new Error("error(toLatLng): Unexpected object type");
    }
}

export function isTimestampInRange(timestamp: Timestamp, range: DateRange): boolean {
    const date = timestamp.toDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startHours = range.start.getHours();
    const startMinutes = range.start.getMinutes();
    const endHours = range.end.getHours();
    const endMinutes = range.end.getMinutes();
    return (startHours < hours || (startHours === hours && startMinutes <= minutes)) &&
        (hours < endHours || (hours === endHours && minutes <= endMinutes));
}

export function createDateRange(startHour: number, startMinute: number, endHour: number, endMinute: number): DateRange {
    const start = new Date();
    start.setHours(startHour);
    start.setMinutes(startMinute);
    const end = new Date();
    end.setHours(endHour);
    end.setMinutes(endMinute);
    return { start, end };
}

export function isWeekend(timestamp: Timestamp): boolean {
    const weekday = timestamp.toDate().getDay();
    return weekday === 0 || weekday === 6;
}