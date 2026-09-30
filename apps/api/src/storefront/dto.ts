import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsIn(["CASH_ON_DELIVERY", "ONLINE_MOCK"])
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE_MOCK";

  /** Checkout sessiyasi tokeni (bo'lsa, buyurtma berilgach sessiya yopiladi). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  checkoutToken?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}

/** Xaridor telefonini kiritganda savatni serverda saqlash (tugallanmagan xaridlar). */
export class CheckoutSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  token?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
