import { NextResponse } from 'next/server';
import { getStatus, getGatewayHealth } from '@/lib/openclaw/cli';

export async function GET() {
  const [statusResult, healthResult] = await Promise.allSettled([
    getStatus(),
    getGatewayHealth(),
  ]);
  return NextResponse.json({
    status: statusResult.status === 'fulfilled' ? statusResult.value : null,
    statusError: statusResult.status === 'rejected' ? String((statusResult as PromiseRejectedResult).reason) : null,
    health: healthResult.status === 'fulfilled' ? healthResult.value : null,
    healthError: healthResult.status === 'rejected' ? 'Gateway unreachable' : null,
  });
}
