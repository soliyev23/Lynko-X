import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export const THEMES = ["classic", "minimal", "bold", "elegant", "market"] as const;

export class UpdateStoreDto {
  @IsOptional()
  @IsIn(THEMES)
  theme?: (typeof THEMES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  telegramBotToken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegramChatId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
