import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DbService } from 'src/db/db.service';
import { Book } from './entities/book.entity';

function randomNum() {
  return Math.floor(Math.random() * 1000000);
}

@Injectable()
export class BookService {
  @Inject(DbService)
  private readonly DbService: DbService;

  async create(createBookDto: CreateBookDto) {
    // 读取文件，查看是否存在相同的书
    const bookList: Book[] = await this.DbService.readFile();

    const bookInfo = bookList.find((item) => item.name === createBookDto.name);
    if (bookInfo) {
      throw new BadRequestException('该书已经存在');
    }

    // 写入书文件
    const book = new Book();
    book.id = randomNum();
    book.name = createBookDto.name;
    book.author = createBookDto.author;
    book.description = createBookDto.description;
    book.cover = createBookDto.cover;

    bookList.push(book);

    await this.DbService.writeFile(bookList);

    return book;
  }

  async findAll(name?: string) {
    const bookList: Book[] = await this.DbService.readFile();

    if (name) {
      return bookList.filter((item) => item.name.includes(name)) || [];
    }

    return bookList || [];
  }

  async findOne(id: number) {
    const bookList: Book[] = await this.DbService.readFile();

    return bookList.find((item) => item.id === id) || {};
  }

  async update(updateBookDto: UpdateBookDto) {
    const books: Book[] = await this.DbService.readFile();

    const foundBook = books.find((book) => book.id === updateBookDto.id);

    if (!foundBook) {
      throw new BadRequestException('该图书不存在');
    }

    foundBook.author = updateBookDto.author!;
    foundBook.cover = updateBookDto.cover!;
    foundBook.description = updateBookDto.description!;
    foundBook.name = updateBookDto.name!;

    await this.DbService.writeFile(books);
    return foundBook;
  }

  async remove(id: number) {
    const books: Book[] = await this.DbService.readFile();
    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
      books.splice(index, 1);
      await this.DbService.writeFile(books);
    }

    return true;
  }
}
