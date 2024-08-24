'use client'

import { Review, Toilet } from "@/types";
import React, { useEffect, useState, FormEvent, MouseEventHandler } from 'react';
import { collection, getDocs, query, addDoc, Timestamp, where, updateDoc, increment, doc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { FLAG_WASHLET, FLAG_OSTOMATE, FLAG_HANDRAIL, FLAG_WESTERN } from "@/utils/util";
import ToiletImage from "@/components/ToiletImage";
import Rating from '@mui/material/Rating'
import Image from 'next/image';

export type ToiletDetailsProps = { toilet: Toilet };

export const ToiletDetails = ({ toilet }: ToiletDetailsProps) => {

  const [isReviewFormLoading, setIsReviewFormLoading] = useState(false);
  const [isCrowdButtonLoading, setIsCrowdButtonLoading] = useState(false);
  const [beauty, setBeauty] = useState(2);
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsReviewFormLoading(true);
    let testUid = "";
    try {
      const doc = await addDoc(collection(firestore, "reviews"), {
        beauty: beauty,
        date: Timestamp.now(),
        text: text,
        toilet_id: toilet.id,
        uid: testUid
      });
      window.alert("レビューを送信しました");
    } catch (error) {
      console.log(error);
    }
    setIsReviewFormLoading(false);
  };

  const handleSubmitCrowdLevel = async () => {
    setIsCrowdButtonLoading(true);
    const toiletRef = doc(firestore, "toilets", toilet.id);
    if (toilet.crowding_level) {
      try {
        await updateDoc(toiletRef, {
          crowding_level: increment(1)
        });
        window.alert("混雑度を投稿しました");
      } catch (error) {
        console.log(error);
      }
    } else {  //crowding_levle fieldがなかったら作成
      try{
        await updateDoc(toiletRef, {
          crowding_level: 1
        });
        window.alert("混雑度を投稿しました");
      } catch (error) {
        console.log(error);
      }
    }
    setIsCrowdButtonLoading(false);
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
    <div className="p-10 w-full md:w-[250px] md:p-0">
      <span>
        <ToiletImage src={toilet.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
        <span className="ml-2 block top-0">{toilet.nickname} {toilet.floor}階</span>
        <div className="ml-2 block top-0 inline-flex items-center">
          <Rating name="half-rating-read" defaultValue={getBeuatyAverage()} precision={0.1} readOnly size='small' />
          <span>{getBeuatyAverage()}/5(公式調査: {toilet.beauty})</span>
        </div>
        <span className="ml-2 block top-0">説明:{toilet.description}</span>
        <div className="flex flex-row">
          {displayWestern()}
          {displayWashlet()}
          {displayHandrail()}
          {displayOstomate()}
        </div>
        <span className="ml-2 block top-0">現在の混雑度: {toilet.crowding_level || 0}</span>
        <span className="ml-2 block top-0">混雑度投稿</span>
        <button disabled={isCrowdButtonLoading || isReviewFormLoading} onClick={handleSubmitCrowdLevel} className="flex flex-col items-center">
          {(isCrowdButtonLoading ? "投稿中..." : "混んでいます")}
        </button>
        
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
            <label htmlFor="beauty" className="ml-2 top-0 flex-inline items-center">
              <Rating name="half-rating-read" value={beauty} precision={0.1} readOnly size='small' />
              <span>{beauty}/5</span>
            </label>
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
            <button type="submit" disabled={isReviewFormLoading || isCrowdButtonLoading}>
              {(isReviewFormLoading ? "保存中..." : "レビューを投稿")}
            </button>
          </form>
        </details>
      </span>
    </div>
  )
}