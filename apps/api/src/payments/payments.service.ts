import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentProvider } from "./payment-provider";
import { ClickProvider } from "./providers/click.provider";
import { MockProvider } from "./providers/mock.provider";
import { PaymeProvider } from "./providers/payme.provider";

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, PaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    mock: MockProvider,
    payme: PaymeProvider,
    click: ClickProvider,
  ) {
    this.providers = new Map(
      [mock, payme, click].map((p) => [p.name, p]),
    );
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider)
      throw new BadRequestException(`Noma'lum to'lov provayderi: ${name}`);
    return provider;
  }

  /** Mock-provayder callback simulyatsiyasi: to'lovni PAID qiladi. */
  async confirmMockPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment || payment.provider !== "mock")
      throw new NotFoundException("To'lov topilmadi");
    if (payment.status === "PAID") return { ok: true, status: "PAID" };

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", providerTxnId: `mock-${paymentId}` },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "PAID" },
      }),
    ]);
    return { ok: true, status: "PAID" };
  }
}
