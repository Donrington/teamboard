import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

/**
 * Tasks are nested under their project — the URL itself expresses the ownership
 * hierarchy, and the service verifies the caller owns `:projectId` on every call.
 *
 *   GET/POST         /api/projects/:projectId/tasks
 *   PATCH/DELETE     /api/projects/:projectId/tasks/:taskId
 */
@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.tasksService.findAllForProject(userId, projectId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, projectId, dto);
  }

  @Patch(':taskId')
  update(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('taskId', ParseObjectIdPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId, projectId, taskId, dto);
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('taskId', ParseObjectIdPipe) taskId: string,
  ) {
    return this.tasksService.remove(userId, projectId, taskId);
  }
}
