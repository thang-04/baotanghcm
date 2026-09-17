import React from 'react';
import type { Group } from 'three';
import { getAvatarOutfit } from '@/lib/avatarCatalog';

type JointRef = React.Ref<Group>;
type AvatarAppearanceProps = {
  outfitId?: string;
  lowDetail?: boolean;
  hideHead?: boolean;
  headRef?: JointRef;
  leftArmRef?: JointRef;
  rightArmRef?: JointRef;
  leftLegRef?: JointRef;
  rightLegRef?: JointRef;
};

/** Shared proportions preserve existing movement, sitting and collision coordinates. */
export function AvatarAppearance({ outfitId, lowDetail = false, hideHead = false, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef }: AvatarAppearanceProps) {
  const outfit = getAvatarOutfit(outfitId);
  const segments = lowDetail ? 8 : 12;
  return <group scale={1.6}>
    {!hideHead && <group ref={headRef} position={[0, 0.7, 0]}>
      <mesh><sphereGeometry args={[lowDetail ? 0.18 : 0.22, segments, segments]} /><meshStandardMaterial color="#e8c9a8" roughness={0.8} /></mesh>
      <mesh position={[0, 0.09, -0.015]}><sphereGeometry args={[lowDetail ? 0.17 : 0.21, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#302f2e" /></mesh>
      {[-0.065, 0.065].map(x => <mesh key={x} position={[x, 0.02, lowDetail ? 0.167 : 0.203]}><sphereGeometry args={[0.018, 6, 6]} /><meshBasicMaterial color="#292929" /></mesh>)}
    </group>}
    {lowDetail ? <>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.07, 0.18, 0.5, 8]} /><meshStandardMaterial color={outfit.shirt} /></mesh>
      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.22, 0.22, 0.1, 8]} /><meshStandardMaterial color={outfit.trousers} /></mesh>
      <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.095, 0.025, 4, 8]} /><meshStandardMaterial color={outfit.accent} /></mesh>
    </> : <>
      <mesh position={[0, 0.28, 0]}><capsuleGeometry args={[0.175, 0.3, 6, segments]} /><meshStandardMaterial color={outfit.shirt} roughness={0.8} /></mesh>
      <mesh position={[0, 0.49, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.115, 0.022, 6, 12]} /><meshStandardMaterial color={outfit.accent} /></mesh>
      {outfit.id === 'student' && <mesh position={[0, 0.38, 0.18]}><boxGeometry args={[0.035, 0.15, 0.015]} /><meshStandardMaterial color={outfit.accent} /></mesh>}
      {outfit.id === 'aodai' && <mesh position={[0, -0.015, 0]}><cylinderGeometry args={[0.168, 0.23, 0.32, 12]} /><meshStandardMaterial color={outfit.shirt} /></mesh>}
      {outfit.id === 'baba' && [-0.09, 0.09].map(x => <mesh key={x} position={[x, 0.22, 0.159]}><boxGeometry args={[0.065, 0.065, 0.015]} /><meshStandardMaterial color={outfit.accent} /></mesh>)}
      {[{ ref: leftArmRef, x: -0.2396 }, { ref: rightArmRef, x: 0.2396 }].map(({ ref, x }) => <group key={x} ref={ref} position={[x, 0.505, 0]}>
        <mesh position={[0, -0.178, 0]}><capsuleGeometry args={[0.068, 0.22, 6, segments]} /><meshStandardMaterial color={outfit.shirt} /></mesh>
        <mesh position={[0, -0.30, 0]}><sphereGeometry args={[0.065, 8, 8]} /><meshStandardMaterial color="#e8c9a8" /></mesh>
      </group>)}
      {[{ ref: leftLegRef, x: -0.082 }, { ref: rightLegRef, x: 0.082 }].map(({ ref, x }) => <group key={x} ref={ref} position={[x, 0.075, 0]}>
        <mesh position={[0, -0.185, 0]}><capsuleGeometry args={[0.075, 0.22, 6, segments]} /><meshStandardMaterial color={outfit.trousers} /></mesh>
      </group>)}
    </>}
  </group>;
}
