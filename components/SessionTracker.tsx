"use client";

import { useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

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

    const save = async (online = true, extra: Record<string, any> = {}) => {
      await setDoc(ref, {
        sessionId,
        uid: user.uid,
        email: user.email || "",
        role,
        currentPath: window.location.pathname,
        lastSeen: Date.now(),
        online,
        forceLogout: false,
        ...extra,
      }, { merge: true });
    };

    const logoutForIdle = async () => {
      try {
        await updateDoc(ref, {
          online: false,
          lastSeen: Date.now(),
          logoutReason: "15_minute_inactivity",
        });
      } catch {}

      try {
        await signOut(auth);
      } catch {}
    };

    let idleTimer: number | undefined;

    const resetIdleTimer = () => {
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        logoutForIdle().catch(() => {});
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ] as const;

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Start the 15-minute inactivity countdown immediately.
    resetIdleTimer();

    save(true).catch(() => {});
    const timer = window.setInterval(() => save(true).catch(() => {}), 20000);

    const stop = onSnapshot(ref, async (snap) => {
      if (snap.exists() && snap.data()?.forceLogout) {
        try {
          await updateDoc(ref, {
            online: false,
            lastSeen: Date.now(),
            logoutReason: "admin_force_logout",
          });
        } catch {}
        await signOut(auth);
      }
    });

    const onUnload = () => {
      updateDoc(ref, {
        online: false,
        lastSeen: Date.now(),
        logoutReason: "page_unload",
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      window.clearInterval(timer);
      stop();

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });

      window.removeEventListener("beforeunload", onUnload);
      updateDoc(ref, {
        online: false,
        lastSeen: Date.now(),
      }).catch(() => {});
    };
  }, [user?.uid, role, pathname]);

  return null;
}
