import { Document, Types } from 'mongoose';

export type TTaskCategory =
  | 'arts-crafts'
  | 'nature'
  | 'family'
  | 'sport'
  | 'friends'
  | 'meditation';

export type TTaskStatus = 'pending' | 'inprogress' | 'done';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: TTaskCategory;
  status: TTaskStatus;
  userId: Types.ObjectId;
  dueDate?: Date;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskCreate {
  title: string;
  description: string;
  category: TTaskCategory;
  dueDate?: Date | string;
  points?: number;
}

export interface ITaskUpdate {
  title?: string;
  description?: string;
  category?: TTaskCategory;
  status?: TTaskStatus;
  dueDate?: Date | string;
  points?: number;
}

export interface ITaskQuery {
  page?: string;
  limit?: string;
  category?: TTaskCategory;
  status?: TTaskStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const TASK_CATEGORIES: TTaskCategory[] = [
  'arts-crafts',
  'nature',
  'family',
  'sport',
  'friends',
  'meditation',
];

export const TASK_STATUS: TTaskStatus[] = ['pending', 'inprogress', 'done'];
