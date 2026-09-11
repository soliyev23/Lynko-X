// Bosh sahifa matnlari (uz/ru). Server ham, klient ham shu modulni ishlatadi.

export type Locale = "uz" | "ru";
export const LOCALES: Locale[] = ["uz", "ru"];

// Til tanlash oynasidagi ro'yxat (nomlar o'z tilida yoziladi)
export const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
];
export const LANG_COOKIE = "lynkox_lang";

export function isLocale(v: unknown): v is Locale {
  return v === "uz" || v === "ru";
}

export interface Plan {
  name: string;
  price: string;
  free: boolean;
  tagline: string;
  features: string[];
  highlight: boolean;
}

export interface Content {
  nav: {
    features: string;
    how: string;
    pricing: string;
    login: string;
    open: string;
    menu: string;
    language: string;
    close: string;
    lightMode: string;
    darkMode: string;
  };
  meta: { title: string; description: string };
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
  pricing: {
    title: string;
    subtitle: string;
    period: string;
    start: string;
    popular: string;
    plans: Plan[];
  };
  cta: { title: string; text: string; button: string };
  footer: { tagline: string };
}

export const CONTENT: Record<Locale, Content> = {
  uz: {
    nav: {
      features: "Imkoniyatlar",
      how: "Qanday ishlaydi",
      pricing: "Tariflar",
      login: "Kirish",
      open: "Do'kon ochish",
      menu: "Menyu",
      language: "Sayt tili",
      close: "Yopish",
      lightMode: "Yorug' rejim",
      darkMode: "Qorong'i rejim",
    },
    meta: {
      title: "LYNKO-X — Onlayn-do'kon platformasi",
      description: "O'z onlayn-do'koningizni 5 daqiqada oching: mahsulotlar, dizayn shablonlari, buyurtmalar va tahlil — hammasi LYNKO-X ichida.",
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
      popular: "Eng ommabop",
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
      menu: "Меню",
      language: "Язык сайта",
      close: "Закрыть",
      lightMode: "Светлая тема",
      darkMode: "Тёмная тема",
    },
    meta: {
      title: "LYNKO-X — Платформа интернет-магазинов",
      description: "Откройте интернет-магазин за 5 минут: товары, шаблоны дизайна, заказы и аналитика — всё внутри LYNKO-X.",
    },
    hero: {
      badge: "Создано для рынка Узбекистана",
      title1: "Откройте интернет-магазин",
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
      popular: "Популярный",
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
