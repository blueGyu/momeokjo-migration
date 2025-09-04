import { Module } from "@nestjs/common";
import { CryptoService } from "./utils/crypto.utils";

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CommonModule {}
