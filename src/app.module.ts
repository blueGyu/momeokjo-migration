import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { z } from "zod";

const validateSchema = z.object({
  DATABASE_URL: z.string(),
  CRYPTO_ALGORITHM: z.string(),
  CRYPTO_PASSWORD: z.string(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate: (config) => {
        const result = validateSchema.safeParse(config);
        if (!result.success) {
          throw new Error(result.error.message);
        }
        return result.data;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
