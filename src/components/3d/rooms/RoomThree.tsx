import React from 'react';
import { BaseRoom, BaseRoomProps } from './BaseRoom';
import { VideoPillar } from '../VideoPillar';
import { RoomThreeHistoricExhibits } from './RoomThreeHistoricExhibits';

/**
 * Room Three deliberately inherits the same clear BaseRoom shell as Room Two.
 * Its only room-specific meshes are historic exhibits and the video pillar,
 * which keeps the route through the room open and the displays easy to identify.
 */
export const RoomThree: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
}) => (
  <BaseRoom
    galleryId={galleryId}
    customSettings={customSettings}
    isVisible={isVisible}
  >
    <VideoPillar isVisible={isVisible} />
    <RoomThreeHistoricExhibits isVisible={isVisible} />
  </BaseRoom>
);

export default RoomThree;
