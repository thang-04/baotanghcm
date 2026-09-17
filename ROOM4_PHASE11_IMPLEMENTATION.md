# Room 4 — Phase 11 implementation record

## Outcome

Phase 11 adds exactly two fixed orientation markers and strengthens the existing
heading hierarchy. It does **not** add a station, interaction, collider,
achievement, route branch, or score. The approved sequence remains:

```text
Room 3 → Journey Card → S1 → S2 → S3 → Moscow–Guangzhou transition
       → S4 → S5 → S6 → S7 → S8 → Room 5
```

The Moscow–Guangzhou corridor remains a transition, never a third historical
section.

## Framed flag assets

The scene now uses the two flag images supplied by the project owner. They were
normalized into matching 3:2 exhibit textures, then mounted in the same large,
static timber-and-brass frame. The frames have no collider, light, animation,
raycast target, interaction, station state, or label; all other Room 4 wall
sections are deliberately left unchanged for later customization.

| Frame | Asset | Display treatment |
| --- | --- | --- |
| Soviet zone | [`soviet-flag-framed.png`](public/images/room4/flags/soviet-flag-framed.png) | User-provided Soviet flag, normalized to a 3:2 wall texture. |
| Guangzhou/Guangdong zone | [`china-flag-framed.png`](public/images/room4/flags/china-flag-framed.png) | User-provided China flag, normalized to the same 3:2 wall texture. |

## Scene placement and sightlines

Coordinates are in the Room 4 local scene. Each framed texture is `6.20 × 4.13`
(3:2), mounted just inside the existing side wall and clear of the station
objects and central walking spine. No entry was added to `ROOM_FOUR_COLLIDERS`.

| Marker | Position `(x, y, z)` | Rotation `(x, y, z)` | Plane `(w × h)` | Sightline decision |
| --- | --- | --- | --- | --- |
| Soviet / Liên Xô zone | `(8.72, 3.82, -49.80)` | `(0, -π/2, 0)` | `6.20 × 4.13` | Left side in the visitor's entry view, moved past the Start cue so the whole large frame remains readable. |
| China / Quảng Châu–Quảng Đông zone | `(-8.72, 3.82, -27.40)` | `(0, π/2, 0)` | `6.20 × 4.13` | Right side in the visitor's route view, in the existing Guangzhou/Guangdong section and clear of the route spine and Stations 4–5. |

The static source metadata and sightline notes live in
[`roomFourHistoricalMarkers.ts`](src/lib/roomFourHistoricalMarkers.ts). The
non-interactive scene implementation is
[`RoomFourHistoricalFlags.tsx`](src/components/3d/rooms/room-four/RoomFourHistoricalFlags.tsx).

## Typography changes

| Layer | Previous | Phase 11 | Intent |
| --- | ---: | ---: | --- |
| Threshold headings `LIÊN XÔ` and `QUẢNG CHÂU` | 28 px and 13 px respectively | 42 px | Both are first-glance, section-scale headings; 42 px clears the required 32 px at 1024 × 640. |
| Room 5 exit threshold | 18 px | 34 px | Keeps the final direction subordinate to section headings but legible as a destination. |
| Station names | 18 / 16 px | 22 / 20 px | 22–25% increase to the station name only. Date, progress, purpose, and guidance remain small. |
| Object overlay display title | `text-2xl sm:text-3xl` | `text-3xl sm:text-4xl` | One display step larger; it keeps a 19-character measure, scrollable panel, and an explicit right inset for the close button. |

## Acceptance demo

1. Enter Room 4 from Room 3 with fresh progress. Confirm the large `LIÊN XÔ`
   heading, cold atmosphere, Soviet marker, and right-side Journey Card prompt
   are all separately readable.
2. Complete S1–S3. In the existing corridor, confirm the warm shift and the
   large China frame in the Guangzhou/Guangdong section. Confirm no new station
   or action is offered.
3. At `1024 × 640`, first with the standard preset then with `Siêu Thấp /
   Ultra Low`, confirm neither marker covers the floor spine, central artifact,
   Journey Card, active station label, finale panel, or an open overlay.
4. Open any station overlay and verify the larger display title remains short,
   the close button is unobscured, and `Escape` still closes the panel.
5. Finish S4–S8. Confirm Journey Card progress, finale logic, and the Room 5
   exit message remain unchanged.

## Engineering checks to run

```powershell
npx eslint src/components/3d/rooms/RoomFour.tsx src/components/3d/rooms/room-four/RoomFourHistoricalFlags.tsx src/components/3d/rooms/room-four/RoomFourJourneyOverlay.tsx src/lib/roomFourHistoricalMarkers.ts
npx tsc --noEmit --pretty false
npm run build
```
