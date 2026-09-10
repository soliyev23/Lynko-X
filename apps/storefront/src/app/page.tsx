import Link from "next/link";
import {
  ArrowRightIcon,
  BarChartIcon,
  CheckIcon,
  LayersIcon,
  MessageIcon,
  ShieldIcon,
  SmartphoneIcon,
  StoreIcon,
  ZapIcon,
} from "@/components/icons";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";

const FEATURES = [
  {
    icon: StoreIcon,
    title: "Tayyor onlayn-vitrina",
    text: "Mahsulotlar, savat va buyurtma berish — hammasi tayyor. Kod yozish yoki dizayner yollash shart emas.",
  },
  {
    icon: LayersIcon,
    title: "Rang va o'lcham variantlari",
    text: "Har bir variantga alohida narx va ombor qoldig'i. Tugagan o'lcham avtomatik yopiladi.",
  },
  {
    icon: BarChartIcon,
    title: "Buyurtmalar va statistika",
    text: "Yangi, tasdiqlangan, yo'lda, yetkazildi — buyurtma holatini bir bosishda boshqaring va tushumni kuzating.",
  },
  {
    icon: MessageIcon,
    title: "Telegram bildirishnomalari",
    text: "Har bir yangi buyurtma darhol Telegram'ingizga keladi — xaridorni kutdirmaysiz.",
  },
  {
    icon: SmartphoneIcon,
    title: "Telefonga moslashgan",
    text: "Xaridorlaringizning 90% telefondan kiradi. Vitrina har qanday ekranda chiroyli ochiladi.",
  },
  {
    icon: ShieldIcon,
    title: "Ishonchli va tez",
    text: "Narx va ombor faqat serverda tekshiriladi. Ikki xaridor bir vaqtda oxirgi mahsulotni ololmaydi.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Ro'yxatdan o'ting",
    text: "Ism, email va do'kon nomi — 1 daqiqa. Do'koningiz darhol o'z manzilida ochiladi.",
  },
  {
    n: "2",
    title: "Mahsulot qo'shing",
    text: "Rasm yuklang, narx va o'lchamlarni kiriting. Kategoriyalarga ajrating.",
  },
  {
    n: "3",
    title: "Havolani ulashing",
    text: "Do'kon havolasini Telegram, Instagram yoki vizitkangizga qo'ying va buyurtmalar qabul qiling.",
  },
];

const PLANS = [
  {
    name: "Bepul",
    price: "0",
    period: "",
    tagline: "Boshlash uchun",
    features: ["10 tagacha mahsulot", "Onlayn-vitrina", "Buyurtmalar paneli", "Telegram bildirishnomalar"],
    highlight: false,
  },
  {
    name: "Basic",
    price: "99 000",
    period: "so'm / oy",
    tagline: "O'sayotgan do'konlar uchun",
    features: ["100 tagacha mahsulot", "Variantlar (rang, o'lcham)", "Rasm yuklash", "Ustuvor qo'llab-quvvatlash"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "249 000",
    period: "so'm / oy",
    tagline: "Katta katalog uchun",
    features: ["Cheksiz mahsulotlar", "Basic'dagi hamma narsa", "O'z domeningiz (tez kunda)", "Onlayn to'lov (tez kunda)"],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Navigatsiya */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            LYNKO-X
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">
              Imkoniyatlar
            </a>
            <a href="#how" className="hover:text-gray-900">
              Qanday ishlaydi
            </a>
            <a href="#pricing" className="hover:text-gray-900">
              Tariflar
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={`${ADMIN_URL}/login`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Kirish
            </a>
            <a
              href={`${ADMIN_URL}/register`}
              className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 transition"
            >
              Do'kon ochish
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-6">
          O'zbekiston bozori uchun yaratilgan
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          O'z onlayn-do'koningizni{" "}
          <span className="text-emerald-600">5 daqiqada</span> oching
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-6">
          LYNKO-X — savdogarlar uchun tayyor platforma. Mahsulot qo'shing,
          havolani ulashing, buyurtmalarni Telegram'da qabul qiling. Dasturchi
          kerak emas.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <a
            href={`${ADMIN_URL}/register`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-3.5 transition"
          >
            Bepul boshlash
            <ArrowRightIcon size={18} />
          </a>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-emerald-500 text-gray-700 font-medium rounded-xl px-6 py-3.5 transition"
          >
            Demo do'konni ko'rish
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
          {["Karta talab qilinmaydi", "Kod yozish shart emas", "O'zbek va rus tillarida"].map(
            (item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon size={14} className="text-emerald-600" />
                {item}
              </span>
            ),
          )}
        </div>
      </section>

      {/* Imkoniyatlar */}
      <section id="features" className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center">
            Savdo uchun kerak bo'lgan hamma narsa
          </h2>
          <p className="text-gray-600 text-center mt-3 max-w-2xl mx-auto">
            Shopify darajasidagi imkoniyatlar — O'zbekiston sharoitiga moslab.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center">Qanday ishlaydi</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tariflar */}
      <section id="pricing" className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center">Tariflar</h2>
          <p className="text-gray-600 text-center mt-3">
            Kichik boshlang, o'sganingizda oshiring. Sinov davrida barcha
            tariflar bepul.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-7 flex flex-col ${
                  p.highlight
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`text-sm font-medium ${p.highlight ? "text-emerald-100" : "text-gray-500"}`}
                >
                  {p.tagline}
                </div>
                <div className="text-2xl font-bold mt-1">{p.name}</div>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  {p.period && (
                    <span
                      className={`text-sm ml-2 ${p.highlight ? "text-emerald-100" : "text-gray-500"}`}
                    >
                      {p.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckIcon
                        size={16}
                        className={`shrink-0 mt-0.5 ${p.highlight ? "text-emerald-100" : "text-emerald-600"}`}
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
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Boshlash
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <ZapIcon size={24} />
        </div>
        <h2 className="text-3xl font-bold">Bugun boshlang</h2>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto">
          Birinchi buyurtmangizgacha bir necha daqiqa qoldi. Ro'yxatdan
          o'ting — qolganini LYNKO-X bajaradi.
        </p>
        <a
          href={`${ADMIN_URL}/register`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-3.5 mt-8 transition"
        >
          Do'kon ochish
          <ArrowRightIcon size={18} />
        </a>
      </section>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            <span className="font-bold text-emerald-600">LYNKO-X</span> ·
            O'zbekiston uchun e-commerce platformasi · 2026
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-900">
              Imkoniyatlar
            </a>
            <a href="#pricing" className="hover:text-gray-900">
              Tariflar
            </a>
            <a href={`${ADMIN_URL}/login`} className="hover:text-gray-900">
              Kirish
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
