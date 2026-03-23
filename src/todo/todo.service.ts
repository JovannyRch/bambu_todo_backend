import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
        nombre: createTodoDto.nombre,
        descripcion: createTodoDto.descripcion,
        prioridad: createTodoDto.prioridad as Priority,
        finalizada: createTodoDto.finalizada ?? false,
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
    const reportWhere: Prisma.TodoWhereInput = { userId };

    const where: Prisma.TodoWhereInput = {
      ...reportWhere,
      ...(query.prioridad ? { prioridad: query.prioridad as Priority } : {}),
      ...(typeof query.finalizada === 'boolean'
        ? { finalizada: query.finalizada }
        : {}),
    };

    const [items, total, completedCount, pendingCount] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        orderBy: { fechaCreacion: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.todo.count({ where }),
      this.prisma.todo.count({
        where: { ...reportWhere, finalizada: true },
      }),
      this.prisma.todo.count({
        where: { ...reportWhere, finalizada: false },
      }),
    ]);

    return {
      data: items,
      report: {
        totalTodos: completedCount + pendingCount,
        completedTodos: completedCount,
        pendingTodos: pendingCount,
        completionRate:
          completedCount + pendingCount === 0
            ? 0
            : Number(
                (
                  (completedCount / (completedCount + pendingCount)) *
                  100
                ).toFixed(2),
              ),
      },
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
        ...(updateTodoDto.nombre !== undefined && { nombre: updateTodoDto.nombre }),
        ...(updateTodoDto.descripcion !== undefined && { descripcion: updateTodoDto.descripcion }),
        ...(updateTodoDto.prioridad !== undefined && {
          prioridad: updateTodoDto.prioridad as Priority,
        }),
        ...(updateTodoDto.finalizada !== undefined && {
          finalizada: updateTodoDto.finalizada,
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
