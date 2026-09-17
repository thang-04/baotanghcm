import { NextRequest, NextResponse } from 'next/server';
import { getExhibits, saveExhibit } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId') || undefined;
    
    const exhibits = getExhibits(galleryId);
    return NextResponse.json(exhibits);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi lấy dữ liệu hiện vật' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!body.id || !body.gallery_id || !body.title?.vi || !body.title?.en) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc (id, gallery_id, title)' },
        { status: 400 }
      );
    }

    const success = saveExhibit(body);
    if (success) {
      return NextResponse.json({ message: 'Lưu hiện vật thành công', exhibit: body });
    } else {
      return NextResponse.json(
        { error: 'Ghi dữ liệu thất bại' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
