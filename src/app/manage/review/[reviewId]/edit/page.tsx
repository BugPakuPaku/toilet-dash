"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoc, doc } from "firebase/firestore";

import { firestore } from "@/firebase";
import { Review } from "@/types";

import ReviewForm from "@/components/ReviewForm";

export default function Page({ params }: { params: { reviewId: string } }) {
  const { reviewId: reviewId } = params;
  const [review, setReview] = useState<Review>();

  useEffect(() => {
    const getReview = async () => {
      try {
        const snapShot = await getDoc(doc(firestore, "reviews", reviewId));
        setReview({
          id: reviewId,
          ...snapShot.data(),
        } as Review);
      } catch (error) {
        console.error(error);
      }
    };
    if (reviewId) getReview();
  }, [reviewId]);

  return (
    <>
      <h2 className="my-6 sm:my-8 text-3xl sm:text-4xl font-bold">口コミの編集</h2>
      <ReviewForm review={review} />
      <p className="my-6 text-right">
        <Link href={`/manage/toilet/${review?.toilet_id}`}>一覧に戻る</Link>
      </p>
    </>
  );
}