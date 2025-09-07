import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter, createTransport } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly emailUser: string | undefined;
  private readonly emailPass: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.emailUser = this.configService.get<string>("EMAIL_USER");
    this.emailPass = this.configService.get<string>("EMAIL_PASS");

    if (!this.emailUser || !this.emailPass) {
      throw new Error("EMAIL_USER 또는 EMAIL_PASS 환경 변수가 없습니다.");
    }

    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("EMAIL_USER"),
        pass: this.configService.get<string>("EMAIL_PASS"),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>("EMAIL_USER"),
      to,
      subject,
      text,
    });
  }
}
