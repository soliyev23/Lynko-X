import { Controller, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Test to'lovini tasdiqlash (haqiqiy provayder callback'i o'rnida). */
  @Post("mock/:id/confirm")
  confirmMock(@Param("id") id: string) {
    return this.payments.confirmMockPayment(id);
  }
}
