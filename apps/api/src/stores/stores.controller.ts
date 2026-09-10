import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { AuthUser, CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateStoreDto } from "./dto";
import { StoresService } from "./stores.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get("store")
  getMyStore(@CurrentUser() user: AuthUser) {
    return this.stores.getStoreForUser(user.userId);
  }

  @Patch("store")
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateStoreDto) {
    return this.stores.update(user.userId, dto);
  }

  @Get("stats")
  stats(@CurrentUser() user: AuthUser) {
    return this.stores.stats(user.userId);
  }

  @Get("analytics")
  analytics(@CurrentUser() user: AuthUser) {
    return this.stores.analytics(user.userId);
  }
}
