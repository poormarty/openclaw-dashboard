'use client';

import { usePolling } from '@/hooks/use-polling';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, Bot, Clock, MessageSquare } from 'lucide-react';
import type { OpenClawStatus } from '@/lib/openclaw/types';
import { Skeleton } from '@/components/ui/skeleton';

interface OverviewData {
  status: OpenClawStatus | null;
  statusError: string | null;
  health: { ok: boolean } | null;
  healthError: string | null;
}

function formatTokens(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function OverviewPage() {
  const { data, loading, refresh, lastRefreshed } = usePolling<OverviewData>('/api/overview', 15000);

  const isGatewayOk = data?.health?.ok || data?.status != null;
  const heartbeat = data?.status?.heartbeat?.agents?.[0];
  const sessions = data?.status?.sessions;
  const channels = data?.status?.channelSummary ?? [];
  const totalTokens = sessions?.recent?.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          {lastRefreshed && (
            <p className="text-xs text-slate-400 mt-1">
              Updated {timeAgo(Date.now() - lastRefreshed.getTime())}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2 border-slate-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              {isGatewayOk ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32 bg-slate-800" /> : (
              <>
                <div className="flex items-center gap-2">
                  <Badge className={isGatewayOk ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}>
                    {isGatewayOk ? 'RUNNING' : 'OFFLINE'}
                  </Badge>
                  <span className="text-xs text-slate-400">v2026.3.2</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">ws://127.0.0.1:18789</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Bot className="w-4 h-4" /> Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-40 bg-slate-800" /> : (
              <>
                <p className="font-semibold">@POORBOT · main</p>
                <p className="text-xs text-slate-400 mt-1">
                  Model: {sessions?.defaults?.model ?? 'openrouter/auto'}
                </p>
                {heartbeat && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Heartbeat: {heartbeat.every}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24 bg-slate-800" /> : (
              <>
                <p className="text-2xl font-bold">{sessions?.count ?? 0}</p>
                {sessions?.recent?.map(s => (
                  <div key={s.key} className="mt-2 text-xs text-slate-400">
                    <span>{s.key.split(':').slice(-2).join('/')}</span>
                    <span className="ml-2 text-slate-500">{formatTokens(s.totalTokens ?? 0)} tokens</span>
                    <span className="ml-2 text-slate-600">{timeAgo(s.ageMs)}</span>
                  </div>
                ))}
                {totalTokens > 0 && (
                  <p className="text-xs text-slate-500 mt-2">Total: {formatTokens(totalTokens)} tokens</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32 bg-slate-800" /> : (
              channels.length === 0 ? (
                <p className="text-sm text-slate-500">No active channels</p>
              ) : (
                channels.map((ch, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm capitalize">{ch.channel}</span>
                    <Badge className={ch.status === 'ok' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}>
                      {ch.status}
                    </Badge>
                  </div>
                ))
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
