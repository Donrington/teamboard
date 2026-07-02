import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TaskStatus } from '@teamboard/shared';

import { TasksService } from '../src/tasks/tasks.service';
import { ProjectsService } from '../src/projects/projects.service';
import { Task } from '../src/tasks/schemas/task.schema';

/**
 * Unit tests for TasksService with the Task model and ProjectsService mocked. The key
 * behaviour under test is that ownership is checked before any task read/write, and
 * that a default status is applied on create (docs/08).
 */
describe('TasksService', () => {
  let service: TasksService;
  let taskModel: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    deleteOne: jest.Mock;
  };
  let projects: { findOneForOwner: jest.Mock };

  const ownerId = new Types.ObjectId().toHexString();
  const projectId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    taskModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    };
    projects = { findOneForOwner: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: taskModel },
        { provide: ProjectsService, useValue: projects },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  it('checks project ownership and defaults status to "todo" on create', async () => {
    projects.findOneForOwner.mockResolvedValue({ _id: projectId });
    taskModel.create.mockResolvedValue({ id: 'task-1' });

    await service.create(ownerId, projectId, { title: 'Draft copy' });

    expect(projects.findOneForOwner).toHaveBeenCalledWith(ownerId, projectId);
    const createdArg = taskModel.create.mock.calls[0][0];
    expect(createdArg.status).toBe(TaskStatus.Todo);
    expect(createdArg.title).toBe('Draft copy');
  });

  it('does not create a task when the caller does not own the project', async () => {
    projects.findOneForOwner.mockRejectedValue(new NotFoundException());

    await expect(
      service.create(ownerId, projectId, { title: 'Draft copy' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(taskModel.create).not.toHaveBeenCalled();
  });

  it('throws 404 when updating a task that is not in the project', async () => {
    projects.findOneForOwner.mockResolvedValue({ _id: projectId });
    taskModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.update(ownerId, projectId, new Types.ObjectId().toHexString(), { title: 'New' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
