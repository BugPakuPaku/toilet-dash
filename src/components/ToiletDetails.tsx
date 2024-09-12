'use client'

import { Review, Toilet } from "@/types";
import React, { useEffect, useState, FormEvent, MouseEventHandler, useCallback } from 'react';
import { collection, getDocs, getDoc, query, addDoc, Timestamp, where, updateDoc, increment, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { GeoPoint } from "firebase/firestore";
import { FLAG_WASHLET, FLAG_OSTOMATE, FLAG_HANDRAIL, FLAG_WESTERN } from "@/util";
import ToiletImage from "@/components/ToiletImage";
import { Rating, Tooltip } from '@mui/material';
import Image from 'next/image';
import 'dayjs/locale/ja';
import dayjs, { locale, extend } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuthContext } from "@/app/provider/AuthContext";
import Link from "next/link";
import { updateCrowdingLevel, isNowRestTime } from "@/components/CrowdPrediction";

export type ToiletDetailsProps = { toilet: Toilet };

export const STATE_SENDABLE = 0;
export const STATE_SENDING = 1;
export const STATE_SENT = 2;

export const INTERVAL_AUTO_UPDATE = 5000;

export const ToiletDetails = ({ toilet: preToilet }: ToiletDetailsProps) => {
  const [toilet, setToilet] = useState(preToilet);
  const [isReviewFormLoading, setIsReviewFormLoading] = useState(false);
  const [crowdButtonState, setCrowdButtonState] = useState(STATE_SENDABLE);
  const [beauty, setBeauty] = useState(2);
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [samePositionToilets, setSamePositionToilets] = useState<Toilet[]>([]);
  const [crowdingLevel, setCrowdingLevel] = useState(toilet.crowding_level || 0);

  const { user, isLogin, isAuthReady } = useAuthContext();

  const fetchCrowdingLevel = async () => {
    try {
      const snapShot = await getDoc(doc(firestore, "toilets", toilet.id));
      const tmpToilet = snapShot.data() as Toilet;
      setCrowdingLevel(tmpToilet.crowding_level || 0);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCrowdingLevel();
    }, INTERVAL_AUTO_UPDATE);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
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
      console.error(error);
    }
    setIsReviewFormLoading(false);
  }, [beauty, text, toilet]);

  const handleSubmitCrowdLevel = useCallback(async () => {
    setCrowdButtonState(STATE_SENDING);
    const toiletRef = doc(firestore, "toilets", toilet.id);
    if (toilet.crowding_level) {
      try {
        await updateDoc(toiletRef, {
          crowding_level: increment(1)
        });
      } catch (error) {
        console.error(error);
      }
    } else {  //crowding_levle fieldがなかったら作成
      try {
        await updateDoc(toiletRef, {
          crowding_level: 1
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchCrowdingLevel();
    setCrowdButtonState(STATE_SENT);
  }, [toilet]);

  const fetchReviews = async (toiletId: string) => {
    try {
      const q = query(collection(firestore, "reviews"), where('toilet_id', '==', toiletId));
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() })
      ) as Review[];
      setReviews(reviews);
    } catch (error) {
      console.error(error);
    }
  };

  const getBeuatyAverage = useCallback(() => {
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
  }, [reviews, toilet]);

  const isWestern = useCallback(() => ((toilet.flag || 0) & FLAG_WESTERN) != 0, [toilet]);
  const isWashlet = useCallback(() => ((toilet.flag || 0) & FLAG_WASHLET) != 0, [toilet]);
  const isHandRail = useCallback(() => ((toilet.flag || 0) & FLAG_HANDRAIL) != 0, [toilet]);
  const isOstomate = useCallback(() => ((toilet.flag || 0) & FLAG_OSTOMATE) != 0, [toilet]);

  const displayWestern = useCallback(() => {
    if (isWestern()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
          <Tooltip title="洋式">
            <Image
              alt="洋式"
              fill
              style={{ objectFit: "contain" }}
              src="/details/western.svg"
            />
          </Tooltip>
        </span>
      )
    } else {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
          <Tooltip title="和式">
            <Image
              alt="和式"
              fill
              style={{ objectFit: "contain" }}
              src="/details/japanese.png"
            />
          </Tooltip>
        </span>
      )
    }
  }, [isWestern]);

  const displayWashlet = useCallback(() => {
    if (isWashlet()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
          <Tooltip title="ウォシュレットあり">
            <Image
              alt="ウォシュレットあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/washlet.png"
            />
          </Tooltip>
        </span>
      )
    } else {
      return null;
    }
  }, [isWashlet]);

  const displayHandrail = useCallback(() => {
    if (isHandRail()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
          <Tooltip title="手すりあり">
            <Image
              alt="手すりあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/handrail.svg"
            />
          </Tooltip>
        </span>
      )
    } else {
      return null;
    }
  }, [isHandRail]);

  const displayOstomate = useCallback(() => {
    if (isOstomate()) {
      return (
        <span className="aspect-square relative w-[20px] p-[3px]">
          <Tooltip title="オストメイトあり">
            <Image
              alt="オストメイトあり"
              fill
              style={{ objectFit: "contain" }}
              src="/details/ostomates.png"
            />
          </Tooltip>
        </span>
      )
    } else {
      return null;
    }
  }, [isOstomate]);

  const displayRestTime = () => {
    if (isNowRestTime()) {
      return (
        <span>休み時間</span>
      )
    } else {
      return null;
    }
  }

  const handleDeleteReview = async (review: Review) => {
    if (window.confirm("本当に削除してもよろしいですか？")) {
      await deleteDoc(doc(firestore, "reviews", review.id));
      window.alert("削除しました");
      fetchReviews(review.toilet_id);
    }
  }

  const getToiletsByPosition = async (position: GeoPoint) => {
    const q = query(collection(firestore, "toilets"), where('position', '==', position));
    const querySnapshot = await getDocs(q);
    const toilets = querySnapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() })
    ) as Toilet[];
    return toilets;
  };
  
  const querySamePositionToilets = async (toilet: Toilet) => {
    const toilets = await getToiletsByPosition(toilet.position);
    setSamePositionToilets(toilets);
  };

  const isPostAllowed = () => {
    return (! isReviewFormLoading) && crowdButtonState != STATE_SENDING;
  }

  useEffect(() => {
    querySamePositionToilets(toilet);
    fetchCrowdingLevel();
    fetchReviews(toilet.id);
  }, [toilet]);

  locale('ja');
  extend(relativeTime);

  return (
    <div className="p-10 w-full md:w-[250px] md:p-0">
      {  
        samePositionToilets.length >= 2 && (
          <>
            <span>階を選択</span>
            <div className="flex flex-row">
              {samePositionToilets.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setToilet(x)}
                  disabled={toilet.id === x.id}
                  className={toilet.id === x.id ? "mr-2" : "mr-2 text-blue-600/100"}
                >
                  {x.floor}階
                </button>
              ))}
            </div>
          </>
        )
      }
      <span>
        {
          isLogin && (
            <span className="block top-0 text-right">
              <Link href={`/manage/toilet/${toilet.id}/edit`} className="text-blue-600/100">編集</Link>
            </span>
          )
        }
        <ToiletImage src={toilet.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
        <span className="block top-0">{toilet.nickname} 
          {
            samePositionToilets.length == 1 && (
              `${toilet.floor}階`
            )
          }
        </span>
        <div className="block top-0 inline-flex items-center">
          <Rating name="half-rating-read" defaultValue={getBeuatyAverage()} precision={0.1} readOnly size='small' />
          <span>{getBeuatyAverage()}/5(公式調査: {toilet.beauty})</span>
        </div>
        <span className="block top-0">{toilet.description}</span>
        <div className="flex flex-row">
          {displayWestern()}
          {displayWashlet()}
          {displayHandrail()}
          {displayOstomate()}
        </div>
        <div className="flex flex-row">
          <span className="block top-0">現在の混雑度: {updateCrowdingLevel(crowdingLevel)}</span>
          {displayRestTime()}
        </div>
        <span className="block top-0">混雑度投稿</span>
        <button disabled={! isPostAllowed() || crowdButtonState != STATE_SENDABLE} onClick={handleSubmitCrowdLevel} className="flex flex-col items-center text-blue-600/100">
          {(crowdButtonState == STATE_SENDING ? "投稿中..." : crowdButtonState == STATE_SENT ? "投稿済み" : "混んでいます")}
        </button>

        <ul className="md:overflow-y-auto md:max-h-20 border border-gray-300 rounded-lg">
          {reviews.length > 0 ? (
            reviews.map((x) => (
              <li key={x.id} className="flex space-x-4 p-4 border-b border-gray-300">
                {/* Placeholder for avatar */}
                <div className="flex-shrink-0">
                  <Image
                    src="/defaultIcon.svg" // Replace with actual avatar URL
                    alt={x.uid || "名無しのトイレ評論家"}
                    className="rounded-full"
                    width={30}
                    height={30}
                  />
                </div>

                {/* Comment content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold md:text-xs">{x.uid || "名無しのトイレ評論家"}</span> {/* Replace with actual user name */}
                    <span className="text-gray-500 md:text-xs">{dayjs(x.date?.toDate()).fromNow()}</span>
                    {
                      isLogin && (
                        <button
                          className="text-red-500"
                          onClick={() => handleDeleteReview(x)}
                          >削除</button>
                      )
                    }
                  </div>
                  <div className="mt-1">
                    <div className="block top-0 inline-flex items-center">
                      <Rating name="half-rating-read" defaultValue={x.beauty} precision={0.1} readOnly size='small' />
                      <span>{x.beauty}/5</span>
                    </div>
                    <p className="text-gray-700 mt-1">{x.text || "コメントはありません"}</p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">レビューはありません</p>
          )}
        </ul>
        <details>
          <summary>レビューを書く</summary>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="beauty" className="top-0 flex-inline items-center">
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
            <button type="submit" disabled={! isPostAllowed()} className="text-blue-600/100">
              {(isReviewFormLoading ? "保存中..." : "レビューを投稿")}
            </button>
          </form>
        </details>
      </span>
    </div>
  )
}