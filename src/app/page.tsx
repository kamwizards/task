'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Task, 
  TaskFilters, 
  TaskStatus, 
  ViewMode, 
  TaskStats as StatsType 
} from '@/types/task';
import { 
  loadStoredTasks, 
  saveStoredTasks, 
  getStoredTheme, 
  saveStoredTheme, 
  getStoredSound, 
  saveStoredSound,
  resetToDemoTasks 
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  getTasks, 
  upsertTask, 
  removeTask, 
  removeCompletedTasks, 
  markAllTasksCompleted, 
  subscribeToRealtimeChanges 
} from '@/lib/taskService';
import { soundFX } from '@/lib/audio';
import { Navbar } from '@/components/Navbar';
import { TaskStats } from '@/components/TaskStats';
import { FilterBar } from '@/components/FilterBar';
import { ListView } from '@/components/ListView';
import { KanbanBoard } from '@/components/KanbanBoard';
import { FocusTimer } from '@/components/FocusTimer';
import { TaskModal } from '@/components/TaskModal';
import { SupabaseModal } from '@/components/SupabaseModal';
import { Toast, ToastMessage } from '@/components/Toast';

export default function TaskManagerApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cloud Database State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // View & UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'dueDate',
    sortDirection: 'asc',
  });

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('todo');

  // Focus Timer active task
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load tasks function
  const refreshTasks = useCallback(async () => {
    const { tasks: loadedTasks, isCloud } = await getTasks();
    setTasks(loadedTasks);
    setIsCloudConnected(isCloud);
    return isCloud;
  }, []);

  // Initial client hydration from storage / Supabase
  useEffect(() => {
    const storedTheme = getStoredTheme();
    const storedSound = getStoredSound();
    const todayStr = new Date().toISOString().split('T')[0];

    setTheme(storedTheme);
    setSoundEnabled(storedSound);
    setCurrentDateStr(todayStr);
    soundFX.setEnabled(storedSound);
    document.documentElement.setAttribute('data-theme', storedTheme);

    // Initial load from cloud or local fallback
    refreshTasks().then((cloud) => {
      if (cloud) {
        addToast('Synced with Supabase Cloud database 🟢', 'success');
      }
      setIsHydrated(true);
    });

    // Realtime Supabase change listener
    const unsubscribe = subscribeToRealtimeChanges((change) => {
      if (change.eventType === 'INSERT' && change.newRow) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === change.newRow!.id)) return prev;
          return [change.newRow!, ...prev];
        });
      } else if (change.eventType === 'UPDATE' && change.newRow) {
        setTasks((prev) => prev.map((t) => (t.id === change.newRow!.id ? change.newRow! : t)));
      } else if (change.eventType === 'DELETE' && change.oldId) {
        setTasks((prev) => prev.filter((t) => t.id !== change.oldId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshTasks, addToast]);

  // Save tasks on modification (local cache + cloud)
  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    soundFX.playClickSound();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    addToast(`Switched to ${nextTheme} mode`, 'info');
  };

  // Sound toggle
  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    soundFX.setEnabled(nextSound);
    saveStoredSound(nextSound);
    if (nextSound) soundFX.playClickSound();
    addToast(nextSound ? 'Sound effects enabled' : 'Sound muted', 'info');
  };

  // Reset to sample demo tasks
  const handleResetDemoData = () => {
    const reset = resetToDemoTasks();
    setTasks(reset);
    soundFX.playClickSound();
    // Also upsert reset items to cloud if connected
    if (isCloudConnected) {
      reset.forEach((t) => upsertTask(t));
    }
    addToast('Reset to demo tasks with fresh timelines', 'info');
  };

  // Reset all filters
  const handleResetFilters = () => {
    soundFX.playClickSound();
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      sortBy: 'dueDate',
      sortDirection: 'asc',
    });
    addToast('Filters reset', 'info');
  };

  // Add / Update Task
  const handleSaveTask = (savedTask: Task) => {
    const exists = tasks.some((t) => t.id === savedTask.id);
    let nextList: Task[];
    if (exists) {
      nextList = tasks.map((t) => (t.id === savedTask.id ? savedTask : t));
      addToast('Task updated successfully', 'success');
    } else {
      nextList = [savedTask, ...tasks];
      addToast('New task created', 'success');
    }
    updateTasks(nextList);
    // Sync to Supabase
    upsertTask(savedTask);
  };

  // Quick single task update (e.g. from checkbox or status transition)
  const handleUpdateTask = (updated: Task) => {
    const nextList = tasks.map((t) => (t.id === updated.id ? updated : t));
    updateTasks(nextList);
    // Sync to Supabase
    upsertTask(updated);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    const nextList = tasks.filter((t) => t.id !== id);
    updateTasks(nextList);
    removeTask(id);
    addToast('Task removed', 'info');
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    soundFX.playClickSound();
    const nextList = tasks.filter((t) => t.status !== 'completed');
    updateTasks(nextList);
    removeCompletedTasks();
    addToast('Completed tasks cleared', 'info');
  };

  // Mark all completed
  const handleMarkAllCompleted = () => {
    soundFX.playCompleteSound();
    const taskIds = tasks.map((t) => t.id);
    const nextList = tasks.map((t) => ({
      ...t,
      status: 'completed' as TaskStatus,
      subtasks: t.subtasks.map((s) => ({ ...s, completed: true })),
      updatedAt: new Date().toISOString(),
    }));
    updateTasks(nextList);
    markAllTasksCompleted(taskIds);
    addToast('All tasks marked as completed 🎉', 'success');
  };

  // Open task modal for new task
  const handleOpenNewTaskModal = (status: TaskStatus = 'todo') => {
    soundFX.playClickSound();
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsTaskModalOpen(true);
  };

  // Open modal for editing
  const handleEditTask = (task: Task) => {
    soundFX.playClickSound();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Launch Focus Mode on a task
  const handleStartFocus = (task: Task) => {
    soundFX.playClickSound();
    setFocusTask(task);
    setViewMode('focus');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'SELECT';

      // Ctrl + K or '/' to search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        searchInput?.focus();
        return;
      }

      if (!isInput && !isTaskModalOpen && !isSupabaseModalOpen) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleOpenNewTaskModal('todo');
        } else if (e.key === '1') {
          setViewMode('list');
        } else if (e.key === '2') {
          setViewMode('kanban');
        } else if (e.key === '3') {
          setViewMode('focus');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isSupabaseModalOpen]);

  // Compute Statistics
  const stats: StatsType = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const review = tasks.filter((t) => t.status === 'review').length;
    const highPriorityCount = tasks.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
    ).length;

    // Check overdue
    const overdue = tasks.filter((t) => {
      if (t.status === 'completed' || !t.dueDate || !currentDateStr) return false;
      return t.dueDate < currentDateStr;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      review,
      overdue,
      completionRate,
      highPriorityCount,
    };
  }, [tasks, currentDateStr]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (filters.sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (filters.sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateB - dateA;
      } else if (filters.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filters]);

  if (!isHydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#818cf8', fontSize: '1.2rem', fontWeight: 600 }}>Loading AuraTask...</div>
      </div>
    );
  }

  return (
    <main className="app-main-wrapper">
      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={filters.search}
        setSearchQuery={(q) => setFilters((prev) => ({ ...prev, search: q }))}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        onOpenNewTaskModal={() => handleOpenNewTaskModal('todo')}
        onResetDemoData={handleResetDemoData}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isCloudConnected={isCloudConnected}
        taskCount={stats.total}
        completedCount={stats.completed}
      />

      <div className="app-container">
        {/* Statistics Executive Overview */}
        <TaskStats stats={stats} />

        {/* Filters & Categories Bar (Hidden in Focus Mode) */}
        {viewMode !== 'focus' && (
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            tasks={tasks}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Main View Area */}
        {viewMode === 'list' && (
          <ListView
            tasks={filteredTasks}
            currentDate={currentDateStr}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onStartFocus={handleStartFocus}
            onOpenNewTaskModal={() => handleOpenNewTaskModal('todo')}
            onClearCompleted={handleClearCompleted}
            onMarkAllCompleted={handleMarkAllCompleted}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanBoard
            tasks={filteredTasks}
            currentDate={currentDateStr}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onStartFocus={handleStartFocus}
            onOpenNewTaskModalWithStatus={(status) => handleOpenNewTaskModal(status)}
          />
        )}

        {viewMode === 'focus' && (
          <FocusTimer
            tasks={tasks}
            initialTask={focusTask}
            onUpdateTask={handleUpdateTask}
            onExitFocus={() => setViewMode('list')}
          />
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultModalStatus}
      />

      {/* Supabase Database Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChanged={() => {
          refreshTasks().then((cloud) => {
            addToast(
              cloud ? 'Connected to Supabase Cloud 🟢' : 'Using Local Storage Mode 🟡',
              'info'
            );
          });
        }}
        isCloudConnected={isCloudConnected}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
