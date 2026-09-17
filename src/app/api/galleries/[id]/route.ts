import { NextRequest, NextResponse } from 'next/server';
import { updateGallery } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Tạo object dữ liệu cập nhật
    const updatedData = {
      room_width: body.room_width !== undefined ? Number(body.room_width) : undefined,
      room_length: body.room_length !== undefined ? Number(body.room_length) : undefined,
      room_height: body.room_height !== undefined ? Number(body.room_height) : undefined,
      floor_color: body.floor_color,
      wall_color: body.wall_color,
      wainscoting_color: body.wainscoting_color,
      floor_type: body.floor_type,
      rope_barriers_config: body.rope_barriers_config,
    };
    
    // Loại bỏ các trường undefined
    Object.keys(updatedData).forEach(key => {
      if ((updatedData as any)[key] === undefined) {
        delete (updatedData as any)[key];
      }
    });

    const success = updateGallery(id, updatedData);
    if (success) {
      return NextResponse.json({ message: 'Cập nhật cấu trúc phòng thành công' });
    } else {
      return NextResponse.json(
        { error: 'Phòng triển lãm không tồn tại hoặc cập nhật thất bại' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Lỗi API cập nhật gallery:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi cập nhật cấu trúc phòng' },
      { status: 500 }
    );
  }
}
