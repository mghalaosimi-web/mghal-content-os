import { NextResponse } from 'next/server';
import { ContentStorage } from '@/modules/content/storage';
import type { ContentStatus, ContentType } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContentStatus | null;
    const contentType = searchParams.get('contentType') as ContentType | null;
    const search = searchParams.get('search') || undefined;

    const items = await ContentStorage.getAll({
      status: status || undefined,
      contentType: contentType || undefined,
      search,
    });

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
