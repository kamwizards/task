import { Task } from '@/types/task';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { loadStoredTasks, saveStoredTasks } from './storage';

// Database row representation in Supabase
export interface DbTaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  category: string;
  due_date: string | null;
  subtasks: unknown;
  tags: string[] | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

// Convert DB row to Frontend Task
export function mapRowToTask(row: DbTaskRow): Task {
  let parsedSubtasks = [];
  if (Array.isArray(row.subtasks)) {
    parsedSubtasks = row.subtasks;
  } else if (typeof row.subtasks === 'string') {
    try {
      parsedSubtasks = JSON.parse(row.subtasks);
    } catch {
      parsedSubtasks = [];
    }
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    priority: (row.priority as Task['priority']) || 'medium',
    status: (row.status as Task['status']) || 'todo',
    category: (row.category as Task['category']) || 'Engineering',
    dueDate: row.due_date || '',
    subtasks: parsedSubtasks,
    tags: Array.isArray(row.tags) ? row.tags : [],
    estimatedMinutes: row.estimated_minutes || 30,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// Convert Frontend Task to DB row
export function mapTaskToRow(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    category: task.category,
    due_date: task.dueDate || null,
    subtasks: task.subtasks || [],
    tags: task.tags || [],
    estimated_minutes: task.estimatedMinutes || 30,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all tasks (from Supabase if configured, otherwise localStorage)
 */
export async function getTasks(): Promise<{ tasks: Task[]; isCloud: boolean }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = (data as DbTaskRow[]).map(mapRowToTask);
        // Also keep local cache updated
        saveStoredTasks(mapped);
        return { tasks: mapped, isCloud: true };
      }
      console.warn('Supabase fetch failed, falling back to local storage:', error?.message);
    } catch (err) {
      console.warn('Supabase fetch threw error:', err);
    }
  }

  // Fallback to local storage
  return { tasks: loadStoredTasks(), isCloud: false };
}

/**
 * Save / Upsert a single task
 */
export async function upsertTask(task: Task): Promise<boolean> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const row = mapTaskToRow(task);
      const { error } = await client.from('tasks').upsert(row, { onConflict: 'id' });
      if (!error) return true;
      console.error('Supabase upsert error:', error);
    } catch (err) {
      console.error('Supabase upsert exception:', err);
    }
  }
  return false;
}

/**
 * Delete a task
 */
export async function removeTask(id: string): Promise<boolean> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from('tasks').delete().eq('id', id);
      if (!error) return true;
      console.error('Supabase delete error:', error);
    } catch (err) {
      console.error('Supabase delete exception:', err);
    }
  }
  return false;
}

/**
 * Delete all completed tasks
 */
export async function removeCompletedTasks(): Promise<boolean> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from('tasks').delete().eq('status', 'completed');
      if (!error) return true;
      console.error('Supabase delete completed error:', error);
    } catch (err) {
      console.error('Supabase delete completed exception:', err);
    }
  }
  return false;
}

/**
 * Mark all tasks as completed
 */
export async function markAllTasksCompleted(taskIds: string[]): Promise<boolean> {
  const client = getSupabaseClient();

  if (client && taskIds.length > 0) {
    try {
      const { error } = await client
        .from('tasks')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .in('id', taskIds);
      if (!error) return true;
      console.error('Supabase mark all completed error:', error);
    } catch (err) {
      console.error('Supabase mark all completed exception:', err);
    }
  }
  return false;
}

/**
 * Subscribe to real-time changes
 */
export function subscribeToRealtimeChanges(
  onUpdate: (payload: { eventType: string; newRow?: Task; oldId?: string }) => void
) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('tasks-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const mapped = mapRowToTask(payload.new as DbTaskRow);
            onUpdate({ eventType: payload.eventType, newRow: mapped });
          } else if (payload.eventType === 'DELETE') {
            onUpdate({ eventType: 'DELETE', oldId: (payload.old as { id: string }).id });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error('Failed to subscribe to realtime', err);
    return () => {};
  }
}
