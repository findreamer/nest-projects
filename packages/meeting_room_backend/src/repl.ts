import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await repl(AppModule);
  app.setupHistory('.nestjs_repl_history', (err) => {
    if (err) {
      console.error('Error setting up history', err);
    }
  });
}

bootstrap();
