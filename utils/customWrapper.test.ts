import { Request, Response, NextFunction } from "express";
import { PoolClient } from "pg";

import pool from "../database/db";
import {
  tryCatchWrapper,
  tryCatchWrapperWithDb,
  tryCatchWrapperWithDbTransaction,
} from "./customWrapper";

jest.mock("../database/db", () => ({
  connect: jest.fn().mockResolvedValue({
    release: jest.fn(),
    query: jest.fn(),
  }),
}));

const req = {} as Request;
const res = {} as Response;
const next = jest.fn() as unknown as NextFunction;

let mockClient: PoolClient;
beforeEach(async () => {
  jest.resetModules();
  mockClient = await pool.connect();
});

describe("tryCatchWrapper", () => {
  it("정상 동작 시 next 호출되지 않아야 한다.", async () => {
    const mockFunc = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapper(mockFunc)(req, res, next);

    expect(mockFunc).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("에러 발생 시 next 호출되어야 한다.", async () => {
    const error = new Error("test error");
    const mockFunc = jest.fn().mockRejectedValue(error);

    await tryCatchWrapper(mockFunc)(req, res, next);

    expect(mockFunc).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("tryCatchWrapperWithDb", () => {
  it("DB 연결 후 func를 실행해야한다.", async () => {
    const mockFunc = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapperWithDb(pool)(mockFunc)(req, res, next);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockFunc).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("에러 발생 시 next 호출해야한다.", async () => {
    const error = new Error("db error");
    const mockFunc = jest.fn().mockRejectedValue(error);

    await tryCatchWrapperWithDb(pool)(mockFunc)(req, res, next);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockFunc).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe("tryCatchWrapperWithDbTransaction", () => {
  it("트랜잭션이 정상적으로 완료되는 경우 next를 호출되지 않아야 한다.", async () => {
    const mockFunc = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapperWithDbTransaction(pool)(mockFunc)(req, res, next);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockFunc).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(next).not.toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("트랜잭션 중 에러 발생 시 ROLLBACK와 next가 호출되어야 한다.", async () => {
    const error = new Error("transaction error");
    const mockFunc = jest.fn().mockRejectedValue(error);

    await tryCatchWrapperWithDbTransaction(pool)(mockFunc)(req, res, next);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockFunc).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("트랜잭션 중 에러 발생하여 ROLLBACK 호출 중 오류가 발생한 경우 console.error와 next가 호출되어야 한다.", async () => {
    const rollbackError = new Error("rollback error");
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(rollbackError);

    const error = new Error("transaction error");
    const mockFunc = jest.fn().mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await tryCatchWrapperWithDbTransaction(pool)(mockFunc)(req, res, next);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockFunc).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
