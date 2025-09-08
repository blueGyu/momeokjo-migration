import { Role, User } from "@prisma/client";

export class UserResponseDto {
  idx!: bigint;
  id!: string | null;
  role!: Role;
  email!: string;
  nickname!: string;

  static fromEntity(entity: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.idx = entity.idx;
    dto.id = entity.id;
    dto.role = entity.role;
    dto.email = entity.email;
    dto.nickname = entity.nickname;
    return dto;
  }
}
