import { Controller, Get, Inject } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AnswerController {
  @Inject('EXAM_SERVICE')
  private readonly examClient: ClientProxy;

  constructor(private readonly answerService: AnswerService) {}

  @Get()
  async getHello(): Promise<string> {
    const value = await firstValueFrom(this.examClient.send('sum', [1, 3, 5]));
    return this.answerService.getHello() + ' ' + value;
  }
}
