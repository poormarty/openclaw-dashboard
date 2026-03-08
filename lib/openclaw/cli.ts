import { exec } from 'child_process';
import type { OpenClawStatus, SecurityAudit } from './types';

export async function execOpenClaw(args: string[]): Promise<string> {
  const cmd = ['openclaw', ...args.map(a => a.includes(' ') ? `"${a}"` : a)].join(' ');
  return new Promise((resolve) => {
    exec(
      cmd,
      { shell: '/bin/sh', timeout: 20000, env: { ...process.env } },
      (_err, stdout) => {
        resolve(stdout || '');
      }
    );
  });
}

export async function getStatus(): Promise<OpenClawStatus> {
  const out = await execOpenClaw(['status', '--json']);
  return JSON.parse(out);
}

export async function getGatewayHealth() {
  const out = await execOpenClaw(['gateway', 'health', '--json']);
  try { return JSON.parse(out); } catch { return { ok: false }; }
}

export async function listSkills() {
  const out = await execOpenClaw(['skills', 'list', '--json']);
  return JSON.parse(out);
}

export async function listCronJobs() {
  const out = await execOpenClaw(['cron', 'list', '--json']);
  return JSON.parse(out);
}

export async function getCronRuns(id?: string, limit = 50) {
  const args = ['cron', 'runs', '--json', '--limit', String(limit)];
  if (id) args.push('--id', id);
  const out = await execOpenClaw(args);
  return out.trim().split('\n').filter(Boolean).map((l: string) => JSON.parse(l));
}

export async function getSecurityAudit(): Promise<SecurityAudit> {
  const out = await execOpenClaw(['security', 'audit', '--json']);
  return JSON.parse(out);
}

export async function addCronJob(params: {
  name?: string; description?: string; cron?: string; every?: string;
  message?: string; agentId?: string; announce?: boolean; disabled?: boolean;
}) {
  const args = ['cron', 'add'];
  if (params.name) args.push('--name', params.name);
  if (params.description) args.push('--description', params.description);
  if (params.cron) args.push('--cron', params.cron);
  if (params.every) args.push('--every', params.every);
  if (params.message) args.push('--message', params.message);
  if (params.agentId) args.push('--agent', params.agentId);
  if (params.announce) args.push('--announce');
  if (params.disabled) args.push('--disabled');
  args.push('--json');
  const out = await execOpenClaw(args);
  return JSON.parse(out);
}

export async function editCronJob(id: string, params: {
  name?: string; description?: string; cron?: string; every?: string; message?: string;
}) {
  const args = ['cron', 'edit', id];
  if (params.name) args.push('--name', params.name);
  if (params.description) args.push('--description', params.description);
  if (params.cron) args.push('--cron', params.cron);
  if (params.every) args.push('--every', params.every);
  if (params.message) args.push('--message', params.message);
  await execOpenClaw(args);
}

export async function deleteCronJob(id: string) {
  await execOpenClaw(['cron', 'rm', id]);
}

export async function toggleCronJob(id: string, enable: boolean) {
  await execOpenClaw(['cron', enable ? 'enable' : 'disable', id]);
}

export async function runCronJob(id: string) {
  await execOpenClaw(['cron', 'run', id]);
}

export async function getConfigValue(path: string) {
  const out = await execOpenClaw(['config', 'get', path]);
  try { return JSON.parse(out); } catch { return out.trim(); }
}

export async function setConfigValue(path: string, value: string) {
  await execOpenClaw(['config', 'set', path, value]);
}
