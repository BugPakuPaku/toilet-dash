import { GeoPoint, Timestamp } from "firebase/firestore";

export type Toilet = {
    id: string;
    title: string;
    beauty?: number;
    description?: string;
    flag?: number;
    floor?: number;
    nickname?: string;
    picture?: string;
    position: GeoPoint;
    reviewsnum?: number;
};

export type Reviews = {
    beauty?: number;
    date?: Timestamp;
    text?: string;
    toilet_id?: "";
    uid?: string;
};