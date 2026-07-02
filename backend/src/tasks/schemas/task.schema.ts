import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { TaskStatus, TASK_STATUSES } from '@teamboard/shared';

export type TaskDocument = HydratedDocument<Task>;

/**
 * Task collection. `status` reuses the SHARED `TaskStatus` enum (docs/01) — the same
 * values the DB constrains, the DTOs validate, and the UI renders. `project` is an
 * ObjectId reference to its parent Project (docs/00 · ADR-002).
 */
@Schema({ timestamps: true, collection: 'tasks' })
export class Task {
  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ trim: true, maxlength: 4000 })
  description?: string;

  @Prop({
    type: String,
    enum: TASK_STATUSES,
    default: TaskStatus.Todo,
    index: true,
  })
  status!: TaskStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true, index: true })
  project!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = String(r._id);
    r.project = String(r.project);
    delete r._id;
    return r;
  },
});
