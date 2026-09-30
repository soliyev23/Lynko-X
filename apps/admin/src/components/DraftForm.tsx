"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { dateTime, money, tpl } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { Alert, Badge, Button, Field, Input } from "@/components/ui";
import {
  ArrowLeftIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  variants: { id: string; name: string; price: number | null; stock: number }[];
}

/** Sotiladigan birlik: variantli mahsulotda har bir variant alohida */
interface Option {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  stock: number;
  image: string | null;
}

interface DraftItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  image: string | null;
}

export interface DraftData {
  id: string;
  number: number;
  status: "OPEN" | "COMPLETED";
  customerName: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  deliveryFee: number;
  items: DraftItem[];
  order: { id: string; number: number } | null;
  subtotal: number;
  total: number;
  createdAt: string;
}

function sameLine(a: DraftItem, b: { productId: string; variantId: string | null }) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

function Thumb({ image }: { image: string | null }) {
  return image ? (
    <img src={image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
      <PackageIcon size={18} />
    </span>
  );
}

/**
 * Qoralama formasi: yangi (draft=null) va mavjud qoralama uchun bitta komponent.
 * Mahsulotlar qidiruvdan tanlanadi; narx va qoldiq sotuvchining mahsulot ro'yxatidan olinadi.
 */
export function DraftForm({ draft }: { draft: DraftData | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const readOnly = draft?.status === "COMPLETED";

  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [items, setItems] = useState<DraftItem[]>(draft?.items ?? []);
  const [form, setForm] = useState({
    customerName: draft?.customerName ?? "",
    phone: draft?.phone ?? "",
    address: draft?.address ?? "",
    note: draft?.note ?? "",
    deliveryFee: draft ? String(draft.deliveryFee) : "",
  });
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState<"save" | "complete" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    api<ProductRow[]>("/products").then(setProducts).catch(console.error);
    if (!draft) {
      // Yangi qoralamada yetkazish narxi do'kon sozlamasidan olinadi
      api<{ deliveryFee: number }>("/store")
        .then((s) => setForm((f) => ({ ...f, deliveryFee: String(s.deliveryFee) })))
        .catch(() => undefined);
    }
  }, [draft]);

  const options = useMemo<Option[]>(
    () =>
      (products ?? []).flatMap((p): Option[] =>
        p.variants.length > 0
          ? p.variants.map((v) => ({
              key: `${p.id}:${v.id}`,
              productId: p.id,
              variantId: v.id,
              name: p.name,
              variantName: v.name,
              price: v.price ?? p.price,
              stock: v.stock,
              image: p.images[0] ?? null,
            }))
          : [
              {
                key: p.id,
                productId: p.id,
                variantId: null,
                name: p.name,
                variantName: null,
                price: p.price,
                stock: p.stock,
                image: p.images[0] ?? null,
              },
            ],
      ),
    [products],
  );
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => `${o.name} ${o.variantName ?? ""}`.toLowerCase().includes(q))
    : options;
  const stockOf = (it: DraftItem) => options.find((o) => sameLine(it, o))?.stock;

  function addItem(o: Option) {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, o));
      if (existing) {
        return prev.map((i) => (sameLine(i, o) ? { ...i, quantity: Math.min(i.quantity + 1, o.stock) } : i));
      }
      return [
        ...prev,
        {
          productId: o.productId,
          variantId: o.variantId,
          name: o.name,
          variantName: o.variantName,
          price: o.price,
          quantity: 1,
          image: o.image,
        },
      ];
    });
    setQuery("");
    setPickerOpen(false);
  }
  function setQty(it: DraftItem, quantity: number) {
    const max = stockOf(it) ?? 9999;
    const next = Math.max(1, Math.min(quantity, max));
    setItems((prev) => prev.map((i) => (sameLine(i, it) ? { ...i, quantity: next } : i)));
  }
  function removeItem(it: DraftItem) {
    setItems((prev) => prev.filter((i) => !sameLine(i, it)));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const fee = Number(form.deliveryFee) || 0;
  const total = subtotal + fee;

  async function save() {
    const body = {
      customerName: form.customerName || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      note: form.note || undefined,
      deliveryFee: fee,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        quantity: i.quantity,
      })),
    };
    return draft
      ? api<DraftData>(`/drafts/${draft.id}`, { method: "PATCH", body: JSON.stringify(body) })
      : api<DraftData>("/drafts", { method: "POST", body: JSON.stringify(body) });
  }

  async function onSave() {
    setError("");
    setBusy("save");
    try {
      const saved = await save();
      if (!draft) {
        router.replace(`/orders/drafts/${saved.id}`);
        return;
      }
      setItems(saved.items);
      setFlash(t("saved"));
      setTimeout(() => setFlash(""), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function onComplete() {
    setError("");
    if (items.length === 0) return setError(t("draftNeedItems"));
    if (form.customerName.trim().length < 2 || form.phone.replace(/\D/g, "").length < 7) {
      return setError(t("draftNeedCustomer"));
    }
    setBusy("complete");
    try {
      const saved = await save();
      const res = await api<{ orderId: string }>(`/drafts/${saved.id}/complete`, {
        method: "POST",
        body: JSON.stringify({ paid }),
      });
      router.push(`/orders/${res.orderId}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!draft || !window.confirm(t("deleteDraftConfirm"))) return;
    setBusy("delete");
    try {
      await api(`/drafts/${draft.id}`, { method: "DELETE" });
      router.push("/orders/drafts");
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    disabled: readOnly,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/orders/drafts"
            aria-label={t("backToDrafts")}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <h1 className="truncate text-xl font-bold">{draft ? `${t("draft")} #D${draft.number}` : t("newDraft")}</h1>
          {draft && (
            <Badge tone={readOnly ? "success" : "primary"}>{readOnly ? t("draftCompleted") : t("draftOpen")}</Badge>
          )}
          {draft && <span className="hidden text-sm text-gray-400 sm:inline">{dateTime(draft.createdAt)}</span>}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {draft && (
              <Button variant="danger" onClick={onDelete} disabled={busy !== null}>
                {t("delete")}
              </Button>
            )}
            <Button variant="secondary" onClick={onSave} disabled={busy !== null}>
              {busy === "save" ? t("saving") : t("save")}
            </Button>
          </div>
        )}
      </div>

      {readOnly && draft?.order && (
        <Alert tone="success" className="mb-6">
          {t("draftConverted")}:{" "}
          <Link href={`/orders/${draft.order.id}`} className="font-semibold underline">
            #{draft.order.number}
          </Link>
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}
      {flash && (
        <Alert tone="success" className="mb-6">
          {flash}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Mahsulotlar */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="font-semibold text-gray-900">{t("products")}</h2>
            {!readOnly && (
              <div className="relative mt-3">
                <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPickerOpen(true);
                  }}
                  onFocus={() => setPickerOpen(true)}
                  placeholder={t("searchProducts")}
                  className="pl-9"
                />
                {pickerOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
                      <span>{products ? tpl(t("itemsCount"), { n: filtered.length }) : t("loading")}</span>
                      <button type="button" onClick={() => setPickerOpen(false)} className="font-medium hover:text-gray-900">
                        {t("closeList")}
                      </button>
                    </div>
                    {products && filtered.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-gray-500">{t("noProductsFound")}</p>
                    )}
                    {filtered.slice(0, 60).map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        disabled={o.stock <= 0}
                        onClick={() => addItem(o)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Thumb image={o.image} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {o.name}
                            {o.variantName ? ` / ${o.variantName}` : ""}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {o.stock > 0 ? tpl(t("inStockCount"), { n: o.stock }) : t("outOfStockShort")}
                          </span>
                        </span>
                        <span className="text-sm font-medium text-gray-700">{money(o.price)}</span>
                        <PlusIcon size={16} className="text-primary-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                {t("draftNoItems")}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {items.map((it) => {
                  const stock = stockOf(it);
                  return (
                    <li key={`${it.productId}:${it.variantId ?? ""}`} className="flex items-center gap-3 py-3">
                      <Thumb image={it.image} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {it.name}
                          {it.variantName ? ` / ${it.variantName}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {money(it.price)}
                          {stock != null && ` · ${tpl(t("inStockCount"), { n: stock })}`}
                        </div>
                      </div>
                      {readOnly ? (
                        <span className="text-sm text-gray-700">× {it.quantity}</span>
                      ) : (
                        <div className="flex items-center rounded-lg border border-gray-300">
                          <button
                            type="button"
                            onClick={() => setQty(it, it.quantity - 1)}
                            className="px-2 py-1.5 text-gray-600 hover:bg-gray-100"
                            aria-label="-1"
                          >
                            <MinusIcon size={14} />
                          </button>
                          <input
                            value={it.quantity}
                            inputMode="numeric"
                            onChange={(e) => setQty(it, Number(e.target.value) || 1)}
                            className="w-12 border-x border-gray-300 bg-transparent py-1.5 text-center text-sm"
                            aria-label={t("quantity")}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(it, it.quantity + 1)}
                            className="px-2 py-1.5 text-gray-600 hover:bg-gray-100"
                            aria-label="+1"
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                      )}
                      <span className="w-28 text-right text-sm font-semibold text-gray-900">{money(it.price * it.quantity)}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => removeItem(it)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600"
                          aria-label={t("delete")}
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Xaridor */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="font-semibold text-gray-900">{t("customer")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("customerNameLabel")}>
                <Input {...field("customerName")} />
              </Field>
              <Field label={t("phone")}>
                <Input type="tel" placeholder="+998 90 123 45 67" {...field("phone")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t("address")}>
                  <Input {...field("address")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={t("note")}>
                  <textarea
                    rows={2}
                    {...field("note")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none disabled:bg-gray-50"
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* Jami va harakat */}
        <aside>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-4">
            <h2 className="font-semibold text-gray-900">{t("total")}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t("subtotal")}</dt>
                <dd className="text-gray-900">{money(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">{t("deliveryShort")}</dt>
                <dd className="text-gray-900">
                  {readOnly ? (
                    money(fee)
                  ) : (
                    <Input type="number" min={0} {...field("deliveryFee")} className="w-32 text-right" />
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
                <dt className="text-gray-900">{t("total")}</dt>
                <dd className="text-gray-900">{money(total)}</dd>
              </div>
            </dl>
            {!readOnly && (
              <div className="mt-5 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    className="h-4 w-4 accent-primary-600"
                  />
                  {t("paymentReceived")}
                </label>
                <Button variant="primary" className="w-full" onClick={onComplete} disabled={busy !== null}>
                  {busy === "complete" ? t("saving") : t("createOrder")}
                </Button>
                <p className="text-xs leading-relaxed text-gray-500">{t("draftHint")}</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
