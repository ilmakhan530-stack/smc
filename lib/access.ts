export type PermissionKey =
  | "dashboard" | "labour" | "staff" | "attendance" | "salary"
  | "advance" | "thekedar" | "bill" | "stock" | "reports";

export type UserPermissions = Partial<Record<PermissionKey, boolean>>;

export const MODULE_ROUTES: Record<PermissionKey, string> = {
  dashboard: "/dashboard",
  labour: "/labour",
  staff: "/staff",
  attendance: "/attendance",
  salary: "/salary",
  advance: "/advance",
  thekedar: "/thekedar",
  bill: "/bill",
  stock: "/stock",
  reports: "/reports",
};

export const MODULE_ORDER: PermissionKey[] = [
  "dashboard", "bill", "stock", "attendance", "labour", "staff",
  "salary", "advance", "thekedar", "reports",
];

export function hasPermission(
  role: string | undefined,
  permissions: UserPermissions | undefined,
  module: PermissionKey
) {
  if (role === "admin") return true;
  if (permissions && Object.keys(permissions).length > 0) return permissions[module] === true;
  // Backward compatibility only for old profiles created before permissions existed.
  return role === module;
}

export function firstAllowedRoute(role: string | undefined, permissions?: UserPermissions) {
  if (role === "admin") return "/dashboard";
  const key = MODULE_ORDER.find((m) => hasPermission(role, permissions, m));
  return key ? MODULE_ROUTES[key] : null;
}

export function moduleFromPath(pathname: string): PermissionKey | null {
  const match = Object.entries(MODULE_ROUTES).find(([, route]) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  return (match?.[0] as PermissionKey | undefined) || null;
}
