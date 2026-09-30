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
import { AuthUser, CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CompleteDraftDto, SaveDraftDto } from "./dto";
import { DraftsService } from "./drafts.service";

@UseGuards(JwtAuthGuard)
@Controller("drafts")
export class DraftsController {
  constructor(private readonly drafts: DraftsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query("status") status?: string) {
    return this.drafts.list(user.userId, status);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: SaveDraftDto) {
    return this.drafts.create(user.userId, dto);
  }

  @Get(":id")
  getOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.drafts.getOne(user.userId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: SaveDraftDto,
  ) {
    return this.drafts.update(user.userId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.drafts.remove(user.userId, id);
  }

  @Post(":id/complete")
  complete(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: CompleteDraftDto,
  ) {
    return this.drafts.complete(user.userId, id, dto);
  }
}
