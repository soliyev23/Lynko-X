import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { PAID_PLANS, PLANS, Plan } from "../common/plans";

export class AdminUpdateStoreDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(PLANS)
  plan?: Plan;

  /** ISO sana; null = muddatsiz. FREE tanlansa avtomatik tozalanadi. */
  @IsOptional()
  @IsDateString()
  planExpiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;
}

export const PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER", "OTHER"] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

/** Qo'lda yozilgan obuna to'lovi (naqd, karta, o'tkazma). */
export class AddPlanPaymentDto {
  @IsIn(PAID_PLANS)
  plan: Plan;

  @IsInt()
  @Min(0)
  amount: number;

  @IsIn(PAYMENT_METHODS)
  method: PaymentMethodValue;

  @IsInt()
  @Min(1)
  @Max(24)
  months: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
