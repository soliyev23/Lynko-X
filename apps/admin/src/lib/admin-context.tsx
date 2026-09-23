"use client";

import { createContext, useContext } from "react";

export type AdminRole = "OWNER" | "SUPPORT" | "FINANCE";

export interface AdminMe {
  id: string;
  name: string;
  email: string;
  adminRole: AdminRole;
}

const AdminContext = createContext<AdminMe | null>(null);
export const AdminProvider = AdminContext.Provider;

/** Owner-panel sahifalarida joriy admin va huquqlari */
export function useAdmin() {
  return useContext(AdminContext);
}

/** Huquqlar: OWNER hamma narsa; FINANCE tariflar va to'lovlar; SUPPORT bloklash va izohlar */
export function can(role: AdminRole | null | undefined, what: "billing" | "support" | "team") {
  const r = role ?? "SUPPORT";
  if (r === "OWNER") return true;
  if (what === "billing") return r === "FINANCE";
  if (what === "support") return r === "SUPPORT";
  return false;
}
