'use client'

import { Review, Toilet } from "@/types";
import React, { useEffect, useState, FormEvent } from 'react';
import { collection, getDocs, query, addDoc, Timestamp, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { FLAG_WASHLET, FLAG_OSTOMATE, FLAG_HANDRAIL, FLAG_WESTERN } from "@/utils/util";
import ToiletImage from "@/components/ToiletImage";

export type ToiletDetailsProps = { toilet: Toilet };

export const ToiletDetails = ({toilet} : ToiletDetailsProps) => {

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
      return allAverage;
    }
    
    const isWestern = () => ((toilet.flag || 0) & FLAG_WESTERN) != 0;
    const isWashlet = () => ((toilet.flag || 0) & FLAG_WASHLET) != 0;
    const isHandRail = () => ((toilet.flag || 0) & FLAG_HANDRAIL) != 0;
    const isOstomate = () => ((toilet.flag || 0) & FLAG_OSTOMATE) != 0;
  
    const displayWestern = () => {
      if (isWestern()) {
        return (
          <span className="ml-2 block sticky  top-0">洋式</span>
        )
      } else {
        return (
          <span className="ml-2 block sticky  top-0">和式</span>
        )
      }
    }
  
    const displayWashlet = () => {
      if (isWashlet()) {
        return (
          <span className="ml-2 block sticky  top-0">ウォシュレットあり</span>
        )
      } else {
        return (
          <span className="ml-2 block sticky  top-0">ウォシュレットなし</span>
        )
      }
    }
  
    const displayHandrail = () => {
      if (isHandRail()) {
        return (
          <span className="ml-2 block sticky  top-0">手すりあり</span>
        )
      } else {
        return (
          <span className="ml-2 block sticky  top-0">手すりなし</span>
        )
      }
    }
  
    const displayOstomate = () => {
      if (isOstomate()) {
        return (
          <span className="ml-2 block sticky  top-0">オストメイトあり</span>
        )
      } else {
        return (
          <span className="ml-2 block sticky  top-0">オストメイトなし</span>
        )
      }
    }
  
    useEffect(() => {  
      fetchReviews(toilet.id);
    }, [toilet]);
  
    return (
      <div>
        <span>
          <ToiletImage src={toilet.picture || "/NoImage.svg"} />
          <span className="ml-2 block sticky  top-0">{toilet.nickname}</span>
          <span className="ml-2 block sticky  top-0">フロア:{toilet.floor}階</span>
          <span className="ml-2 block sticky  top-0">きれいさ:{getBeuatyAverage()} (公式調査: {toilet.beauty})</span>
          <span className="ml-2 block sticky  top-0">説明:{toilet.description}</span>
          {displayWestern()}
          {displayWashlet()}
          {displayHandrail()}
          {displayOstomate()}
          <span className="ml-2 block sticky  top-0">レビュー</span>
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