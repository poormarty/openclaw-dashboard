'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Skill } from '@/lib/openclaw/types';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'ready' | 'missing' | 'os-only';

function SkillCard({ skill }: { skill: Skill }) {
  const isOsOnly = skill.missing.os.length > 0;
  const isMissingEnv = skill.missing.env.length > 0;
  const status = skill.eligible ? 'ready' : isOsOnly ? 'os-only' : isMissingEnv ? 'missing-env' : 'missing-bin';

  const border = { ready: 'border-l-green-500', 'os-only': 'border-l-slate-600', 'missing-env': 'border-l-yellow-500', 'missing-bin': 'border-l-slate-700' }[status];
  const badgeClass = { ready: 'bg-green-900 text-green-300', 'os-only': 'bg-slate-800 text-slate-400', 'missing-env': 'bg-yellow-900 text-yellow-300', 'missing-bin': 'bg-slate-800 text-slate-400' }[status];
  const badgeLabel = { ready: 'READY', 'os-only': 'OS ONLY', 'missing-env': 'MISSING ENV', 'missing-bin': 'MISSING BIN' }[status];

  return (
    <Card className={`bg-slate-900 border-slate-800 border-l-4 ${border}`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-sm flex items-center gap-1">
            {skill.emoji && <span>{skill.emoji}</span>}
            {skill.name}
          </span>
          <Badge className={`text-xs shrink-0 ${badgeClass}`}>{badgeLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <p className="text-xs text-slate-400 line-clamp-2">{skill.description}</p>
        {!skill.eligible && (
          <div className="mt-2 flex flex-wrap gap-1">
            {skill.missing.bins.map(b => <Badge key={b} variant="outline" className="text-xs border-slate-700 text-slate-500">bin: {b}</Badge>)}
            {skill.missing.env.map(e => <Badge key={e} variant="outline" className="text-xs border-yellow-800 text-yellow-500">env: {e}</Badge>)}
            {skill.missing.os.map(o => <Badge key={o} variant="outline" className="text-xs border-slate-700 text-slate-500">os: {o}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data.skills ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = skills.filter(s => {
    if (filter === 'ready' && !s.eligible) return false;
    if (filter === 'missing' && (s.eligible || s.missing.os.length > 0)) return false;
    if (filter === 'os-only' && s.missing.os.length === 0) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { all: skills.length, ready: skills.filter(s => s.eligible).length, missing: skills.filter(s => !s.eligible && s.missing.os.length === 0).length, 'os-only': skills.filter(s => s.missing.os.length > 0).length };
  const filterBtns: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` }, { key: 'ready', label: `Ready (${counts.ready})` },
    { key: 'missing', label: `Missing (${counts.missing})` }, { key: 'os-only', label: `OS Only (${counts['os-only']})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills</h1>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 border-slate-700"><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {filterBtns.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{label}</button>
          ))}
        </div>
        <Input placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} className="bg-slate-900 border-slate-700 text-sm max-w-xs" />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 bg-slate-800 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map(skill => <SkillCard key={skill.name} skill={skill} />)}</div>
      )}
    </div>
  );
}
