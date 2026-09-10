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
import { CreateCategoryDto, CreateProductDto, UpdateProductDto } from "./dto";
import { ProductsService } from "./products.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get("products")
  list(@CurrentUser() user: AuthUser, @Query("search") search?: string) {
    return this.products.list(user.userId, search);
  }

  @Post("products")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.products.create(user.userId, dto);
  }

  @Get("products/:id")
  getOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.products.getOne(user.userId, id);
  }

  @Patch("products/:id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(user.userId, id, dto);
  }

  @Delete("products/:id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.products.remove(user.userId, id);
  }

  @Get("categories")
  categories(@CurrentUser() user: AuthUser) {
    return this.products.listCategories(user.userId);
  }

  @Post("categories")
  createCategory(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.products.createCategory(user.userId, dto);
  }

  @Delete("categories/:id")
  removeCategory(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.products.removeCategory(user.userId, id);
  }
}
