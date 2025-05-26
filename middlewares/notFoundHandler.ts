import { NextFunction, Request, Response } from "express";

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "요청한 API 찾을 수 없음" });
};

export default notFoundHandler;
