import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CheckoutDto } from "./dto";
import { StorefrontService } from "./storefront.service";

/** Ommaviy API — xaridorlar uchun, autentifikatsiya talab qilinmaydi. */
@Controller("storefront/:slug")
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get()
  getStore(@Param("slug") slug: string) {
    return this.storefront.getStore(slug);
  }

  @Get("products")
  listProducts(
    @Param("slug") slug: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
  ) {
    return this.storefront.listProducts(slug, category, search);
  }

  @Get("products/:productSlug")
  getProduct(
    @Param("slug") slug: string,
    @Param("productSlug") productSlug: string,
  ) {
    return this.storefront.getProduct(slug, productSlug);
  }

  @Post("orders")
  checkout(@Param("slug") slug: string, @Body() dto: CheckoutDto) {
    return this.storefront.checkout(slug, dto);
  }

  @Get("orders/:orderId")
  getOrder(@Param("slug") slug: string, @Param("orderId") orderId: string) {
    return this.storefront.getOrder(slug, orderId);
  }
}
