'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ShieldAlert, Info } from 'lucide-react';
import type { SecurityAudit } from '@/lib/openclaw/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const [audit, setAudit] = useState<SecurityAudit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [heartbeat, setHeartbeat] = useState('30m');
  const [heartbeatSaving, setHeartbeatSaving] = useState(false);
  const [heartbeatSaved, setHeartbeatSaved] = useState(false);

  const runAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/settings/security');
      setAudit(await res.json());
    } finally {
      setAuditLoading(false);
    }
  };

  const saveHeartbeat = async () => {
    setHeartbeatSaving(true);
    await fetch('/api/settings/heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interval: heartbeat }) });
    setHeartbeatSaving(false);
    setHeartbeatSaved(true);
    setTimeout(() => setHeartbeatSaved(false), 2000);
  };

  const severityIcon = { critical: ShieldAlert, warn: ShieldAlert, info: Info };
  const severityColor = { critical: 'border-red-800 bg-red-950/20 text-red-300', warn: 'border-yellow-800 bg-yellow-950/20 text-yellow-300', info: 'border-blue-800 bg-blue-950/20 text-blue-300' };
  const badgeColor = { critical: 'bg-red-900 text-red-300', warn: 'bg-yellow-900 text-yellow-300', info: 'bg-blue-900 text-blue-300' };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-base">Heartbeat</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-400">How often the agent proactively checks in (e.g. <code className="text-xs bg-slate-800 px-1 rounded">30m</code>, <code className="text-xs bg-slate-800 px-1 rounded">1h</code>).</p>
          <div className="flex gap-2">
            <Input value={heartbeat} onChange={e => setHeartbeat(e.target.value)} className="bg-slate-800 border-slate-700 w-32 font-mono" />
            <Button onClick={saveHeartbeat} disabled={heartbeatSaving} className="bg-slate-700 hover:bg-slate-600">
              {heartbeatSaved ? '✓ Saved' : heartbeatSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-base">Discord Allowlist</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-400">Only these Discord user IDs can trigger POORBOT.</p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-700 text-slate-200 font-mono text-xs">389562657394655234 (you)</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Edit via: <code className="bg-slate-800 px-1 rounded">openclaw config set channels.discord.allowFrom</code></p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Security Audit</CardTitle>
          <Button size="sm" variant="outline" onClick={runAudit} disabled={auditLoading} className="gap-2 border-slate-700">
            <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
            {auditLoading ? 'Running...' : 'Run Audit'}
          </Button>
        </CardHeader>
        <CardContent>
          {!audit && !auditLoading && <p className="text-sm text-slate-500">Click "Run Audit" to check your security posture.</p>}
          {auditLoading && <Skeleton className="h-20 bg-slate-800" />}
          {audit && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Badge className={audit.summary.critical > 0 ? 'bg-red-900 text-red-300' : 'bg-slate-800 text-slate-400'}>{audit.summary.critical} Critical</Badge>
                <Badge className={audit.summary.warn > 0 ? 'bg-yellow-900 text-yellow-300' : 'bg-slate-800 text-slate-400'}>{audit.summary.warn} Warnings</Badge>
                <Badge className="bg-blue-900 text-blue-300">{audit.summary.info} Info</Badge>
              </div>
              {audit.findings?.map(f => {
                const Icon = severityIcon[f.severity];
                return (
                  <div key={f.checkId} className={`border rounded-md p-3 ${severityColor[f.severity]}`}>
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${badgeColor[f.severity]}`}>{f.severity.toUpperCase()}</Badge>
                          <span className="text-sm font-medium">{f.title}</span>
                        </div>
                        <p className="text-xs opacity-80">{f.detail}</p>
                        {f.remediation && <p className="text-xs opacity-60 mt-1">Fix: {f.remediation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
