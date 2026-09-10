/** Tarif rejalari va ularning mahsulot limitlari. */
export const PLAN_LIMITS: Record<string, number> = {
  FREE: 10,
  BASIC: 100,
  PRO: Number.POSITIVE_INFINITY,
};

export const PLANS = ["FREE", "BASIC", "PRO"] as const;
export type Plan = (typeof PLANS)[number];
