import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskStatus } from '@teamboard/shared';

import { Task, TaskDocument } from './schemas/task.schema';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * Task business logic, always scoped to a project the caller owns. Every method first
 * calls `projectsService.findOneForOwner(ownerId, projectId)` — one reused ownership
 * gate — so tasks inherit their project's access rules and cross-user access is
 * impossible (docs/00 · ADR-005). This dependency on ProjectsService is the seam that
 * would become a service-to-service call after a microservice split.
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    ownerId: string,
    projectId: string,
    dto: CreateTaskDto,
  ): Promise<TaskDocument> {
    await this.projectsService.findOneForOwner(ownerId, projectId); // authz gate
    return this.taskModel.create({
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TaskStatus.Todo,
      project: new Types.ObjectId(projectId),
    });
  }

  async findAllForProject(ownerId: string, projectId: string): Promise<TaskDocument[]> {
    await this.projectsService.findOneForOwner(ownerId, projectId);
    return this.taskModel
      .find({ project: new Types.ObjectId(projectId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async update(
    ownerId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    await this.projectsService.findOneForOwner(ownerId, projectId);
    const task = await this.taskModel
      .findOne({ _id: taskId, project: new Types.ObjectId(projectId) })
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found.');
    }
    Object.assign(task, dto);
    return task.save();
  }

  async remove(ownerId: string, projectId: string, taskId: string): Promise<void> {
    await this.projectsService.findOneForOwner(ownerId, projectId);
    const result = await this.taskModel
      .deleteOne({ _id: taskId, project: new Types.ObjectId(projectId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found.');
    }
  }
}
