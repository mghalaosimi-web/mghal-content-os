import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ContentStorage } from '@/modules/content/storage';
import { ContentStatusEnum, PlatformTypeEnum } from '@/lib/validation/content.schema';

const updateActionSchema = z.object({
  status: ContentStatusEnum.optional(),
  platformUpdate: z
    .object({
      platform: PlatformTypeEnum,
      caption: z.string().optional(),
      hashtags: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await ContentStorage.getById(id);

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateActionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: 'Invalid update body' }, { status: 400 });
    }

    let updatedItem = null;

    if (validated.data.status) {
      updatedItem = await ContentStorage.updateStatus(id, validated.data.status);
    }

    if (validated.data.platformUpdate) {
      const { platform, caption, hashtags } = validated.data.platformUpdate;
      await ContentStorage.updateVariant(id, platform, { caption, hashtags });
      updatedItem = await ContentStorage.getById(id);
    }

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: 'Item not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await ContentStorage.delete(id);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
