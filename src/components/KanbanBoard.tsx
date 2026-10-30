'use client';

import React from 'react';
import { 
  Circle, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onOpenNewTaskModalWithStatus: (status: TaskStatus) => void;
  currentDate?: string;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  accentClass: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: 'To Do',
    icon: <Circle size={15} />,
    accentClass: 'column-accent-todo',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: <Clock size={15} />,
    accentClass: 'column-accent-progress',
  },
  {
    id: 'review',
    title: 'In Review',
    icon: <Eye size={15} />,
    accentClass: 'column-accent-review',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: <CheckCircle2 size={15} />,
    accentClass: 'column-accent-completed',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onStartFocus,
  onOpenNewTaskModalWithStatus,
  currentDate = '',
}) => {
  return (
    <div className="kanban-board-container">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-column">
            {/* Column Header */}
            <div className={`kanban-column-header ${col.accentClass}`}>
              <div className="column-title-group">
                <span className="column-icon">{col.icon}</span>
                <h3 className="column-title">{col.title}</h3>
                <span className="column-count-badge">{columnTasks.length}</span>
              </div>

              <button
                onClick={() => onOpenNewTaskModalWithStatus(col.id)}
                className="column-add-btn"
                title={`Add task to ${col.title}`}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Column Cards List */}
            <div className="kanban-cards-track">
              {columnTasks.length === 0 ? (
                <div className="column-empty-state">
                  <div className="empty-sparkle-box">
                    <Sparkles size={18} className="text-muted" />
                  </div>
                  <span className="empty-state-text">No tasks in {col.title}</span>
                  <button
                    onClick={() => onOpenNewTaskModalWithStatus(col.id)}
                    className="btn btn-ghost btn-sm empty-add-btn"
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    layout="kanban"
                    currentDate={currentDate}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                    onStartFocus={onStartFocus}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
