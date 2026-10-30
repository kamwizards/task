import { Task } from '@/types/task';

// Generate dynamic dates relative to today when invoked on the client
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const getInitialTasks = (): Task[] => {
  return [
    {
      id: 'task-1',
      title: 'Architect Microservices Auth Flow',
      description: 'Implement JWT refresh tokens, OAuth2 social login providers, and rate-limiting middleware for auth gateway.',
      priority: 'urgent',
      status: 'in_progress',
      category: 'Engineering',
      dueDate: getRelativeDate(1), // Tomorrow
      tags: ['Next.js', 'Auth', 'Security', 'Backend'],
      estimatedMinutes: 90,
      subtasks: [
        { id: 'sub-1-1', title: 'Setup JWT signing and verification keys', completed: true },
        { id: 'sub-1-2', title: 'Implement Redis token revocation blacklist', completed: true },
        { id: 'sub-1-3', title: 'Add GitHub & Google OAuth callback endpoints', completed: false },
        { id: 'sub-1-4', title: 'End-to-end integration test coverage (>90%)', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design Dark Mode Glassmorphism Components',
      description: 'Refine Figma design tokens for modern glass elevation, acrylic blur, border highlights, and tactile micro-interactions.',
      priority: 'high',
      status: 'in_progress',
      category: 'Design',
      dueDate: getRelativeDate(0), // Today
      tags: ['Figma', 'UI/UX', 'DesignSystem'],
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-2-1', title: 'Define HSL color palette and translucent layers', completed: true },
        { id: 'sub-2-2', title: 'Create interactive button hover states', completed: true },
        { id: 'sub-2-3', title: 'Export tokens to CSS custom variables', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Quarterly Strategic Growth & Budget Review',
      description: 'Consolidate department SaaS expenditures, revenue projections, and cloud infrastructure runway for Q4 presentation.',
      priority: 'high',
      status: 'todo',
      category: 'Finance',
      dueDate: getRelativeDate(3),
      tags: ['Finance', 'Strategy', 'Executive'],
      estimatedMinutes: 45,
      subtasks: [
        { id: 'sub-3-1', title: 'Export AWS and Vercel spend reports', completed: false },
        { id: 'sub-3-2', title: 'Draft runway scenarios with CFO', completed: false },
        { id: 'sub-3-3', title: 'Prepare slide deck for board meeting', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Optimize Core Web Vitals & Image Pipelines',
      description: 'Achieve 98+ Lighthouse performance score by implementing Next.js image optimization, responsive formats, and critical CSS inlining.',
      priority: 'medium',
      status: 'review',
      category: 'Engineering',
      dueDate: getRelativeDate(2),
      tags: ['Performance', 'Lighthouse', 'SEO'],
      estimatedMinutes: 40,
      subtasks: [
        { id: 'sub-4-1', title: 'Convert legacy PNGs to AVIF/WebP', completed: true },
        { id: 'sub-4-2', title: 'Defer non-essential third-party analytics scripts', completed: true },
        { id: 'sub-4-3', title: 'Verify zero layout shift (CLS < 0.05)', completed: true },
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Prepare Weekly Engineering Standup Notes',
      description: 'Summarize sprint deliverables, highlight deployment blockages, and coordinate cross-team dependency timelines.',
      priority: 'low',
      status: 'completed',
      category: 'Work',
      dueDate: getRelativeDate(-1), // Completed yesterday
      tags: ['Agile', 'Team', 'Sync'],
      estimatedMinutes: 20,
      subtasks: [
        { id: 'sub-5-1', title: 'Collect updates from team channels', completed: true },
        { id: 'sub-5-2', title: 'Publish meeting agenda in Notion', completed: true },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Deep Work: Read "Designing Data-Intensive Applications"',
      description: 'Read Chapters 7 and 8 focusing on distributed transactions, two-phase commits, and consensus algorithms (Raft/Paxos).',
      priority: 'medium',
      status: 'todo',
      category: 'Learning',
      dueDate: getRelativeDate(5),
      tags: ['Books', 'Architecture', 'ContinuousLearning'],
      estimatedMinutes: 75,
      subtasks: [
        { id: 'sub-6-1', title: 'Finish Chapter 7: Transactions & Serializability', completed: false },
        { id: 'sub-6-2', title: 'Summarize key takeaways in Obsidian vault', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      title: 'Renew Passport & Submit Visa Documents',
      description: 'Verify photo specifications, book biometric appointment, and upload notarized travel documentation.',
      priority: 'urgent',
      status: 'todo',
      category: 'Personal',
      dueDate: getRelativeDate(-1), // Overdue
      tags: ['Personal', 'Travel', 'Urgent'],
      estimatedMinutes: 30,
      subtasks: [
        { id: 'sub-7-1', title: 'Take passport specification compliant photos', completed: true },
        { id: 'sub-7-2', title: 'Submit online expedited renewal form', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};
