import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { ClickProvider } from "./providers/click.provider";
import { MockProvider } from "./providers/mock.provider";
import { PaymeProvider } from "./providers/payme.provider";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MockProvider, PaymeProvider, ClickProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
