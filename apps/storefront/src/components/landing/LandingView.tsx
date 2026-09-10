"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChartIcon,
  CheckIcon,
  LayersIcon,
  MenuIcon,
  MoonIcon,
  PaletteIcon,
  ShieldIcon,
  SmartphoneIcon,
  StoreIcon,
  SunIcon,
  XIcon,
  ZapIcon,
} from "@/components/icons";
import { CONTENT, LANG_COOKIE, type Locale } from "@/lib/landing-content";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";

const FEATURE_ICONS = [
  StoreIcon,
  LayersIcon,
  PaletteIcon,
  BarChartIcon,
  SmartphoneIcon,
  ShieldIcon,
];


// Sahifa chizilishidan oldin saqlangan rejimni qo'llaydi (yorug'dan qorong'iga "sakrash" bo'lmasin)
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('lynkox_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

// Tanlangan til cookie'da saqlanadi: keyingi ochilishda server darhol shu tilda render qiladi
function persistLocale(l: Locale) {
  try {
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LANG_COOKIE, l);
    document.documentElement.lang = l;
  } catch {}
}

const FADE_MS = 160;

export default function LandingView({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const c = CONTENT[locale];

  useEffect(() => {
    persistLocale(initialLocale);
    try {
      setDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, [initialLocale]);

  function changeLocale(l: Locale) {
    if (l === locale) return;
    persistLocale(l);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setLocale(l);
      return;
    }
    // View Transitions: eski va yangi ko'rinish o'rtasida yumshoq crossfade
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => {
        flushSync(() => setLocale(l));
      });
      return;
    }
    // Qo'llamaydigan brauzerlar: qisqa so'nish, keyin almashtirish
    setFading(true);
    window.setTimeout(() => {
      setLocale(l);
      setFading(false);
    }, FADE_MS);
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("lynkox_theme", next ? "dark" : "light");
    } catch {}
  }

  const muted = "text-gray-600 dark:text-gray-400";
  const card = "bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800";
  const band = "bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800";
  const navLink = "hover:text-gray-900 dark:hover:text-white transition-colors";
  const mobileLink = `py-2.5 font-medium ${muted} hover:text-gray-900 dark:hover:text-white`;
  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      className={`overflow-x-clip bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-[opacity,background-color,color] duration-150 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

      {/* Navigatsiya */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 lg:justify-self-start"
          >
            LYNKO-X
          </Link>

          {/* Keng ekranda nav aniq markazda turadi (o'rta ustun) */}
          <nav className={`hidden lg:flex items-center gap-8 text-sm ${muted} lg:justify-self-center`}>
            <a href="#features" className={navLink}>{c.nav.features}</a>
            <a href="#how" className={navLink}>{c.nav.how}</a>
            <a href="#pricing" className={navLink}>{c.nav.pricing}</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 text-xs font-semibold">
              {(["uz", "ru"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => changeLocale(l)}
                  className={`px-2 py-1 rounded-md uppercase transition ${
                    locale === l
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={toggleDark}
              aria-label={dark ? c.nav.lightMode : c.nav.darkMode}
              title={dark ? c.nav.lightMode : c.nav.darkMode}
              className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-emerald-500 transition"
            >
              {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>
            <a
              href={`${ADMIN_URL}/login`}
              className={`hidden lg:block text-sm font-medium ${muted} hover:text-gray-900 dark:hover:text-white px-2 py-2`}
            >
              {c.nav.login}
            </a>
            <a
              href={`${ADMIN_URL}/register`}
              className="hidden sm:inline-flex text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 transition whitespace-nowrap"
            >
              {c.nav.open}
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={c.nav.menu}
              aria-expanded={menuOpen}
              className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-emerald-500 transition"
            >
              {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col text-sm">
              <a href="#features" onClick={closeMenu} className={mobileLink}>{c.nav.features}</a>
              <a href="#how" onClick={closeMenu} className={mobileLink}>{c.nav.how}</a>
              <a href="#pricing" onClick={closeMenu} className={mobileLink}>{c.nav.pricing}</a>
              <a href={`${ADMIN_URL}/login`} className={mobileLink}>{c.nav.login}</a>
              <a
                href={`${ADMIN_URL}/register`}
                className="mt-2 mb-1 text-center font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 transition"
              >
                {c.nav.open}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-16 md:pb-20 text-center">
        <span className="inline-block max-w-full text-xs font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-full px-3 py-1 mb-6">
          {c.hero.badge}
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto text-balance break-words">
          {c.hero.title1}{" "}
          <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{c.hero.accent}</span>
          {c.hero.title2 && ` ${c.hero.title2}`}
        </h1>
        <p className={`text-lg md:text-xl ${muted} max-w-2xl mx-auto mt-6 text-pretty`}>{c.hero.text}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a
            href={`${ADMIN_URL}/register`}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[240px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-3.5 transition"
          >
            {c.hero.start}
            <ArrowRightIcon size={18} />
          </a>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[240px] border border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-200 font-medium rounded-xl px-6 py-3.5 transition"
          >
            {c.hero.demo}
          </Link>
        </div>
        <div className="flex flex-col items-center sm:flex-row sm:flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500 dark:text-gray-400">
          {c.hero.bullets.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <CheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Imkoniyatlar */}
      <section id="features" className={band}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-balance">{c.features.title}</h2>
          <p className={`${muted} text-center mt-3 max-w-2xl mx-auto text-pretty`}>{c.features.subtitle}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {c.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className={`${card} rounded-2xl p-6`}>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className={`${muted} text-sm mt-2 leading-relaxed min-h-[3lh]`}>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-balance">{c.how.title}</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {c.how.steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className={`${muted} text-sm mt-2 leading-relaxed min-h-[3lh]`}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tariflar */}
      <section id="pricing" className={band}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-balance">{c.pricing.title}</h2>
          <p className={`${muted} text-center mt-3`}>{c.pricing.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
            {c.pricing.plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-7 flex flex-col ${
                  p.highlight
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                    : card
                }`}
              >
                <div className={`text-sm font-medium ${p.highlight ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {p.tagline}
                </div>
                <div className="text-2xl font-bold mt-1">{p.name}</div>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  {!p.free && (
                    <span className={`text-sm ml-2 ${p.highlight ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
                      {c.pricing.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckIcon
                        size={16}
                        className={`shrink-0 mt-0.5 ${p.highlight ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${ADMIN_URL}/register`}
                  className={`mt-7 block text-center font-semibold rounded-xl py-3 transition ${
                    p.highlight
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  }`}
                >
                  {c.pricing.start}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5">
          <ZapIcon size={24} />
        </div>
        <h2 className="text-3xl font-bold text-balance">{c.cta.title}</h2>
        <p className={`${muted} mt-3 max-w-xl mx-auto text-pretty`}>{c.cta.text}</p>
        <a
          href={`${ADMIN_URL}/register`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-3.5 mt-8 transition"
        >
          {c.cta.button}
          <ArrowRightIcon size={18} />
        </a>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">LYNKO-X</span> · {c.footer.tagline} · 2026
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white">{c.nav.features}</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white">{c.nav.pricing}</a>
            <a href={`${ADMIN_URL}/login`} className="hover:text-gray-900 dark:hover:text-white">{c.nav.login}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
