import { NextFunction } from "express";
import {
  tryCatchWrapper,
  tryCatchWrapperWithDb,
  tryCatchWrapperWithDbTransaction,
} from "./customWrapper";
import { Pool, PoolClient } from "pg";

const req = {} as Request;
const res = {} as Response;
const next = jest.fn() as unknown as NextFunction;

describe("tryCatchWrapper", () => {
  it("정상 동작 시 next 호출되지 않아야 함", async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapper(mockHandler)(req, res, next);

    expect(mockHandler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("에러 발생 시 next 호출되어야 함", async () => {
    const error = new Error("test error");
    const mockHandler = jest.fn().mockRejectedValue(error);

    await tryCatchWrapper(mockHandler)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("tryCatchWrapperWithDb", () => {
  it("DB 연결 후 핸들러 실행", async () => {
    const mockClient = { release: jest.fn() } as unknown as PoolClient;
    const mockPool = { connect: jest.fn().mockResolvedValue(mockClient) } as unknown as Pool;
    const mockHandler = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapperWithDb(mockPool)(mockHandler)(req, res, next, mockClient);

    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalledWith(req, res, next, mockClient);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("에러 발생 시 next 호출", async () => {
    const error = new Error("db error");
    const mockClient = { release: jest.fn() } as unknown as PoolClient;
    const mockPool = { connect: jest.fn().mockResolvedValue(mockClient) } as unknown as Pool;
    const mockHandler = jest.fn().mockRejectedValue(error);

    await tryCatchWrapperWithDb(mockPool)(mockHandler)(req, res, next, mockClient);

    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe("tryCatchWrapperWithDbTransaction", () => {
  it("트랜잭션 정상 흐름", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    } as unknown as PoolClient;

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as unknown as Pool;

    const mockHandler = jest.fn().mockResolvedValue(undefined);

    await tryCatchWrapperWithDbTransaction(mockPool)(mockHandler)(req, res, next, mockClient);

    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockHandler).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("트랜잭션 중 에러 발생 시 ROLLBACK 호출", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    } as unknown as PoolClient;

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as unknown as Pool;

    const error = new Error("transaction error");
    const mockHandler = jest.fn().mockRejectedValue(error);

    await tryCatchWrapperWithDbTransaction(mockPool)(mockHandler)(req, res, next, mockClient);

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("트랜잭션 중 에러 발생 시 ROLLBACK 호출 중 오류 발생", async () => {
    const rollbackError = new Error("rollback error");
    const mockQuery = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(rollbackError);

    const mockClient = {
      query: mockQuery,
      release: jest.fn(),
    } as unknown as PoolClient;

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as unknown as Pool;

    const error = new Error("transaction error");
    const mockHandler = jest.fn().mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await tryCatchWrapperWithDbTransaction(mockPool)(mockHandler)(req, res, next, mockClient);

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(mockClient.release).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
