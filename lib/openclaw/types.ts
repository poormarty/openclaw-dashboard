export interface GatewayHealth {
  ok: boolean;
  version?: string;
  latencyMs?: number;
}

export interface HeartbeatAgent {
  agentId: string;
  enabled: boolean;
  every: string;
  everyMs: number;
}

export interface SessionSummary {
  key: string;
  kind: string;
  agentId: string;
  updatedAt: number;
  ageMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  model?: string;
  contextTokens?: number;
}

export interface OpenClawStatus {
  heartbeat: {
    defaultAgentId: string;
    agents: HeartbeatAgent[];
  };
  channelSummary: Array<{ channel: string; status: string; account?: string; detail?: string }>;
  sessions: {
    count: number;
    defaults: { model: string; contextTokens: number };
    recent: SessionSummary[];
    byAgent: Array<{ agentId: string; count: number; recent: SessionSummary[] }>;
  };
  os?: { platform: string; arch: string; label?: string };
  update?: { registry?: { latestVersion: string }; installKind?: string };
}

export interface SkillMissing {
  bins: string[];
  anyBins: string[];
  env: string[];
  config: string[];
  os: string[];
}

export interface Skill {
  name: string;
  description: string;
  emoji?: string;
  eligible: boolean;
  disabled: boolean;
  blockedByAllowlist: boolean;
  source: string;
  bundled: boolean;
  homepage?: string;
  missing: SkillMissing;
}

export interface CronSchedule {
  cron?: string;
  every?: string;
  at?: string;
  tz?: string;
}

export interface CronJob {
  id: string;
  name?: string;
  description?: string;
  enabled: boolean;
  schedule: CronSchedule;
  payload: { message?: string; systemEvent?: string };
  announce?: boolean;
  agentId?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: 'ok' | 'error' | 'timeout';
}

export interface CronRun {
  jobId: string;
  runId: string;
  startedAt: string;
  completedAt?: string;
  status: 'ok' | 'error' | 'timeout' | 'running';
  error?: string;
  durationMs?: number;
}

export interface SecurityFinding {
  checkId: string;
  severity: 'critical' | 'warn' | 'info';
  title: string;
  detail: string;
  remediation?: string;
}

export interface SecurityAudit {
  ts: number;
  summary: { critical: number; warn: number; info: number };
  findings: SecurityFinding[];
}
