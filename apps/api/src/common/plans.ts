/** Tarif rejalari: limitlar, narxlar va obuna holati. */
export const PLANS = ["FREE", "BASIC", "PRO"] as const;
export type Plan = (typeof PLANS)[number];
export const PAID_PLANS: Plan[] = ["BASIC", "PRO"];

/** Mahsulot limiti (vitrinada ko'rinadigan va qo'shish mumkin bo'lgan soni). */
export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 10,
  BASIC: 100,
  PRO: Number.POSITIVE_INFINITY,
};

/** Oylik narx, so'mda (bosh sahifadagi tariflar bilan bir xil). */
export const PLAN_PRICES: Record<Plan, number> = {
  FREE: 0,
  BASIC: 99_000,
  PRO: 249_000,
};

/** Yangi do'konga beriladigan sinov: shu tarif, shuncha kun. */
export const TRIAL_PLAN: Plan = "PRO";
export const TRIAL_DAYS = 14;

/** "Muddati tugayapti" ro'yxati uchun oyna (kun). */
export const EXPIRING_SOON_DAYS = 7;

export type SubscriptionStatus = "FREE" | "TRIAL" | "ACTIVE" | "EXPIRED";

export interface SubscriptionSource {
  plan: string;
  planExpiresAt: Date | null;
  isTrial: boolean;
}

export interface SubscriptionInfo {
  /** Adminda belgilangan tarif */
  plan: Plan;
  /** Amalda ishlayotgan tarif: muddati o'tgan bo'lsa FREE */
  effectivePlan: Plan;
  status: SubscriptionStatus;
  isTrial: boolean;
  expiresAt: Date | null;
  /** Qolgan kunlar; muddatsiz bo'lsa null, o'tgan bo'lsa 0 */
  daysLeft: number | null;
  /** Amaldagi mahsulot limiti; cheksiz bo'lsa null */
  limit: number | null;
  /** Belgilangan tarifning oylik narxi */
  price: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function isPlan(v: unknown): v is Plan {
  return typeof v === "string" && (PLANS as readonly string[]).includes(v);
}

export function planLimit(plan: string): number | null {
  const limit = isPlan(plan) ? PLAN_LIMITS[plan] : PLAN_LIMITS.FREE;
  return Number.isFinite(limit) ? limit : null;
}

export function isExpired(store: SubscriptionSource, now = new Date()): boolean {
  return (
    store.plan !== "FREE" &&
    store.planExpiresAt != null &&
    store.planExpiresAt.getTime() <= now.getTime()
  );
}

/** Muddati o'tgan pullik tarif amalda FREE hisoblanadi. */
export function effectivePlan(store: SubscriptionSource, now = new Date()): Plan {
  const plan = isPlan(store.plan) ? store.plan : "FREE";
  return isExpired(store, now) ? "FREE" : plan;
}

export function subscriptionInfo(
  store: SubscriptionSource,
  now = new Date(),
): SubscriptionInfo {
  const plan = isPlan(store.plan) ? store.plan : "FREE";
  const effective = effectivePlan(store, now);
  const expiresAt = plan === "FREE" ? null : store.planExpiresAt;
  let status: SubscriptionStatus = "FREE";
  let daysLeft: number | null = null;
  if (plan !== "FREE") {
    if (expiresAt == null) status = "ACTIVE";
    else if (expiresAt.getTime() <= now.getTime()) {
      status = "EXPIRED";
      daysLeft = 0;
    } else {
      status = store.isTrial ? "TRIAL" : "ACTIVE";
      daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS);
    }
  }
  return {
    plan,
    effectivePlan: effective,
    status,
    isTrial: status === "TRIAL",
    expiresAt,
    daysLeft,
    limit: planLimit(effective),
    price: PLAN_PRICES[plan],
  };
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Kalendar oylar qo'shadi (31-yanvar + 1 oy = 28/29-fevral). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/** Ro'yxatdan o'tganda beriladigan sinov obunasi. */
export function trialSubscription(now = new Date()) {
  return {
    plan: TRIAL_PLAN,
    isTrial: true,
    planExpiresAt: addDays(now, TRIAL_DAYS),
  };
}
