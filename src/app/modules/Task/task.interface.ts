export type TTaskStatus = 'pending' | 'inprogress' | 'done';

export type TTaskCategory =
  | 'arts_and_craft'
  | 'nature'
  | 'family'
  | 'sport'
  | 'friends'
  | 'meditation';

export type TTask = {
  _id: string;
  title: string;
  description: string;
  category: TTaskCategory;
  status: TTaskStatus;
  userId: string;
  dueDate?: Date;
  completedAt?: Date;
  points: number;
  isCollaborative: boolean;
  collaborators?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type TCreateTask = {
  title: string;
  description: string;
  category: TTaskCategory;
  dueDate?: Date;
  points?: number;
  isCollaborative?: boolean;
  collaborators?: string[];
};

export type TUpdateTask = {
  title?: string;
  description?: string;
  category?: TTaskCategory;
  status?: TTaskStatus;
  dueDate?: Date;
  points?: number;
  isCollaborative?: boolean;
  collaborators?: string[];
};

export type TTaskQuery = {
  search?: string;
  category?: TTaskCategory;
  status?: TTaskStatus;
  isCollaborative?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
