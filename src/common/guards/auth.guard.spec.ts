import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";

// ExecutionContext mocking 헬퍼 함수
const createMockContext = (authorization?: string) => {
  const req = {
    headers: {
      authorization,
    },
    authUser: undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: jest.fn().mockReturnValue(req),
    }),
    // 테스트에서 request 객체에 쉽게 접근할 수 있도록 추가
    getRequest: jest.fn().mockReturnValue(req),
  } as unknown as ExecutionContext & { getRequest: () => any };
};

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("AuthGuard가 정의되어야 한다.", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("유효한 토큰이 제공되면 true를 반환하고 request 객체에 user를 추가해야 한다.", async () => {
      const payload = { sub: "user-id", username: "testuser" };
      const mockContext = createMockContext("Bearer valid-token");

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const canActivateResult = await guard.canActivate(mockContext);

      expect(canActivateResult).toBe(true);
      expect(mockContext.getRequest().authUser).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token");
    });

    it("토큰이 제공되지 않으면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext(undefined);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("인증 토큰이 없습니다.")
      );
    });

    it("토큰 타입이 Bearer가 아니면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext("Basic invalid-token");

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("인증 토큰이 없습니다.")
      );
    });

    it("토큰 검증에 실패하면 UnauthorizedException을 던져야 한다", async () => {
      const mockContext = createMockContext("Bearer invalid-token");
      const verificationError = new Error("JWT is broken");

      mockJwtService.verifyAsync.mockRejectedValue(verificationError);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException("인증 토큰이 유효하지 않습니다.")
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("invalid-token");
    });
  });
});
