"use client";

import { useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";

export default function SessionTracker({ user, role }: { user: any; role: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.uid) return;
    const key = "smc_session_id";
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${user.uid}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, sessionId);
    }

    const ref = doc(db, "activeSessions", sessionId);
    const save = async (online = true) => {
      await setDoc(ref, {
        sessionId,
        uid: user.uid,
        email: user.email || "",
        role,
        currentPath: window.location.pathname,
        lastSeen: Date.now(),
        online,
        forceLogout: false,
      }, { merge: true });
    };

    save(true).catch(() => {});
    const timer = window.setInterval(() => save(true).catch(() => {}), 20000);

    const stop = onSnapshot(ref, async (snap) => {
      if (snap.exists() && snap.data()?.forceLogout) {
        try { await updateDoc(ref, { online: false, lastSeen: Date.now() }); } catch {}
        await signOut(auth);
      }
    });

    const onUnload = () => {
      updateDoc(ref, { online: false, lastSeen: Date.now() }).catch(() => {});
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.clearInterval(timer);
      stop();
      window.removeEventListener("beforeunload", onUnload);
      updateDoc(ref, { online: false, lastSeen: Date.now() }).catch(() => {});
    };
  }, [user?.uid, role, pathname]);

  return null;
}
