import { Document, Types } from 'mongoose';

export type TSpinCategory =
  | 'arts-crafts'
  | 'nature'
  | 'family'
  | 'sport'
  | 'friends'
  | 'meditation';

export interface ISpinResult extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  category: TSpinCategory;
  spinDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  pointsEarned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpinRequest {
  categories?: TSpinCategory[];
  excludeCompleted?: boolean;
}

export interface ISpinResponse {
  task: {
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: TSpinCategory;
    points: number;
  };
  spinResult: ISpinResult;
  message: string;
}

export interface ISpinHistory {
  spinResults: ISpinResult[];
  stats: {
    totalSpins: number;
    completedSpins: number;
    totalPointsEarned: number;
    favoriteCategory: string;
  };
}

export const SPIN_CATEGORIES: TSpinCategory[] = [
  'arts-crafts',
  'nature',
  'family',
  'sport',
  'friends',
  'meditation',
];
