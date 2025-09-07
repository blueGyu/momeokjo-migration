import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { CryptoService } from "./crypto.util";

describe("CryptoSerivce", () => {
  let service: CryptoService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case "CRYPTO_ALGORITHM":
          return "aes-256-gcm";
        case "CRYPTO_PASSWORD":
          return "test-password-should-be-long-enough";
        default:
          return undefined;
      }
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("필요한 환경 변수가 모두 설정된 경우 정상적으로 생성되어야 한다", () => {
      expect(service).toBeDefined();
    });

    it("ALGORITHM_WAY 환경 변수가 없는 경우 예외를 발생시켜야 한다", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "CRYPTO_ALGORITHM") return undefined;
        return "test-password";
      });

      expect(() => new CryptoService(configService)).toThrow(
        "CRYPTO_ALGORITHM 또는 CRYPTO_PASSWORD 환경 변수가 없습니다."
      );
    });

    it("ALGORITHM_PASSWORD 환경 변수가 없는 경우 예외를 발생시켜야 한다", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "CRYPTO_PASSWORD") return undefined;
        return "aes-256-gcm";
      });

      expect(() => new CryptoService(configService)).toThrow(
        "CRYPTO_ALGORITHM 또는 CRYPTO_PASSWORD 환경 변수가 없습니다."
      );
    });

    it("GCM이 아닌 알고리즘인 경우 예외를 발생시켜야 한다", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "CRYPTO_ALGORITHM") return "aes-256-cbc";
        return "test-password";
      });

      expect(() => new CryptoService(configService)).toThrow(
        "지원되지 않는 알고리즘입니다: aes-256-cbc"
      );
    });
  });

  describe("encrypt", () => {
    const testText = "테스트에 사용할 텍스트";

    it("정상적인 텍스트인 경우 암호화 결과값을 리턴해야 한다", async () => {
      const encryptedData = await service.encrypt(testText);

      expect(encryptedData).toHaveProperty("iv");
      expect(encryptedData).toHaveProperty("tag");
      expect(encryptedData).toHaveProperty("data");

      expect(typeof encryptedData.iv).toBe("string");
      expect(typeof encryptedData.tag).toBe("string");
      expect(typeof encryptedData.data).toBe("string");
    });

    it.each([null, undefined, ""])(
      "암호화할 대상이 %p인 경우 예외를 발생시켜야 한다",
      async (input) => {
        // @ts-ignore
        await expect(service.encrypt(input)).rejects.toThrow(
          "암호화할 대상이 없습니다."
        );
      }
    );
  });

  describe("decrypt", () => {
    const testText = "테스트에 사용할 텍스트";

    it("정상적인 데이터인 경우 복호화 결과값을 리턴해야 한다", async () => {
      const encryptedData = await service.encrypt(testText);
      const decryptedData = await service.decrypt(encryptedData);

      expect(decryptedData).toBe(testText);
    });

    it("필수 속성이 누락된 데이터인 경우 예외를 발생시켜야 한다", async () => {
      // @ts-ignore
      await expect(service.decrypt({ iv: "test" })).rejects.toThrow();
    });

    it.each([null, undefined, ""])(
      "복호화할 대상이 %p인 경우 예외를 발생시켜야 한다",
      async (input) => {
        const encryptedData = { iv: input, tag: input, data: input };
        // @ts-ignore
        await expect(service.decrypt(encryptedData)).rejects.toThrow();
      }
    );
  });
});
