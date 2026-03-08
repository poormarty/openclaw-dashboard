'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, Zap, Clock, Settings } from 'lucide-react';

const nav = [
  { href: '/overview', label: 'Overview', icon: Activity },
  { href: '/skills', label: 'Skills', icon: Zap },
  { href: '/cron', label: 'Cron Jobs', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦞</span>
          <div>
            <p className="font-semibold text-sm">OpenClaw</p>
            <p className="text-xs text-slate-400">@POORBOT</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <p className="text-xs text-slate-500">v2026.3.2 · WSL2</p>
      </div>
    </aside>
  );
}
