import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { tryCatchWrapper } from "../utils/customWrapper";
import customErrorResponse from "../utils/customErrorResponse";

const validInput = <T extends z.ZodRawShape>(
  target: "body" | "params" | "query",
  schema: z.ZodObject<T>
) =>
  tryCatchWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const input = req[target];
    const parse = schema.safeParse(input);

    if (!parse.success) {
      throw customErrorResponse({
        message: `Invalid request ${target}`,
        status: 400,
        target: parse.error.errors[0]?.path[0] as string,
      });
    }

    next();
  });

export default validInput;
