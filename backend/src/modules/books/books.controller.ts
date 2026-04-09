import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { normalizePrimitivePayload } from '../access/shared';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { BookIdDto } from './dto/book-id.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksDto } from './dto/list-books.dto';
import { UpdateGradeDto, UpdateBookVersionDto } from './dto/resource.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateBookLockDto } from './dto/update-book-lock.dto';
import { BooksService } from './books.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('grade/list')
  listGrades() {
    return this.booksService.listGrades();
  }

  @Post('grade/add')
  createGrade(@Body() payload: unknown) {
    return this.booksService.createGrade(normalizePrimitivePayload<{ name?: string }>(payload, 'name').name);
  }

  @Post('grade/update')
  updateGrade(@Body() payload: UpdateGradeDto) {
    return this.booksService.updateGrade(payload);
  }

  @Get('grade/version/delete/:id')
  deleteGrade(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteGrade(id);
  }

  @Get('book/version/list')
  listVersions() {
    return this.booksService.listVersions();
  }

  @Post('book/version/add')
  createVersion(@Body() payload: unknown) {
    return this.booksService.createVersion(
      normalizePrimitivePayload<{ name?: string }>(payload, 'name').name,
    );
  }

  @Post('book/version/update')
  updateVersion(@Body() payload: UpdateBookVersionDto) {
    return this.booksService.updateVersion(payload);
  }

  @Get('book/version/delete/:id')
  deleteVersion(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteVersion(id);
  }

  @Post('book/list')
  listBooks(@Body() payload: ListBooksDto) {
    return this.booksService.listBooks(payload);
  }

  @Post('book/add')
  createBook(@Body() payload: CreateBookDto) {
    return this.booksService.createBook(payload);
  }

  @Post('book/update')
  updateBook(@Body() payload: UpdateBookDto) {
    return this.booksService.updateBook(payload);
  }

  @Post('book/delete')
  deleteBook(@Body() payload: unknown) {
    const normalized = normalizePrimitivePayload<BookIdDto>(payload, 'id');
    return this.booksService.deleteBook(Number(normalized.id));
  }

  @Post('book/lock')
  updateBookLock(@Query() payload: UpdateBookLockDto) {
    return this.booksService.updateBookLock(payload);
  }
}
