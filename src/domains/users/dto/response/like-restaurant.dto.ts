export type LikedRestaurantEntityType = {
  idx: bigint;
  name: string;
  address: string;
  addressDetail?: string | null;
  phone?: string | null;
  openTime?: Date | null;
  closeTime?: Date | null;
  location: string;
  likesCount: number;
  isMyLike: boolean;
};

export class LikeRestaurantResponseDto {
  idx!: bigint;
  name!: string;
  address!: string;
  addressDetail?: string | null;
  phone?: string | null;
  openTime?: Date | null;
  closeTime?: Date | null;
  location!: string;
  likesCount!: number;
  isMyLike!: boolean;

  static fromEntity(
    entity: LikedRestaurantEntityType
  ): LikeRestaurantResponseDto {
    const dto = new LikeRestaurantResponseDto();
    dto.idx = entity.idx;
    dto.name = entity.name;
    dto.address = entity.address;
    dto.addressDetail = entity.addressDetail;
    dto.phone = entity.phone;
    dto.openTime = entity.openTime;
    dto.closeTime = entity.closeTime;
    dto.location = entity.location;
    dto.likesCount = entity.likesCount;
    dto.isMyLike = entity.isMyLike;
    return dto;
  }
}
