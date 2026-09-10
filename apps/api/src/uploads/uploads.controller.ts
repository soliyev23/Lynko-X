import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

export const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          // Nomni o'zimiz beramiz — foydalanuvchi fayl nomiga ishonilmaydi
          const ext =
            ALLOWED_TYPES.get(file.mimetype) ??
            extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
        else
          cb(
            new BadRequestException(
              "Faqat rasm fayllari qabul qilinadi (JPG, PNG, WEBP, GIF)",
            ),
            false,
          );
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Fayl yuborilmadi");
    const base = process.env.PUBLIC_URL ?? "http://localhost:4000";
    return { url: `${base}/uploads/${file.filename}` };
  }
}
