"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { saveMatch } from "../../actions";

/* ─────────────────────── constants ─────────────────────── */

const GRAVITY = 0.35;
const PLAYER_W = 40;
const PLAYER_H = 70;
const SHUTTLE_R = 6;
const NET_W = 6;
const GROUND_H = 80;
const JUMP_VEL = -10;
const MOVE_SPEED = 5;
const HIT_POWER_X = 8;
const HIT_POWER_Y = -10;
const AI_SPEED = 3.8;
const WIN_SCORE = 11;
const HIT_RANGE = 120;
const SERVE_DELAY = 60; // frames before auto-serve

/* ─────────────────────── types ─────────────────────── */

interface Vec2 {
  x: number;
  y: number;
}

interface Player {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  facingRight: boolean;
  isHitting: boolean;
  hitCooldown: number;
  color: string;
  racketColor: string;
}

interface Shuttle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  lastHitBy: "player" | "ai" | null;
  trail: Vec2[];
}

interface GameState {
  player: Player;
  ai: Player;
  shuttle: Shuttle;
  playerScore: number;
  aiScore: number;
  serving: "player" | "ai";
  serveTimer: number;
  gameOver: boolean;
  winner: string;
  canvasW: number;
  canvasH: number;
}

/* ─────────────────────── helpers ─────────────────────── */

function groundY(h: number) {
  return h - GROUND_H;
}

function netX(w: number) {
  return w / 2;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ─────────────────────── initial state ─────────────────────── */

function createInitialState(w: number, h: number): GameState {
  const gy = groundY(h);
  return {
    player: {
      x: w * 0.25,
      y: gy - PLAYER_H,
      vy: 0,
      onGround: true,
      facingRight: true,
      isHitting: false,
      hitCooldown: 0,
      color: "#6ee7b7",
      racketColor: "#34d399",
    },
    ai: {
      x: w * 0.75,
      y: gy - PLAYER_H,
      vy: 0,
      onGround: true,
      facingRight: false,
      isHitting: false,
      hitCooldown: 0,
      color: "#f9a8d4",
      racketColor: "#f472b6",
    },
    shuttle: {
      x: w * 0.25,
      y: gy - PLAYER_H - 40,
      vx: 0,
      vy: 0,
      active: false,
      lastHitBy: null,
      trail: [],
    },
    playerScore: 0,
    aiScore: 0,
    serving: "player",
    serveTimer: SERVE_DELAY,
    gameOver: false,
    winner: "",
    canvasW: w,
    canvasH: h,
  };
}

/* ─────────────────────── component ─────────────────────── */
/* ──────── UPDATE ──────── */
function update(s: GameState, keys: Set<string>) {
  const { player: p, ai, shuttle: sh } = s;
  const gy = groundY(s.canvasH);
  const nx = netX(s.canvasW);

  /* ── serve ── */
  if (!sh.active && !s.gameOver) {
    // position shuttle above server
    const server = s.serving === "player" ? p : ai;
    sh.x = server.x + (s.serving === "player" ? 20 : -20);
    sh.y = server.y - 20;

    if (s.serving === "player") {
      // player serves by pressing spacebar
      if (keys.has(" ")) {
        sh.active = true;
        sh.vx = 6;
        sh.vy = -7;
        sh.lastHitBy = "player";
        p.isHitting = true;
        p.hitCooldown = 20;
      }
    } else {
      // AI auto-serves after a short delay
      s.serveTimer--;
      if (s.serveTimer <= 0) {
        sh.active = true;
        sh.vx = -6;
        sh.vy = -7;
        sh.lastHitBy = "ai";
      }
    }
  }

  /* ── player movement ── */
  if (keys.has("arrowleft")) p.x -= MOVE_SPEED;
  if (keys.has("arrowright")) p.x += MOVE_SPEED;
  if (keys.has("arrowup") && p.onGround && sh.active) {
    p.vy = JUMP_VEL;
    p.onGround = false;
  }

  // constrain to left half
  p.x = clamp(p.x, PLAYER_W / 2, nx - NET_W / 2 - PLAYER_W / 2);

  // gravity
  p.vy += GRAVITY;
  p.y += p.vy;
  if (p.y >= gy - PLAYER_H) {
    p.y = gy - PLAYER_H;
    p.vy = 0;
    p.onGround = true;
  }

  // hit (only when shuttle is already active — serve is handled above)
  if (p.hitCooldown > 0) p.hitCooldown--;
  if (sh.active && keys.has(" ") && p.hitCooldown === 0) {
    p.isHitting = true;
    p.hitCooldown = 20;
    // check shuttle in range
    if (dist({ x: p.x, y: p.y }, { x: sh.x, y: sh.y }) < HIT_RANGE) {
      sh.vx = HIT_POWER_X + Math.random() * 2;
      sh.vy = HIT_POWER_Y - Math.random() * 2;
      sh.lastHitBy = "player";
    }
  } else if (sh.active) {
    p.isHitting = false;
  }

  /* ── AI ── */
  if (sh.active) {
    // simple tracking
    const targetX = sh.x > nx ? sh.x : ai.x; // only chase if on its side
    if (sh.x > nx) {
      if (ai.x < targetX - 20) ai.x += AI_SPEED;
      else if (ai.x > targetX + 20) ai.x -= AI_SPEED;
    } else {
      // return to centre of its half
      const centre = (nx + s.canvasW) / 2;
      if (ai.x < centre - 10) ai.x += AI_SPEED * 0.5;
      else if (ai.x > centre + 10) ai.x -= AI_SPEED * 0.5;
    }

    // jump decision
    if (sh.x > nx && sh.y < gy - PLAYER_H - 30 && ai.onGround) {
      ai.vy = JUMP_VEL;
      ai.onGround = false;
    }

    // hit decision
    ai.hitCooldown = Math.max(0, ai.hitCooldown - 1);
    if (
      ai.hitCooldown === 0 &&
      dist({ x: ai.x, y: ai.y }, { x: sh.x, y: sh.y }) < HIT_RANGE
    ) {
      ai.isHitting = true;
      ai.hitCooldown = 25;
      sh.vx = -(HIT_POWER_X + Math.random() * 2);
      sh.vy = HIT_POWER_Y - Math.random() * 3;
      sh.lastHitBy = "ai";
    } else {
      ai.isHitting = false;
    }
  }

  // AI constrained to right half
  ai.x = clamp(ai.x, nx + NET_W / 2 + PLAYER_W / 2, s.canvasW - PLAYER_W / 2);
  ai.vy += GRAVITY;
  ai.y += ai.vy;
  if (ai.y >= gy - PLAYER_H) {
    ai.y = gy - PLAYER_H;
    ai.vy = 0;
    ai.onGround = true;
  }

  /* ── shuttle physics ── */
  if (sh.active) {
    sh.vy += GRAVITY * 0.55; // lighter than a person
    sh.vx *= 0.998; // tiny air drag
    sh.x += sh.vx;
    sh.y += sh.vy;

    // trail
    sh.trail.push({ x: sh.x, y: sh.y });
    if (sh.trail.length > 12) sh.trail.shift();

    /* net collision */
    const netTop = gy - 120;
    if (
      sh.y > netTop &&
      sh.y < gy &&
      Math.abs(sh.x - nx) < NET_W / 2 + SHUTTLE_R
    ) {
      sh.vx *= -0.4;
      sh.x += sh.vx > 0 ? NET_W : -NET_W;
    }

    /* ground → point scored */
    if (sh.y >= gy - SHUTTLE_R) {
      const leftBound = 100;
      const rightBound = s.canvasW - 100;
      let pointFor = "";

      if (sh.x < leftBound || sh.x > rightBound) {
        // Out of bounds! Point goes to the person who didn't hit it last.
        pointFor = sh.lastHitBy === "player" ? "ai" : "player";
      } else {
        // In bounds. Point goes to the side opposite to where it landed.
        pointFor = sh.x < nx ? "ai" : "player";
      }

      if (pointFor === "ai") {
        s.aiScore++;
        s.serving = "player";
      } else {
        s.playerScore++;
        s.serving = "ai";
      }
      resetShuttle(s);

      if (s.playerScore >= WIN_SCORE || s.aiScore >= WIN_SCORE) {
        s.gameOver = true;
        s.winner = s.playerScore >= WIN_SCORE ? "You Win! 🏆" : "AI Wins! 🤖";
      }
    }

    /* out of bounds horizontally */
    if (sh.x < 0 || sh.x > s.canvasW) {
      // Definitely out
      const pointFor = sh.lastHitBy === "player" ? "ai" : "player";

      if (pointFor === "ai") {
        s.aiScore++;
        s.serving = "player";
      } else {
        s.playerScore++;
        s.serving = "ai";
      }
      resetShuttle(s);

      if (s.playerScore >= WIN_SCORE || s.aiScore >= WIN_SCORE) {
        s.gameOver = true;
        s.winner = s.playerScore >= WIN_SCORE ? "You Win! 🏆" : "AI Wins! 🤖";
      }
    }
  }
}

function resetShuttle(s: GameState) {
  s.shuttle.active = false;
  s.shuttle.vx = 0;
  s.shuttle.vy = 0;
  s.shuttle.trail = [];
  s.shuttle.lastHitBy = null;
  s.serveTimer = SERVE_DELAY;
}

/* ──────── DRAW ──────── */
function draw(ctx: CanvasRenderingContext2D, s: GameState) {
  const { canvasW: W, canvasH: H, player: p, ai, shuttle: sh } = s;
  const gy = groundY(H);
  const nx = netX(W);

  /* background gradient */
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(0.6, "#1e293b");
  bg.addColorStop(1, "#334155");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* court */
  ctx.fillStyle = "#475569";
  ctx.fillRect(0, gy, W, GROUND_H);
  // court lines
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(nx, gy);
  ctx.lineTo(nx, gy + GROUND_H);
  ctx.stroke();
  ctx.setLineDash([]);

  // court surface pattern
  ctx.fillStyle = "#3b5e3a";
  ctx.fillRect(0, gy, W, GROUND_H);
  // lighter stripe
  ctx.fillStyle = "#44693f";
  for (let i = 0; i < W; i += 80) {
    ctx.fillRect(i, gy, 40, GROUND_H);
  }
  // boundary lines
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(100, gy, 4, GROUND_H); // left bound
  ctx.fillRect(W - 104, gy, 4, GROUND_H); // right bound

  /* net */
  const netTop = gy - 120;
  const netGrad = ctx.createLinearGradient(nx, netTop, nx, gy);
  netGrad.addColorStop(0, "#e2e8f0");
  netGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = netGrad;
  ctx.fillRect(nx - NET_W / 2, netTop, NET_W, gy - netTop);
  // net mesh lines
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  for (let y = netTop; y < gy; y += 12) {
    ctx.beginPath();
    ctx.moveTo(nx - NET_W / 2, y);
    ctx.lineTo(nx + NET_W / 2, y);
    ctx.stroke();
  }
  // post top
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(nx - NET_W, netTop - 6, NET_W * 2, 6);

  /* shuttle trail */
  if (sh.active && sh.trail.length > 1) {
    for (let i = 1; i < sh.trail.length; i++) {
      const alpha = i / sh.trail.length;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.moveTo(sh.trail[i - 1].x, sh.trail[i - 1].y);
      ctx.lineTo(sh.trail[i].x, sh.trail[i].y);
      ctx.stroke();
    }
  }

  /* shuttlecock */
  drawShuttle(ctx, sh);

  /* players */
  drawPlayer(ctx, p, gy, true);
  drawPlayer(ctx, ai, gy, false);

  /* HUD */
  drawHUD(ctx, s, W);
}

function drawShuttle(ctx: CanvasRenderingContext2D, sh: Shuttle) {
  ctx.save();
  ctx.translate(sh.x, sh.y);
  const angle = Math.atan2(sh.vy, sh.vx);
  ctx.rotate(angle);

  const corkR = SHUTTLE_R;
  const featherCount = 16;
  const featherLen = 22;
  const skirtSpread = 12; // half-width of the feather fan at the tip

  /* ── feathers (individual quills fanning behind the cork) ── */
  for (let i = 0; i < featherCount; i++) {
    const t = (i / (featherCount - 1)) * 2 - 1; // -1 … +1
    const tipX = -featherLen;
    const tipY = t * skirtSpread;
    const baseY = t * (corkR * 0.6);

    // feather fill
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(-corkR * 0.3, baseY - 0.8);
    ctx.quadraticCurveTo(tipX * 0.5, tipY * 0.6, tipX, tipY);
    ctx.lineTo(tipX, tipY);
    ctx.quadraticCurveTo(tipX * 0.5, tipY * 0.6, -corkR * 0.3, baseY + 0.8);
    ctx.closePath();
    ctx.fill();

    // feather spine
    ctx.strokeStyle = "rgba(180, 180, 190, 0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-corkR * 0.3, baseY);
    ctx.quadraticCurveTo(tipX * 0.5, tipY * 0.6, tipX, tipY);
    ctx.stroke();
  }

  /* ── skirt rim (the ring where feathers meet the cork) ── */
  ctx.strokeStyle = "#c0c0c0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-corkR * 0.3, 0, 2, corkR * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* ── skirt tip ring ── */
  ctx.strokeStyle = "rgba(200, 200, 210, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-featherLen, 0, 2, skirtSpread, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* ── cork base ── */
  // main cork
  const corkGrad = ctx.createRadialGradient(1, -1, 0, 0, 0, corkR);
  corkGrad.addColorStop(0, "#ffffff");
  corkGrad.addColorStop(0.4, "#e2e8f0");
  corkGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = corkGrad;
  ctx.beginPath();
  ctx.arc(0, 0, corkR, 0, Math.PI * 2);
  ctx.fill();

  // cork rim
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, corkR, 0, Math.PI * 2);
  ctx.stroke();

  // cork highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.arc(1.5, -2, corkR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  /* ── motion glow ── */
  const speed = Math.hypot(sh.vx, sh.vy);
  if (speed > 3) {
    ctx.globalAlpha = Math.min(0.35, speed * 0.025);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, corkR + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  gy: number,
  isPlayer: boolean,
) {
  const x = p.x;
  const y = p.y;

  // shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, gy, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // body
  ctx.fillStyle = p.color;
  const bodyX = x - PLAYER_W / 2;
  const bodyY = y + 20;
  const bodyW = PLAYER_W;
  const bodyH = PLAYER_H - 20;
  roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 8);

  // head
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(x, y + 14, 14, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  ctx.fillStyle = "#1e293b";
  const eyeOffX = isPlayer ? 4 : -4;
  ctx.beginPath();
  ctx.arc(x + eyeOffX - 3, y + 12, 2, 0, Math.PI * 2);
  ctx.arc(x + eyeOffX + 5, y + 12, 2, 0, Math.PI * 2);
  ctx.fill();

  // racket (longer handle + bigger head)
  const racketDir = isPlayer ? 1 : -1;
  const racketX = x + racketDir * 36;
  const racketY = p.isHitting ? y + 4 : y + 26;
  ctx.strokeStyle = p.racketColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x + racketDir * 16, y + 30);
  ctx.lineTo(racketX, racketY);
  ctx.stroke();
  // racket head
  ctx.fillStyle = p.racketColor;
  ctx.beginPath();
  ctx.ellipse(
    racketX + racketDir * 10,
    racketY - 5,
    13,
    18,
    racketDir * 0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // racket strings
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 0.5;
  for (let i = -10; i <= 10; i += 4) {
    ctx.beginPath();
    ctx.moveTo(racketX + racketDir * 10, racketY - 5 + i);
    ctx.lineTo(racketX + racketDir * 10 + racketDir * 11, racketY - 5 + i);
    ctx.stroke();
  }

  // label
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isPlayer ? "YOU" : "AI", x, y - 4);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawHUD(ctx: CanvasRenderingContext2D, s: GameState, W: number) {
  /* score panel */
  const panelW = 260;
  const panelH = 50;
  const panelX = (W - panelW) / 2;
  const panelY = 16;

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "bold 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // player score
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText(String(s.playerScore), panelX + 70, panelY + panelH / 2);

  // divider
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("—", panelX + panelW / 2, panelY + panelH / 2);

  // ai score
  ctx.fillStyle = "#f9a8d4";
  ctx.fillText(String(s.aiScore), panelX + panelW - 70, panelY + panelH / 2);

  ctx.restore();

  /* controls hint */
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Arrows: Move  ·  Up: Jump  ·  Space: Hit",
    W / 2,
    panelY + panelH + 20,
  );
  ctx.restore();

  /* serve prompt */
  if (!s.shuttle.active && s.serving === "player" && !s.gameOver) {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.fillStyle = `rgba(250, 204, 21, ${0.5 + pulse * 0.5})`;
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE to serve", W / 2, panelY + panelH + 48);
    ctx.restore();
  }
}

export default function GamePage() {
  const params = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const [started, setStarted] = useState(false);
  const [overlay, setOverlay] = useState<{
    show: boolean;
    winner: string;
    pScore: number;
    aScore: number;
  }>({ show: false, winner: "", pScore: 0, aScore: 0 });

  /* ── resize ── */
  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    if (stateRef.current) {
      stateRef.current.canvasW = c.width;
      stateRef.current.canvasH = c.height;
    }
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);
      if (key === "escape") {
        setStarted(false);
      }
      // prevent scrolling
      if (["arrowup", "arrowleft", "arrowright", " "].includes(key))
        e.preventDefault();
    };
    const up = (e: KeyboardEvent) =>
      keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  /* ── start / restart ── */
  const startGame = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stateRef.current = createInitialState(c.width, c.height);
    setStarted(true);
    setOverlay({ show: false, winner: "", pScore: 0, aScore: 0 });
  }, []);

  /* ── game loop ── */
  useEffect(() => {
    if (!started) return;

    const loop = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      const s = stateRef.current;
      if (!c || !ctx || !s) return;

      update(s, keysRef.current);
      draw(ctx, s);

      if (s.gameOver) {
        setOverlay({
          show: true,
          winner: s.winner,
          pScore: s.playerScore,
          aScore: s.aiScore,
        });

        const mId = typeof params.id === "string" ? params.id : "unknown";
        saveMatch({
          id: mId,
          playerScore: s.playerScore,
          aiScore: s.aiScore,
          winner: s.winner.includes("You") ? "Player" : "AI",
          timestamp: new Date().toISOString(),
        }).catch(console.error);

        return; // stop loop
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, params.id]);

  /* ──────── JSX ──────── */
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f172a] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* start / game-over overlay */}
      {(!started || overlay.show) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-slate-900/80 px-12 py-10 shadow-2xl border border-slate-700/50 max-w-sm w-full">
            <h1 className="text-3xl font-bold tracking-tight text-white text-center">
              {overlay.show ? overlay.winner : "All England Smash 🏸"}
            </h1>

            {overlay.show && (
              <div className="flex items-center gap-6 text-xl font-semibold">
                <span className="text-emerald-300">{overlay.pScore}</span>
                <span className="text-slate-500">—</span>
                <span className="text-pink-300">{overlay.aScore}</span>
              </div>
            )}

            {!started && !overlay.show && (
              <>
                <p className="text-sm text-slate-400 text-center leading-relaxed">
                  Arrows to move · Up to jump · Space to hit · ESC to stop
                  <br />
                  First to {WIN_SCORE} wins!
                </p>
                <button
                  id="start-game-btn"
                  onClick={startGame}
                  className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Start Match
                </button>
              </>
            )}

            <Link
              href="/game"
              className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-base hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {overlay.show || started === false
                ? "Return to Lobby"
                : "Exit to Lobby"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
