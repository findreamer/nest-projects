import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({
    message: 'Book name cannot be empty',
  })
  name: string;

  @IsNotEmpty({
    message: 'Book author cannot be empty',
  })
  author: string;

  @IsNotEmpty({
    message: 'Book description cannot be empty',
  })
  description: string;

  @IsNotEmpty({
    message: 'Book cover cannot be empty',
  })
  cover: string;
}
