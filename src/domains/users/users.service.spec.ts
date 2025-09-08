import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserResponseDto } from "./dto/response/user.dto";
import { UserReviewResponseDto } from "./dto/response/user-review.dto";
import { LikeRestaurantResponseDto } from "./dto/response/like-restaurant.dto";

// PrismaService 모킹
const mockPrismaService = {
  user: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  review: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();
    1;
    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 모든 모크 초기화
  });

  it("UsersService가 정의되어야 한다", () => {
    expect(service).toBeDefined();
  });

  describe("updateMyInfo", () => {
    it("내 닉네임을 성공적으로 변경해야 한다", async () => {
      const userIdx = 1;
      const nickname = "new_nickname";

      await service.updateMyInfo(userIdx, nickname);

      // prisma.user.update가 올바른 인자와 함께 호출되었는지 확인
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { idx: userIdx, isDeleted: false },
        data: { nickname },
      });
    });
  });

  describe("getUserInfoByUserIdx", () => {
    it("사용자 정보를 성공적으로 조회해야 한다", async () => {
      const userIdx = 1;
      const mockUserEntity: User = {
        idx: 1n,
        id: "test_id",
        pw: "hashed_password",
        email: "test@test.com",
        nickname: "testuser",
        role: "USER",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserEntity);

      const result = await service.getUserInfoByUserIdx(userIdx);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).not.toHaveProperty("pw");
      expect(result.nickname).toEqual(mockUserEntity.nickname);
    });

    it("사용자 정보를 조회할 수 없는 경우 예외를 발생시켜야 한다", async () => {
      const userIdx = 999;

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserInfoByUserIdx(userIdx)).rejects.toThrow(
        new NotFoundException("User not found")
      );
    });
  });

  describe("getReviewsByUserIdx", () => {
    it("특정 사용자가 작성한 리뷰 목록을 올바르게 반환해야 한다", async () => {
      const targetUserIdx = 1;
      const currentUserIdx = 2;
      const mockReviewsEntity = [
        {
          idx: 10,
          content: "맛있어요",
          imageUrl: "https://example.com/image.jpg",
          createdAt: "2025-09-08 10:00:00",
          updatedAt: "2025-09-08 10:00:00",
          restaurant: { idx: 1, name: "음식점1" },
          menu: { idx: 1, name: "메뉴1" },
          _count: { reviewLike: 5 },
          reviewLike: [{ creatorIdx: 2 }],
        },
        {
          idx: 11,
          content: "그저 그래요",
          imageUrl: "https://example.com/image.jpg",
          createdAt: "2025-09-08 10:00:00",
          updatedAt: "2025-09-08 10:00:00",
          restaurant: { idx: 2, name: "음식점2" },
          menu: { idx: 2, name: "메뉴2" },
          _count: { reviewLike: 2 },
          reviewLike: [],
        },
      ];
      mockPrismaService.review.findMany.mockResolvedValue(mockReviewsEntity);

      const result = await service.getReviewsByUserIdx(
        targetUserIdx,
        currentUserIdx
      );

      expect(result[0]).toBeInstanceOf(UserReviewResponseDto);
      expect(result[1]).toBeInstanceOf(UserReviewResponseDto);

      expect(result).toEqual([
        {
          idx: 10,
          content: "맛있어요",
          imageUrl: "https://example.com/image.jpg",
          createdAt: "2025-09-08 10:00:00",
          updatedAt: "2025-09-08 10:00:00",
          restaurant: { idx: 1, name: "음식점1" },
          menu: { idx: 1, name: "메뉴1" },
          likesCount: 5,
          isMyLike: true,
        },
        {
          idx: 11,
          content: "그저 그래요",
          imageUrl: "https://example.com/image.jpg",
          createdAt: "2025-09-08 10:00:00",
          updatedAt: "2025-09-08 10:00:00",
          restaurant: { idx: 2, name: "음식점2" },
          menu: { idx: 2, name: "메뉴2" },
          likesCount: 2,
          isMyLike: false,
        },
      ]);
    });
  });

  describe("getLikeRestaurantsByUserIdx", () => {
    it("특정 사용자가 즐겨찾기한 음식점 목록을 올바르게 반환해야 한다", async () => {
      const targetUserIdx = 1;
      const currentUserIdx = 2;
      const mockLikeRestaurantsEntity = [
        {
          idx: 10,
          name: "음식점1",
          address: "서울시 강남구",
          addressDetail: "테스트 음식점 상세 주소",
          phone: "010-1234-5678",
          openTime: "10:00",
          closeTime: "20:00",
          location: "POINT(127.0123456 37.5123456)",
          likesCount: 5,
          isMyLike: true,
        },
        {
          idx: 11,
          name: "음식점2",
          address: "서울시 강남구",
          addressDetail: "테스트 음식점 상세 주소",
          phone: "010-1234-5678",
          openTime: "10:00",
          closeTime: "20:00",
          location: "POINT(127.0123456 37.5123456)",
          likesCount: 5,
          isMyLike: false,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockLikeRestaurantsEntity);

      const result = await service.getLikeRestaurantsByUserIdx(
        targetUserIdx,
        currentUserIdx
      );

      expect(result[0]).toBeInstanceOf(LikeRestaurantResponseDto);
      expect(result[1]).toBeInstanceOf(LikeRestaurantResponseDto);

      expect(result).toEqual([
        {
          idx: 10,
          name: "음식점1",
          address: "서울시 강남구",
          addressDetail: "테스트 음식점 상세 주소",
          phone: "010-1234-5678",
          openTime: "10:00",
          closeTime: "20:00",
          location: "POINT(127.0123456 37.5123456)",
          likesCount: 5,
          isMyLike: true,
        },
        {
          idx: 11,
          name: "음식점2",
          address: "서울시 강남구",
          addressDetail: "테스트 음식점 상세 주소",
          phone: "010-1234-5678",
          openTime: "10:00",
          closeTime: "20:00",
          location: "POINT(127.0123456 37.5123456)",
          likesCount: 5,
          isMyLike: false,
        },
      ]);
    });
  });
});
