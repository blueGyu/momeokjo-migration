import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "./prisma.module";
import { PrismaService } from "./prisma.service";

describe("PrismaModule", () => {
  let module: TestingModule;
  let prismaService: PrismaService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.onModuleDestroy();
    await module.close();
  });

  it("PrismaService가 정의되어야 한다", () => {
    expect(prismaService).toBeDefined();
  });
});
