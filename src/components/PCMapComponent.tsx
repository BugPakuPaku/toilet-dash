'use client'

import React, { useEffect, useState } from 'react';
import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Toilet } from "@/types";
import Link from 'next/link';
import ToiletImage from './ToiletImage';
import { MapComponent } from './MapComponent';
import MapProvider from '@/providers/map-provider';
import { useAuthContext } from '@/app/provider/AuthContext';

export const PCMapComponent = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<Toilet | null>(null);
  const { isLogin } = useAuthContext();

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
          <MapProvider>
            <MapComponent 
              toilets={toilets} 
              isIncludeDetail={true} 
              selectedToilet={selectedInfo || undefined}
              onToiletSelected={(toilet) => setSelectedInfo(toilet)}
            />
          </MapProvider>
        </div>
        <div className="w-[30%] h-[90%] ml-auto mr-[2%]"> {/*右側のリスト*/}
          <ul className="space-y-4 w-full h-full overflow-y-scroll overflow-x-hidden shadow-inner2xl text-center">
            {toilets.map((x) => (
              <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg m-[20px] bg-white text-left">
                <div className="flex justify-between sticky bg-white bg-opacity-80 top-0">
                  <span>{x.nickname}</span>
                  {
                    isLogin && (
                      <Link href={`/manage/toilet/${x.id}/edit`} className="text-blue-600/100">編集</Link>
                    )
                  }
                </div>
                <ToiletImage src={x.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
                <span className="block top-0">フロア:{x.floor}階</span>
                <span className="block top-0">きれいさ:{x.beauty}</span>
                <span className="block top-0">説明:{x.description}</span>
                <button onClick={() => {setSelectedInfo(x)}} className="text-blue-600/100">詳細を確認</button>
              </li>
            ))}
            <Link href={`/request`} className="block p-2 border-2 border-sky-300 m-[20px] rounded-lg bg-white">トイレ追加リクエスト</Link> {/* 要移動 */}
          </ul>
        </div>
      </div>
    </div>
  )
};