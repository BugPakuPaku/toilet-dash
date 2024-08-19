'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import { MapComponent } from './MapComponent';

export const SPMapComponent = () => {

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

  useEffect(() => {  //初回レンダリング時のみ
    getToilets();
  }, []);

  return (
    <div className="absolute w-full h-full z-0">
      <MapComponent toilets={toilets} isIncludeDetail={false} />
    </div>
  )
};