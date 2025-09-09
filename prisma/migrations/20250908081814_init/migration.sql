-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "idx" BIGSERIAL NOT NULL,
    "id" TEXT,
    "pw" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Oauth" (
    "idx" BIGSERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshTokenExpiresIn" BIGINT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userIdx" BIGINT NOT NULL,

    CONSTRAINT "Oauth_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."UserReport" (
    "idx" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromUserIdx" BIGINT NOT NULL,
    "toUserIdx" BIGINT NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Code" (
    "idx" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Restaurant" (
    "idx" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" geography(point, 4326) NOT NULL,
    "address" TEXT NOT NULL,
    "addressDetail" TEXT,
    "phone" TEXT,
    "openTime" TIMESTAMP(3),
    "closeTime" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "categoryIdx" BIGINT NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "idx" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "updaterIdx" BIGINT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."RestaurantLike" (
    "idx" BIGSERIAL NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "restaurantIdx" BIGINT NOT NULL,

    CONSTRAINT "RestaurantLike_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."RestaurantReport" (
    "idx" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reporterIdx" BIGINT NOT NULL,
    "restaurantIdx" BIGINT NOT NULL,

    CONSTRAINT "RestaurantReport_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "idx" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "restaurantIdx" BIGINT NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."MenuLike" (
    "idx" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "menuIdx" BIGINT NOT NULL,

    CONSTRAINT "MenuLike_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."MenuReport" (
    "idx" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reporterIdx" BIGINT NOT NULL,
    "menuIdx" BIGINT NOT NULL,

    CONSTRAINT "MenuReport_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "idx" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorIdx" BIGINT NOT NULL,
    "restaurantIdx" BIGINT NOT NULL,
    "menuIdx" BIGINT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."ReviewLike" (
    "idx" BIGSERIAL NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorIdx" BIGINT NOT NULL,
    "reviewIdx" BIGINT NOT NULL,

    CONSTRAINT "ReviewLike_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."ReviewReport" (
    "idx" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reporterIdx" BIGINT NOT NULL,
    "reviewIdx" BIGINT NOT NULL,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "public"."User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Oauth_provider_providerUserId_key" ON "public"."Oauth"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Oauth_provider_userIdx_key" ON "public"."Oauth"("provider", "userIdx");

-- CreateIndex
CREATE UNIQUE INDEX "UserReport_fromUserIdx_toUserIdx_key" ON "public"."UserReport"("fromUserIdx", "toUserIdx");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantLike_creatorIdx_restaurantIdx_key" ON "public"."RestaurantLike"("creatorIdx", "restaurantIdx");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantReport_reporterIdx_restaurantIdx_key" ON "public"."RestaurantReport"("reporterIdx", "restaurantIdx");

-- CreateIndex
CREATE UNIQUE INDEX "MenuLike_creatorIdx_menuIdx_key" ON "public"."MenuLike"("creatorIdx", "menuIdx");

-- CreateIndex
CREATE UNIQUE INDEX "MenuReport_reporterIdx_menuIdx_key" ON "public"."MenuReport"("reporterIdx", "menuIdx");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorIdx_restaurantIdx_menuIdx_key" ON "public"."Review"("authorIdx", "restaurantIdx", "menuIdx");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewLike_creatorIdx_reviewIdx_key" ON "public"."ReviewLike"("creatorIdx", "reviewIdx");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReport_reporterIdx_reviewIdx_key" ON "public"."ReviewReport"("reporterIdx", "reviewIdx");

-- AddForeignKey
ALTER TABLE "public"."Oauth" ADD CONSTRAINT "Oauth_userIdx_fkey" FOREIGN KEY ("userIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_fromUserIdx_fkey" FOREIGN KEY ("fromUserIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_toUserIdx_fkey" FOREIGN KEY ("toUserIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Restaurant" ADD CONSTRAINT "Restaurant_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Restaurant" ADD CONSTRAINT "Restaurant_categoryIdx_fkey" FOREIGN KEY ("categoryIdx") REFERENCES "public"."Category"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_updaterIdx_fkey" FOREIGN KEY ("updaterIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RestaurantLike" ADD CONSTRAINT "RestaurantLike_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RestaurantLike" ADD CONSTRAINT "RestaurantLike_restaurantIdx_fkey" FOREIGN KEY ("restaurantIdx") REFERENCES "public"."Restaurant"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RestaurantReport" ADD CONSTRAINT "RestaurantReport_reporterIdx_fkey" FOREIGN KEY ("reporterIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RestaurantReport" ADD CONSTRAINT "RestaurantReport_restaurantIdx_fkey" FOREIGN KEY ("restaurantIdx") REFERENCES "public"."Restaurant"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_restaurantIdx_fkey" FOREIGN KEY ("restaurantIdx") REFERENCES "public"."Restaurant"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuLike" ADD CONSTRAINT "MenuLike_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuLike" ADD CONSTRAINT "MenuLike_menuIdx_fkey" FOREIGN KEY ("menuIdx") REFERENCES "public"."Menu"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuReport" ADD CONSTRAINT "MenuReport_reporterIdx_fkey" FOREIGN KEY ("reporterIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuReport" ADD CONSTRAINT "MenuReport_menuIdx_fkey" FOREIGN KEY ("menuIdx") REFERENCES "public"."Menu"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_authorIdx_fkey" FOREIGN KEY ("authorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_restaurantIdx_fkey" FOREIGN KEY ("restaurantIdx") REFERENCES "public"."Restaurant"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_menuIdx_fkey" FOREIGN KEY ("menuIdx") REFERENCES "public"."Menu"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewLike" ADD CONSTRAINT "ReviewLike_creatorIdx_fkey" FOREIGN KEY ("creatorIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewLike" ADD CONSTRAINT "ReviewLike_reviewIdx_fkey" FOREIGN KEY ("reviewIdx") REFERENCES "public"."Review"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewReport" ADD CONSTRAINT "ReviewReport_reporterIdx_fkey" FOREIGN KEY ("reporterIdx") REFERENCES "public"."User"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewReport" ADD CONSTRAINT "ReviewReport_reviewIdx_fkey" FOREIGN KEY ("reviewIdx") REFERENCES "public"."Review"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;
