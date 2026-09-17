# Room 4 — Phase 5 Final Art Direction, Optimisation, and Acceptance Report

## Outcome

Phase 5 is complete. Room Four remains the approved **Soviet Union → Guangzhou (1923–1927)** journey and now has its final exhibition art direction, responsive information layer, graphics-preset behaviour, interaction feedback, and production verification.

The authoritative sequence is unchanged:

`Room 3 → Journey Card → S1 → S2 → S3 → Moscow–Guangzhou transition → S4 → S5 → S6 → S7 → S8 → Room 5`

No new station, quiz, score, punishment mechanic, route branch, doorway, collider, or historical chapter was introduced.

## Preserved spatial contract

| Contract | Final value |
| --- | ---: |
| Room boundary | 18 m × 80 m |
| Local Z | -75 → +5 |
| World Z | 130 → 210 |
| Entrance from Room 3 | world Z 130; spawn Z 133 |
| Exit to Room 5 | world Z 210; spawn Z 212 |
| Soviet section | Card + S1–S3 |
| Transition | local Z -42 → -34; not a historical station |
| Guangzhou section | S4–S8 |

`src/lib/roomFourSpatial.json` and `src/lib/roomFourLayout.ts` remain the single shared source for the boundary, station coordinates, centerline, portals, and colliders.

## Final art-direction changes

| Area | Phase 5 result |
| --- | --- |
| Entrance and Journey Card | The threshold keeps one clear starting action. The compact persistent card now uses the loaded project type system and remains readable at small laptop sizes. |
| S1 · Moscow study desk | Cold paper, steel, and the active stop beacon establish the first focused act of study without adding wall copy. |
| S2 · International forum | A tall editorial backdrop reinforces this first major focal point while the globe and three rings remain the single central object and action. |
| S3 · Guangzhou ticket | The stamped ticket remains the final Soviet-section action and directs attention into the colour-changing corridor. |
| Transition corridor | Floor, walls, and ceiling retain the eight-metre cold-to-warm gradient. Map-like line detail is retained on medium graphics and simplified on lower presets. |
| S4 · Lý Thụy | The warm mission desk, three envelopes, and three directional rays clearly open the operational Guangzhou section. |
| S5 · Organisation nucleus | Network nodes retain their ordered connection feedback and sit within a warmer, more active material field. |
| S6 · Thanh Niên press | A focal backdrop and stronger paper/ink contrast make the printing press one of the three primary visual anchors. |
| S7 · Secret classroom | The map-board and four lesson routes remain readable as one assembly rather than a collection of unrelated props. |
| S8 · Network homeward | The terminal map receives the final focal backdrop; four routes and the exit message remain the journey synthesis. |
| Exit | The portal still activates only after S8 and retains “Hành trang đã sẵn sàng — Con đường về Tổ quốc.” |

Typography now uses fonts already loaded by the application: **EB Garamond** for historical display text, **Hanken Grotesk/Manrope** for reading, and **Space Grotesk** for dates and operational labels. The previous unloaded `Be Vietnam Pro` fallback was removed.

## Interaction and responsive polish

- Only the current station receives an animated beacon. It mutates a Three.js ref in `useFrame` with delta time and never calls React state from the render loop.
- Completed, active, and future stations retain distinct material and label states.
- Proximity falls back to camera-ray distance only when a named player object is unavailable; it no longer grants unconditional remote interaction.
- Station and transition labels are hidden while the reading panel is open, preventing 3D HTML labels from crossing the modal.
- The full-screen interaction layer has an explicit top z-range, `100dvh`-based height limits, scrollable columns, visible focus states, and an `aria-live` status notice.
- Progress survives reload and nickname reuse through the existing Room Four persistence contract.

## Performance changes

### Draw calls and geometry

- Eight transition floor pieces are now one instanced draw.
- Sixteen transition wall pieces are now one instanced draw.
- Eight transition ceiling pieces are now one instanced draw.
- Twenty-one ceiling ribs are now two instanced draws, split only by cold/warm material.
- This reduces the transition-and-rib shell group from **53 draws to 5 draws** before counting the new focal treatment.
- The route tube reduces tubular and radial segments on low and ultra-low presets.
- Ultra-low removes the three focal backdrops and both low presets remove secondary transition connector detail; the station sequence and primary artifacts remain intact.

### Lights and animation

- Medium/low retain the approved three-light maximum: hemisphere fill, one cold key, one warm key.
- Ultra-low uses one hemisphere light and relies on the established cold/warm material contrast.
- Only one active beacon subscribes to `useFrame`; animations are disabled when the project graphics setting disables them.
- Full-screen blur effects are removed on reduced presets while all content and controls remain available.

## Verification results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass |
| Scoped Room Four ESLint | Pass, 0 errors and 0 warnings |
| `npm run build` | Pass on Next.js 16.2.9 |
| `git diff --check` | Pass; only existing LF/CRLF worktree notices |
| Old Room Four content scan | Pass; no old economy zones, Ronaldo, minigame, or 1986–1995 content in final Room Four modules |
| Browser 1024 × 640 | Pass; dialog fits, scrolls, and no longer intersects 3D labels |
| Browser 1280 × 720 | Pass; scene, card HUD, modal, and active station remain readable |
| Browser 1600 × 900 | Pass; focal hierarchy and long sightline remain composed |
| Medium graphics | Pass |
| Ultra-low graphics | Pass; journey and controls remain intact with reduced detail |
| Persistence after reload | Pass; completed Card restored for the same nickname |
| Runtime errors | 0 new errors |

The full-repository `npm run lint` still reports pre-existing errors outside the Phase 5 Room Four scope, including `.agents/skills` CommonJS scripts and older admin/context modules. The four Room Four files used for this delivery are lint-clean, TypeScript passes, and the production build succeeds.

The browser console contains one existing dependency warning: `THREE.Clock` is deprecated in favour of `THREE.Timer`. It originates from the bundled Three/R3F dependency path and does not affect this room's runtime.

## Acceptance matrix

| Acceptance criterion | Status |
| --- | --- |
| Journey file remains the authoritative source | Pass |
| Two sections and eight stations remain in approved order | Pass |
| Transition remains a transition, not a third section | Pass |
| Room boundary, entrances, exits, and circulation remain unchanged | Pass |
| Interior reads as a contemporary historical exhibition | Pass |
| Cold Soviet / warm Guangzhou contrast remains explicit | Pass |
| Every station keeps one object, one action, and one conclusion | Pass |
| Wayfinding and active focal point are clear | Pass |
| Historical detail remains in the interaction layer | Pass |
| No old Room Four story conflicts remain | Pass |
| Graphics presets preserve the full journey | Pass |
| Build completes without a new error | Pass |

## Demo protocol

1. Run `npm run dev`.
2. Open `http://localhost:3000/gallery/gallery-market-economy`.
3. Enter a new nickname and room password `sjkc21jdx2k23`.
4. Select the Journey Card desk on the right side of the entrance and perform **Nhận Thẻ / Collect Card**.
5. Follow the illuminated floor spine through S1–S3, the cold-to-warm transition, and S4–S8.
6. At every station, verify that future stations remain muted, the current stop has the active beacon, and each action updates the object and Journey Card.
7. At S8, activate all four routes and confirm the Room 5 exit message.
8. Re-enter with the same nickname to verify persistence; use a new nickname to start from an empty card.
9. Repeat once with **Trung Bình** and once with **Siêu Thấp** graphics to verify that visual detail changes but the journey does not.

