import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { join } from "node:path";
import { UPLOAD_DIR } from "./uploads/uploads.controller";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Rasmlar boshqa domendagi vitrinadan yuklanadi — CORP'ni ochiq qoldiramiz
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.enableCors({ origin: true });
  app.useStaticAssets(UPLOAD_DIR, { prefix: "/uploads/" });
  // Namuna mahsulot rasmlari va boshqa statik fayllar
  app.useStaticAssets(join(process.cwd(), "assets"), {
    prefix: "/assets/",
    maxAge: "7d",
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`LYNKO-X API: http://localhost:${port}`);
}
bootstrap();
