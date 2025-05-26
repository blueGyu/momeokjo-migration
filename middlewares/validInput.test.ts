import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import validInput from "../middlewares/validInput";

describe("validInput middleware", () => {
  const schema = z.object({
    id: z.string().min(1),
  });

  const mockReq = (target: "body" | "params" | "query", value: any): Request =>
    ({ [target]: value } as Request);
  const mockRes = {} as Response;
  const mockNext = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("검증이 완료된 경우 next 호출", async () => {
    const req = mockReq("body", { id: "test" });
    const middleware = validInput("body", schema);
    await middleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("검증 과정에서 오류 발생한 경우 예외 발생", async () => {
    const req = mockReq("body", { id: "" });
    const middleware = validInput("body", schema);
    const next = jest.fn();

    await middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Invalid request body");
  });
});
