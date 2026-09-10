import { Injectable, NotImplementedException } from "@nestjs/common";
import { CreatePaymentResult, PaymentProvider } from "../payment-provider";

/**
 * CLICK integratsiyasi uchun tayyor joy.
 *
 * Haqiqiy integratsiya qadamlari (Click merchant hisobi ochilgach):
 * 1. merchant_id, service_id, secret_key olinadi (env orqali saqlanadi).
 * 2. createPayment: foydalanuvchi my.click.uz to'lov sahifasiga yo'naltiriladi:
 *    https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param={orderId}
 * 3. Click bizning endpointlarga ikki bosqichli so'rov yuboradi (SHOP-API):
 *    action=0 (Prepare) va action=1 (Complete), sign_string md5 bilan tekshiriladi.
 * 4. Complete muvaffaqiyatli kelganda: payment.status = PAID, order.paymentStatus = PAID.
 */
@Injectable()
export class ClickProvider implements PaymentProvider {
  readonly name = "click";

  async createPayment(_order: {
    id: string;
    total: number;
  }): Promise<CreatePaymentResult> {
    throw new NotImplementedException(
      "Click hali ulanmagan — merchant hisobi ochilgach kalitlar qo'shiladi",
    );
  }
}
