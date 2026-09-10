import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePaymentResult, PaymentProvider } from "../payment-provider";

/**
 * Test-provayder: haqiqiy pul o'tmaydi.
 * Payment yozuvi PENDING holatda yaratiladi, keyin
 * POST /payments/mock/:id/confirm chaqirilsa PAID bo'ladi —
 * bu haqiqiy provayderning callback'ini simulyatsiya qiladi.
 */
@Injectable()
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  constructor(private readonly prisma: PrismaService) {}

  async createPayment(order: {
    id: string;
    total: number;
  }): Promise<CreatePaymentResult> {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: this.name,
        amount: order.total,
        status: "PENDING",
      },
    });
    return { paymentId: payment.id };
  }
}
