import { IsBoolean, IsIn, IsOptional } from "class-validator";
import { PLANS, Plan } from "../common/plans";

export class AdminUpdateStoreDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(PLANS)
  plan?: Plan;
}
