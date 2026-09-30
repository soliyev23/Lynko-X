import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CheckoutsController } from "./checkouts.controller";
import { CheckoutsService } from "./checkouts.service";
import { DraftsController } from "./drafts.controller";
import { DraftsService } from "./drafts.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [StoresModule],
  controllers: [OrdersController, DraftsController, CheckoutsController],
  providers: [OrdersService, DraftsService, CheckoutsService],
})
export class OrdersModule {}
