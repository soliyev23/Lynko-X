"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChartIcon,
  CheckIcon,
  LayersIcon,
  MoonIcon,
  PaletteIcon,
  ShieldIcon,
  SmartphoneIcon,
  StoreIcon,
  SunIcon,
  ZapIcon,
} from "@/components/icons";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";

type Locale = "uz" | "ru";

const FEATURE_ICONS = [
  StoreIcon,
  LayersIcon,
  PaletteIcon,
  BarChartIcon,
  SmartphoneIcon,
  ShieldIcon,
];

interface Plan {
  name: string;
  price: string;
  free: boolean;
  tagline: string;
  features: string[];
  highlight: boolean;
}

interface Content {
  nav: { features: string; how: string; pricing: string; login: string; open: string };
  hero: {
    badge: string;
    title1: string;
    accent: string;
    title2: string;
    text: string;
    start: string;
    demo: string;
    bullets: string[];
  };
  features: { title: string; subtitle: string; items: { title: string; text: string }[] };
  how: { title: string; steps: { title: string; text: string }[] };
  pricing: { title: string; subtitle: string; period: string; start: string; plans: Plan[] };
  cta: { title: string; text: string; button: string };
  footer: { tagline: string };
}

const CONTENT: Record<Locale, Content> = {
  uz: {
    nav: {
      features: "Imkoniyatlar",
      how: "Qanday ishlaydi",
      pricing: "Tariflar",
      login: "Kirish",
      open: "Do'kon ochish",
    },
    hero: {
      badge: "O'zbekiston bozori uchun yaratilgan",
      title1: "O'z onlayn-do'koningizni",
      accent: "5 daqiqada",
      title2: "oching",
      text: "LYNKO-X — savdogarlar uchun tayyor platforma. Mahsulot qo'shing, dizaynni tanlang, havolani ulashing — buyurtmalar to'g'ridan-to'g'ri boshqaruv panelingizga keladi. Dasturchi kerak emas.",
      start: "Bepul boshlash",
      demo: "Demo do'konni ko'rish",
      bullets: ["Karta talab qilinmaydi", "Kod yozish shart emas", "O'zbek va rus tillarida"],
    },
    features: {
      title: "Savdo uchun kerak bo'lgan hamma narsa",
      subtitle: "Professional onlayn-savdo imkoniyatlari — O'zbekiston sharoitiga moslab.",
      items: [
        {
          title: "Tayyor onlayn-vitrina",
          text: "Mahsulotlar, savat va buyurtma berish — hammasi tayyor. Kod yozish yoki dizayner yollash shart emas.",
        },
        {
          title: "Rang va o'lcham variantlari",
          text: "Har bir variantga alohida narx va ombor qoldig'i. Tugagan o'lcham avtomatik yopiladi.",
        },
        {
          title: "5 ta dizayn shabloni",
          text: "Do'koningizga mos ko'rinishni bir bosishda tanlang: Classic, Minimal, Bold, Elegant yoki Market. Banner va logotip yuklang.",
        },
        {
          title: "Buyurtmalar va tahlil",
          text: "Buyurtma holatini bir bosishda boshqaring; tushum dinamikasi, eng ko'p sotilgan mahsulotlar va ombor qoldig'ini kuzating.",
        },
        {
          title: "Telefonga moslashgan",
          text: "Xaridorlaringizning 90% telefondan kiradi. Vitrina har qanday ekranda chiroyli ochiladi.",
        },
        {
          title: "Ishonchli va tez",
          text: "Narx va ombor faqat serverda tekshiriladi. Ikki xaridor bir vaqtda oxirgi mahsulotni ololmaydi.",
        },
      ],
    },
    how: {
      title: "Qanday ishlaydi",
      steps: [
        {
          title: "Ro'yxatdan o'ting",
          text: "Ism, email va do'kon nomi — 1 daqiqa. Do'koningiz darhol o'z manzilida ochiladi.",
        },
        {
          title: "Mahsulot qo'shing",
          text: "Rasm yuklang, narx va o'lchamlarni kiriting. Kategoriyalarga ajrating, dizaynni tanlang.",
        },
        {
          title: "Havolani ulashing",
          text: "Do'kon havolasini ijtimoiy tarmoqlar, vizitka yoki reklamangizga qo'ying — buyurtmalar panelingizga tushadi.",
        },
      ],
    },
    pricing: {
      title: "Tariflar",
      subtitle: "Kichik boshlang, o'sganingizda oshiring. Sinov davrida barcha tariflar bepul.",
      period: "so'm / oy",
      start: "Boshlash",
      plans: [
        {
          name: "Bepul",
          price: "0",
          free: true,
          tagline: "Boshlash uchun",
          features: ["10 tagacha mahsulot", "Onlayn-vitrina", "Buyurtmalar paneli", "5 ta dizayn shabloni"],
          highlight: false,
        },
        {
          name: "Basic",
          price: "99 000",
          free: false,
          tagline: "O'sayotgan do'konlar uchun",
          features: ["100 tagacha mahsulot", "Variantlar (rang, o'lcham)", "Rasm yuklash", "Ustuvor qo'llab-quvvatlash"],
          highlight: true,
        },
        {
          name: "Pro",
          price: "249 000",
          free: false,
          tagline: "Katta katalog uchun",
          features: ["Cheksiz mahsulotlar", "Basic'dagi hamma narsa", "O'z domeningiz (tez kunda)", "Onlayn to'lov (tez kunda)"],
          highlight: false,
        },
      ],
    },
    cta: {
      title: "Bugun boshlang",
      text: "Birinchi buyurtmangizgacha bir necha daqiqa qoldi. Ro'yxatdan o'ting — qolganini LYNKO-X bajaradi.",
      button: "Do'kon ochish",
    },
    footer: { tagline: "O'zbekiston uchun onlayn-savdo platformasi" },
  },
  ru: {
    nav: {
      features: "Возможности",
      how: "Как это работает",
      pricing: "Тарифы",
      login: "Войти",
      open: "Открыть магазин",
    },
    hero: {
      badge: "Создано для рынка Узбекистана",
      title1: "Откройте свой интернет-магазин",
      accent: "за 5 минут",
      title2: "",
      text: "LYNKO-X — готовая платформа для продавцов. Добавьте товары, выберите дизайн, поделитесь ссылкой — заказы приходят прямо в вашу панель управления. Разработчик не нужен.",
      start: "Начать бесплатно",
      demo: "Посмотреть демо-магазин",
      bullets: ["Карта не требуется", "Без программирования", "На узбекском и русском"],
    },
    features: {
      title: "Всё, что нужно для продаж",
      subtitle: "Профессиональные возможности онлайн-торговли — с учётом реалий Узбекистана.",
      items: [
        {
          title: "Готовая витрина",
          text: "Товары, корзина и оформление заказа — всё готово. Не нужно писать код или нанимать дизайнера.",
        },
        {
          title: "Варианты: цвет и размер",
          text: "У каждого варианта своя цена и остаток. Закончившийся размер закрывается автоматически.",
        },
        {
          title: "5 шаблонов дизайна",
          text: "Выберите подходящий вид в один клик: Classic, Minimal, Bold, Elegant или Market. Загрузите баннер и логотип.",
        },
        {
          title: "Заказы и аналитика",
          text: "Управляйте статусом заказа в один клик; следите за выручкой, самыми продаваемыми товарами и остатками.",
        },
        {
          title: "Адаптировано под телефон",
          text: "90% ваших покупателей заходят с телефона. Витрина отлично выглядит на любом экране.",
        },
        {
          title: "Надёжно и быстро",
          text: "Цена и остаток проверяются только на сервере. Два покупателя не смогут купить последний товар одновременно.",
        },
      ],
    },
    how: {
      title: "Как это работает",
      steps: [
        {
          title: "Зарегистрируйтесь",
          text: "Имя, email и название магазина — 1 минута. Магазин сразу откроется по своему адресу.",
        },
        {
          title: "Добавьте товары",
          text: "Загрузите фото, укажите цену и размеры. Разбейте по категориям, выберите дизайн.",
        },
        {
          title: "Поделитесь ссылкой",
          text: "Разместите ссылку на магазин в соцсетях, на визитке или в рекламе — заказы попадут в вашу панель.",
        },
      ],
    },
    pricing: {
      title: "Тарифы",
      subtitle: "Начните с малого, повышайте по мере роста. В тестовый период все тарифы бесплатны.",
      period: "сум / мес",
      start: "Начать",
      plans: [
        {
          name: "Бесплатный",
          price: "0",
          free: true,
          tagline: "Для старта",
          features: ["До 10 товаров", "Онлайн-витрина", "Панель заказов", "5 шаблонов дизайна"],
          highlight: false,
        },
        {
          name: "Basic",
          price: "99 000",
          free: false,
          tagline: "Для растущих магазинов",
          features: ["До 100 товаров", "Варианты (цвет, размер)", "Загрузка фото", "Приоритетная поддержка"],
          highlight: true,
        },
        {
          name: "Pro",
          price: "249 000",
          free: false,
          tagline: "Для большого каталога",
          features: ["Без ограничений по товарам", "Всё из Basic", "Свой домен (скоро)", "Онлайн-оплата (скоро)"],
          highlight: false,
        },
      ],
    },
    cta: {
      title: "Начните сегодня",
      text: "До первого заказа осталось несколько минут. Зарегистрируйтесь — остальное сделает LYNKO-X.",
      button: "Открыть магазин",
    },
    footer: { tagline: "Платформа онлайн-торговли для Узбекистана" },
  },
};

// Sahifa chizilishidan oldin saqlangan rejimni qo'llaydi (yorug'dan qorong'iga "sakrash" bo'lmasin)
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('lynkox_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [dark, setDark] = useState(false);
  const c = CONTENT[locale];

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("lynkox_lang");
      if (savedLang === "uz" || savedLang === "ru") setLocale(savedLang);
      setDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, []);

  function changeLocale(l: Locale) {
    setLocale(l);
    try {
      localStorage.setItem("lynkox_lang", l);
      document.documentElement.lang = l;
    } catch {}
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

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

      {/* Navigatsiya */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            LYNKO-X
          </Link>
          <nav className={`hidden md:flex items-center gap-8 text-sm ${muted}`}>
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white">{c.nav.features}</a>
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white">{c.nav.how}</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white">{c.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
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
              aria-label={dark ? "Light mode" : "Dark mode"}
              className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-emerald-500 transition"
            >
              {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>
            <a
              href={`${ADMIN_URL}/login`}
              className={`hidden sm:block text-sm font-medium ${muted} hover:text-gray-900 dark:hover:text-white px-2 py-2`}
            >
              {c.nav.login}
            </a>
            <a
              href={`${ADMIN_URL}/register`}
              className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 transition whitespace-nowrap"
            >
              {c.nav.open}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-full px-3 py-1 mb-6">
          {c.hero.badge}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          {c.hero.title1}{" "}
          <span className="text-emerald-600 dark:text-emerald-400">{c.hero.accent}</span>
          {c.hero.title2 && ` ${c.hero.title2}`}
        </h1>
        <p className={`text-lg md:text-xl ${muted} max-w-2xl mx-auto mt-6`}>{c.hero.text}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <a
            href={`${ADMIN_URL}/register`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-3.5 transition"
          >
            {c.hero.start}
            <ArrowRightIcon size={18} />
          </a>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-200 font-medium rounded-xl px-6 py-3.5 transition"
          >
            {c.hero.demo}
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500 dark:text-gray-400">
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
          <h2 className="text-3xl font-bold text-center">{c.features.title}</h2>
          <p className={`${muted} text-center mt-3 max-w-2xl mx-auto`}>{c.features.subtitle}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {c.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className={`${card} rounded-2xl p-6`}>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className={`${muted} text-sm mt-2 leading-relaxed`}>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center">{c.how.title}</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {c.how.steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className={`${muted} text-sm mt-2 leading-relaxed`}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tariflar */}
      <section id="pricing" className={band}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center">{c.pricing.title}</h2>
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
        <h2 className="text-3xl font-bold">{c.cta.title}</h2>
        <p className={`${muted} mt-3 max-w-xl mx-auto`}>{c.cta.text}</p>
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
