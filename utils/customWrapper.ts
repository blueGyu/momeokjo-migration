import { NextFunction } from "express";
import { Pool, PoolClient } from "pg";

// 일반 wrapper 타입
type AsyncRequestHandler = {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
};

// 데이터베이스 작업이 필요한 경우 사용할 wrapper 타입
type AsyncRequestHandlerWithDb = {
  (req: Request, res: Response, next: NextFunction, client: PoolClient): Promise<void>;
};

// 일반 wrapper
export const tryCatchWrapper =
  (func: AsyncRequestHandler): AsyncRequestHandler =>
  async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (err) {
      next(err);
    }
  };

// 데이터베이스 작업이 필요한 경우 사용할 wrapper
export const tryCatchWrapperWithDb =
  (pool: Pool) =>
  (func: AsyncRequestHandlerWithDb): AsyncRequestHandlerWithDb =>
  async (req, res, next) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await func(req, res, next, client);
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  };

// 신고 누적으로 인한 soft delete 진행 시 사용할 wrapper
export const tryCatchWrapperWithDbTransaction =
  (pool: Pool) =>
  (func: AsyncRequestHandlerWithDb): AsyncRequestHandlerWithDb =>
  async (req, res, next) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();

      await client.query("BEGIN");
      await func(req, res, next, client);
      await client.query("COMMIT");
    } catch (err) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackErr) {
          //TODO: 로깅 기능 추가
          console.error("Rollback error:", rollbackErr);
        }
      }
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  };
