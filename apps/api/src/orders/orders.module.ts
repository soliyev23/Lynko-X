import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [StoresModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
