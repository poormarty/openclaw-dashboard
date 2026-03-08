import { NextResponse } from 'next/server';
import { listSkills } from '@/lib/openclaw/cli';

export async function GET() {
  try {
    const data = await listSkills();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err), skills: [] }, { status: 500 });
  }
}
