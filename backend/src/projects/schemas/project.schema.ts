import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

/**
 * Project collection. `owner` is a *reference* to a User (ObjectId), not an embedded
 * copy — so projects stay independently queryable and, later, splittable into their
 * own service (docs/00 · ADR-002).
 */
@Schema({ timestamps: true, collection: 'projects' })
export class Project {
  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = String(r._id);
    r.owner = String(r.owner);
    delete r._id;
    return r;
  },
});
