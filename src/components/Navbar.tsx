'use client';

import React from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  LayoutList, 
  Kanban, 
  Timer, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Command
} from 'lucide-react';
import { ViewMode } from '@/types/task';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onOpenNewTaskModal: () => void;
  onResetDemoData: () => void;
  taskCount: number;
  completedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  onOpenNewTaskModal,
  onResetDemoData,
  taskCount,
  completedCount,
}) => {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-box">
            <Sparkles size={20} className="brand-icon" />
          </div>
          <div className="brand-text-group">
            <div className="brand-name-row">
              <span className="brand-title">AuraTask</span>
              <span className="brand-badge">PRO</span>
            </div>
            <span className="brand-subtitle">
              {completedCount}/{taskCount} Completed
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="navbar-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks, tags, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="global-search-input"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
              title="Clear search"
            >
              ×
            </button>
          ) : (
            <div className="search-shortcut" title="Press Ctrl+K to search">
              <Command size={10} />
              <span>K</span>
            </div>
          )}
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="navbar-view-tabs">
          <button
            onClick={() => setViewMode('list')}
            className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            id="view-tab-list"
          >
            <LayoutList size={16} />
            <span className="tab-label">List</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`view-tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            id="view-tab-kanban"
          >
            <Kanban size={16} />
            <span className="tab-label">Board</span>
          </button>
          <button
            onClick={() => setViewMode('focus')}
            className={`view-tab-btn ${viewMode === 'focus' ? 'active' : ''}`}
            id="view-tab-focus"
          >
            <Timer size={16} />
            <span className="tab-label">Focus</span>
          </button>
        </div>

        {/* Actions & Utilities */}
        <div className="navbar-actions">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="btn btn-ghost btn-icon action-btn"
            title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            id="toggle-sound-btn"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon action-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="toggle-theme-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemoData}
            className="btn btn-ghost btn-icon action-btn"
            title="Reset to sample demo tasks"
            id="reset-demo-btn"
          >
            <RotateCcw size={17} />
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="btn btn-primary new-task-btn"
            id="create-new-task-btn"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
