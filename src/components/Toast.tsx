'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type} glass-card`}>
          {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald" />}
          {t.type === 'error' && <AlertCircle size={18} className="text-danger" />}
          {t.type === 'info' && <Info size={18} className="text-brand" />}

          <span className="toast-message-text">{t.message}</span>

          <button
            onClick={() => onDismiss(t.id)}
            className="toast-dismiss-btn"
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
