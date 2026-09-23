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
import { AdminGuard, AdminRoles, AuthUser, CurrentUser } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";
import { AuditService } from "../audit/audit.service";
import {
  AddPlanPaymentDto,
  AdminUpdateStoreDto,
  CreateAdminDto,
  CreateNoteDto,
  UpdateAdminDto,
} from "./dto";

@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly audit: AuditService,
  ) {}

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

  @Get("attention")
  attention() {
    return this.admin.attention();
  }

  /** Barcha do'konlar ichidan buyurtma qidirish: telefon, raqam, ism */
  @Get("orders")
  orders(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
  ) {
    return this.admin.searchOrders({ search, status, page: Number(page) || 1 });
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
  updateStore(
    @Param("id") id: string,
    @Body() dto: AdminUpdateStoreDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.admin.updateStore(id, dto, user);
  }

  @Get("stores/:id/orders")
  storeOrders(
    @Param("id") id: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
  ) {
    return this.admin.listStoreOrders(id, { status, search, page: Number(page) || 1 });
  }

  @Get("stores/:id/orders/:orderId")
  storeOrder(@Param("id") id: string, @Param("orderId") orderId: string) {
    return this.admin.getStoreOrder(id, orderId);
  }

  @Get("stores/:id/products")
  storeProducts(
    @Param("id") id: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
  ) {
    return this.admin.listStoreProducts(id, { search, page: Number(page) || 1 });
  }

  @Get("stores/:id/notes")
  notes(@Param("id") id: string) {
    return this.admin.listNotes(id);
  }

  @Post("stores/:id/notes")
  addNote(@Param("id") id: string, @Body() dto: CreateNoteDto, @CurrentUser() user: AuthUser) {
    return this.admin.addNote(id, dto, user);
  }

  @Delete("stores/:id/notes/:noteId")
  deleteNote(@Param("id") id: string, @Param("noteId") noteId: string, @CurrentUser() user: AuthUser) {
    return this.admin.deleteNote(id, noteId, user);
  }

  @Get("stores/:id/events")
  events(@Param("id") id: string) {
    return this.admin.storeEvents(id);
  }

  @AdminRoles("OWNER", "FINANCE")
  @Post("stores/:id/payments")
  addPayment(
    @Param("id") id: string,
    @Body() dto: AddPlanPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.admin.addPayment(id, dto, user);
  }

  @AdminRoles("OWNER", "FINANCE")
  @Delete("stores/:id/payments/:paymentId")
  deletePayment(
    @Param("id") id: string,
    @Param("paymentId") paymentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.admin.deletePayment(id, paymentId, user);
  }

  @Get("users")
  users(@Query("search") search?: string) {
    return this.admin.listUsers(search);
  }

  // ---------- Jamoa ----------

  @Get("admins")
  admins() {
    return this.admin.listAdmins();
  }

  @AdminRoles("OWNER")
  @Post("admins")
  createAdmin(@Body() dto: CreateAdminDto, @CurrentUser() user: AuthUser) {
    return this.admin.createAdmin(dto, user);
  }

  @AdminRoles("OWNER")
  @Patch("admins/:id")
  updateAdmin(@Param("id") id: string, @Body() dto: UpdateAdminDto, @CurrentUser() user: AuthUser) {
    return this.admin.updateAdmin(id, dto, user);
  }

  @AdminRoles("OWNER")
  @Delete("admins/:id")
  removeAdmin(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.admin.removeAdmin(id, user);
  }

  // ---------- Audit-jurnal ----------

  @Get("audit")
  auditList(
    @Query("page") page?: string,
    @Query("storeId") storeId?: string,
    @Query("action") action?: string,
    @Query("search") search?: string,
  ) {
    return this.audit.list({ page: Number(page) || 1, storeId, action, search });
  }
}
