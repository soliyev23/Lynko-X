import type { Metadata } from "next";
import { cookies } from "next/headers";
import LandingView from "@/components/landing/LandingView";
import { CONTENT, LANG_COOKIE, isLocale, type Locale } from "@/lib/landing-content";

type Search = Promise<{ lang?: string | string[] }>;

// Til: ?lang= parametri > cookie > o'zbekcha. Server darhol shu tilda render qiladi,
// shuning uchun sahifa ochilganda til "sakramaydi".
async function resolveLocale(searchParams: Search): Promise<Locale> {
  const { lang } = await searchParams;
  const fromQuery = Array.isArray(lang) ? lang[0] : lang;
  if (isLocale(fromQuery)) return fromQuery;
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return isLocale(saved) ? saved : "uz";
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { meta } = CONTENT[await resolveLocale(searchParams)];
  return { title: meta.title, description: meta.description };
}

export default async function LandingPage({ searchParams }: { searchParams: Search }) {
  const locale = await resolveLocale(searchParams);
  return <LandingView initialLocale={locale} />;
}
