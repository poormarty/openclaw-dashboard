import { NextResponse } from 'next/server';
import { listCronJobs, addCronJob } from '@/lib/openclaw/cli';

export async function GET() {
  try {
    const data = await listCronJobs();
    return NextResponse.json({ ...data, error: null });
  } catch {
    return NextResponse.json({ jobs: [], total: 0, error: 'Gateway offline' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await addCronJob(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
