import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: 'smtp.126.com',
      port: 587,
      auth: {
        user: 'findream@126.com',
        pass: 'YRyGL32vWKLPDfRS',
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '考试系统',
        address: '你的邮箱地址',
      },
      to,
      subject,
      html,
    });
  }
}
