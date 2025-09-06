import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { z } from "zod";

const validateSchema = z.object({
  DATABASE_URL: z.string(),
  CRYPTO_ALGORITHM: z.string(),
  CRYPTO_PASSWORD: z.string(),
  ACCESS_SECRET: z.string(),
  ACCESS_EXPIRES_IN: z.string(),
  REFRESH_SECRET: z.string(),
  REFRESH_EXPIRES_IN: z.string(),
  EMAIL_VERIFICATION_SECRET: z.string(),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string(),
  PASSWORD_RESET_SECRET: z.string(),
  PASSWORD_RESET_EXPIRES_IN: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessSecret: configService.get<string>("ACCESS_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("ACCESS_EXPIRES_IN"),
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
