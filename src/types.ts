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
    crowding_level?: number;
};

export type Review = {
    id: string;
    beauty?: number;
    date?: Timestamp;
    text?: string;
    toilet_id: "";
    uid: string;
};

export type Request = {
    id: string;
    title: string;
    beauty?: number;
    description?: string;
    flag?: number;
    floor?: number;
    nickname?: string;
    picture?: string;
    position: GeoPoint;
    censored_flag: number;
};