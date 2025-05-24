import { Injectable, Inject } from '@nestjs/common';
import { DbModuleOptions } from './db.module';
import { readFile, writeFile, access } from 'fs/promises';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private options: DbModuleOptions;

  async read() {
    const filePath = this.options.path;

    try {
      await access(filePath);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return [];
    }

    const str = await readFile(filePath, { encoding: 'utf8' });

    if (!str) {
      return [];
    }
    return JSON.parse(str);
  }

  async write(data: Record<string, unknown> | Array<unknown>) {
    await writeFile(this.options.path, JSON.stringify(data), {
      encoding: 'utf-8',
    });
  }
}
