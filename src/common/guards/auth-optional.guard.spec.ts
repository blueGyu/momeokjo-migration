import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthOptionalGuard } from "./auth-optional.guard";

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
      getRequest: () => req,
    }),
    getRequest: () => req,
  } as unknown as ExecutionContext & { getRequest: () => any };
};

describe("AuthOptionalGuard", () => {
  let guard: AuthOptionalGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthOptionalGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthOptionalGuard>(AuthOptionalGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("AuthOptionalGuard가 정의되어야 한다", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("유효한 토큰이 있으면 true를 반환하고 request.authUser에 payload를 추가해야 한다", async () => {
      const payload = { sub: "user-id", username: "test" };
      const mockContext = createMockContext("Bearer valid-token");
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.getRequest().authUser).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token");
    });

    it("토큰이 없으면 true를 반환하고 request.authUser는 undefined여야 한다", async () => {
      const mockContext = createMockContext(undefined);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.getRequest().authUser).toBeUndefined();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it("유효하지 않은 토큰이 있으면 true를 반환하고 request.authUser는 undefined여야 한다", async () => {
      const mockContext = createMockContext("Bearer invalid-token");
      mockJwtService.verifyAsync.mockRejectedValue(new Error("jwt error"));

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.getRequest().authUser).toBeUndefined();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("invalid-token");
    });

    it("토큰 타입이 Bearer가 아니면 true를 반환하고 request.authUser는 undefined여야 한다", async () => {
      const mockContext = createMockContext("Basic some-token");

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.getRequest().authUser).toBeUndefined();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
