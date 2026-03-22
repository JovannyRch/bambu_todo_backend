import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ListTodoDto } from './dto/list-todo.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('v1/todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post('create')
  create(@Req() req: any, @Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(req.user.userId, createTodoDto);
  }

  @Get('list')
  findAll(@Req() req: any, @Query() query: ListTodoDto) {
    return this.todoService.findAll(req.user.userId, query);
  }

  @Get('list/:id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.todoService.findOne(req.user.userId, id);
  }

  @Patch('update/:id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(req.user.userId, id, updateTodoDto);
  }

  @Delete('list/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.todoService.remove(req.user.userId, id);
  }
}