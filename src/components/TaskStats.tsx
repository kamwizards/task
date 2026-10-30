'use client';

import React from 'react';
import { CheckCircle2, Clock, Flame, AlertCircle, Layers } from 'lucide-react';
import { TaskStats as StatsType } from '@/types/task';

interface TaskStatsProps {
  stats: StatsType;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      {/* Total Tasks Card */}
      <div className="stat-card glass-card">
        <div className="stat-icon-wrapper icon-total">
          <Layers size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-value-row">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-subtext">Active backlog</span>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="stat-card glass-card">
        <div className="stat-icon-wrapper icon-progress">
          <Clock size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">In Progress</span>
          <div className="stat-value-row">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-subtext">Being worked on</span>
          </div>
        </div>
      </div>

      {/* Completion Rate Card */}
      <div className="stat-card glass-card">
        <div className="stat-icon-wrapper icon-completed">
          <CheckCircle2 size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Completed</span>
          <div className="stat-value-row">
            <span className="stat-value">{stats.completed}</span>
            <div className="stat-progress-pill">
              <span>{stats.completionRate}%</span>
            </div>
          </div>
        </div>
        <div className="stat-mini-bar">
          <div 
            className="stat-mini-fill" 
            style={{ width: `${stats.completionRate}%` }} 
          />
        </div>
      </div>

      {/* High Priority & Overdue Card */}
      <div className="stat-card glass-card">
        <div className={`stat-icon-wrapper ${stats.overdue > 0 ? 'icon-overdue' : 'icon-priority'}`}>
          {stats.overdue > 0 ? <AlertCircle size={20} /> : <Flame size={20} />}
        </div>
        <div className="stat-content">
          <span className="stat-label">
            {stats.overdue > 0 ? 'Overdue Tasks' : 'High Priority'}
          </span>
          <div className="stat-value-row">
            <span className="stat-value">
              {stats.overdue > 0 ? stats.overdue : stats.highPriorityCount}
            </span>
            <span className={`stat-subtext ${stats.overdue > 0 ? 'text-urgent' : ''}`}>
              {stats.overdue > 0 ? 'Needs attention' : 'Strategic focus'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
