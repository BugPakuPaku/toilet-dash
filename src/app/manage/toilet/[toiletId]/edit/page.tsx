"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDoc, doc, deleteDoc } from "firebase/firestore";

import { firestore } from "@/firebase";
import { Toilet } from "@/types";

import ToiletForm from "@/components/ToiletForm";

export default function Page({ params }: { params: { toiletId: string } }) {
  const { toiletId: toiletId } = params;
  const [toilet, setToilet] = useState<Toilet>();
  const { push } = useRouter();

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

  const handleDelete = async () => {
    if (window.confirm("本当に削除してもよろしいですか？")) {
      await deleteDoc(doc(firestore, "toilets", toiletId));
      window.alert("削除しました");
      push("/");
    }
  }

  return (
    <>
      <h2 className="my-6 sm:my-8 text-3xl sm:text-4xl font-bold text-center">トイレの編集</h2>
      <div className="text-center">
        <button className="text-red-500" onClick={handleDelete}>削除</button>
      </div>
      <ToiletForm toilet={toilet} />
      <p className="my-6 text-right">
        <Link href="/">トップに戻る</Link>
      </p>
    </>
  );
}