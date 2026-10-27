import { NextResponse } from 'next/server';
import { ContentStorage } from '@/modules/content/storage';

export async function GET() {
  try {
    const logs = await ContentStorage.getAuditLogs(30);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
