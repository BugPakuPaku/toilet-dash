"use client";
import Link from "next/link";
import ToiletForm from "@/components/ToiletForm";

export default function Page() {
  return (
    <>
      <h2 className="flex justify-center">トイレの登録</h2>
      <ToiletForm />
      <p className="text-right">
        <Link href="/">トップに戻る</Link>
      </p>
    </>
  );
}
