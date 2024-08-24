'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import Rating from '@mui/material/Rating'

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
        <ul className="overflow-y-scroll overflow-x-hidden">
          {toilets.map((x) => (
            <li key={x.id} id={x.id} className="p-[30px] border-2 border-sky-300 rounded-lg shadow-xl m-[40px] bg-white">
              <span className="block sticky top-0 bg-white bg-opacity-80">{x.nickname}</span>
              <ToiletImage src={x.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center'/>
              <span className="block top-0">フロア:{x.floor}階</span>
              <div className="block top-0 inline-flex items-center">
                <Rating name="half-rating-read" defaultValue={x.beauty} precision={0.1} readOnly size='small' />
                <span>{x.beauty}/5</span>
              </div>
              <span className="block top-0">説明:{x.description}</span>
            </li>
          ))}
        </ul>
    )
  };