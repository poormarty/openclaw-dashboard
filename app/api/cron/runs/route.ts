import { NextResponse } from 'next/server';
import { getCronRuns } from '@/lib/openclaw/cli';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? 20);
  try {
    const runs = await getCronRuns(id, limit);
    return NextResponse.json({ runs });
  } catch (err: unknown) {
    return NextResponse.json({ runs: [], error: String(err) }, { status: 500 });
  }
}
