import { NextRequest, NextResponse } from 'next/server';
import { updateExhibitCoordinates, deleteExhibit } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate coordinates fields
    const coords = {
      coordinate_x: Number(body.coordinate_x),
      coordinate_y: Number(body.coordinate_y),
      coordinate_z: Number(body.coordinate_z),
      rotation_x: Number(body.rotation_x),
      rotation_y: Number(body.rotation_y),
      rotation_z: Number(body.rotation_z),
      scale_x: Number(body.scale_x),
      scale_y: Number(body.scale_y),
      scale_z: Number(body.scale_z),
    };

    if (Object.values(coords).some(isNaN)) {
      return NextResponse.json(
        { error: 'Các tọa độ phải là số hợp lệ' },
        { status: 400 }
      );
    }
    
    const success = updateExhibitCoordinates(id, coords);
    if (success) {
      return NextResponse.json({ message: 'Cập nhật tọa độ thành công' });
    } else {
      return NextResponse.json(
        { error: 'Hiện vật không tồn tại hoặc cập nhật thất bại' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi cập nhật tọa độ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteExhibit(id);
    if (success) {
      return NextResponse.json({ message: 'Xóa hiện vật thành công' });
    } else {
      return NextResponse.json(
        { error: 'Hiện vật không tồn tại hoặc xóa thất bại' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xóa hiện vật' },
      { status: 500 }
    );
  }
}
