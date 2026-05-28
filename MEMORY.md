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

## Where We Left Off

**Task: Redesign `drawBackground()` to look like an 80's FNAF performance stage.**

The user wants:
- Red/white checkered wall pattern (like a pizzeria)
- Red curtains on left and right sides
- Yellow star lights across the top
- Wooden stage floor at the bottom
- Cage-door openings instead of vent grates
- Chuck E. Cheese / FNAF vibe

The old `drawBackground()` had bricks, a dark floor, and vent frames. The user started editing but the function still has the old code. **Next step is to rewrite the entire function** with the 5-layer plan below.

### Plan: New `drawBackground()` — 5 Layers

```js
function drawBackground () {
  // Layer 1 — Checkered wall (red/white tiles, y=0 to y=380)
  const tileSize = 40
  for (let y = 0; y < 380; y += tileSize) {
    for (let x = 0; x < canvas.width; x += tileSize) {
      const isRed = ((x / tileSize) + (y / tileSize)) % 2 === 0
      ctx.fillStyle = isRed ? '#cc2222' : '#e8e8e8'
      ctx.fillRect(x, y, tileSize, tileSize)
    }
  }

  // Layer 2 — Curtains (left + right)
  // Left
  ctx.fillStyle = '#8b0000'
  ctx.fillRect(0, 0, 35, 400)
  ctx.strokeStyle = '#5a0000'
  ctx.lineWidth = 3
  for (let x = 5; x < 35; x += 10) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 400)
    ctx.stroke()
  }
  // Right
  ctx.fillStyle = '#8b0000'
  ctx.fillRect(canvas.width - 35, 0, 35, 400)
  ctx.strokeStyle = '#5a0000'
  ctx.lineWidth = 3
  for (let x = canvas.width - 30; x < canvas.width - 5; x += 10) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 400)
    ctx.stroke()
  }

  // Layer 3 — Star lights (top)
  ctx.fillStyle = '#ffdd44'
  for (let x = 50; x < canvas.width - 50; x += 70) {
    const cx = x, cy = 25, outerR = 12, innerR = 5
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i * Math.PI) / 5 - Math.PI / 2
      const px = cx + r * Math.cos(angle)
      const py = cy + r * Math.sin(angle)
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  }

  // Layer 4 — Wooden stage floor (y=380 to 500)
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(0, 380, canvas.width, 120)
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(0, 380, canvas.width, 8)
  ctx.strokeStyle = '#3d2510'
  ctx.lineWidth = 2
  for (let y = 400; y < 500; y += 25) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  for (let x = 0; x < canvas.width; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 388)
    ctx.lineTo(x, 500)
    ctx.stroke()
  }

  // Layer 5 — Cage-door openings (holes)
  for (const h of state.holes) {
    // Dark opening
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2)
    ctx.fill()
    // Metallic rim
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2)
    ctx.stroke()
    // Cross bars (cage door)
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(h.x - h.radius, h.y)
    ctx.lineTo(h.x + h.radius, h.y)
    ctx.moveTo(h.x, h.y - h.radius)
    ctx.lineTo(h.x, h.y + h.radius)
    ctx.stroke()
  }
}
```

After this, delete the old `drawHoles()` function since the holes are now drawn inside `drawBackground()`.

### After Background: Next Steps
1. Animatronic spawning logic (pop up from holes at random intervals)
2. Draw animatronic characters (colored circles/shapes at hole positions)
3. Click detection (detect clicks on animatronics)
4. Miss penalty (life lost if animatronic goes back down)
5. Difficulty scaling (faster spawning over time)

### Known Issues
- The user's current `drawBackground()` has missing `#` in hex colors (e.g. `'1a0a0a'` instead of `'#1a0a0a'`) — needs fixing when rewriting
