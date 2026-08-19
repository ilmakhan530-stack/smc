"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SessionTracker from "@/components/SessionTracker";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "attendance" | "stock" | "accounts" | "bill";
export type PermissionKey =
  | "dashboard" | "labour" | "staff" | "attendance" | "salary"
  | "advance" | "thekedar" | "bill" | "stock" | "reports";

type PermissionMap = Partial<Record<PermissionKey, boolean>>;

export const ROLE_FALLBACK_PERMISSIONS: Record<Exclude<UserRole, "admin">, PermissionKey[]> = {
  attendance: ["attendance"],
  stock: ["stock"],
  accounts: ["dashboard", "reports"],
  bill: ["bill"],
};

export function hasModulePermission(
  role: UserRole | undefined,
  permissions: PermissionMap | undefined,
  key: PermissionKey,
  permissionsConfigured = true
) {
  if (role === "admin") return true;
  if (permissionsConfigured) return !!permissions?.[key];
  if (!role) return false;
  return ROLE_FALLBACK_PERMISSIONS[role]?.includes(key) ?? false;
}

export function firstAllowedRoute(
  role: UserRole,
  permissions?: PermissionMap,
  permissionsConfigured = true
) {
  if (role === "admin") return "/dashboard";
  const routes: Array<[PermissionKey, string]> = [
    ["dashboard", "/dashboard"], ["attendance", "/attendance"], ["bill", "/bill"],
    ["stock", "/stock"], ["labour", "/labour"], ["staff", "/staff"],
    ["salary", "/salary"], ["advance", "/advance"], ["thekedar", "/thekedar"],
    ["reports", "/reports"],
  ];
  const found = routes.find(([key]) => hasModulePermission(role, permissions, key, permissionsConfigured));
  return found?.[1] || "/login";
}

export default function AuthGuard({
  children,
  allowedRoles,
  requiredPermission,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: PermissionKey;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [role, setRole] = useState<UserRole>("attendance");

  useEffect(() => {
    let alive = true;
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        if (alive) setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() || {};
        const userRole = (data.role || "attendance") as UserRole;
        const permissions = (data.permissions || undefined) as PermissionMap | undefined;
        const permissionsConfigured = !!data.permissions && typeof data.permissions === "object";

        if (data.enabled === false) {
          await auth.signOut();
          if (alive) setLoading(false);
          router.replace("/login");
          return;
        }

        if (!alive) return;
        setRole(userRole);

        const roleAllowed = !allowedRoles || allowedRoles.includes(userRole) || userRole === "admin";
        const permissionAllowed = !requiredPermission || hasModulePermission(
          userRole, permissions, requiredPermission, permissionsConfigured
        );

        if (!roleAllowed || !permissionAllowed) {
          router.replace(firstAllowedRoute(userRole, permissions, permissionsConfigured));
          return;
        }

        setAllowed(true);
        setLoading(false);
      } catch {
        if (!alive) return;
        setLoading(false);
        router.replace("/login");
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [router, requiredPermission, allowedRoles]);

  if (loading || !allowed) {
    return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f9ff"}}>Checking secure access…</div>;
  }

  return <>
    <SessionTracker user={auth.currentUser} role={role} />
    {children}
  </>;
}
