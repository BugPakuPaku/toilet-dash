"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
