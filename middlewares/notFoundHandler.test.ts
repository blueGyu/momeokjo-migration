import { Request, Response, NextFunction } from "express";
import notFoundHandler from "./notFoundHandler";

it("호출된 url이 없으면 notFoundHandler가 응답해야한다.", () => {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;

  notFoundHandler(req, res, next);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "요청한 API 찾을 수 없음" });
});
