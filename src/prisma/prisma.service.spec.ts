import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  let module: TestingModule;
  let prismaService: PrismaService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.onModuleDestroy();
    await module.close();
  });

  it("데이터베이스 연결, 해제 메서드가 정의되어야 한다", () => {
    expect(prismaService.onModuleInit).toBeDefined();
    expect(prismaService.onModuleDestroy).toBeDefined();
  });

  it("데이터베이스에 성공적으로 연결되어야 한다", async () => {
    await expect(prismaService.onModuleInit()).resolves.not.toThrow();
  });

  it("데이터베이스 연결을 성공적으로 해제해야 한다", async () => {
    await prismaService.onModuleInit();
    await expect(prismaService.onModuleDestroy()).resolves.not.toThrow();
  });

  it("User 모델이 정의되어야 한다", () => {
    expect(prismaService.user).toBeDefined();
  });
});
