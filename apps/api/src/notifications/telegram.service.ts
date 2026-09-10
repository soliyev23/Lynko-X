import { Injectable, Logger } from "@nestjs/common";

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Naqd (yetkazganda)",
  ONLINE_MOCK: "Onlayn (test)",
  PAYME: "Payme",
  CLICK: "Click",
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

/**
 * Telegram Bot API orqali sotuvchiga bildirishnoma.
 * Har bir do'kon o'z botini (BotFather) va chat ID'sini sozlamalarda kiritadi.
 * Xatolik buyurtma jarayonini to'xtatmaydi — faqat logga yoziladi.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendMessage(botToken: string, chatId: string, text: string) {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Telegram API ${res.status}: ${body.slice(0, 200)}`);
    }
  }

  async notifyNewOrder(
    store: {
      name: string;
      telegramBotToken: string | null;
      telegramChatId: string | null;
    },
    order: {
      number: number;
      customerName: string;
      phone: string;
      address: string | null;
      note: string | null;
      total: number;
      deliveryFee: number;
      paymentMethod: string;
      items: { name: string; quantity: number; price: number }[];
    },
  ) {
    if (!store.telegramBotToken || !store.telegramChatId) return;

    const lines = [
      `<b>Yangi buyurtma #${order.number}</b> — ${escapeHtml(store.name)}`,
      "",
      `Xaridor: ${escapeHtml(order.customerName)}`,
      `Telefon: ${escapeHtml(order.phone)}`,
      ...(order.address ? [`Manzil: ${escapeHtml(order.address)}`] : []),
      ...(order.note ? [`Izoh: ${escapeHtml(order.note)}`] : []),
      "",
      ...order.items.map(
        (i) =>
          `• ${escapeHtml(i.name)} × ${i.quantity} — ${money(i.price * i.quantity)}`,
      ),
      ...(order.deliveryFee ? [`Yetkazish: ${money(order.deliveryFee)}`] : []),
      "",
      `<b>Jami: ${money(order.total)}</b>`,
      `To'lov: ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}`,
    ];

    try {
      await this.sendMessage(
        store.telegramBotToken,
        store.telegramChatId,
        lines.join("\n"),
      );
    } catch (err: any) {
      this.logger.warn(
        `Telegram xabari yuborilmadi (buyurtma #${order.number}): ${err.message}`,
      );
    }
  }
}
