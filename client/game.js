// ── API ──────────────────────────────────────────────────────
const API = '/api/scores'

async function submitScore (name, score) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: name, score })
  })
  return res.json()
}

async function getLeaderboard (limit = 10) {
  const res = await fetch(`${API}/leaderboard?limit=${limit}`)
  return res.json()
}

async function getPlayerHistory (name) {
  const res = await fetch(`${API}/${encodeURIComponent(name)}`)
  return res.json()
}

// ── DOM refs ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const scoreDisplay = document.getElementById('scoreDisplay')
const timerDisplay = document.getElementById('timerDisplay')
const livesDisplay = document.getElementById('livesDisplay')
const finalScore = document.getElementById('finalScore')
const gameOverDiv = document.getElementById('gameOver')
const loginDiv = document.getElementById('login')
const gameDiv = document.getElementById('game')
const nameInput = document.getElementById('nameInput')
const startBtn = document.getElementById('startBtn')
const playAgainBtn = document.getElementById('playAgainBtn')
const menuBtn = document.getElementById('menuBtn')
const historyBox = document.getElementById('historyBox')

// ── Canvas sizing ─────────────────────────────────────────
function resizeCanvas () {
  canvas.width = 600
  canvas.height = 500
}
resizeCanvas()

// ── Game state ────────────────────────────────────────────
const state = {
  score: 0,
  lives: 3,
  timeLeft: 30,
  running: false,
  playerName: '',
  animatronics: [],    // YOU: populate with active animatronic objects
  holes: [], 
            // positions of vents/doors
  // ... add more as needed
}

// ── Holes / Vents positions ───────────────────────────────
// YOU: design your layout — each hole = { x, y, radius, isOpen }
// Example:
state.holes = [
  { x: 150, y: 150, radius: 40 },
  { x: 300, y: 120, radius: 40 },
  { x: 450, y: 150, radius: 40 },
  { x: 100, y: 320, radius: 40 },
  { x: 300, y: 340, radius: 40 },
  { x: 500, y: 320, radius: 40 },
]

// ── Draw helpers ──────────────────────────────────────────
function drawBackground () {
  const tileSize = 40
  for (let y = 0; y < 380; y += tileSize) {
    for (let x = 0; x < canvas.width; x += tileSize) {
      const isRed = ((x / tileSize) + (y / tileSize)) % 2 == 0 //this formula is what causes x and y to alternate colors like a chessboard 
      ctx.fillStyle = isRed ? '#cc2222' : '#e8e8e8'
      ctx.fillRect(x, y, tileSize, tileSize)
    }
  }
  //left curtain layer 2
  ctx.fillStyle = '#8B0000'
  ctx.fillRect(0,0, 35, 400)
  //curtain folds (vertical lines)
  ctx.strokeStyle = '#5a0000'
  ctx.lineWidth = 3
  for (let x = 5; x < 35; x += 10){
    ctx.beginPath()
    ctx.moveTo (x, 0)
    ctx.lineTo(x,400)
    ctx.stroke ()
  }

//Right curtain (same thing but on the right side)
ctx.fillStyle = '#8b0000'
ctx.fillRect(canvas.width - 35, 0, 35, 400)
ctx.strokeStyle = '#5a0000'
ctx.lineWidth = 3
for (let x = canvas.width - 30; x < canvas.width - 5; x += 10){
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, 400)
  ctx.stroke()
}

//Layer 3 star lights at the top of the wall

ctx.fillStyle = '#ffdd44'
for (let x = 50; x < canvas.width - 50; x +=70){
  //draw a star
  const cx = x, cy = 25, outerR = 12, innerR = 5
  ctx.beginPath()
  for (let i = 0; i <10; i++){
    const r = i % 2 == 0 ? outerR : innerR
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const px = cx + r * Math.cos(angle)
    const py = cy + r * Math.sin(angle)
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px,py)
  }
  ctx.closePath()
  ctx.fill()
}

//layer 4 wooden stage floor

ctx.fillStyle = '#5c3a1e' 
ctx.fillRect(0, 380, canvas.width, 120)

//stage edge
ctx.fillStyle = '#8B4513'
ctx.fillRect(0, 380, canvas.width, 8)

//floor plank lines 

ctx.strokeStyle = '#3d2510'
ctx.lineWidth = 2
for (let y = 400; y < 500; y += 25){
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(canvas.width, y)
  ctx.stroke()
}
for (let x = 0; x < canvas.width; x += 80){
  ctx.beginPath()
  ctx.moveTo(x, 388)
  ctx.lineTo(x, 500)
  ctx.stroke()
}

//layer 5 cage door openings 

for (const h of state.holes){
  //dark opening
  ctx.fillStyle = '#000'
  ctx.beginPath ()
  ctx.arc(h.x, h.y, h.radius, 0, Math.PI *2)
  ctx.fill ()
  //metallic rim
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 4
  ctx.beginPath ()
  ctx.arc(h.x, h.y, h.radius, 0, Math.PI *2)
  ctx.stroke()
  //cross bars cage door
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 3
  ctx.beginPath ()
  ctx.moveTo(h.x -h.radius, h.y)
  ctx.lineTo(h.x + h.radius, h.y)
  ctx.moveTo(h.x, h.y - h.radius)
  ctx.lineTo(h.x, h.y + h.radius)
  ctx.stroke()
}


  
}



function drawHoles () {
  for (const h of state.holes) {
    ctx.beginPath()
    ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()
  }
}

// ── Game update ───────────────────────────────────────────
function update (dt) {
  state.spawnTimer -= dt //spawn timer

  if (state.spawnTimer <= 0) {
    const holeIndex = Math.floor(Math.random() * state.holes.length)
    const animatronic = {
      holeIndex,
      popUpTime: state.timeLeft,
      duariton: 0.8 + Math.random() * 0.7,
      hit: false
    }
    state.animatronics.push(animatronic)
    state.spawnTimer = 1 + Math.random() * 2
  }
  // Despawn expired
  const before = state.animatronics.length
  state.animatronics = state.animatronics.filter(a =>
    a.hit || (a.popUpTime - state.timeLeft) < a.duariton
  )
  if (state.animatronics.length < before) state.lives -= 1
}

// ── Game render ───────────────────────────────────────────
function render () {
  drawBackground()
  drawHoles()
  // draw each active animatronic
  for (const a of state.animatronics) {
    if (a.hit) continue // skip hit ones
    const hole = state.holes[a.holeIndex] // draw something at (hole.x, hole.y)

    // body (rounded head peeking up)
    ctx.fillStyle = '#8B4513'
    ctx.beginPath()
    ctx.arc(hole.x - 10, hole.y - 10, 30, 0, Math.PI * 2)
    ctx.fill()

    // eyes glowing white
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(hole.x - 10, hole.y - 15, 5, 0, Math.PI * 2)
    ctx.arc(hole.x + 10, hole.y - 15, 5, 0, Math.PI * 2)
    ctx.fill()

    // pupils red dots
    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.arc(hole.x - 10, hole.y - 15, 2, 0, Math.PI * 2)
    ctx.arc(hole.x + 10, hole.y - 15, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}
  

// ── Click handler ─────────────────────────────────────────
canvas.addEventListener('click', (e) => {
  if (!state.running) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  
  for(let i = state.animatronics.length - 1; i >= 0; i--){
    const a = state.animatronics[i]
    if (a.hit) continue
    const hole = state.holes[a.holeIndex]
    const dx = mx - hole.x
    const dy = my - (hole.y - 10) //same offset as where it is drawn
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 30){
      a.hit = true
      state.score += 10
      break //only hit one per click 

    }

  }
})

// ── HUD update ────────────────────────────────────────────
function updateHUD () {
  scoreDisplay.textContent = state.score
  timerDisplay.textContent = Math.ceil(state.timeLeft)
  livesDisplay.textContent = state.lives
}

// ── Game loop ─────────────────────────────────────────────
let lastTime = 0
function loop (timestamp) {
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp
  if (state.running) {
    state.timeLeft -= dt
    if (state.timeLeft <= 0 || state.lives <= 0) {
      endGame()
      return
    }
    update(dt)
    render()
    updateHUD()
  }
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

// ── Start / End game ──────────────────────────────────────
function startGame () {
  state.score = 0
  state.lives = 3
  state.timeLeft = 30
  state.running = true
  state.animatronics = []
  gameOverDiv.style.display = 'none'
  updateHUD()
}

function endGame () {
  state.running = false
  finalScore.textContent = state.score
  gameOverDiv.style.display = 'flex'
  submitScore(state.playerName, state.score)
  showHistory(state.playerName)
}

// ── History display ───────────────────────────────────────
async function showHistory (name) {
  const scores = await getPlayerHistory(name)
  if (scores.length === 0) {
    historyBox.textContent = 'No previous games.'
    return
  }
  const best = Math.max(...scores.map(s => s.score))
  const last = scores[0].score
  historyBox.innerHTML = `Best: ${best} &nbsp;|&nbsp; Last: ${last} &nbsp;|&nbsp; Games: ${scores.length}`
}

// ── UI events ─────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim()
  if (!name) return
  state.playerName = name
  loginDiv.style.display = 'none'
  gameDiv.style.display = 'block'
  showHistory(name)
  startGame()
})

playAgainBtn.addEventListener('click', startGame)

menuBtn.addEventListener('click', () => {
  gameDiv.style.display = 'none'
  gameOverDiv.style.display = 'none'
  loginDiv.style.display = 'block'
})
