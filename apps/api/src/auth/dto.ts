import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  storeName: string;

  @Matches(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, {
    message:
      "storeSlug faqat kichik lotin harflari, raqam va '-' dan iborat bo'lishi kerak (3-30 belgi)",
  })
  storeSlug: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
