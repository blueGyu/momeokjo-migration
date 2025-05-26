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
      throw customErrorResponse(
        `Invalid request ${target}`,
        400,
        parse.error.errors[0]?.path[0] as string
      );
    }

    next();
  });

export default validInput;
