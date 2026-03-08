import { NextResponse } from 'next/server';
import { toggleCronJob, runCronJob } from '@/lib/openclaw/cli';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { action } = await req.json();
    if (action === 'run') await runCronJob(id);
    else await toggleCronJob(id, action === 'enable');
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
