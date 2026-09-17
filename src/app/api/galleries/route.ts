import { NextResponse } from 'next/server';
import { getGalleries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const galleries = getGalleries();
    return NextResponse.json(galleries);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi lấy dữ liệu phòng triển lãm' },
      { status: 500 }
    );
  }
}
