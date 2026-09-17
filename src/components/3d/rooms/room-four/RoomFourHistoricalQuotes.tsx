'use client';

import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  ROOM_FOUR_QUOTE_PANELS,
  type RoomFourQuotePanel,
} from '@/lib/roomFourHistoricalMarkers';

const IGNORE_RAYCAST: THREE.Object3D['raycast'] = () => undefined;

const QUOTE_MATERIALS = {
  coldBacking: new THREE.MeshStandardMaterial({ color: '#0d141b', roughness: 0.78, metalness: 0.22 }),
  coldSurface: new THREE.MeshStandardMaterial({ color: '#182631', roughness: 0.88, metalness: 0.08 }),
  coldAccent: new THREE.MeshStandardMaterial({ color: '#9cbeca', roughness: 0.56, metalness: 0.42 }),
  warmBacking: new THREE.MeshStandardMaterial({ color: '#181411', roughness: 0.8, metalness: 0.2 }),
  warmSurface: new THREE.MeshStandardMaterial({ color: '#2a251e', roughness: 0.88, metalness: 0.05 }),
  warmAccent: new THREE.MeshStandardMaterial({ color: '#d6a76a', roughness: 0.53, metalness: 0.38 }),
} as const;

const HistoricalQuotePanel = ({
  panel,
  language,
  visible,
}: {
  panel: RoomFourQuotePanel;
  language: 'vi' | 'en';
  visible: boolean;
}) => {
  const [width, height] = panel.dimensions;
  const isSoviet = panel.zone === 'soviet';
  const backing = isSoviet ? QUOTE_MATERIALS.coldBacking : QUOTE_MATERIALS.warmBacking;
  const surface = isSoviet ? QUOTE_MATERIALS.coldSurface : QUOTE_MATERIALS.warmSurface;
  const accent = isSoviet ? QUOTE_MATERIALS.coldAccent : QUOTE_MATERIALS.warmAccent;
  const quoteLines = language === 'vi' ? panel.quoteLinesVi : panel.quoteLinesEn;
  const attribution = language === 'vi' ? panel.attributionVi : panel.attributionEn;
  const frontDepth = 0.08;
  const quoteLineHeight = 0.38;
  const quoteStartY = ((quoteLines.length - 1) * quoteLineHeight) / 2;

  return (
    <group
      name={`room-four-${panel.id}-wall-quote`}
      position={panel.position}
      rotation={panel.rotation}
      raycast={IGNORE_RAYCAST}
    >
      {/* An opposing-wall reading moment: static scenery only, with no collider
          or pointer target, so the approved eight-station journey is unchanged. */}
      <mesh position={[0, 0, -0.06]} material={backing} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width + 0.28, height + 0.28, 0.13]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={surface} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width, height, 0.06]} />
      </mesh>
      <mesh position={[0, height / 2 - 0.18, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width - 0.4, 0.035, 0.025]} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.18, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width - 0.4, 0.035, 0.025]} />
      </mesh>
      <mesh position={[-width / 2 + 0.18, 0, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.035, height - 0.4, 0.025]} />
      </mesh>

      {/* Wall copy is scene-native text, not a DOM overlay. This removes the
          per-frame Html occlusion/z-index changes that caused it to flicker. */}
      <group position={[0, 0.1, frontDepth + 0.11]} visible={visible} raycast={IGNORE_RAYCAST}>
        {quoteLines.map((line, index) => (
          <Text
            key={line}
            position={[0, quoteStartY - index * quoteLineHeight, 0]}
            anchorX="center"
            anchorY="middle"
            color="#f2e5cc"
            fontSize={0.3}
            maxWidth={width - 0.8}
            outlineWidth={0.012}
            outlineColor="#080a0b"
            renderOrder={12}
            raycast={IGNORE_RAYCAST}
          >
            {line}
          </Text>
        ))}
        <Text
          position={[0, -quoteStartY - 0.44, 0.01]}
          anchorX="center"
          anchorY="middle"
          color={isSoviet ? '#9db9c2' : '#d7b17c'}
          fontSize={0.16}
          letterSpacing={0.025}
          outlineWidth={0.008}
          outlineColor="#080a0b"
          renderOrder={12}
          raycast={IGNORE_RAYCAST}
        >
          {attribution}
        </Text>
      </group>
    </group>
  );
};

/**
 * The two quotations occupy the wall opposite each framed flag, completing
 * the Soviet and Guangzhou reading pairs without altering the room's route.
 * They are temporarily hidden while a station form is open so the form always
 * remains the primary reading surface.
 */
export const RoomFourHistoricalQuotes = ({
  language,
  visible = true,
}: {
  language: 'vi' | 'en';
  visible?: boolean;
}) => (
  <group name="room-four-historical-wall-quotes" visible={visible} raycast={IGNORE_RAYCAST}>
    {ROOM_FOUR_QUOTE_PANELS.map((panel) => (
      <HistoricalQuotePanel key={panel.id} panel={panel} language={language} visible={visible} />
    ))}
  </group>
);

export default RoomFourHistoricalQuotes;
