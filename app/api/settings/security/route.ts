import { NextResponse } from 'next/server';
import { getSecurityAudit } from '@/lib/openclaw/cli';

export async function GET() {
  try {
    const audit = await getSecurityAudit();
    return NextResponse.json(audit);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
