"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";

export default function Page() {
    const [toiletId, setToiletId] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const id = searchParams.get("toilet_id") || "";
            setToiletId(id);
        }
    }, []);

    return (
        <>
            <h2 className="flex justify-center">口コミの登録</h2>
            <ReviewForm toiletId={toiletId} key={toiletId} />
            <p>
                <Link href={`/manage/toilet/${toiletId}`}>一覧に戻る</Link>
            </p>
        </>
    );
}
