'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import { MapComponent } from './MapComponent';
import Link from 'next/link';
import MapProvider from '@/providers/map-provider';

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
      <MapProvider>
        <MapComponent toilets={toilets} isIncludeDetail={false} selectedDetail={undefined}/>
      </MapProvider>
      <span className="absolute w-[40px] h-[40px] z-[1] bottom-[165px] right-[0px] bg-white rounded-[2px] shadow-md p-[5px] m-[10px]">
        <Link href='https://forms.gle/nU5dQ29FCpQay3UB6'><img src='/feedback.svg' width={30} height={30} /></Link>
      </span>
    </div>
  )
};