"use client";

import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

type Value = {
  user: User | null;
  isLogin: boolean;
};

const defaultValue: Value = {
  user: null,
  isLogin: false
};

export const AuthContext = createContext<Value>(defaultValue);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used in AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { push } = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    setIsLogin(!!user);
    
    if (pathname.startsWith("/manage")) {
      if (!isLogin && pathname !== "/manage/login") {
        push("/manage/login");
      }
    }
  }, [pathname, push, user]);

  return (
    <AuthContext.Provider value={{ user, isLogin }}>{children}</AuthContext.Provider>
  );
}
