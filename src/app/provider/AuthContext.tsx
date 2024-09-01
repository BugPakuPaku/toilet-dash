"use client";

import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

type Value = {
  user: User | null;
  isLogin: boolean;
  isAuthReady: boolean
};

const defaultValue: Value = {
  user: null,
  isLogin: false,
  isAuthReady: false
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
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (tmpUser) => {
      if (tmpUser) {
        setUser(tmpUser);
        setIsLogin(true);
      } else {
        setUser(null);
        setIsLogin(false);
      }

      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    if (pathname.startsWith("/manage")) {
      if (!isLogin && pathname !== "/manage/login" && pathname !== "/manage/logout") {
        push("/manage/login");
      }
    }
  }, [pathname, push, isLogin, isAuthReady]);

  return (
    <AuthContext.Provider
      value={{ user, isLogin, isAuthReady }}
      >
        {children}
      </AuthContext.Provider>
  );
}
