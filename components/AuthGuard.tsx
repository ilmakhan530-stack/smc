"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SessionTracker from "@/components/SessionTracker";
import { usePathname, useRouter } from "next/navigation";

export type UserRole = "admin" | "attendance" | "stock" | "accounts";

export type UserPermissions = Record<string, boolean>;

export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard": "dashboard",
  "/labour": "labour",
  "/staff": "staff",
  "/attendance": "attendance",
  "/salary": "salary",
  "/advance": "advance",
  "/thekedar": "thekedar",
  "/bill": "bill",
  "/stock": "stock",
  "/reports": "reports",
};

function permissionForPath(pathname: string) {
  const exact = Object.keys(ROUTE_PERMISSIONS).find(path => pathname === path || pathname.startsWith(`${path}/`));
  return exact ? ROUTE_PERMISSIONS[exact] : undefined;
}

function firstAllowedPath(role: UserRole, permissions: UserPermissions) {
  if (role === "admin") return "/dashboard";
  const order = [
    ["dashboard", "/dashboard"],
    ["attendance", "/attendance"],
    ["bill", "/bill"],
    ["stock", "/stock"],
    ["labour", "/labour"],
    ["staff", "/staff"],
    ["salary", "/salary"],
    ["advance", "/advance"],
    ["thekedar", "/thekedar"],
    ["reports", "/reports"],
  ] as const;
  const found = order.find(([key]) => permissions[key]);
  return found?.[1] || "/login";
}

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          setAllowed(false);
          setLoading(false);
          router.replace("/login");
          return;
        }

        const data = snap.data() || {};
        const userRole = (data.role || "attendance") as UserRole;
        const permissions = (data.permissions || {}) as UserPermissions;

        setRole(userRole);

        if (data.enabled === false) {
          setAllowed(false);
          setLoading(false);
          await auth.signOut();
          router.replace("/login");
          return;
        }

        // Admin keeps full access. For every other user, module access is
        // controlled by the saved permission checkbox, not only by role.
        const requiredPermission = permissionForPath(pathname);
        const roleAllowed = !allowedRoles || allowedRoles.includes(userRole) || userRole === "admin";

        if (userRole !== "admin") {
          if (requiredPermission && !permissions[requiredPermission]) {
            setAllowed(false);
            setLoading(false);
            router.replace(firstAllowedPath(userRole, permissions));
            return;
          }
          if (!requiredPermission && !roleAllowed) {
            setAllowed(false);
            setLoading(false);
            router.replace(firstAllowedPath(userRole, permissions));
            return;
          }
        } else if (allowedRoles && !allowedRoles.includes("admin") && !allowedRoles.includes(userRole)) {
          // Admin is intentionally allowed through all protected business modules.
        }

        setAllowed(true);
        setLoading(false);
      } catch {
        setAllowed(false);
        setLoading(false);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router, pathname, allowedRoles]);

  if (loading || !allowed) {
    return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f9ff"}}>Checking secure access…</div>;
  }

  return <>
    <SessionTracker user={auth.currentUser} role={role} />
    {children}
  </>;
}
