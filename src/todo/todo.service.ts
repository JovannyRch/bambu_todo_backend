import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Priority } from '@prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ListTodoDto } from './dto/list-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description,
        priority: createTodoDto.priority as Priority,
        completed: createTodoDto.completed ?? false,
        userId,
      },
    });

    return {
      message: 'Tarea creada correctamente',
      code: 'TODO_CREATED',
      data: todo,
    };
  }

  async findAll(userId: string, query: ListTodoDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.TodoWhereInput = {
      userId,
      ...(query.priority ? { priority: query.priority as Priority } : {}),
      ...(typeof query.completed === 'boolean' ? { completed: query.completed } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('FORBIDDEN ACCESS');
    }

    return {
      data: todo,
    };
  }

  async update(userId: string, id: string, updateTodoDto: UpdateTodoDto) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('FORBIDDEN ACCESS');
    }

    const updatedTodo = await this.prisma.todo.update({
      where: { id },
      data: {
        ...(updateTodoDto.title !== undefined && { title: updateTodoDto.title }),
        ...(updateTodoDto.description !== undefined && { description: updateTodoDto.description }),
        ...(updateTodoDto.priority !== undefined && {
          priority: updateTodoDto.priority as Priority,
        }),
        ...(updateTodoDto.completed !== undefined && {
          completed: updateTodoDto.completed,
        }),
      },
    });

    return {
      message: 'Tarea actualizada correctamente',
      code: 'TODO_UPDATED',
      data: updatedTodo,
    };
  }

  async remove(userId: string, id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('FORBIDDEN ACCESS');
    }

    await this.prisma.todo.delete({
      where: { id },
    });

    return {
      message: 'Tarea eliminada correctamente',
      code: 'TODO_DELETED',
    };
  }
}