import React from 'react';
import RoomOne from './rooms/RoomOne';
import RoomTwo from './rooms/RoomTwo';
import RoomThree from './rooms/RoomThree';
import RoomFour from './rooms/RoomFour';
import RoomNhaRong from './rooms/RoomNhaRong';
import BaseRoom from './rooms/BaseRoom';
import { Exhibit } from '@/lib/db';

interface ExhibitionRoomProps {
  galleryId: string;
  customSettings?: {
    room_width: number;
    room_length: number;
    room_height: number;
    floor_color: string;
    wall_color: string;
    wainscoting_color: string;
    floor_type: 'wood' | 'marble' | 'carpet';
  };
  isVisible?: boolean;
  isInteractive?: boolean;
  lightingContext?: 'standalone' | 'connected';
  onRopeClick?: (ropeIndex: number) => void;
  ropeBarriersConfig?: string;
  exhibits?: Exhibit[];
}

export const ExhibitionRoom: React.FC<ExhibitionRoomProps> = (props) => {
  const { galleryId } = props;

  if (galleryId === 'gallery-subsidy') {
    return <RoomOne {...props} ropeBarriersConfig={props.ropeBarriersConfig} />;
  }

  if (galleryId === 'gallery-paintings') {
    return <RoomTwo {...props} />;
  }

  if (galleryId === 'gallery-ceramics') {
    return <RoomThree {...props} />;
  }

  if (galleryId === 'gallery-market-economy') {
    return <RoomFour {...props} />;
  }

  if (galleryId === 'gallery-three') {
    return <RoomNhaRong {...props} />;
  }

  // Fallback cho phòng mới trong tương lai
  return <BaseRoom {...props} />;
};

export default ExhibitionRoom;
