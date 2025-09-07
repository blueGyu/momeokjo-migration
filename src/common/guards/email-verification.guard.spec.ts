import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { EmailVerificationGuard } from "./email-verification.guard";

// ExecutionContext mocking 헬퍼 함수
const createMockContext = (authorization?: string) => {
  const req = {
    headers: {
      authorization,
    },
    emailVerified: undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: jest.fn().mockReturnValue(req),
    }),
    // 테스트에서 request 객체에 쉽게 접근할 수 있도록 추가
    getRequest: jest.fn().mockReturnValue(req),
  } as unknown as ExecutionContext & { getRequest: () => any };
};

describe("EmailVerificationGuard", () => {
  let guard: EmailVerificationGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case "EMAIL_VERIFICATION_SECRET":
          return "test-email-secret";
        default:
          return undefined;
      }
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<EmailVerificationGuard>(EmailVerificationGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("EmailVerificationGuard가 정의되어야 한다.", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("유효한 토큰이 제공되면 true를 반환하고 request 객체에 emailVerified를 추가해야 한다.", async () => {
      const payload = { sub: "email-verified", email: "test@test.com" };
      const mockSecret = configService.get<string>("EMAIL_VERIFICATION_SECRET");
      const mockContext = createMockContext("Bearer valid-token");

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const canActivateResult = await guard.canActivate(mockContext);

      expect(canActivateResult).toBe(true);
      expect(mockContext.getRequest().emailVerified).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token", {
        secret: mockSecret,
      });
    });

    it("토큰이 제공되지 않으면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext(undefined);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("이메일 인증 토큰이 없습니다.")
      );
    });

    it("토큰 타입이 Bearer가 아니면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext("Basic invalid-token");

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("이메일 인증 토큰이 없습니다.")
      );
    });

    it("토큰 검증에 실패하면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext("Bearer invalid-token");
      const mockSecret = configService.get<string>("EMAIL_VERIFICATION_SECRET");
      const verificationError = new Error("JWT is broken");

      mockJwtService.verifyAsync.mockRejectedValue(verificationError);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("이메일 인증 토큰이 유효하지 않습니다.")
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("invalid-token", {
        secret: mockSecret,
      });
    });
  });
});
