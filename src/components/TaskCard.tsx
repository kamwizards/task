'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Play, 
  ArrowRight, 
  Clock, 
  Tag as TagIcon,
  AlertTriangle
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { soundFX } from '@/lib/audio';
import { fireSuccessConfetti } from '@/lib/confetti';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  layout?: 'kanban' | 'list';
  currentDate?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onStartFocus,
  layout = 'list',
  currentDate = '',
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);

  // Status cycling
  const nextStatusMap: Record<TaskStatus, TaskStatus> = {
    todo: 'in_progress',
    in_progress: 'review',
    review: 'completed',
    completed: 'todo',
  };

  // Due Date calculation
  const getDueDateInfo = (dateString: string, current: string) => {
    if (!dateString || !current) return null;
    const today = new Date(current + 'T00:00:00');
    const due = new Date(dateString + 'T00:00:00');

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true, label: 'overdue' };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', isToday: true, label: 'today' };
    }
    if (diffDays === 1) {
      return { text: 'Due Tomorrow', label: 'tomorrow' };
    }
    return { text: `Due in ${diffDays}d`, label: 'future' };
  };

  const dueInfo = getDueDateInfo(task.dueDate, currentDate);
  const isCompleted = task.status === 'completed';

  // Toggle complete
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskStatus = isCompleted ? 'todo' : 'completed';
    if (!isCompleted) {
      soundFX.playCompleteSound();
      fireSuccessConfetti(e);
    } else {
      soundFX.playClickSound();
    }

    // Also mark subtasks completed if moving to completed
    const updatedSubtasks = task.subtasks.map((s) => ({
      ...s,
      completed: newStatus === 'completed' ? true : s.completed,
    }));

    onUpdateTask({
      ...task,
      status: newStatus,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  // Cycle to next status
  const handleCycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClickSound();
    const next = nextStatusMap[task.status];
    if (next === 'completed') {
      soundFX.playCompleteSound();
      fireSuccessConfetti(e);
    }
    onUpdateTask({
      ...task,
      status: next,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle subtask
  const handleToggleSubtask = (subId: string) => {
    soundFX.playClickSound();
    const updatedSubtasks = task.subtasks.map((sub) =>
      sub.id === subId ? { ...sub, completed: !sub.completed } : sub
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

    if (allDone && !isCompleted) {
      soundFX.playCompleteSound();
      fireSuccessConfetti();
    }

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      status: allDone ? 'completed' : task.status === 'completed' ? 'in_progress' : task.status,
      updatedAt: new Date().toISOString(),
    });
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  return (
    <div
      className={`task-card glass-card ${layout === 'kanban' ? 'card-kanban' : 'card-list'} ${
        isCompleted ? 'is-completed' : ''
      }`}
    >
      <div className="task-card-header">
        {/* Checkbox & Priority Indicator */}
        <div className="task-left-section">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => {}}
            onClick={handleToggleComplete}
            className="custom-checkbox"
            title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          />

          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>

          <span className="category-tag">
            {task.category}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="task-actions-group">
          {/* Pomodoro Focus Button */}
          {!isCompleted && (
            <button
              onClick={() => onStartFocus(task)}
              className="btn-action-icon text-indigo"
              title="Start Pomodoro Focus on this task"
            >
              <Play size={14} />
            </button>
          )}

          {/* Quick cycle status button */}
          <button
            onClick={handleCycleStatus}
            className="btn-action-icon text-muted"
            title={`Move to next: ${nextStatusMap[task.status].replace('_', ' ')}`}
          >
            <ArrowRight size={14} />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEditTask(task)}
            className="btn-action-icon text-muted"
            title="Edit task"
          >
            <Edit3 size={14} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              soundFX.playClickSound();
              onDeleteTask(task.id);
            }}
            className="btn-action-icon text-danger"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="task-card-body">
        <h4 className={`task-title ${isCompleted ? 'task-title-completed' : ''}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {/* Meta Bar: Due Date, Subtasks, Tags, Focus Time */}
      <div className="task-card-footer">
        <div className="footer-meta-items">
          {/* Due Date Indicator */}
          {dueInfo && (
            <div
              className={`meta-item due-date-pill ${
                dueInfo.isOverdue ? 'overdue' : dueInfo.isToday ? 'today' : ''
              }`}
            >
              {dueInfo.isOverdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
              <span>{dueInfo.text}</span>
            </div>
          )}

          {/* Estimated minutes */}
          {task.estimatedMinutes && (
            <div className="meta-item text-muted" title="Estimated focus time">
              <Clock size={12} />
              <span>{task.estimatedMinutes}m</span>
            </div>
          )}

          {/* Subtasks Accordion Trigger */}
          {hasSubtasks && (
            <button
              onClick={() => setExpandedSubtasks(!expandedSubtasks)}
              className="meta-item subtask-toggle-btn"
              title="Toggle subtasks checklist"
            >
              <CheckSquare size={12} />
              <span>
                {completedSubtasksCount}/{task.subtasks.length}
              </span>
              {expandedSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags-row">
            {task.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Subtasks Checklist */}
      {expandedSubtasks && hasSubtasks && (
        <div className="subtasks-dropdown animate-fade-in">
          <div className="subtasks-progress-track">
            <div
              className="subtasks-progress-fill"
              style={{
                width: `${(completedSubtasksCount / task.subtasks.length) * 100}%`,
              }}
            />
          </div>
          <div className="subtasks-checklist">
            {task.subtasks.map((sub) => (
              <label key={sub.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleToggleSubtask(sub.id)}
                  className="custom-checkbox subtask-checkbox"
                />
                <span className={`subtask-title ${sub.completed ? 'completed' : ''}`}>
                  {sub.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
