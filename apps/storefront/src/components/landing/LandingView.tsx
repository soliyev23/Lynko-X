"use client";

import { useEffect, useState, type CSSProperties } from "react";
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
import LanguageMenu from "@/components/landing/LanguageMenu";
import { Logo } from "@/components/Logo";

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

// .lp-reveal elementlari ko'rinish maydoniga kirganda yumshoq paydo bo'ladi
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lp-reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Header skroll qilinganda soya oladi
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

const delay = (ms: number) => ({ "--lp-delay": `${ms}ms` }) as CSSProperties;
const enter = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

export default function LandingView({ locale }: { locale: Locale }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const c = CONTENT[locale];
  const scrolled = useScrolled();
  useReveal();

  useEffect(() => {
    persistLocale(locale);
    try {
      setDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, [locale]);

  // Til almashganda sahifa to'liq qayta yuklanadi: cookie yoziladi,
  // server sahifani yangi tilda beradi (matnlar joyida almashmaydi).
  function changeLocale(l: Locale) {
    if (l === locale) return;
    persistLocale(l);
    const url = new URL(window.location.href);
    url.searchParams.delete("lang"); // ?lang= cookie'dan ustun, shuning uchun olib tashlanadi
    if (url.href === window.location.href) window.location.reload();
    else window.location.assign(url.href);
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
  const band = "bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950";
  const btnPrimaryBase = `group items-center justify-center gap-2 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${focusRing}`;
  const btnPrimary = `inline-flex ${btnPrimaryBase}`;
  const btnSecondary = `inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:shadow-md motion-safe:hover:-translate-y-0.5 active:translate-y-0 ${focusRing}`;
  const arrow = "transition-transform duration-200 group-hover:translate-x-1";
  const navLink =
    "relative py-1 transition-colors hover:text-gray-900 dark:hover:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-emerald-500 after:transition-transform after:duration-200 hover:after:scale-x-100";
  const iconBtn = `w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 ${focusRing}`;
  const mobileLink = `py-2.5 font-medium ${muted} transition-colors hover:text-emerald-700 dark:hover:text-emerald-400`;
  const footerLink = "transition-colors hover:text-emerald-600 dark:hover:text-emerald-400";
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="overflow-x-clip bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

      {/* Navigatsiya */}
      <header
        className={`sticky top-0 z-30 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b transition-[box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-gray-200 dark:border-gray-800 shadow-md shadow-gray-900/5 dark:shadow-black/30"
            : "border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="LYNKO-X"
            className={`group inline-flex items-center whitespace-nowrap lg:justify-self-start rounded-md ${focusRing}`}
          >
            <Logo size={30} textClassName="text-lg sm:text-xl" />
          </Link>

          {/* Keng ekranda nav aniq markazda turadi (o'rta ustun) */}
          <nav className={`hidden lg:flex items-center gap-8 text-sm font-medium ${muted} lg:justify-self-center`}>
            <a href="#features" className={navLink}>{c.nav.features}</a>
            <a href="#how" className={navLink}>{c.nav.how}</a>
            <a href="#pricing" className={navLink}>{c.nav.pricing}</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
            <LanguageMenu
              locale={locale}
              title={c.nav.language}
              closeLabel={c.nav.close}
              onSelect={changeLocale}
            />
            <button
              onClick={toggleDark}
              aria-label={dark ? c.nav.lightMode : c.nav.darkMode}
              title={dark ? c.nav.lightMode : c.nav.darkMode}
              className={iconBtn}
            >
              {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>
            <a
              href={`${ADMIN_URL}/login`}
              className={`hidden lg:block text-sm font-medium ${muted} transition-colors hover:text-gray-900 dark:hover:text-white px-2 py-2 rounded-md ${focusRing}`}
            >
              {c.nav.login}
            </a>
            <a
              href={`${ADMIN_URL}/register`}
              className={`hidden sm:inline-flex text-sm rounded-lg px-4 py-2 whitespace-nowrap ${btnPrimaryBase}`}
            >
              {c.nav.open}
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={c.nav.menu}
              aria-expanded={menuOpen}
              className={`lg:hidden ${iconBtn}`}
            >
              {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {menuOpen && (
          <div className="lp-drop lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col text-sm">
              <a href="#features" onClick={closeMenu} className={mobileLink}>{c.nav.features}</a>
              <a href="#how" onClick={closeMenu} className={mobileLink}>{c.nav.how}</a>
              <a href="#pricing" onClick={closeMenu} className={mobileLink}>{c.nav.pricing}</a>
              <a href={`${ADMIN_URL}/login`} className={mobileLink}>{c.nav.login}</a>
              <a
                href={`${ADMIN_URL}/register`}
                className={`mt-2 mb-1 rounded-lg px-4 py-2.5 ${btnPrimary}`}
              >
                {c.nav.open}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="lp-grid absolute inset-0" />
          <div className="lp-float absolute left-1/2 -top-32 h-[480px] w-[820px] max-w-[160vw] -translate-x-1/2 rounded-full bg-emerald-400/25 dark:bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-16 md:pb-20 text-center">
          <span
            className="lp-enter inline-flex items-center gap-2 max-w-full text-xs font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-full px-3 py-1.5 mb-6"
            style={enter(0)}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {c.hero.badge}
          </span>
          <h1
            className="lp-enter text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto text-balance break-words"
            style={enter(80)}
          >
            {c.hero.title1}{" "}
            <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{c.hero.accent}</span>
            {c.hero.title2 && ` ${c.hero.title2}`}
          </h1>
          <p className={`lp-enter text-lg md:text-xl ${muted} max-w-2xl mx-auto mt-6 text-pretty`} style={enter(160)}>
            {c.hero.text}
          </p>
          <div className="lp-enter flex flex-col sm:flex-row gap-3 justify-center mt-8" style={enter(240)}>
            <a
              href={`${ADMIN_URL}/register`}
              className={`w-full sm:w-auto sm:min-w-[240px] px-6 py-3.5 ${btnPrimary}`}
            >
              {c.hero.start}
              <ArrowRightIcon size={18} className={arrow} />
            </a>
            <Link href="/demo" className={`w-full sm:w-auto sm:min-w-[240px] px-6 py-3.5 ${btnSecondary}`}>
              {c.hero.demo}
            </Link>
          </div>
          <div
            className="lp-enter flex flex-col items-center sm:flex-row sm:flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500 dark:text-gray-400"
            style={enter(320)}
          >
            {c.hero.bullets.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Imkoniyatlar */}
      <section id="features" className={`${band} scroll-mt-16`}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="lp-reveal text-center">
            <h2 className="text-3xl font-bold text-balance">{c.features.title}</h2>
            <p className={`${muted} mt-3 max-w-2xl mx-auto text-pretty`}>{c.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {c.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="lp-reveal" style={delay((i % 3) * 90)}>
                  <div className="group relative h-full overflow-hidden rounded-2xl p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl hover:shadow-emerald-900/5 dark:hover:shadow-black/40 motion-safe:hover:-translate-y-1">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/0 blur-2xl transition-colors duration-500 group-hover:bg-emerald-400/20"
                    />
                    <div className="relative w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-600/30 motion-safe:group-hover:scale-110">
                      <Icon size={22} />
                    </div>
                    <h3 className="relative font-semibold text-lg transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {f.title}
                    </h3>
                    <p className={`relative ${muted} text-sm mt-2 leading-relaxed min-h-[3lh]`}>{f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-20 scroll-mt-16">
        <h2 className="lp-reveal text-3xl font-bold text-center text-balance">{c.how.title}</h2>
        <div className="relative grid md:grid-cols-3 gap-8 mt-12">
          {/* Qadamlarni bog'lovchi chiziq (faqat keng ekranda) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] border-t-2 border-dashed border-gray-200 dark:border-gray-800"
          />
          {c.how.steps.map((s, i) => (
            <div key={s.title} className="lp-reveal" style={delay(i * 110)}>
              <div className="group h-full text-center rounded-2xl p-6 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="relative w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30 ring-4 ring-white dark:ring-gray-950 transition-transform duration-300 motion-safe:group-hover:scale-110">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {s.title}
                </h3>
                <p className={`${muted} text-sm mt-2 leading-relaxed min-h-[3lh]`}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tariflar */}
      <section id="pricing" className={`${band} scroll-mt-16`}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="lp-reveal text-center">
            <h2 className="text-3xl font-bold text-balance">{c.pricing.title}</h2>
            <p className={`${muted} mt-3 text-pretty`}>{c.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
            {c.pricing.plans.map((p, i) => (
              <div key={p.name} className="lp-reveal" style={delay(i * 110)}>
                <div
                  className={`group relative h-full rounded-2xl border p-7 flex flex-col transition-all duration-300 motion-safe:hover:-translate-y-1 ${
                    p.highlight
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/35 md:scale-[1.02]"
                      : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/40"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold px-3 py-1 shadow-md">
                      {c.pricing.popular}
                    </span>
                  )}
                  <div className={`text-sm font-medium ${p.highlight ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {p.tagline}
                  </div>
                  <div className="text-2xl font-bold mt-1">{p.name}</div>
                  <div className="mt-4 mb-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                    {!p.free && (
                      <span className={`text-sm ${p.highlight ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
                        {c.pricing.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 text-sm flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                            p.highlight
                              ? "bg-white/20 text-white"
                              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <CheckIcon size={11} strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`${ADMIN_URL}/register`}
                    className={`mt-7 block text-center font-semibold rounded-xl py-3 transition-all duration-200 motion-safe:hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md ${focusRing} ${
                      p.highlight
                        ? "bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-white focus-visible:ring-offset-emerald-600"
                        : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    }`}
                  >
                    {c.pricing.start}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="lp-reveal">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gray-900 dark:bg-gray-900 border border-gray-800 px-6 py-14 sm:px-12 text-center text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="lp-grid lp-grid-on-dark absolute inset-0" />
              <div className="absolute -top-28 left-1/2 h-72 w-[560px] max-w-[140vw] -translate-x-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30 flex items-center justify-center mx-auto mb-5">
              <ZapIcon size={24} />
            </div>
            <h2 className="text-3xl font-bold text-balance">{c.cta.title}</h2>
            <p className="text-gray-300 mt-3 max-w-xl mx-auto text-pretty">{c.cta.text}</p>
            <a
              href={`${ADMIN_URL}/register`}
              className={`px-6 py-3.5 mt-8 focus-visible:ring-offset-gray-900 ${btnPrimary}`}
            >
              {c.cta.button}
              <ArrowRightIcon size={18} className={arrow} />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Logo size={22} textClassName="text-base" />
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
            <span>{c.footer.tagline} · 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className={footerLink}>{c.nav.features}</a>
            <a href="#pricing" className={footerLink}>{c.nav.pricing}</a>
            <a href={`${ADMIN_URL}/login`} className={footerLink}>{c.nav.login}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
