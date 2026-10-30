-- ====================================================================
-- AuraTask — Supabase PostgreSQL Schema Migration
-- Run this script in the Supabase Dashboard SQL Editor
-- ====================================================================

-- 1. Create Tasks Table
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

-- 2. Create index for fast status & category queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks (category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Public Access (or replace with user_id policies for authenticated users)
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.tasks;
CREATE POLICY "Allow anonymous read access" ON public.tasks
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.tasks;
CREATE POLICY "Allow anonymous insert access" ON public.tasks
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON public.tasks;
CREATE POLICY "Allow anonymous update access" ON public.tasks
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.tasks;
CREATE POLICY "Allow anonymous delete access" ON public.tasks
  FOR DELETE
  TO public
  USING (true);

-- 5. Enable Supabase Realtime for live cross-device synchronisation
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- 6. Optional: Insert Initial Starter Tasks
INSERT INTO public.tasks (id, title, description, priority, status, category, due_date, subtasks, tags, estimated_minutes)
VALUES
  (
    'task-1',
    'Architect Microservices Auth Flow',
    'Implement JWT refresh tokens, OAuth2 social login providers, and rate-limiting middleware for auth gateway.',
    'urgent',
    'in_progress',
    'Engineering',
    TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'),
    '[{"id":"sub-1-1","title":"Setup JWT signing and verification keys","completed":true},{"id":"sub-1-2","title":"Implement Redis token revocation blacklist","completed":true},{"id":"sub-1-3","title":"Add GitHub & Google OAuth callback endpoints","completed":false},{"id":"sub-1-4","title":"End-to-end integration test coverage (>90%)","completed":false}]'::jsonb,
    ARRAY['Next.js', 'Auth', 'Security', 'Backend'],
    90
  ),
  (
    'task-2',
    'Design Dark Mode Glassmorphism Components',
    'Refine Figma design tokens for modern glass elevation, acrylic blur, border highlights, and tactile micro-interactions.',
    'high',
    'in_progress',
    'Design',
    TO_CHAR(NOW(), 'YYYY-MM-DD'),
    '[{"id":"sub-2-1","title":"Define HSL color palette and translucent layers","completed":true},{"id":"sub-2-2","title":"Create interactive button hover states","completed":true},{"id":"sub-2-3","title":"Export tokens to CSS custom variables","completed":false}]'::jsonb,
    ARRAY['Figma', 'UI/UX', 'DesignSystem'],
    60
  ),
  (
    'task-3',
    'Quarterly Strategic Growth & Budget Review',
    'Consolidate department SaaS expenditures, revenue projections, and cloud infrastructure runway for Q4 presentation.',
    'high',
    'todo',
    'Finance',
    TO_CHAR(NOW() + INTERVAL '3 days', 'YYYY-MM-DD'),
    '[{"id":"sub-3-1","title":"Export AWS and Vercel spend reports","completed":false},{"id":"sub-3-2","title":"Draft runway scenarios with CFO","completed":false},{"id":"sub-3-3","title":"Prepare slide deck for board meeting","completed":false}]'::jsonb,
    ARRAY['Finance', 'Strategy', 'Executive'],
    45
  )
ON CONFLICT (id) DO NOTHING;
