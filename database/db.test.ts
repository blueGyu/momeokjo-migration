import * as pg from "pg";

import env from "../config/env";

jest.mock("pg", () => {
  const mockPool = {
    connect: jest.fn(),
  };

  return { Pool: jest.fn(() => mockPool) };
});

jest.mock("../config/env", () => ({
  DB_HOST: "localhost",
  DB_NAME: "test_db",
  DB_USER: "test_user",
  DB_PASSWORD: "test_password",
  DB_PORT: "5432",
}));

describe("Database Pool", () => {
  it("새로운 pool 인스턴스가 생성되면 connect 메서드가 호출된다", () => {
    require("../database/db");

    expect(pg.Pool).toHaveBeenCalledWith({
      host: env.DB_HOST,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      port: parseInt(env.DB_PORT),
    });
  });
});
