# Room Three 3D Editing Rules

## Purpose

Use this document when changing the 3D environment, props, lighting, or historic exhibits of **Room Three**. The goal is to keep every change isolated to Room Three and avoid altering navigation, rendering, or assets used by other rooms.

Room Three is rendered for `gallery-ceramics`.

## Safe editing boundary

You may edit the following files for Room Three-only 3D work:

- `src/components/3d/rooms/RoomThree.tsx` - Room Three lighting, rails, rope barriers, hooks, and room-local 3D decoration.
- `src/components/3d/rooms/RoomThreeHistoricExhibits.tsx` - Room Three historic displays, desk, and exhibit meshes.
- `src/components/3d/VideoPillar.tsx` - only when the change is specific to the Room Three video pillar.
- New Room Three-only assets placed in a clearly scoped folder, for example `public/exhibits/room-three/` or `public/images/room-three/`.

## Rules for changing 3D items

1. Keep all new meshes, materials, lights, and groups inside `RoomThree` or `RoomThreeHistoricExhibits`.
2. Use coordinates local to Room Three. Do not change world offsets, spawn positions, or player/camera movement code.
3. Reuse Room Three's `roomWidth`, `roomLength`, and `roomHeight` values when positioning items near walls or the ceiling. Do not hard-code a global room size.
4. Name new assets and React keys with a `room-three` prefix where practical, so they cannot be confused with shared assets.
5. Do not replace a shared material, geometry, texture, or video file unless the replacement is confirmed to be used only by Room Three.
6. Preserve the `isVisible` prop on Room Three content so inactive rooms do not render visibly.

## Do not edit for Room Three prop-only work

The following files are shared infrastructure or control cross-room behavior. Do not change them for a Room Three 3D-item task:

- `src/components/3d/rooms/BaseRoom.tsx`
- `src/components/3d/rooms/BaseRoomPlain.tsx`
- `src/components/3d/ExhibitionRoom.tsx`
- `src/components/3d/DynamicRoom.tsx`
- `src/components/3d/GalleryCanvas.tsx`
- `src/components/3d/PlayerCharacter.tsx`
- `src/context/MuseumContext.tsx`
- `src/app/lobby/page.tsx`
- `src/app/admin/page.tsx`

These files own shared room rendering, movement, collisions, doors, room state, and navigation.

## Room connection guardrails

Room Three participates in the shared route below:

```text
Room Two (gallery-paintings) <-> Room Three (gallery-ceramics) <-> Room Four (gallery-market-economy)
```

The connections and `door-room4` are managed outside `RoomThree.tsx`. A Room Three visual or prop change must not modify:

- `galleryId` values;
- door IDs, door states, or target rooms;
- adjacency rules;
- spawn points or teleport targets;
- collision rules or player boundaries;
- Room Four's `gallery-market-economy` layout.

## Changes that require an explicit wider-scope review

Stop and review the impact before changing any of the following:

- A door opening, closing, or destination.
- Shared context state or local-storage keys.
- Player movement, collision, camera, or world-coordinate offsets.
- A file imported by multiple rooms or a generic base-room component.

## Pre-change checklist

- [ ] The requested change is visual, decorative, or a Room Three-only historic prop.
- [ ] Every edited component is scoped to Room Three.
- [ ] New assets are stored in a Room Three-specific location and do not overwrite shared assets.
- [ ] No navigation, door, player, context, or shared base-room file was modified.

## Verification checklist

- [ ] Open Room Three and confirm every new or changed item is visible and correctly positioned.
- [ ] Walk around the changed item and confirm it does not block a doorway or route unexpectedly.
- [ ] Confirm Room Two -> Room Three -> Room Four navigation still works without code changes in the navigation layer.
- [ ] Confirm Room Three's video pillar still renders normally if it was edited.
