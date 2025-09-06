import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { EmailService } from "./email.service";

// nodemailer 모킹
jest.mock("nodemailer");

// 테스트에서 쉽게 접근할 수 있도록 추가
const mockCreateTransport = nodemailer.createTransport as jest.Mock;
const mockSendMail = jest.fn();

describe("EmailService", () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockCreateTransport.mockReturnValue({
      sendMail: mockSendMail,
    });

    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case "EMAIL_USER":
          return "testuser@gmail.com";
        case "EMAIL_PASS":
          return "testpassword";
        default:
          return undefined;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    mockCreateTransport.mockClear();
    mockSendMail.mockClear();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("constructor", () => {
    it("서비스가 생성될 때 transporter를 올바른 설정으로 초기화해야 한다", () => {
      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: {
          user: "testuser@gmail.com",
          pass: "testpassword",
        },
      });
    });

    it("EMAIL_USER 환경 변수가 없는 경우 예외를 발생시켜야 한다", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "EMAIL_USER") return undefined;
        return "testuser@gmail.com";
      });

      expect(() => new EmailService(configService)).toThrow(
        "EMAIL_USER 또는 EMAIL_PASS 환경 변수가 없습니다."
      );
    });

    it("EMAIL_PASS 환경 변수가 없는 경우 예외를 발생시켜야 한다", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "EMAIL_PASS") return undefined;
        return "testpassword";
      });

      expect(() => new EmailService(configService)).toThrow(
        "EMAIL_USER 또는 EMAIL_PASS 환경 변수가 없습니다."
      );
    });
  });

  describe("sendEmail", () => {
    it("transporter.sendMail을 올바른 인자와 함께 호출해야 한다", async () => {
      const to = "recipient@example.com";
      const subject = "Test Subject";
      const text = "Test Body";
      const from = "testuser@gmail.com";

      await service.sendEmail(to, subject, text);

      expect(mockSendMail).toHaveBeenCalledWith({
        from,
        to,
        subject,
        text,
      });
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });
});
