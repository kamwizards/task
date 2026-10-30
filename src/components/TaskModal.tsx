'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskCategory, SubTask } from '@/types/task';
import { soundFX } from '@/lib/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
}

const CATEGORIES: TaskCategory[] = [
  'Engineering',
  'Design',
  'Work',
  'Finance',
  'Personal',
  'Health',
  'Learning',
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultStatus = 'todo',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [category, setCategory] = useState<TaskCategory>('Engineering');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setCategory(initialTask.category);
      setDueDate(initialTask.dueDate || '');
      setEstimatedMinutes(initialTask.estimatedMinutes || 30);
      setSubtasks(initialTask.subtasks || []);
      setTags(initialTask.tags || []);
    } else {
      // Defaults for brand new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus(defaultStatus);
      setCategory('Engineering');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setEstimatedMinutes(30);
      setSubtasks([]);
      setTags(['Sprint']);
    }
    setError('');
  }, [initialTask, defaultStatus, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen) {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, description, priority, status, category, dueDate, estimatedMinutes, subtasks, tags]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
    soundFX.playClickSound();
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
    soundFX.playClickSound();
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setNewTagInput('');
    soundFX.playClickSound();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    soundFX.playClickSound();
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const taskToSave: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      category,
      dueDate,
      subtasks,
      tags,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    soundFX.playClickSound();
    onSave(taskToSave);
    onClose();
  };

  const setRelativeDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container glass-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <h3 className="modal-title">
              {initialTask ? 'Edit Task Details' : 'Create New Task'}
            </h3>
            <span className="modal-subtitle">
              Configure priority, deliverables, tags, and timeline
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-icon"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="modal-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body / Form */}
        <div className="modal-body">
          {/* Title Input */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Redesign Landing Page Hero Section"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="form-input form-input-lg"
              autoFocus
            />
          </div>

          {/* Description Textarea */}
          <div className="form-group">
            <label className="form-label">Description & Context</label>
            <textarea
              placeholder="Add key deliverables, acceptance criteria, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Priority & Status Row */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div className="priority-selector">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`priority-btn priority-btn-${p} ${
                      priority === p ? 'active' : ''
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="form-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Category & Due Date Row */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="form-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="label-with-actions">
                <label className="form-label">Due Date</label>
                <div className="quick-date-buttons">
                  <button
                    type="button"
                    onClick={() => setRelativeDate(0)}
                    className="btn-text-sm"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelativeDate(1)}
                    className="btn-text-sm"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelativeDate(7)}
                    className="btn-text-sm"
                  >
                    +1 Wk
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="form-group">
            <label className="form-label">
              Subtasks & Checklist ({subtasks.length})
            </label>
            <div className="subtask-add-row">
              <input
                type="text"
                placeholder="Add checklist step and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="form-input"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn btn-secondary btn-icon"
                title="Add step"
              >
                <Plus size={16} />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="modal-subtasks-list">
                {subtasks.map((st) => (
                  <div key={st.id} className="modal-subtask-item">
                    <span className="subtask-modal-text">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="btn-action-icon text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags & Focus Time Row */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input-row">
                <input
                  type="text"
                  placeholder="Type tag & Enter..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary btn-icon"
                >
                  <Plus size={16} />
                </button>
              </div>

              {tags.length > 0 && (
                <div className="modal-tags-wrap">
                  {tags.map((tg) => (
                    <span key={tg} className="modal-tag-chip">
                      #{tg}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tg)}
                        className="tag-remove-x"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Focus (Minutes)</label>
              <select
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="form-select"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (1 Pomodoro)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes (Deep Work)</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-hint">
            <span>Tip: Press </span>
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
            <span> to save</span>
          </div>

          <div className="modal-footer-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave} 
              className="btn btn-primary"
            >
              <Check size={16} />
              <span>{initialTask ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
