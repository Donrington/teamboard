import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Project as ProjectContract } from '@teamboard/shared';

import { Project, ProjectDocument } from './schemas/project.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * All project business logic. Every method is scoped to an `ownerId`, so a user can
 * only ever see or mutate their own projects (docs/00 · ADR-005). `findOneForOwner`
 * is the single ownership gate that TasksService also reuses.
 */
@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    // Registered here for the delete-cascade and the task-count aggregation only.
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  create(ownerId: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    return this.projectModel.create({ ...dto, owner: new Types.ObjectId(ownerId) });
  }

  /** List the user's projects, newest-touched first, each with a live `taskCount`. */
  async findAllForOwner(ownerId: string): Promise<ProjectContract[]> {
    const projects = await this.projectModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ updatedAt: -1 })
      .exec();

    // One aggregation for all counts instead of N per-project queries.
    const ids = projects.map((p) => p._id);
    const counts = await this.taskModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { project: { $in: ids } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);
    const countByProject = new Map(counts.map((c) => [String(c._id), c.count]));

    return projects.map((p) => ({
      ...(p.toJSON() as unknown as ProjectContract),
      taskCount: countByProject.get(String(p._id)) ?? 0,
    }));
  }

  /**
   * Fetch one project the user owns. Throws 404 (not 403) when it is missing OR not
   * theirs — we never reveal that an id exists for another user.
   */
  async findOneForOwner(ownerId: string, projectId: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findOne({ _id: projectId, owner: new Types.ObjectId(ownerId) })
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  async update(
    ownerId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.findOneForOwner(ownerId, projectId);
    Object.assign(project, dto);
    return project.save();
  }

  async remove(ownerId: string, projectId: string): Promise<void> {
    const project = await this.findOneForOwner(ownerId, projectId);
    // Cascade delete the project's tasks. In a microservice split this becomes a
    // `ProjectDeleted` event consumed by TaskService (docs/00 · §5).
    await this.taskModel.deleteMany({ project: project._id }).exec();
    await project.deleteOne();
  }

  /**
   * Delete every project (and their tasks) owned by a user. Used by account deletion
   * (UsersService.deleteById) — same cascade shape as `remove`, just for the whole
   * owner instead of one project.
   */
  async removeAllForOwner(ownerId: string): Promise<void> {
    const owner = new Types.ObjectId(ownerId);
    const projectIds = await this.projectModel.find({ owner }).distinct('_id').exec();
    if (projectIds.length === 0) return;
    await this.taskModel.deleteMany({ project: { $in: projectIds } }).exec();
    await this.projectModel.deleteMany({ owner }).exec();
  }
}
