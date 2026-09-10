/**
 * Har bir to'lov tizimi (Payme, Click, ...) shu interfeysni amalga oshiradi.
 * Yangi provayder qo'shish = bitta yangi klass + PaymentsModule ro'yxatiga qo'shish.
 */
export interface CreatePaymentResult {
  paymentId: string;
  /** Foydalanuvchi to'lov uchun yo'naltiriladigan sahifa (bo'lsa) */
  redirectUrl?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(order: {
    id: string;
    total: number;
    storeId: string;
  }): Promise<CreatePaymentResult>;
}
