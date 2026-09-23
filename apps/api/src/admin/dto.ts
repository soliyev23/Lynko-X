import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
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

  /** Bloklash sababi (isActive=false bilan birga) */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  blockReason?: string;
}

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string;
}

export const ADMIN_ROLES = ["OWNER", "SUPPORT", "FINANCE"] as const;
export type AdminRoleValue = (typeof ADMIN_ROLES)[number];

export class CreateAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsIn(ADMIN_ROLES)
  adminRole: AdminRoleValue;
}

export class UpdateAdminDto {
  @IsIn(ADMIN_ROLES)
  adminRole: AdminRoleValue;
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
