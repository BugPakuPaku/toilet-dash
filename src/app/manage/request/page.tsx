"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Toilet, Request } from "@/types";

export default function Page() {
    const [requests, setRequests] = useState<Request[]>([]);

    const getRequests = async () => {
        try {
            const q = query(collection(firestore, "requests"));
            const snapShot = await getDocs(q);
            const data = snapShot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            })) as Request[];
            setRequests(data);
        } catch (error) {
            console.error(error);
        }
    };

    const getCensorshipStatus = (flag: number) => {
        if (!flag) {
            return (
                <span>未検閲</span>
            )
        } else {
            if (flag == 1) {
                return (
                    <span>承認済み</span>
                )
            } else if (flag == 2) {
                return (
                    <span>拒否済み</span>
                )
            }
        }
    }


    useEffect(() => {
        getRequests();
    }, []);

    return (
        <>
            <h2 className="bg-gray-300 text-bg-gray-900 p-4 text-center">リクエスト一覧</h2>
            <div className="text-center">
                <table className="inline-block text-black-600/100 p-4 text-left">
                    {requests.map((x) => (
                        <tr key={x.id}>
                            <td>{x.nickname}</td>
                            <td className="text-blue-600/100">
                                <Link href={`/manage/request/${x.id}`}>詳細</Link>
                            </td>
                            <td>検閲: {getCensorshipStatus(x.censored_flag)}</td>
                        </tr>
                    ))}
                </table>
            </div>
            <p className="my-6 text-center">
                <Link href="/">トップに戻る</Link>
            </p>
        </>
    );
}
