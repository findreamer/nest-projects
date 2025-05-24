import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DbService } from 'src/db/db.service';
import { Book } from './entities/book.entity';

function randomNum() {
  return Math.floor(Math.random() * 10000000);
}

@Injectable()
export class BookService {
  constructor(private readonly dbService: DbService) {}
  async create(createBookDto: CreateBookDto) {
    const books: Book[] = await this.dbService.read();
    const book = new Book();
    book.id = randomNum();
    book.name = createBookDto.name;
    book.author = createBookDto.author;
    book.description = createBookDto.description;
    book.cover = createBookDto.cover;
    books.push(book);
    await this.dbService.write(books);
    return book;
  }

  async findAll() {
    const books = await this.dbService.read();
    return books;
  }

  async findById(id: number) {
    const books = await this.dbService.read();
    const book = books.find((book) => book.id === id);
    if (!book) {
      return null;
    }
    return book;
  }

  async update(updateBookDto: UpdateBookDto) {
    const books = await this.dbService.read();
    const book = books.find((book) => book.id === updateBookDto.id);
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    book.name = updateBookDto.name;
    book.author = updateBookDto.author;
    book.description = updateBookDto.description;
    book.cover = updateBookDto.cover;
    await this.dbService.write(books);
    return book;
  }

  async delete(id: number) {
    const books = await this.dbService.read();
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1) {
      books.splice(index, 1);
      await this.dbService.write(books);
      return 'ok';
    }
    return 'id not found';
  }
}
