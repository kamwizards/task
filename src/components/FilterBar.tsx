'use client';

import React from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  XCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { TaskFilters, TaskPriority, TaskStatus, TaskCategory, Task } from '@/types/task';

interface FilterBarProps {
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  tasks: Task[];
  onResetFilters: () => void;
}

const CATEGORIES: ('all' | TaskCategory)[] = [
  'all',
  'Engineering',
  'Design',
  'Work',
  'Finance',
  'Personal',
  'Learning',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  tasks,
  onResetFilters,
}) => {
  // Count tasks per category
  const getCategoryCount = (cat: 'all' | TaskCategory) => {
    if (cat === 'all') return tasks.length;
    return tasks.filter((t) => t.category === cat).length;
  };

  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.priority !== 'all' || 
    filters.status !== 'all' || 
    filters.search.length > 0;

  return (
    <div className="filter-bar-wrapper">
      {/* Category Pills Row */}
      <div className="category-scroll-container">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat;
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`category-pill ${isSelected ? 'active' : ''}`}
            >
              <span className="pill-name">{cat === 'all' ? 'All Tasks' : cat}</span>
              <span className="pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Control Dropdowns & Toggles Row */}
      <div className="filter-controls-row">
        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Layers size={13} />
            <span>Status</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => 
              setFilters((prev) => ({ ...prev, status: e.target.value as TaskStatus | 'all' }))
            }
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Filter size={13} />
            <span>Priority</span>
          </label>
          <select
            value={filters.priority}
            onChange={(e) => 
              setFilters((prev) => ({ ...prev, priority: e.target.value as TaskPriority | 'all' }))
            }
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <ArrowUpDown size={13} />
            <span>Sort By</span>
          </label>
          <div className="sort-input-group">
            <select
              value={filters.sortBy}
              onChange={(e) => 
                setFilters((prev) => ({ 
                  ...prev, 
                  sortBy: e.target.value as TaskFilters['sortBy'] 
                }))
              }
              className="filter-select sort-select"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Alphabetical</option>
            </select>
            <button
              onClick={() => 
                setFilters((prev) => ({ 
                  ...prev, 
                  sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' 
                }))
              }
              className="btn btn-ghost sort-toggle-btn"
              title={`Sort direction: ${filters.sortDirection.toUpperCase()}`}
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="btn btn-ghost btn-sm reset-filter-btn animate-fade-in"
          >
            <XCircle size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
