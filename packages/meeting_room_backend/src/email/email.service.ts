import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('nodemailer_host');
    const port = this.configService.get('nodemailer_port');
    const auth = {
      user: this.configService.get('nodemailer_auth_user'),
      pass: this.configService.get('nodemailer_auth_pass'),
    };
    console.log(host, port, auth);
    this.transporter = createTransport({
      host,
      port: Number(port),
      auth,
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: this.configService.get('nodemailer_auth_user'),
      },
      to,
      subject,
      html,
    });
  }
}
