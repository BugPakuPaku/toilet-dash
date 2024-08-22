'use client'

import { Review, Toilet } from "@/types";
import React, { useEffect, useState, FormEvent } from 'react';
import { collection, getDocs, query, addDoc, Timestamp, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { FLAG_WASHLET, FLAG_OSTOMATE, FLAG_HANDRAIL, FLAG_WESTERN } from "@/utils/util";
import ToiletImage from "@/components/ToiletImage";
import Rating from '@mui/material/Rating'
import Image from 'next/image';

export type ToiletDetailsProps = { toilet: Toilet };

export const ToiletDetails = ({ toilet }: ToiletDetailsProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [beauty, setBeauty] = useState(2);
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let testUid = "";
    try {
      const doc = await addDoc(collection(firestore, "reviews"), {
        beauty: beauty,
        date: Timestamp.now(),
        text: text,
        toilet_id: toilet.id,
        uid: testUid
      });
      setIsLoading(false);
      window.alert("レビューを送信しました");
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const fetchReviews = async (toiletId: string) => {
    try {
      const q = query(collection(firestore, "reviews"), where('toilet_id', '==', toiletId));
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() })
      ) as Review[];
      setReviews(reviews);
    } catch (error) {
      console.log(error);
    }
  };

  const getBeuatyAverage = () => {
    let sum = 0;
    let count = reviews.length;
    reviews.map((x) => {
      sum += x.beauty || 0;
    });
    // console.log("sum" + sum);
    // console.log("count" + count);
    let customerAverage = sum / count;
    let allAverage = 0.0;
    if (count != 0) {
      allAverage = ((toilet.beauty || 0) * 7 + customerAverage * 3) / 10;
    } else {
      allAverage = toilet.beauty || 0;
    }
    return Math.round(allAverage * 100) / 100;
  }

  const isWestern = () => ((toilet.flag || 0) & FLAG_WESTERN) != 0;
  const isWashlet = () => ((toilet.flag || 0) & FLAG_WASHLET) != 0;
  const isHandRail = () => ((toilet.flag || 0) & FLAG_HANDRAIL) != 0;
  const isOstomate = () => ((toilet.flag || 0) & FLAG_OSTOMATE) != 0;

  const displayWestern = () => {
    if (isWestern()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
            <Image
              alt="洋式"
              fill
              style={{ objectFit: "contain" }}
              src="/details/western.svg"
            />
        </span>
      )
    } else {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
            <Image
              alt="和式"
              fill
              style={{ objectFit: "contain" }}
              src="/details/japanese.png"
            />
        </span>
      )
    }
  }

  const displayWashlet = () => {
    if (isWashlet()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
            <Image
              alt="ウォシュレットあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/washlet.png"
            />
        </span>
      )
    } else {
      return null;
    }
  }

  const displayHandrail = () => {
    if (isHandRail()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
            <Image
              alt="手すりあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/handrail.svg"
            />
        </span>
      )
    } else {
      return null;
    }
  }

  const displayOstomate = () => {
    if (isOstomate()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
            <Image
              alt="オストメイトあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/ostomates.png"
            />
        </span>
      )
    } else {
      return null;
    }
  }

  useEffect(() => {
    fetchReviews(toilet.id);
  }, [toilet]);

  return (
    <div className="w-[250px]">
      <span>
        <ToiletImage src={toilet.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
        <span className="block top-0">{toilet.nickname} {toilet.floor}階</span>
        <span className="block top-0">きれいさ</span>
        <span className="block top-0"><Rating name="half-rating-read" defaultValue={getBeuatyAverage()} precision={0.1} readOnly size='small' /></span>
        <span className="block top-0">{getBeuatyAverage()}/5(公式調査: {toilet.beauty})</span>
        <span className="block top-0">説明:{toilet.description}</span>
        <div className="flex flex-row">
          {displayWestern()}
          {displayWashlet()}
          {displayHandrail()}
          {displayOstomate()}
        </div>
        <span className="block top-0">レビュー</span>
        <ul>
          {reviews.map((x) => (
            <li key={x.id}>
              <span>きれいさ: {x.beauty}</span><br />
              <span>レビュー: {x.text || ""}</span>
            </li>
          ))}
        </ul>
        <details>
          <summary>レビューを書く</summary>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="beauty">きれいさ {beauty}</label>
            <input
              id="beauty"
              type="range"
              step="1"
              min="0"
              max="5"
              value={Math.round(beauty)}
              onChange={(e) => setBeauty(e.target.valueAsNumber)}
              className="border border-gray-300"
              required
            />

            <label htmlFor='review'>口コミ</label>
            <textarea
              id='review'
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='border border-gray-300'
              required
            />

            <button type="submit" disabled={isLoading}>
              {(isLoading ? "保存中..." : "レビューを投稿")}
            </button>
          </form>
        </details>
      </span>
    </div>
  )
}