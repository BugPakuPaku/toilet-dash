"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoc, doc } from "firebase/firestore";

import { firestore } from "@/firebase";
import { Toilet } from "@/types";

import ToiletForm from "@/components/ToiletForm";

export default function Page({ params }: { params: { toiletId: string } }) {
  const { toiletId: toiletId } = params;
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
        console.error(error);
      }
    };
    if (toiletId) getToilet();
  }, [toiletId]);

  return (
    <>
      <h2 className="my-6 sm:my-8 text-3xl sm:text-4xl font-bold text-center">トイレの編集</h2>
      <ToiletForm toilet={toilet} />
      <p className="my-6 text-right">
        <Link href="/">トップに戻る</Link>
      </p>
    </>
  );
}