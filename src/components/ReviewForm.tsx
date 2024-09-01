import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

import { addDoc, doc, collection, updateDoc, GeoPoint, Timestamp } from "firebase/firestore";

import { firestore } from "@/firebase";
import { Review } from "@/types";

type Props = { review?: Review, toiletId?: string };

export default function ReviewForm({ review, toiletId: preToiletId }: Props) {
  const { push } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [beauty, setBeauty] = useState(0.0);
  const [date, setDate] = useState<Timestamp>(Timestamp.now());
  const [text, setText] = useState("");
  const [toiletId, setToiletId] = useState(preToiletId || "");
  const [uid, setUid] = useState("");

  const isNew = !review;

  useEffect(() => {
    if (review) {
      setBeauty(review.beauty || 0.0);
      setDate(review.date || Timestamp.now());
      setText(review.text || "");
      setToiletId(review.toilet_id || "");
      setUid(review.uid || "");
    } else {
      setToiletId(preToiletId || "");
    }
  }, [review]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let reviewId = review?.id;
    try {
      if (isNew) {
        const doc = await addDoc(collection(firestore, "reviews"), {
          beauty: beauty,
          date: date,
          text: text,
          toilet_id: toiletId,
          uid: uid
        });
        reviewId = doc.id;
      } else {
        await updateDoc(doc(firestore, "reviews", review.id), {
          beauty: beauty,
          date: date,
          text: text,
          toilet_id: toiletId,
          uid: uid
        });
      }
      setIsLoading(false);
      window.alert("保存しました");
      push(`/manage/review/${reviewId}`);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="uid">UID</label>
        <input
          id="uid"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="toilet-id">トイレID</label>
        <input
          id="toilet-id"
          value={toiletId}
          onChange={(e) => setToiletId(e.target.value)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="beauty">きれいさ {beauty}</label>
        <input
          id="beauty"
          type="range"
          step="0.1"
          min="0.0"
          max="5.0"
          value={beauty}
          onChange={(e) => setBeauty(e.target.valueAsNumber)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="text">詳細</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border border-gray-300"
          required
        />

        <button type="submit" disabled={isLoading}>
          {isNew && (isLoading ? "登録中..." : "登録")}
          {!isNew && (isLoading ? "保存中..." : "変更を保存")}
        </button>
      </form>
    </>
  );
}
