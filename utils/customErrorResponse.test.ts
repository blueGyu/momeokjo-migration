import customErrorResponse from "./customErrorResponse";

it("status, target이 undefined인 경우 status 500을 가지는 Error 객체를 리턴해야한다.", () => {
  const message = "에러 메시지";
  const status = undefined;
  const target = undefined;

  const result = customErrorResponse({ message, status, target });

  expect(result).toBeInstanceOf(Error);
  expect(result.status).toBe(500);
  expect(result.message).toBe(message);
  expect(result.target).toBeUndefined();
});

it("status와 message만 입력한 경우 해당 값이 반경된 Error 객체를 리턴해야한다.", () => {
  const message = "에러 메시지";
  const status = 404;
  const target = undefined;

  const result = customErrorResponse({ message, status, target });

  expect(result).toBeInstanceOf(Error);
  expect(result.status).toBe(status);
  expect(result.message).toBe(message);
  expect(result.target).toBeUndefined();
});

it("message와 target만 입력한 경우 해당 값이 반영되고 status가 500인 Error 객체를 리턴해야한다.", () => {
  const message = "에러 메시지";
  const status = undefined;
  const target = "target";

  const result = customErrorResponse({ status, message, target });

  expect(result).toBeInstanceOf(Error);
  expect(result.status).toBe(500);
  expect(result.message).toBe(message);
  expect(result.target).toBe(target);
});
