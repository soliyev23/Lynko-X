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

  @Get("stores")
  stores(@Query("search") search?: string) {
    return this.admin.listStores(search);
  }

  @Patch("stores/:id")
  updateStore(@Param("id") id: string, @Body() dto: AdminUpdateStoreDto) {
    return this.admin.updateStore(id, dto);
  }

  @Get("users")
  users() {
    return this.admin.listUsers();
  }
}
