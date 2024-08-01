import { GeoPoint } from "firebase/firestore";

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
    reviews?: 
        {
            beauty: number;
            date: string;
            id: string;
            text: string;
            uid: string;
        }[];
};