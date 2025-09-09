import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AuthOptionalGuard } from "../../common/guards/auth-optional.guard";
import { UserPayload } from "../auth/types/auth-payload.type";
import { AuthUser } from "../../common/decorators/auth-jwt.decorator";
import { UpdateUserDto } from "./dto/request/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put("me")
  @UseGuards(AuthGuard)
  async updateMyInfo(
    @AuthUser() user: UserPayload,
    @Body() body: UpdateUserDto
  ) {
    return await this.usersService.updateMyInfo(user.userIdx, body.nickname);
  }

  @Get(":userIdx")
  getUserInfoByIdx(@Param("userIdx", ParseIntPipe) userIdx: number) {
    return this.usersService.getUserInfoByUserIdx(userIdx);
  }

  @Get(":userIdx/reviews")
  @UseGuards(AuthOptionalGuard)
  async getReviews(
    @AuthUser() user: UserPayload,
    @Param("userIdx", ParseIntPipe) userIdx: number
  ) {
    return await this.usersService.getReviewsByUserIdx(userIdx, user.userIdx);
  }

  @Get(":userIdx/restaurants/likes")
  @UseGuards(AuthOptionalGuard)
  async getLikeRestaurants(
    @AuthUser() user: UserPayload,
    @Param("userIdx", ParseIntPipe) userIdx: number
  ) {
    return await this.usersService.getLikeRestaurantsByUserIdx(
      userIdx,
      user.userIdx
    );
  }
}
