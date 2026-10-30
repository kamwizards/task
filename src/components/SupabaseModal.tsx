'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Check, 
  ExternalLink, 
  Copy, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Terminal,
  RefreshCw
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveDynamicSupabaseCredentials, 
  testSupabaseConnection,
  isSupabaseConfigured 
} from '@/lib/supabase';
import { soundFX } from '@/lib/audio';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChanged: () => void;
  isCloudConnected: boolean;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged,
  isCloudConnected,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url || '');
      setAnonKey(creds.anonKey || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    soundFX.playClickSound();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = async () => {
    soundFX.playClickSound();
    saveDynamicSupabaseCredentials(url, anonKey);
    onConnectionChanged();
    onClose();
  };

  const handleClear = () => {
    soundFX.playClickSound();
    saveDynamicSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConnectionChanged();
    onClose();
  };

  const sqlCode = `-- AuraTask Schema Migration
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
  category TEXT NOT NULL DEFAULT 'Engineering',
  due_date TEXT,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  estimated_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON public.tasks FOR SELECT TO public USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.tasks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.tasks FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access" ON public.tasks FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;`;

  const copySqlToClipboard = () => {
    soundFX.playClickSound();
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container glass-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} className="text-brand" />
              <h3 className="modal-title">Supabase Database Integration</h3>
            </div>
            <span className="modal-subtitle">
              Connect a real PostgreSQL database with live real-time sync
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-icon"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div 
          style={{ 
            margin: '1.25rem 1.75rem 0 1.75rem', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            background: isCloudConnected ? 'rgba(52, 211, 153, 0.12)' : 'rgba(234, 179, 8, 0.12)',
            border: isCloudConnected ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(234, 179, 8, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: isCloudConnected ? 'var(--status-completed)' : 'var(--priority-medium-text)' 
              }} 
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {isCloudConnected 
                ? 'Cloud Sync Active (Connected to Supabase)' 
                : 'Local Mode (Supabase Not Connected)'}
            </span>
          </div>

          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: '0.775rem', 
              color: 'var(--brand-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontWeight: 500
            }}
          >
            <span>Supabase Dashboard</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.75rem 0 1.75rem' }}>
          <button
            onClick={() => setActiveTab('config')}
            className={`btn btn-sm ${activeTab === 'config' ? 'btn-primary' : 'btn-ghost'}`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`btn btn-sm ${activeTab === 'sql' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Terminal size={14} />
            <span>SQL Schema Migration</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'config' ? (
            <>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Enter your Supabase project credentials below. Alternatively, you can add them to <code>.env.local</code> as <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>

              {/* URL */}
              <div className="form-group">
                <label className="form-label">Project URL (API Endpoint)</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Anon Key */}
              <div className="form-group">
                <label className="form-label">Anon / Public API Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Test Result Alert */}
              {testResult && (
                <div 
                  className="animate-fade-in"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: testResult.success ? 'rgba(52, 211, 153, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    border: testResult.success ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
                    color: testResult.success ? '#34d399' : '#fb7185',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {testResult.success ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Paste this into the <strong>SQL Editor</strong> in your Supabase Dashboard:
                </span>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="btn btn-secondary btn-sm"
                >
                  {copiedSql ? (
                    <>
                      <Check size={14} className="text-emerald" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre 
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                  maxHeight: '220px',
                  lineHeight: 1.45,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {sqlCode}
              </pre>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div>
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-ghost btn-sm text-danger"
              >
                Disconnect & Revert to Local
              </button>
            )}
          </div>

          <div className="modal-footer-actions">
            {activeTab === 'config' && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url || !anonKey}
                className="btn btn-secondary btn-sm"
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Test Connection</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
            >
              <Check size={16} />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
