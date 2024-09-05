"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function Page() {
  const { push } = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      push("/");
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  return (
    <>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin}>
        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" className="bg-blue-500 text-white px-2 rounded">
          ログイン
        </button>
      </form>
    </>
  );
}
