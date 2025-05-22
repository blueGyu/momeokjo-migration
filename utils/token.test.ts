import jwt from "jsonwebtoken";
import env from "../config/env";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./token";

jest.mock("../config/env", () => ({
  JWT_ACCESS_SECRET: "access_secret",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_SECRET: "refresh_secret",
  JWT_REFRESH_EXPIRES_IN: "30d",
}));

describe("generateAccessToken", () => {
  afterEach(() => {
    env.JWT_ACCESS_SECRET = "access_secret";
    jest.restoreAllMocks();
  });

  it("payload, 환경 변수가 유효한 경우 토큰을 생성해야한다.", () => {
    const { success, data, message } = generateAccessToken({ id: 1 });

    expect(success).toBe(true);
    expect(data).toStrictEqual(expect.any(String));
    expect(message).toBe("");
  });

  it("payload가 유효하지 않은 경우 오류 메시지를 반환해야한다.", () => {
    const { success, data, message } = generateAccessToken({});

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("payload 확인 필요");
  });

  it("payload가 유효하지만 비밀키가 유효하지 않은 경우 오류 메시지를 반환해야한다.", () => {
    env.JWT_ACCESS_SECRET = "";

    const { success, data, message } = generateAccessToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("비밀키 확인 필요");
  });

  it("예측하지 못한 Error 인스턴스가 발생한 경우 오류 메시지를 반환해야한다.", () => {
    const errorMessage = "unexpected error";
    jest.spyOn(jwt, "sign").mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { success, data, message } = generateAccessToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe(errorMessage);
  });

  it("예측하지 못한 Error 인스턴스가 아닌 오류가 발생한 경우 오류 메시지를 반환해야한다.", () => {
    jest.spyOn(jwt, "sign").mockImplementation(() => {
      throw "unexpected error";
    });

    const { success, data, message } = generateAccessToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("토큰 생성 중 오류 발생");
  });
});

describe("generateRefreshToken", () => {
  afterEach(() => {
    env.JWT_REFRESH_SECRET = "refresh_secret";
    jest.restoreAllMocks();
  });

  it("payload, 환경 변수가 유효한 경우 토큰을 생성해야한다.", () => {
    const { success, data, message } = generateRefreshToken({ id: 1 });

    expect(success).toBe(true);
    expect(data).toStrictEqual(expect.any(String));
    expect(message).toBe("");
  });

  it("payload가 유효하지 않은 경우 오류 메시지를 반환해야한다.", () => {
    const { success, data, message } = generateRefreshToken({});

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("payload 확인 필요");
  });

  it("payload가 유효하지만 비밀키가 유효하지 않은 경우 오류 매시지를 반환해야한다.", () => {
    env.JWT_REFRESH_SECRET = "";

    const { success, data, message } = generateRefreshToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("비밀키 확인 필요");
  });

  it("예측하지 못한 오류가 발생한 경우 오류 메시지를 반환해야한다.", () => {
    const errorMessage = "unexpected error";
    jest.spyOn(jwt, "sign").mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { success, data, message } = generateRefreshToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe(errorMessage);
  });

  it("예측하지 못한 오류가 발생한 경우 오류 메시지를 반환해야한다.", () => {
    jest.spyOn(jwt, "sign").mockImplementation(() => {
      throw "unexpected error";
    });

    const { success, data, message } = generateRefreshToken({ id: 1 });

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(message).toBe("토큰 생성 중 오류 발생");
  });
});

describe("verifyAccessToken", () => {
  const dummyPayload = { id: 1 };
  const { data: validToken } = generateAccessToken(dummyPayload);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("유효한 토크인 경우 검증된 값을 응답해야한다.", () => {
    const { success, data, message } = verifyAccessToken(validToken as string);

    expect(success).toBe(true);
    expect(data).toMatchObject(dummyPayload);
    expect(message).toBe("");
  });

  it("토큰이 빈 값이면 실패 응답을 해야 한다.", () => {
    const { success, code, data, message } = verifyAccessToken("");

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(code).toBeUndefined();
    expect(message).toBe("token 확인 필요");
  });

  it("토큰이 만료된 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("token expired", new Date());
    });

    const { success, code, data, message } = verifyAccessToken("expired_token");

    expect(success).toBe(false);
    expect(code).toBe("TOKEN_EXPIRED");
    expect(data).toBeNull();
    expect(message).toBe("토큰이 만료되었습니다.");
  });

  it("유효하지 않은 토큰인 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });

    const { success, code, data, message } = verifyAccessToken("invalid_token");

    expect(success).toBe(false);
    expect(code).toBe("INVALID_TOKEN");
    expect(data).toBeNull();
    expect(message).toBe("유효하지 않은 토큰입니다.");
  });

  it("알 수 없는 오류가 발생한 경우 실패 응답을 해야 한다.", () => {
    const errorMessage = "unexpected error";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { success, code, data, message } = verifyAccessToken("any_token");

    expect(success).toBe(false);
    expect(code).toBe("UNKNOWN_ERROR");
    expect(data).toBeNull();
    expect(message).toBe(errorMessage);
  });

  it("Error 인스턴스가 아닌 오류가 발생한 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw "unexpected error";
    });

    const { success, code, data, message } = verifyAccessToken("any_token");

    expect(success).toBe(false);
    expect(code).toBe("UNKNOWN_ERROR");
    expect(data).toBeNull();
    expect(message).toBe("토큰 디코딩 중 오류 발생");
  });
});

describe("verifyRefreshToken", () => {
  const dummyPayload = { id: 1 };
  const { data: validToken } = generateRefreshToken(dummyPayload);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("유효한 토크인 경우 검증된 값을 응답해야한다.", () => {
    const { success, data, message } = verifyRefreshToken(validToken as string);

    expect(success).toBe(true);
    expect(data).toMatchObject(dummyPayload);
    expect(message).toBe("");
  });

  it("토큰이 빈 값이면 실패 응답을 해야 한다.", () => {
    const { success, code, data, message } = verifyRefreshToken("");

    expect(success).toBe(false);
    expect(data).toBeNull();
    expect(code).toBeUndefined();
    expect(message).toBe("token 확인 필요");
  });

  it("토큰이 만료된 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("token expired", new Date());
    });

    const { success, code, data, message } = verifyRefreshToken("expired_token");

    expect(success).toBe(false);
    expect(code).toBe("TOKEN_EXPIRED");
    expect(data).toBeNull();
    expect(message).toBe("토큰이 만료되었습니다.");
  });

  it("유효하지 않은 토큰인 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });

    const { success, code, data, message } = verifyRefreshToken("invalid_token");

    expect(success).toBe(false);
    expect(code).toBe("INVALID_TOKEN");
    expect(data).toBeNull();
    expect(message).toBe("유효하지 않은 토큰입니다.");
  });

  it("알 수 없는 오류가 발생한 경우 실패 응답을 해야 한다.", () => {
    const errorMessage = "unexpected error";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { success, code, data, message } = verifyRefreshToken("any_token");

    expect(success).toBe(false);
    expect(code).toBe("UNKNOWN_ERROR");
    expect(data).toBeNull();
    expect(message).toBe(errorMessage);
  });

  it("Error 인스턴스가 아닌 오류가 발생한 경우 실패 응답을 해야 한다.", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw "unexpected error";
    });

    const { success, code, data, message } = verifyRefreshToken("any_token");

    expect(success).toBe(false);
    expect(code).toBe("UNKNOWN_ERROR");
    expect(data).toBeNull();
    expect(message).toBe("토큰 디코딩 중 오류 발생");
  });
});
