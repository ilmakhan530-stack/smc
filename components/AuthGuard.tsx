"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "attendance" | "stock" | "accounts";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data() || {};
      if (data.enabled === false) {
        await auth.signOut();
        router.replace("/login");
        return;
      }
      const role = (data.role || "attendance") as UserRole;

      if (allowedRoles && !allowedRoles.includes(role)) {
        router.replace(role === "attendance" ? "/attendance" : "/dashboard");
        return;
      }

      setAllowed(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, allowedRoles]);

  if (loading || !allowed) {
    return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f9ff"}}>Checking secure access…</div>;
  }

  return <>{children}</>;
}
