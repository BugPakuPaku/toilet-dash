"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoc, doc, query, where, collection, getDocs } from "firebase/firestore";

import { firestore } from "@/firebase";
import { Toilet, Review } from "@/types";

import ToiletImage from "@/components/ToiletImage";
import { floorNumberToString, floorStringToNumber } from "@/components/Floor";

export default function Page({ params }: { params: { toiletId: string } }) {
    const { toiletId } = params;
    const [toilet, setToilet] = useState<Toilet>();
    const [reviews, setReviews] = useState<Review[]>([]);

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
        }

        if (toiletId) {
            getToilet();
            fetchReviews(toiletId);
        }
    }, [toiletId]);

    return (
        <>
            <div className="flex flex-col items-center">
                <h2 className="flex justify-center">{toilet?.nickname} {floorNumberToString(toilet?.floor || 1)}</h2>
                <ToiletImage src={toilet?.picture || "/toilet_image_example.svg"} />
                <p>
                    <Link className="text-blue-600/100" href={`./edit`}>編集する</Link>
                </p>
                <p className="text-center">口コミ</p>
                <div className="text-center">
                    <table className="inline-block text-left">
                        {reviews.map((x) => (
                            <tr key={x.id}>
                                <td>{x.text || ""}</td>
                                <td>UID: {x.uid}</td>
                                <td>
                                    <Link className="text-blue-600/100" href={`/manage/review/${x.id}/edit`}>編集する</Link>
                                </td>
                                <td>
                                    <button type="button">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>
                <p>
                    <Link className="text-blue-600/100" href={`/manage/review/new?toilet_id=${toiletId}`}>口コミを追加</Link>
                </p>
            </div>
            <p className="text-right">
                <Link href="/">トップに戻る</Link>
            </p>
        </>
    );
}
