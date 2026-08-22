"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SessionTracker from "@/components/SessionTracker";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, moduleFromPath, type UserPermissions } from "@/lib/access";

export type UserRole = "admin" | "attendance" | "stock" | "accounts" | "bill";

type Profile = { role?: UserRole; permissions?: UserPermissions; enabled?: boolean };

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [role, setRole] = useState<UserRole>("attendance");
  const [error, setError] = useState("");

  // Parent pages recreate inline allowedRoles arrays on every state update.
  // Use a stable string key so typing in any form does NOT restart the
  // auth check, unmount the page, or steal input focus.
  const allowedRolesKey = allowedRoles?.join("|") || "";

  useEffect(() => {
    let alive = true;
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!alive) return;
      setLoading(true);
      setAllowed(false);
      setError("");

      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          setError("User profile nahi mila. Admin se profile configure karwao.");
          setLoading(false);
          return;
        }

        const data = snap.data() as Profile;
        const userRole = (data.role || "attendance") as UserRole;
        setRole(userRole);

        if (data.enabled === false) {
          setError("Aapka user account disabled hai. Admin se contact karo.");
          setLoading(false);
          return;
        }

        const module = moduleFromPath(pathname);
        const permissionAllowed = module ? hasPermission(userRole, data.permissions, module) : true;
        const legacyRoleAllowed = !data.permissions || Object.keys(data.permissions).length === 0
          ? (!allowedRoles || allowedRoles.includes(userRole))
          : true;

        if (!permissionAllowed || !legacyRoleAllowed) {
          setError("Is module ki permission aapko nahi di gayi hai.");
          setLoading(false);
          return;
        }

        setAllowed(true);
        setLoading(false);
      } catch (e: any) {
        console.error("Auth profile check failed", e);
        setError("Secure access check complete nahi ho saka. Login active hai; thodi der baad retry karo.");
        setLoading(false);
        // IMPORTANT: do not sign the user out on a Firestore/network error.
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [router, pathname, allowedRolesKey]);

  if (loading) {
    return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f9ff",fontFamily:"Arial"}}>Checking secure access…</div>;
  }

  if (!allowed) {
    return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f9ff",fontFamily:"Arial",padding:24}}><div style={{background:"#fff",padding:28,borderRadius:14,border:"1px solid #dce6f0",maxWidth:520,textAlign:"center"}}><h2 style={{color:"#123e76",marginTop:0}}>Access unavailable</h2><p style={{color:"#65778a"}}>{error || "Aapko is page ki permission nahi hai."}</p><button onClick={() => router.replace("/login")} style={{border:0,borderRadius:9,padding:"11px 18px",background:"#0d63d7",color:"#fff",fontWeight:800,cursor:"pointer"}}>Back to Login</button></div></div>;
  }

  return <><SessionTracker user={auth.currentUser} role={role} />{children}</>;
}
