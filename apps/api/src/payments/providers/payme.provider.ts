import { Injectable, NotImplementedException } from "@nestjs/common";
import { CreatePaymentResult, PaymentProvider } from "../payment-provider";

/**
 * PAYME integratsiyasi uchun tayyor joy.
 *
 * Haqiqiy integratsiya qadamlari (Payme Business merchant hisobi ochilgach):
 * 1. Merchant kabinetidan KASSA_ID va KEY olinadi (env: PAYME_MERCHANT_ID, PAYME_KEY).
 * 2. createPayment: foydalanuvchi checkout.paycom.uz sahifasiga yo'naltiriladi:
 *    https://checkout.paycom.uz/base64({m: MERCHANT_ID, ac.order_id: ..., a: summa_tiyinda})
 *    Diqqat: Payme summani TIYIN'da qabul qiladi (so'm * 100).
 * 3. Payme bizning endpointga JSON-RPC so'rovlar yuboradi (Merchant API):
 *    CheckPerformTransaction, CreateTransaction, PerformTransaction,
 *    CancelTransaction, CheckTransaction, GetStatement.
 *    Ular uchun alohida controller yoziladi (Basic auth: Paycom:KEY).
 * 4. PerformTransaction kelganda: payment.status = PAID, order.paymentStatus = PAID.
 */
@Injectable()
export class PaymeProvider implements PaymentProvider {
  readonly name = "payme";

  async createPayment(_order: {
    id: string;
    total: number;
  }): Promise<CreatePaymentResult> {
    throw new NotImplementedException(
      "Payme hali ulanmagan — merchant hisobi ochilgach PAYME_MERCHANT_ID va PAYME_KEY qo'shiladi",
    );
  }
}
