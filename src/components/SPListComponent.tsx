'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";

export const SPListComponent = () => {
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
      <div className="w-[100%] h-[100%] ml-auto mt-[4%] mr-[2%]">
        <ul className="overflow-y-scroll overflow-x-hidden">
          {toilets.map((x) => (
            <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg shadow-xl m-[20px] bg-white">
              <span className="ml-2 block sticky top-0 bg-white bg-opacity-80">{x.nickname}</span>
              <ToiletImage src={x.picture || "/NoImage.svg"}/>
              <span className="ml-2 block top-0">フロア:{x.floor}階</span>
              <span className="ml-2 block top-0">きれいさ:{x.beauty}</span>
              <span className="ml-2 block top-0">説明:{x.description}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  };