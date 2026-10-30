'use client';

import React, { useState } from 'react';
import { 
  CheckCheck, 
  Trash2, 
  Layers, 
  Sparkles, 
  Plus, 
  FolderCheck 
} from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onClearCompleted: () => void;
  onMarkAllCompleted: () => void;
  currentDate?: string;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onStartFocus,
  onOpenNewTaskModal,
  onClearCompleted,
  onMarkAllCompleted,
  currentDate = '',
}) => {
  const [groupBy, setGroupBy] = useState<'status' | 'none'>('status');

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;

  if (tasks.length === 0) {
    return (
      <div className="empty-tasks-container glass-card animate-fade-in">
        <div className="empty-tasks-icon-box">
          <Sparkles size={36} className="text-brand" />
        </div>
        <h3 className="empty-tasks-title">No tasks found</h3>
        <p className="empty-tasks-desc">
          There are no tasks matching your current filters. Clear filters or create a new task to get started.
        </p>
        <button
          onClick={onOpenNewTaskModal}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Create New Task</span>
        </button>
      </div>
    );
  }

  // Status groups
  const statusGroups: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'In Review' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="list-view-container">
      {/* List Toolbar */}
      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <span className="list-summary-text">
            Showing <strong>{tasks.length}</strong> tasks ({pendingCount} pending, {completedCount} completed)
          </span>
        </div>

        <div className="list-toolbar-right">
          {/* Group Toggle */}
          <button
            onClick={() => setGroupBy(groupBy === 'status' ? 'none' : 'status')}
            className="btn btn-secondary btn-sm"
          >
            <Layers size={14} />
            <span>{groupBy === 'status' ? 'Ungroup' : 'Group by Status'}</span>
          </button>

          {/* Mark all complete */}
          {pendingCount > 0 && (
            <button
              onClick={onMarkAllCompleted}
              className="btn btn-ghost btn-sm"
              title="Mark all pending tasks completed"
            >
              <CheckCheck size={14} />
              <span>Mark All Done</span>
            </button>
          )}

          {/* Clear completed */}
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="btn btn-ghost btn-sm text-danger"
              title="Remove all completed tasks"
            >
              <Trash2 size={14} />
              <span>Clear Completed ({completedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Grouped or Flat List */}
      {groupBy === 'none' ? (
        <div className="tasks-list-stack">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              layout="list"
              currentDate={currentDate}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      ) : (
        <div className="status-groups-stack">
          {statusGroups.map((grp) => {
            const groupTasks = tasks.filter((t) => t.status === grp.id);
            if (groupTasks.length === 0) return null;

            return (
              <div key={grp.id} className="status-group-section">
                <div className="status-group-header">
                  <span className={`status-dot status-dot-${grp.id}`} />
                  <h3 className="status-group-title">{grp.label}</h3>
                  <span className="status-group-count">{groupTasks.length}</span>
                </div>

                <div className="tasks-list-stack">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      layout="list"
                      currentDate={currentDate}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                      onEditTask={onEditTask}
                      onStartFocus={onStartFocus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
