'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useVideoTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const ROOM_THREE_PILLAR_VIDEO_URL = '/videos/room-three-pillar.mp4';

export interface VideoPillarProps {
  isVisible?: boolean;
}

const CUBE_SIDE = 3.9;
const FRAME_THICKNESS = 0.16;
const CUBE_CENTER_Y = 2.05;
const SIDE_CENTER = CUBE_SIDE / 2 - FRAME_THICKNESS / 2;
const END_SCREEN_WIDTH = CUBE_SIDE - FRAME_THICKNESS * 2;
const SCREEN_CONFIG = [
  // Front and rear frames end exactly at the side frames, so no screen volumes overlap.
  { position: [0, CUBE_CENTER_Y, SIDE_CENTER] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: END_SCREEN_WIDTH },
  { position: [SIDE_CENTER, CUBE_CENTER_Y, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], width: CUBE_SIDE },
  { position: [0, CUBE_CENTER_Y, -SIDE_CENTER] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], width: END_SCREEN_WIDTH },
  { position: [-SIDE_CENTER, CUBE_CENTER_Y, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], width: CUBE_SIDE },
];
const ACTIVATION_RADIUS = 4.8;
const ACTIVATION_RADIUS_SQUARED = ACTIVATION_RADIUS * ACTIVATION_RADIUS;

export const VideoPillar: React.FC<VideoPillarProps> = ({ isVisible = true }) => {
  const videoTexture = useVideoTexture(ROOM_THREE_PILLAR_VIDEO_URL, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  });
  const pillarGroup = useRef<THREE.Group>(null);
  const pillarWorldPosition = useRef(new THREE.Vector3());
  const videoElement = useRef<HTMLVideoElement>(null);
  const hasStartedPlayback = useRef(false);
  const nextPlaybackAttemptAt = useRef(0);

  useEffect(() => {
    videoElement.current = videoTexture.image;
  }, [videoTexture]);

  useFrame(({ camera, clock }) => {
    if (!isVisible || hasStartedPlayback.current) return;

    const group = pillarGroup.current;
    if (!group) return;

    group.getWorldPosition(pillarWorldPosition.current);
    const dx = camera.position.x - pillarWorldPosition.current.x;
    const dz = camera.position.z - pillarWorldPosition.current.z;
    const distanceSquared = dx * dx + dz * dz;
    if (distanceSquared > ACTIVATION_RADIUS_SQUARED) return;

    const video = videoElement.current;
    if (!video) return;
    if (!video.paused) {
      hasStartedPlayback.current = true;
      return;
    }

    if (clock.elapsedTime < nextPlaybackAttemptAt.current) return;
    nextPlaybackAttemptAt.current = clock.elapsedTime + 2;
    video.muted = true;
    video.currentTime = 0;
    void video.play().then(() => {
      hasStartedPlayback.current = true;
    }).catch(() => undefined);
  });

  useEffect(() => {
    if (isVisible) return;

    videoElement.current?.pause();
    hasStartedPlayback.current = false;
    nextPlaybackAttemptAt.current = 0;
  }, [isVisible, videoTexture]);

  return (
    <group ref={pillarGroup} visible={isVisible}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.4, 0.24, 32]} />
        <meshStandardMaterial color="#211a16" metalness={0.75} roughness={0.25} />
      </mesh>

      <mesh position={[0, 1.98, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.08, 1.08, 3.46, 32]} />
        <meshStandardMaterial color="#3b2a22" metalness={0.55} roughness={0.3} />
      </mesh>

      <mesh position={[0, 3.78, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.16, 32]} />
        <meshStandardMaterial color="#b8893e" metalness={0.8} roughness={0.2} />
      </mesh>

      {SCREEN_CONFIG.map(({ position, rotation, width }, index) => {
        const videoWidth = width - 0.26;
        const videoHeight = videoWidth * 9 / 16;

        return (
        <group
          key={`room-three-video-screen-${index}`}
          position={position}
          rotation={rotation}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, CUBE_SIDE, FRAME_THICKNESS]} />
            <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.086]}>
            <planeGeometry args={[videoWidth, videoHeight]} />
            <meshBasicMaterial map={videoTexture} toneMapped={false} color="#ffffff" />
          </mesh>
        </group>
        );
      })}

    </group>
  );
};

export default VideoPillar;
