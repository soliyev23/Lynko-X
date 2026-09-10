"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateTime } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "MERCHANT" | "ADMIN";
  createdAt: string;
  stores: { slug: string; name: string }[];
}

export default function PlatformUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserRow[] | null>(null);

  useEffect(() => {
    api<UserRow[]>("/admin/users").then(setUsers).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("users")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("email")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("role")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("stores")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t(`role_${u.role}` as TKey)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.stores.length === 0 ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    u.stores.map((s) => (
                      <a
                        key={s.slug}
                        href={`http://localhost:3001/${s.slug}`}
                        target="_blank"
                        className="text-indigo-600 hover:underline mr-2"
                      >
                        {s.name}
                      </a>
                    ))
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {dateTime(u.createdAt)}
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
