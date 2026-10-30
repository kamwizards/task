'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  ArrowLeft,
  Headphones
} from 'lucide-react';
import { Task } from '@/types/task';
import { soundFX } from '@/lib/audio';
import { fireSuccessConfetti } from '@/lib/confetti';

interface FocusTimerProps {
  tasks: Task[];
  initialTask?: Task | null;
  onUpdateTask: (updated: Task) => void;
  onExitFocus: () => void;
}

type SessionType = 'focus' | 'short_break' | 'long_break';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  initialTask,
  onUpdateTask,
  onExitFocus,
}) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    initialTask || (activeTasks.length > 0 ? activeTasks[0] : null)
  );

  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const sessionDurations: Record<SessionType, number> = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState<number>(sessionDurations.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<boolean>(false);

  // Web Audio ambient brown noise synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Switch session type
  const switchSession = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    soundFX.playClickSound();
  };

  // Timer countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      soundFX.playTimerFinishSound();
      fireSuccessConfetti();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Ambient focus sound generator using Web Audio
  useEffect(() => {
    if (!ambientSound) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate Brown noise (warm, deep, relaxing focus noise)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain adjustment
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(0);
      noiseNodeRef.current = noise;
    } catch {
      // Audio fallback
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [ambientSound]);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = sessionDurations[sessionType];
  const progressRatio = (totalDuration - timeLeft) / totalDuration;
  const strokeDashoffset = 880 - 880 * progressRatio;

  const handleTogglePlay = () => {
    soundFX.playClickSound();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    soundFX.playClickSound();
    setIsRunning(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const handleCompleteCurrentTask = (e: React.MouseEvent) => {
    if (!selectedTask) return;
    soundFX.playCompleteSound();
    fireSuccessConfetti(e);

    const updated: Task = {
      ...selectedTask,
      status: 'completed',
      subtasks: selectedTask.subtasks.map((s) => ({ ...s, completed: true })),
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updated);

    // Pick next active task
    const nextRemaining = activeTasks.filter((t) => t.id !== selectedTask.id);
    setSelectedTask(nextRemaining.length > 0 ? nextRemaining[0] : null);
  };

  return (
    <div className="focus-view-container animate-fade-in">
      {/* Top Bar with back button */}
      <div className="focus-top-bar">
        <button
          onClick={onExitFocus}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          <span>Exit Focus Mode</span>
        </button>

        <div className="focus-mode-pills">
          <button
            onClick={() => switchSession('focus')}
            className={`focus-pill ${sessionType === 'focus' ? 'active' : ''}`}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => switchSession('short_break')}
            className={`focus-pill ${sessionType === 'short_break' ? 'active' : ''}`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchSession('long_break')}
            className={`focus-pill ${sessionType === 'long_break' ? 'active' : ''}`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Ambient Sound Generator Toggle */}
        <button
          onClick={() => setAmbientSound(!ambientSound)}
          className={`btn btn-secondary btn-sm ${ambientSound ? 'btn-ambient-active' : ''}`}
          title="Toggle synthesized warm brown noise for concentration"
        >
          <Headphones size={15} />
          <span>{ambientSound ? 'Ambient Noise: On' : 'Ambient Noise'}</span>
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="focus-main-card glass-card">
        {/* Selected Task Header */}
        <div className="focus-task-selector-box">
          {activeTasks.length > 0 ? (
            <div className="focus-select-wrapper">
              <span className="focus-label-micro">CURRENT FOCUS OBJECTIVE</span>
              <select
                value={selectedTask?.id || ''}
                onChange={(e) => {
                  const t = tasks.find((item) => item.id === e.target.value);
                  setSelectedTask(t || null);
                }}
                className="focus-task-select"
              >
                {activeTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.priority.toUpperCase()}] {t.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="focus-congrats">
              <Sparkles size={22} className="text-brand" />
              <span>All tasks completed! Take a well deserved break.</span>
            </div>
          )}
        </div>

        {/* Circular Progress Display */}
        <div className="focus-timer-display">
          <svg className="timer-svg" viewBox="0 0 300 300">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r="140"
              className="timer-ring-bg"
            />
            {/* Progress animated ring */}
            <circle
              cx="150"
              cy="150"
              r="140"
              className="timer-ring-progress"
              style={{
                strokeDasharray: '880',
                strokeDashoffset: strokeDashoffset,
              }}
              transform="rotate(-90 150 150)"
            />
          </svg>

          <div className="timer-inner-content">
            <span className="timer-time-string">{timeFormatted}</span>
            <span className="timer-session-label">
              {sessionType === 'focus' ? 'STAY IN FLOW' : 'REST & RECHARGE'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="timer-controls-row">
          <button
            onClick={handleResetTimer}
            className="btn btn-secondary btn-icon timer-btn-reset"
            title="Reset session"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`btn btn-primary timer-btn-play ${isRunning ? 'is-running' : ''}`}
          >
            {isRunning ? (
              <>
                <Pause size={22} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={22} />
                <span>Start Focus</span>
              </>
            )}
          </button>

          {selectedTask && (
            <button
              onClick={handleCompleteCurrentTask}
              className="btn btn-secondary btn-sm timer-btn-complete"
              title="Mark current task completed"
            >
              <CheckCircle2 size={16} />
              <span>Mark Done</span>
            </button>
          )}
        </div>

        {/* Selected Task Details preview */}
        {selectedTask && (
          <div className="focus-task-footer-info">
            <h4 className="focus-task-info-title">{selectedTask.title}</h4>
            {selectedTask.description && (
              <p className="focus-task-info-desc">{selectedTask.description}</p>
            )}
            {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
              <div className="focus-subtasks-preview">
                <span className="focus-subtasks-summary">
                  {selectedTask.subtasks.filter((s) => s.completed).length} of{' '}
                  {selectedTask.subtasks.length} subtasks done
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
