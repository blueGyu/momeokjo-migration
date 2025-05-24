// 환경설정
import env from "./config/env";

// 외부 라이브러리
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// 라우터
// import authRouter from "./domains/auth/router";
// import restaurantsRouter from "./domains/restaurants/router";
// import usersRouter from "./domains/users/router";
// import adminRouter from "./domains/admin/router";

// 미들웨어
// import errorHandler from "./middlewares/errorHandler";
// import notFoundHandler from "./middlewares/notFoundHandler";

const app = express();

app.use(
  cors({
    origin: env.FRONT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// app.use("/auth", authRouter);
// app.use("/restaurants", restaurantsRouter);
// app.use("/users", usersRouter);
// app.use("/admin", adminRouter);

// app.use(notFoundHandler);
// app.use(errorHandler);

export default app;
