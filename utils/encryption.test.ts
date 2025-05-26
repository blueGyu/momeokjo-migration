import { encrypt, decrypt } from "./encryption";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("encrypt", () => {
  it("유효하지 않은 값을 입력하면 실패 응답을 해야한다.", async () => {
    const { success, data, message } = await encrypt("");

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe("plainText 확인 필요");
  });

  it("유효한 값을 입력하면 성공 응답을 해야한다.", async () => {
    const { success, data, message } = await encrypt("test");

    expect(success).toBe(true);
    expect(data).toStrictEqual(expect.any(String));
    expect(message).toBeUndefined();
  });

  it("알 수 없는 오류가 발생한 경우 실패 응답을 해야 한다.", async () => {
    const error = "unexpected error";
    jest.spyOn(Buffer, "concat").mockImplementation(() => {
      throw new Error(error);
    });

    const { success, data, message } = await encrypt("test");

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe(error);
  });

  it("Error 인스턴스가 아닌 오류가 발생한 경우 실패 응답을 해야 한다.", async () => {
    const error = "암호화 중 오류 발생";
    jest.spyOn(Buffer, "concat").mockImplementation(() => {
      throw error;
    });

    const { success, data, message } = await encrypt("test");

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe(error);
  });
});

describe("decrypt", () => {
  it("유효하지 않은 값을 입력하면 실패 응답을 해야한다.", async () => {
    const { success, data, message } = await decrypt("");

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe("encryptedText 확인 필요");
  });

  it("암호화된 문자열 형식이 잘못된 경우 실패 응답을 해야한다.", async () => {
    const { success, data, message } = await decrypt("invalid:format");

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe("암호화된 문자열 형식이 잘못되었습니다.");
  });

  it("유효한 암호화된 문자열을 입력하면 성공 응답을 해야한다.", async () => {
    const encrypted = await encrypt("test");
    const { success, data, message } = await decrypt(encrypted.data as string);

    expect(success).toBe(true);
    expect(data).toBe("test");
    expect(message).toBeUndefined();
  });

  it("알 수 없는 오류가 발생한 경우 실패 응답을 해야 한다.", async () => {
    const encrypted = await encrypt("test");

    const error = "unexpected error";
    jest.spyOn(Buffer, "concat").mockImplementation(() => {
      throw new Error(error);
    });

    const { success, data, message } = await decrypt(encrypted.data as string);

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe(error);
  });

  it("Error 인스턴스가 아닌 오류가 발생한 경우 실패 응답을 해야 한다.", async () => {
    const encrypted = await encrypt("test");

    const error = "복호화 중 오류 발생";
    jest.spyOn(Buffer, "concat").mockImplementation(() => {
      throw error;
    });

    const { success, data, message } = await decrypt(encrypted.data as string);

    expect(success).toBe(false);
    expect(data).toBeUndefined();
    expect(message).toBe(error);
  });
});
