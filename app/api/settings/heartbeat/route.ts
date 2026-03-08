import { NextResponse } from 'next/server';
import { getConfigValue, setConfigValue } from '@/lib/openclaw/cli';

export async function GET() {
  const val = await getConfigValue('agents.defaults.heartbeat');
  return NextResponse.json({ heartbeat: val });
}

export async function POST(req: Request) {
  const { interval } = await req.json();
  await setConfigValue('agents.defaults.heartbeat', interval);
  return NextResponse.json({ ok: true });
}
