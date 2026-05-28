# Session Memory — FNAF Arcade Game

## Project
`Mini-Browser-Game-Score-API` — FNAF Whack-a-Mole arcade game with score API.

## Setup
- **Package manager:** pnpm only (no npm)
- **Run:** `pnpm start`
- **Open:** `http://localhost:3000`

## What's Built (complete)

### Server (`server/index.js`)
- Express 5 + better-sqlite3 (SQLite)
- DB table: `scores` (id, player_name, score, created_at)
- `POST /api/scores` — submit score
- `GET /api/scores/leaderboard?limit=10` — top scores
- `GET /api/scores/:playerName` — player history
- Serves static `client/` folder

### Client (`client/`)
- **index.html** — login screen → game canvas → game-over screen
- **style.css** — dark FNAF theme with red accents
- **game.js** — API functions, game loop, HUD, click handler, all UI wired up
- Player name input, history display, play again / menu buttons

## Background — Complete ✅
`drawBackground()` has all 5 layers working:
1. **Checkered wall** — red/white tiles, y=0 to y=380
2. **Red curtains** — left and right sides with fold lines
3. **Yellow star lights** — across the top (fixed missing `#`)
4. **Wooden stage floor** — brown fill, edge strip, horizontal + vertical plank lines (fixed empty loop body)
5. **Cage-door openings** — dark holes with metallic rims and cross bars

### Bugs fixed this session
- `'ffdd44'` → `'#ffdd44'` (missing `#`)
- `canvas.wdith` → `canvas.width` (typo)
- Floor plank `for` loop body was empty — added `moveTo`/`lineTo`/`stroke`
- `ctx.arch()` → `ctx.arc()` (wrong method name)
- Crossbar `lineTo(h.x, + h.radius, h.y)` → `lineTo(h.x + h.radius, h.y)` (extra comma)

### Still pending cleanup
- `drawHoles()` (line 180) is redundant — cage doors are in `drawBackground()` now
- `render()` still calls `drawHoles()` — should be removed

## Where We Left Off

**Current task: Implement animatronic spawning logic in `update()`.**

We were planning the approach:

### Spawning plan
1. Add `spawnTimer: 0` to the `state` object
2. In `update(dt)`:
   - Decrement `spawnTimer` by `dt`
   - When it hits 0: find a free hole, create animatronic object, push to `state.animatronics`, reset timer
3. Animatronic shape: `{ holeIndex, popUpTime, duration, hit }`
   - `popUpTime` = `state.timeLeft` at spawn (use to check expiry)
   - `duration` = random between 0.8–1.5s
   - `hit` = false initially
4. Despawn: loop animatronics, remove any where `popUpTime - state.timeLeft > duration`

### Next after spawning
1. Draw animatronics on screen
2. Click detection (hit = score, miss/expire = life loss)
3. Difficulty scaling
