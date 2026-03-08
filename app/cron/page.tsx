'use client';

import { useState } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Play, Pencil, Trash2, Pause, Clock } from 'lucide-react';
import type { CronJob, CronRun } from '@/lib/openclaw/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CronListData { jobs: CronJob[]; total: number; error: string | null }

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function CronPage() {
  const { data, loading, refresh } = usePolling<CronListData>('/api/cron', 30000);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<CronJob | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', scheduleType: 'every', schedule: '30m', message: '', announce: false });

  const jobs = data?.jobs ?? [];

  const loadRuns = async (id: string) => {
    setSelectedJob(id);
    setRunsLoading(true);
    const res = await fetch(`/api/cron/runs?id=${id}&limit=10`);
    const d = await res.json();
    setRuns(d.runs ?? []);
    setRunsLoading(false);
  };

  const openAdd = () => { setEditJob(null); setForm({ name: '', scheduleType: 'every', schedule: '30m', message: '', announce: false }); setShowForm(true); };
  const openEdit = (job: CronJob) => {
    setEditJob(job);
    setForm({ name: job.name ?? '', scheduleType: job.schedule.cron ? 'cron' : 'every', schedule: job.schedule.cron ?? job.schedule.every ?? '30m', message: job.payload.message ?? '', announce: job.announce ?? false });
    setShowForm(true);
  };

  const save = async () => {
    const body = { name: form.name, [form.scheduleType]: form.schedule, message: form.message, announce: form.announce };
    if (editJob) await fetch(`/api/cron/${editJob.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    else await fetch('/api/cron', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowForm(false);
    refresh();
  };

  const toggle = async (id: string, enable: boolean) => {
    await fetch(`/api/cron/${id}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: enable ? 'enable' : 'disable' }) });
    refresh();
  };

  const run = async (id: string) => {
    await fetch(`/api/cron/${id}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'run' }) });
  };

  const del = async (id: string) => {
    if (!confirm('Delete this cron job?')) return;
    await fetch(`/api/cron/${id}`, { method: 'DELETE' });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cron Jobs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2 border-slate-700"><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-slate-700 hover:bg-slate-600"><Plus className="w-4 h-4" /> Add Job</Button>
        </div>
      </div>

      {data?.error && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-md p-3 text-sm text-yellow-300">
          ⚠️ {data.error} — Start the gateway to manage cron jobs.
        </div>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 bg-slate-800" />)}</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No cron jobs yet.</p>
              <Button size="sm" onClick={openAdd} className="mt-3 bg-slate-700 hover:bg-slate-600"><Plus className="w-4 h-4 mr-1" /> Add your first job</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Schedule</th>
                  <th className="text-left px-4 py-3">Last Run</th><th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${selectedJob === job.id ? 'bg-slate-800/50' : ''}`} onClick={() => loadRuns(job.id)}>
                    <td className="px-4 py-3 font-medium">{job.name ?? <span className="text-slate-500 italic">unnamed</span>}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{job.schedule.cron ?? `every ${job.schedule.every}`}</td>
                    <td className="px-4 py-3 text-slate-400">{job.lastRunAt ? timeAgo(job.lastRunAt) : 'never'}</td>
                    <td className="px-4 py-3"><Badge className={job.enabled ? 'bg-green-900 text-green-300' : 'bg-slate-800 text-slate-400'}>{job.enabled ? 'Active' : 'Paused'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => run(job.id)}><Play className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(job)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toggle(job.id, !job.enabled)}>
                          {job.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-green-400" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={() => del(job.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {selectedJob && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Run History</CardTitle></CardHeader>
          <CardContent>
            {runsLoading ? <Skeleton className="h-20 bg-slate-800" /> : runs.length === 0 ? (
              <p className="text-sm text-slate-500">No runs yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 uppercase"><th className="text-left py-1">Run ID</th><th className="text-left py-1">Started</th><th className="text-left py-1">Duration</th><th className="text-left py-1">Status</th></tr></thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.runId} className="border-t border-slate-800/50">
                      <td className="py-1.5 font-mono text-slate-500">{r.runId.slice(0, 8)}</td>
                      <td className="py-1.5 text-slate-400">{timeAgo(r.startedAt)}</td>
                      <td className="py-1.5 text-slate-400">{r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                      <td className="py-1.5"><Badge className={r.status === 'ok' ? 'bg-green-900 text-green-300' : r.status === 'running' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader><DialogTitle>{editJob ? 'Edit Cron Job' : 'Add Cron Job'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Daily summary" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-1">
              <Label>Schedule type</Label>
              <div className="flex gap-2">
                {['every', 'cron'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, scheduleType: t }))} className={`px-3 py-1.5 rounded text-sm ${form.scheduleType === t ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>{form.scheduleType === 'cron' ? 'Cron expression' : 'Interval'}</Label>
              <Input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} placeholder={form.scheduleType === 'cron' ? '0 9 * * 1-5' : '30m'} className="bg-slate-800 border-slate-700 font-mono" />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Input value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What should the agent do?" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.announce} onCheckedChange={v => setForm(f => ({ ...f, announce: v }))} />
              <Label>Announce result in channel</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-700">Cancel</Button>
            <Button onClick={save} className="bg-slate-700 hover:bg-slate-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
