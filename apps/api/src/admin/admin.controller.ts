import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";
import { AdminUpdateStoreDto } from "./dto";

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

  @Get("users")
  users(@Query("search") search?: string) {
    return this.admin.listUsers(search);
  }
}
