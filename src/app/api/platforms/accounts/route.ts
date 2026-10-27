import { NextResponse } from 'next/server';
import { PublisherService } from '@/modules/publishing';
import type { PlatformType } from '@/types';

export async function GET() {
  try {
    const statuses = await PublisherService.getAccountStatuses();
    return NextResponse.json({
      success: true,
      accounts: statuses,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, accountId, accessToken, accountName, appId, appSecret } = body;

    if (!platform || !['FACEBOOK', 'INSTAGRAM', 'TIKTOK'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'المنصة غير صالحة. المنصات المدعومة: FACEBOOK, INSTAGRAM, TIKTOK فقط.' },
        { status: 400 }
      );
    }

    if (!accessToken?.trim()) {
      return NextResponse.json(
        { success: false, error: 'رمز تصريح الوصول (Access Token) مطلوب.' },
        { status: 400 }
      );
    }

    const result = await PublisherService.saveAndVerifyCredential({
      platform: platform as PlatformType,
      accountId,
      accessToken,
      accountName,
      appId,
      appSecret,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountName: result.accountName,
      message: `تم ربط حساب ${platform} والتحقق منه بنجاح!`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') as PlatformType;

    if (!platform || !['FACEBOOK', 'INSTAGRAM', 'TIKTOK'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'المنصة غير صالحة.' },
        { status: 400 }
      );
    }

    const success = PublisherService.disconnectAccount(platform);
    return NextResponse.json({
      success,
      message: `تم إلغاء ربط منصة ${platform}.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
