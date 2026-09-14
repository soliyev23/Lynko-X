import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard, AuthUser, CurrentUser } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";
import { AddPlanPaymentDto, AdminUpdateStoreDto } from "./dto";

@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("analytics")
  analytics() {
    return this.admin.analytics();
  }

  @Get("billing")
  billing() {
    return this.admin.billing();
  }

  @Get("stores")
  stores(@Query("search") search?: string) {
    return this.admin.listStores(search);
  }

  @Get("stores/:id")
  store(@Param("id") id: string) {
    return this.admin.getStore(id);
  }

  @Patch("stores/:id")
  updateStore(@Param("id") id: string, @Body() dto: AdminUpdateStoreDto) {
    return this.admin.updateStore(id, dto);
  }

  @Post("stores/:id/payments")
  addPayment(
    @Param("id") id: string,
    @Body() dto: AddPlanPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.admin.addPayment(id, dto, user.userId);
  }

  @Delete("stores/:id/payments/:paymentId")
  deletePayment(@Param("id") id: string, @Param("paymentId") paymentId: string) {
    return this.admin.deletePayment(id, paymentId);
  }

  @Get("users")
  users(@Query("search") search?: string) {
    return this.admin.listUsers(search);
  }
}
