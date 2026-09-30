import { IsIn } from "class-validator";

export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status: OrderStatusValue;
}

import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class DraftItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsInt()
  @Min(1)
  @Max(9999)
  quantity: number;
}

/** Qoralamani yaratish va yangilash: mahsulotlar ro'yxati to'liq almashtiriladi. */
export class SaveDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFee?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DraftItemDto)
  items: DraftItemDto[];
}

export class CompleteDraftDto {
  /** To'lov allaqachon qabul qilingan (buyurtma "to'langan" holatda yaratiladi). */
  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}
