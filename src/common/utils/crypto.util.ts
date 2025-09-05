import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CipherGCM,
  createCipheriv,
  createDecipheriv,
  DecipherGCM,
  randomBytes,
  scrypt,
} from "crypto";
import { promisify } from "util";
import { z } from "zod";

const CryptoResultSchema = z.object({
  iv: z.string(),
  tag: z.string(),
  data: z.string(),
});

type CryptoResult = z.infer<typeof CryptoResultSchema>;

@Injectable()
export class CryptoService {
  private readonly algorithm: string;
  private readonly password: string;

  constructor(private readonly configService: ConfigService) {
    this.algorithm = this.configService.get<string>("CRYPTO_ALGORITHM") ?? "";
    this.password = this.configService.get<string>("CRYPTO_PASSWORD") ?? "";

    if (!this.algorithm || !this.password) {
      throw new Error(
        "CRYPTO_ALGORITHM 또는 CRYPTO_PASSWORD 환경 변수가 없습니다."
      );
    }

    if (!this.algorithm.toLowerCase().includes("gcm")) {
      throw new Error(`지원되지 않는 알고리즘입니다: ${this.algorithm}`);
    }
  }

  private async initKey(): Promise<Buffer> {
    return (await promisify(scrypt)(this.password, "salt", 32)) as Buffer;
  }

  async encrypt(textToEncrypt: string): Promise<CryptoResult> {
    if (!textToEncrypt) throw new Error("암호화할 대상이 없습니다.");

    const iv = randomBytes(16);
    const key = await this.initKey();

    const cipher = createCipheriv(this.algorithm, key, iv) as CipherGCM;
    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encryptedText.toString("base64"),
    };
  }

  async decrypt(encryptedTextToDecrypt: CryptoResult): Promise<string> {
    if (!CryptoResultSchema.safeParse(encryptedTextToDecrypt).success)
      throw new Error("복호화할 대상이 없습니다.");

    const iv = Buffer.from(encryptedTextToDecrypt.iv, "base64");
    const tag = Buffer.from(encryptedTextToDecrypt.tag, "base64");
    const encrypted = Buffer.from(encryptedTextToDecrypt.data, "base64");
    const key = await this.initKey();

    const decipher = createDecipheriv(this.algorithm, key, iv) as DecipherGCM;
    decipher.setAuthTag(tag);

    const decryptedText = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    return decryptedText;
  }
}
