"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Locale = "uz" | "ru";

const uz = {
  dashboard: "Boshqaruv paneli",
  products: "Mahsulotlar",
  orders: "Buyurtmalar",
  settings: "Sozlamalar",
  logout: "Chiqish",
  login: "Kirish",
  register: "Ro'yxatdan o'tish",
  email: "Email",
  password: "Parol",
  yourName: "Ismingiz",
  storeName: "Do'kon nomi",
  storeSlug: "Do'kon manzili (lotincha)",
  noAccount: "Hisobingiz yo'qmi?",
  haveAccount: "Hisobingiz bormi?",
  createStore: "Do'kon ochish",
  totalProducts: "Jami mahsulotlar",
  totalOrders: "Jami buyurtmalar",
  newOrders: "Yangi buyurtmalar",
  revenue: "Tushum",
  viewStore: "Do'konni ko'rish",
  addProduct: "Mahsulot qo'shish",
  name: "Nomi",
  price: "Narx (so'm)",
  comparePrice: "Eski narx (chegirma uchun, ixtiyoriy)",
  stock: "Ombordagi soni",
  category: "Kategoriya",
  noCategory: "Kategoriyasiz",
  description: "Tavsif",
  images: "Rasmlar",
  upload: "Yuklash",
  uploading: "Yuklanmoqda",
  variants: "Variantlar (rang, o'lcham...)",
  addVariant: "Variant qo'shish",
  variantName: "Nomi (masalan: Qizil / L)",
  variantPrice: "Narxi",
  variantHint:
    "Variantlar qo'shilsa, narx va ombor har bir variant bo'yicha yuritiladi. Narx bo'sh qolsa, asosiy narx amal qiladi.",
  active: "Faol (do'konda ko'rinadi)",
  save: "Saqlash",
  saving: "Saqlanmoqda...",
  cancel: "Bekor qilish",
  delete: "O'chirish",
  edit: "Tahrirlash",
  search: "Qidirish...",
  actions: "Amallar",
  empty: "Hozircha bo'sh",
  confirmDelete: "Rostdan o'chirmoqchimisiz?",
  newCategory: "Yangi kategoriya nomi",
  add: "Qo'shish",
  categories: "Kategoriyalar",
  order: "Buyurtma",
  customer: "Xaridor",
  phone: "Telefon",
  address: "Manzil",
  note: "Izoh",
  date: "Sana",
  total: "Jami",
  subtotal: "Mahsulotlar",
  deliveryFee: "Yetkazish narxi (so'm)",
  status: "Holat",
  paymentStatus: "To'lov holati",
  paymentMethod: "To'lov usuli",
  items: "Tarkibi",
  quantity: "Soni",
  storeDescription: "Do'kon tavsifi",
  telegram: "Telegram (@siz)",
  logoUrl: "Logo",
  saved: "Saqlandi",
  loading: "Yuklanmoqda...",
  status_NEW: "Yangi",
  status_CONFIRMED: "Tasdiqlangan",
  status_SHIPPED: "Yo'lda",
  status_DELIVERED: "Yetkazildi",
  status_CANCELLED: "Bekor qilingan",
  pay_PENDING: "Kutilmoqda",
  pay_PAID: "To'langan",
  pay_FAILED: "Xatolik",
  pay_REFUNDED: "Qaytarilgan",
  method_CASH_ON_DELIVERY: "Naqd (yetkazganda)",
  method_ONLINE_MOCK: "Onlayn (test)",
  method_PAYME: "Payme",
  method_CLICK: "Click",
};

const ru: Record<keyof typeof uz, string> = {
  dashboard: "Панель управления",
  products: "Товары",
  orders: "Заказы",
  settings: "Настройки",
  logout: "Выйти",
  login: "Войти",
  register: "Регистрация",
  email: "Email",
  password: "Пароль",
  yourName: "Ваше имя",
  storeName: "Название магазина",
  storeSlug: "Адрес магазина (латиницей)",
  noAccount: "Нет аккаунта?",
  haveAccount: "Уже есть аккаунт?",
  createStore: "Открыть магазин",
  totalProducts: "Всего товаров",
  totalOrders: "Всего заказов",
  newOrders: "Новые заказы",
  revenue: "Выручка",
  viewStore: "Открыть витрину",
  addProduct: "Добавить товар",
  name: "Название",
  price: "Цена (сум)",
  comparePrice: "Старая цена (для скидки, необязательно)",
  stock: "Остаток на складе",
  category: "Категория",
  noCategory: "Без категории",
  description: "Описание",
  images: "Изображения",
  upload: "Загрузить",
  uploading: "Загрузка",
  variants: "Варианты (цвет, размер...)",
  addVariant: "Добавить вариант",
  variantName: "Название (например: Красный / L)",
  variantPrice: "Цена",
  variantHint:
    "Если добавлены варианты, цена и остаток ведутся по каждому варианту. Пустая цена — действует основная.",
  active: "Активен (виден в магазине)",
  save: "Сохранить",
  saving: "Сохранение...",
  cancel: "Отмена",
  delete: "Удалить",
  edit: "Изменить",
  search: "Поиск...",
  actions: "Действия",
  empty: "Пока пусто",
  confirmDelete: "Действительно удалить?",
  newCategory: "Название новой категории",
  add: "Добавить",
  categories: "Категории",
  order: "Заказ",
  customer: "Покупатель",
  phone: "Телефон",
  address: "Адрес",
  note: "Комментарий",
  date: "Дата",
  total: "Итого",
  subtotal: "Товары",
  deliveryFee: "Стоимость доставки (сум)",
  status: "Статус",
  paymentStatus: "Статус оплаты",
  paymentMethod: "Способ оплаты",
  items: "Состав",
  quantity: "Кол-во",
  storeDescription: "Описание магазина",
  telegram: "Telegram (@ваш)",
  logoUrl: "Логотип",
  saved: "Сохранено",
  loading: "Загрузка...",
  status_NEW: "Новый",
  status_CONFIRMED: "Подтверждён",
  status_SHIPPED: "В пути",
  status_DELIVERED: "Доставлен",
  status_CANCELLED: "Отменён",
  pay_PENDING: "Ожидается",
  pay_PAID: "Оплачен",
  pay_FAILED: "Ошибка",
  pay_REFUNDED: "Возврат",
  method_CASH_ON_DELIVERY: "Наличные (при получении)",
  method_ONLINE_MOCK: "Онлайн (тест)",
  method_PAYME: "Payme",
  method_CLICK: "Click",
};

const dictionaries: Record<Locale, typeof uz> = { uz, ru };

export type TKey = keyof typeof uz;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "uz",
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("lynkox_locale") as Locale | null;
    if (saved === "uz" || saved === "ru") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("lynkox_locale", l);
  };

  const t = (key: TKey) => dictionaries[locale][key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
