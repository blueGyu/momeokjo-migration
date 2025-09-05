import { Module } from "@nestjs/common";
import { CryptoService } from "./utils/crypto.util";

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CommonModule {}
