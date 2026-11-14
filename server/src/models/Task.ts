import mongoose, { Schema, Document } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskEntityType = 'lead' | 'customer' | 'property' | 'booking' | 'site-visit' | 'general';

export interface ITask extends Document {
  referenceId: string;
  title: string;
  description?: string;
  entityType: TaskEntityType;
  entityId?: string;
  entityTitle?: string;
  assignedTo?: mongoose.Types.ObjectId;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  completedAt?: Date;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    entityType: {
      type: String,
      enum: ['lead', 'customer', 'property', 'booking', 'site-visit', 'general'],
      default: 'general',
    },
    entityId: { type: String },
    entityTitle: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedEmployeeId: { type: String, required: true },
    assignedEmployeeName: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ assignedEmployeeId: 1, status: 1 });
TaskSchema.index({ entityType: 1, entityId: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);

