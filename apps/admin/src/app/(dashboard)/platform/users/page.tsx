"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { EmptyRow } from "@/components/EmptyState";
import { SearchIcon } from "@/components/icons";
import { TeamPanel } from "@/components/TeamPanel";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "MERCHANT" | "ADMIN";
  createdAt: string;
  stores: {
    id: string;
    slug: string;
    name: string;
    plan: string;
    isActive: boolean;
    _count: { orders: number };
  }[];
}

export default function PlatformUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [search, setSearch] = useState("");

  async function load(q = "") {
    setUsers(await api<UserRow[]>(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`));
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("users")}</h1>
      <TeamPanel />
      <h2 className="font-semibold mb-3">{t("merchantsTab")}</h2>
      <div className="relative mb-4 max-w-sm">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder={t("search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            load(e.target.value);
          }}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 bg-white"
        />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("email")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("role")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("stores")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("registered")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"}`}>
                    {t(`role_${u.role}` as TKey)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.stores.length === 0 ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {u.stores.map((s) => (
                        <Link
                          key={s.id}
                          href={`/platform/stores/${s.id}`}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs hover:border-primary-400 ${s.isActive ? "border-gray-200" : "border-error-200 bg-error-50"}`}
                        >
                          <span className="font-medium text-primary-600">{s.name}</span>
                          <span className="text-gray-400">{t(`plan_${s.plan}` as TKey)} · {s._count.orders} {t("ordersCount")}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(u.createdAt)}</td>
              </tr>
            ))}
            {users?.length === 0 && (
              <EmptyRow colSpan={5} kind="users" title={t("emptyUsersTitle")} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
