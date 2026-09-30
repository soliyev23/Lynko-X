import { Controller, Delete, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthUser, CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CheckoutsService } from "./checkouts.service";

@UseGuards(JwtAuthGuard)
@Controller("checkouts")
export class CheckoutsController {
  constructor(private readonly checkouts: CheckoutsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query("status") status?: string) {
    return this.checkouts.list(user.userId, status);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.checkouts.remove(user.userId, id);
  }
}
