class RestaurantInReviewDto {
  idx!: bigint;
  name!: string;
}

class MenuInReviewDto {
  idx!: bigint;
  name!: string;
}

type UserReviewEntityType = {
  idx: bigint;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  restaurant: RestaurantInReviewDto;
  menu: MenuInReviewDto;
  likesCount: number;
  isMyLike: boolean;
};

export class UserReviewResponseDto {
  idx!: bigint;
  content!: string;
  imageUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  restaurant!: RestaurantInReviewDto;
  menu!: MenuInReviewDto;
  likesCount!: number;
  isMyLike!: boolean;

  static fromEntity(entity: UserReviewEntityType): UserReviewResponseDto {
    const dto = new UserReviewResponseDto();
    dto.idx = entity.idx;
    dto.content = entity.content;
    dto.imageUrl = entity.imageUrl;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.restaurant = entity.restaurant;
    dto.menu = entity.menu;
    dto.likesCount = entity.likesCount;
    dto.isMyLike = entity.isMyLike;
    return dto;
  }
}
