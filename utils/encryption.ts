import env from "../config/env";
import { promisify } from "util";
import {
  scrypt as _scrypt,
  randomBytes as _randomBytes,
  createCipheriv,
  createDecipheriv,
  CipherKey,
  CipherGCM,
  DecipherCCM,
} from "crypto";

const algorithm = env.ALGORITHM_WAY;
const ivLength = parseInt(env.ALGORITHM_IV_LENGTH);
const password = env.ALGORITHM_SECRET;

const scrypt = promisify(_scrypt);
const randomBytes = promisify(_randomBytes);

type Result = {
  success: boolean;
  data?: string;
  message?: string;
};

// 암호화
export const encrypt = async (plainText: string): Promise<Result> => {
  try {
    if (!plainText || typeof plainText !== "string")
      return { success: false, message: "plainText 확인 필요" };

    const iv = await randomBytes(ivLength);
    const key = (await scrypt(password, "salt", 32)) as CipherKey;

    const cipher = createCipheriv(algorithm, key, iv) as CipherGCM;
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      success: true,
      data: [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":"),
    };
  } catch (err) {
    if (err instanceof Error) return { success: false, message: err.message };

    return { success: false, message: "암호화 중 오류 발생" };
  }
};

// 복호화
export const decrypt = async (encryptedText: string): Promise<Result> => {
  try {
    if (!encryptedText || typeof encryptedText !== "string")
      return {
        success: false,
        message: "encryptedText 확인 필요",
      };

    if (encryptedText.split(":").length !== 3)
      return { success: false, message: "암호화된 문자열 형식이 잘못되었습니다." };

    const [ivB64, tagB64, encryptedB64] = encryptedText.split(":");

    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");

    const encrypted = Buffer.from(encryptedB64, "base64");
    const key = (await scrypt(password, "salt", 32)) as CipherKey;
    const decipher = createDecipheriv(algorithm, key, iv) as DecipherCCM;
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return { success: true, data: decrypted.toString("utf8") };
  } catch (err) {
    if (err instanceof Error) return { success: false, message: err.message };

    return { success: false, message: "복호화 중 오류 발생" };
  }
};
