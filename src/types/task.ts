export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type TaskCategory = 
  | 'Work'
  | 'Engineering'
  | 'Design'
  | 'Personal'
  | 'Finance'
  | 'Health'
  | 'Learning';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string; // ISO date string YYYY-MM-DD
  subtasks: SubTask[];
  tags: string[];
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'list' | 'kanban' | 'focus';

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortDirection: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  review: number;
  overdue: number;
  completionRate: number;
  highPriorityCount: number;
}
