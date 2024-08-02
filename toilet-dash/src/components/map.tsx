'use client'

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { collection, getDocs, query, getDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";

export const defaultMapContainerStyle = {
  width: '100%',
  height: '94vh',
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
  text: "toilet",
};

//ページを作ってるやつ
const MapComponent = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);

  const getToilets = async () => {
    try {
      const q = query(collection(firestore, "toilets"));
      const snapShot = await getDocs(q);
      const data = snapShot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        position: doc.data().position,
      })) as Toilet[];
      setToilets(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getToilets();
  //   const getToilet = async () => {
  //   try {
  //     const snapShot = await getDoc(doc(firestore, "books", toiletId));
  //       setToiletDetail({
  //         id: toiletId,
  //         ...snapShot.data(),
  //       } as Toilet);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // if (toiletId) getToilet();
  }, []);

  const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Toilet | null>(null);

  return (
    <div className="flex justify-center items-center gap-3 bg-sky-300">
      <div className="w-[70%] h-full">
        <GoogleMap
          mapContainerStyle={defaultMapContainerStyle}
          center={defaultMapCenter}
          zoom={defaultMapZoom}
          options={defaultMapOptions}
        >
          {toilets.map((x) => (
            <Marker key={x.id}
            position={{ lat: x.position.latitude, lng: x.position.longitude }}
            // label={markerLabeluec} 
            onClick={() => {setSelectedCenter({ lat: x.position.latitude, lng: x.position.longitude });setSelectedDetail(x);}}
            />
          ))}

          {selectedCenter && (
            <InfoWindow
              onCloseClick={() => {setSelectedCenter(null);setSelectedDetail(null);}}
              position={selectedCenter}
            >
            <div>
            <ToiletImage src={selectedDetail?.picture || "/NoImage.svg"} />
            <span className="ml-2 block sticky  top-0">{selectedDetail?.nickname}</span>
            <span className="ml-2 block sticky  top-0">フロア:{selectedDetail?.floor}階</span>
            <span className="ml-2 block sticky  top-0">きれいさ:{selectedDetail?.beauty}</span>
            <span className="ml-2 block sticky  top-0">説明:{selectedDetail?.description}</span>
            </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      <div className="w-[30%] h-screen ml-auto mt-[4%] mr-[2%]">
      <ul className="space-y-4 h-[90%] overflow-y-scroll overflow-x-hidden">
        {toilets.map((x) => (
          <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg shadow bg-white">
            <ToiletImage src={x.picture || "/NoImage.svg"}/>
            <span className="ml-2 block sticky  top-0">{x.nickname}</span>
            <span className="ml-2 block sticky  top-0">フロア:{x.floor}階</span>
            <span className="ml-2 block sticky  top-0">きれいさ:{x.beauty}</span>
            <span className="ml-2 block sticky  top-0">説明:{x.description}</span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
};

export { MapComponent };