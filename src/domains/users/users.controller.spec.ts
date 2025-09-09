import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AuthOptionalGuard } from "../../common/guards/auth-optional.guard";
import { UserPayload } from "../auth/types/auth-payload.type";
import { UpdateUserDto } from "./dto/request/update-user.dto";

// UsersService 모킹
const mockUsersService = {
  updateMyInfo: jest.fn(),
  getUserInfoByUserIdx: jest.fn(),
  getReviewsByUserIdx: jest.fn(),
  getLikeRestaurantsByUserIdx: jest.fn(),
};

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      // 실제 Guard 로직을 실행하지 않도록 모킹 처리
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthOptionalGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("UsersController가 정의되어야 한다", () => {
    expect(controller).toBeDefined();
  });

  describe("updateMyInfo", () => {
    it("내 정보를 성공적으로 수정해야 한다", async () => {
      const mockUser: UserPayload = { userIdx: 1, role: "USER" };
      const mockBody: UpdateUserDto = { nickname: "new_nickname" };

      await controller.updateMyInfo(mockUser, mockBody);

      expect(service.updateMyInfo).toHaveBeenCalledWith(
        mockUser.userIdx,
        mockBody.nickname
      );
    });
  });

  describe("getUserInfoByIdx", () => {
    it("특정 사용자 정보를 성공적으로 조회해야 한다", async () => {
      const userIdx = 1;
      mockUsersService.getUserInfoByUserIdx.mockResolvedValue({ id: 1 });

      await controller.getUserInfoByIdx(userIdx);

      expect(service.getUserInfoByUserIdx).toHaveBeenCalledWith(userIdx);
    });
  });

  describe("getReviews", () => {
    it("특정 사용자의 리뷰 목록을 성공적으로 조회해야 한다", async () => {
      const mockUser: UserPayload = { userIdx: 2, role: "USER" };
      const targetUserIdx = 1;

      await controller.getReviews(mockUser, targetUserIdx);

      expect(service.getReviewsByUserIdx).toHaveBeenCalledWith(
        targetUserIdx,
        mockUser.userIdx
      );
    });
  });

  describe("getLikeRestaurants", () => {
    it("특정 사용자의 즐겨찾기 음식점 목록을 성공적으로 조회해야 한다", async () => {
      const mockUser: UserPayload = { userIdx: 2, role: "USER" };
      const targetUserIdx = 1;

      await controller.getLikeRestaurants(mockUser, targetUserIdx);

      expect(service.getLikeRestaurantsByUserIdx).toHaveBeenCalledWith(
        targetUserIdx,
        mockUser.userIdx
      );
    });
  });
});
