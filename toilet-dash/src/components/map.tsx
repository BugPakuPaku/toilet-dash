'use client'

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { collection, getDocs, query, getDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";

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
  text: "toilet",
};

const MapComponent = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [ToiletDetail, setToiletDetail] = useState<Toilet>();

  const getToilets = async () => {
    try {
      const q = query(collection(firestore, "toilets"));
      const snapShot = await getDocs(q);
      const data = snapShot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
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

  return (
    <>
      <div>
      <h2>トイレ一覧</h2>
      <ul>
        {toilets.map((x) => (
          <li key={x.id}>
            <ToiletImage src={x.picture || "/toilet-dash/public/NoImage.svg"} />
            <span>{x.nickname}</span>
            <span>フロア:{x.floor}階</span>
            <span>きれいさ:{x.beauty}</span>
            <span>説明:{x.description}</span>
          </li>
        ))}
      </ul>
      </div>
      <div className="w-full">
        <GoogleMap
          mapContainerStyle={defaultMapContainerStyle}
          center={defaultMapCenter}
          zoom={defaultMapZoom}
          options={defaultMapOptions}
        >
          {toilets.map((x) => (<Marker
            position={x.position}
            // label={markerLabeluec} 
            onClick={() => setSelectedCenter(x.position)}
          />))}

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
    </>
  )
};

export { MapComponent };