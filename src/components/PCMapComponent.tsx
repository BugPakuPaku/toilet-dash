'use client'

import React, { useEffect, useState } from 'react';
import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Toilet } from "@/types";
import Link from 'next/link';
import ToiletImage from './ToiletImage';
import { MapComponent } from './MapComponent';

export const PCMapComponent = () => {
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
    <div className="absolute w-full h-full">
      <div className="flex flex-nowrap justify-center items-center gap-3 bg-sky-300 h-full">
        <div className="w-[70%] h-[90%] mr-auto ml-[2%]"> {/*左側の地図*/}
          <MapComponent toilets={toilets} isIncludeDetail={true} />
        </div>
        <div className="w-[30%] h-[90%] ml-auto mr-[2%]"> {/*右側のリスト*/}
          <ul className="space-y-4 h-full overflow-y-scroll overflow-x-hidden shadow-inner2xl text-center">
            {toilets.map((x) => (
              <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg m-[20px] bg-white text-left">
                <span className="ml-2 block sticky bg-white bg-opacity-80 top-0">{x.nickname}</span>
                <ToiletImage src={x.picture || "/NoImage.svg"} />
                <span className="ml-2 block top-0">フロア:{x.floor}階</span>
                <span className="ml-2 block top-0">きれいさ:{x.beauty}</span>
                <span className="ml-2 block top-0">説明:{x.description}</span>
              </li>
            ))}
            <Link href={`/request`} className="block p-2 border-2 border-sky-300 m-[20px] rounded-lg bg-white">トイレ追加リクエスト</Link> {/* 要移動 */}
          </ul>
        </div>
      </div>
    </div>
  )
};