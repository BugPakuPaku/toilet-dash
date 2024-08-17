"use client";
import React, { useEffect, useState, FormEvent, useReducer } from 'react';
import Link from "next/link";
import { collection, getDocs, query, getDoc, doc, addDoc, Timestamp, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet, Review } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import { ToiletDetails } from '@/components/MapComponent';

export default function Page({ params }: { params: { toiletId: string } }) {
  const { toiletId } = params;
  const [toilet, setToilet] = useState<Toilet>();

  useEffect(() => {
      const getToilet = async () => {
          try {
              const snapShot = await getDoc(doc(firestore, "toilets", toiletId));
              setToilet({
                  id: toiletId,
                  ...snapShot.data(),
              } as Toilet);
          } catch (error) {
              console.log(error);
          }
      };

      if (toiletId) {
          getToilet();
      }
  }, [toiletId]);

  if (toilet) {
    return (
        <>
          <ToiletDetails
            toilet={toilet}
          />
          <Link href={`/`}>home</Link>
        </>
    );
  } else {
    return <></>;
  }
}
