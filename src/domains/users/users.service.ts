import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserReviewResponseDto } from "./dto/response/user-review.dto";
import {
  LikedRestaurantEntityType,
  LikeRestaurantResponseDto,
} from "./dto/response/like-restaurant.dto";
import { UserResponseDto } from "./dto/response/user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMyInfo(userIdx: number, nickname: string): Promise<void> {
    await this.prisma.user.update({
      where: { idx: userIdx, isDeleted: false },
      data: { nickname },
    });
  }

  async getUserInfoByUserIdx(userIdx: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { idx: userIdx, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return UserResponseDto.fromEntity(user);
  }

  async getReviewsByUserIdx(
    targetUserIdx: number,
    currentUserIdx: number | null
  ): Promise<UserReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { authorIdx: targetUserIdx, isDeleted: false },
      select: {
        idx: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        restaurant: {
          select: {
            idx: true,
            name: true,
          },
        },
        menu: {
          select: {
            idx: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviewLike: {
              where: { isDeleted: false },
            },
          },
        },
        reviewLike: {
          where: { creatorIdx: currentUserIdx ?? -1, isDeleted: false },
        },
      },
    });

    const results = reviews.map((review) => {
      const { reviewLike, _count, ...restOfReview } = review;
      return UserReviewResponseDto.fromEntity({
        ...restOfReview,
        likesCount: _count.reviewLike,
        isMyLike: reviewLike.length > 0,
      });
    });

    return results;
  }

  async getLikeRestaurantsByUserIdx(
    targetUserIdx: number,
    currentUserIdx: number | null
  ): Promise<LikeRestaurantResponseDto[]> {
    const results = await this.prisma.$queryRaw<LikedRestaurantEntityType[]>`
      SELECT
        r.idx,
        r.name,
        r.address,
        r."addressDetail",
        r.phone,
        r."openTime",
        r."closeTime",
        ST_AsText(r.location) as location,
        (
          SELECT COUNT(*)
          FROM "RestaurantLike" rl
          WHERE rl."restaurantIdx" = r.idx AND rl."isDeleted" = false
        )::int AS "likesCount",
        EXISTS (
          SELECT 1
          FROM "RestaurantLike" rl
          WHERE rl."restaurantIdx" = r.idx AND rl."creatorIdx" = ${currentUserIdx} AND rl."isDeleted" = false
        ) AS "isMyLike"
      FROM
        "Restaurant" r
      JOIN
        "RestaurantLike" target_likes ON r.idx = target_likes."restaurantIdx"
      WHERE
        target_likes."creatorIdx" = ${targetUserIdx} AND target_likes."isDeleted" = false;
    `;

    return results.map((result) =>
      LikeRestaurantResponseDto.fromEntity(result)
    );
  }
}
