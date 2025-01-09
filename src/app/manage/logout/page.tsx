"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function Page() {
  const { push } = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      push("/");
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, [push]);

  return (
    <>
      ログアウトしています
    </>
  );
}
