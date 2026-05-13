"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
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
/** Distance from net centre to the short service line on each side */
const SHORT_SERVICE_OFFSET = 130;

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
function update(
  s: GameState,
  keys: Set<string>,
  aiLerpFactor = 0.12,
  aiHitMult = 1.0,
  aiPosError = 20,
  aiJumpEagerness = 40,
  aiHitRange = 75,
  aiLookAhead = 8,
  aiMaxSpeedMult = 1.0,
) {
  const { player: p, ai, shuttle: sh } = s;
  const gy = groundY(s.canvasH);
  const nx = netX(s.canvasW);

  // Calculate a scale factor based on screen width (baseline 1200px)
  const scale = clamp(s.canvasW / 1200, 0.5, 1.25);

  // Responsive Physics Constants
  const resGravity = GRAVITY * scale;
  const resPlayerMove = MOVE_SPEED * scale;
  const resJumpVel = JUMP_VEL * scale;
  const resHitPowerX = HIT_POWER_X * scale;
  const resHitPowerY = HIT_POWER_Y * scale;
  const resAiServeSpeed = AI_SPEED * scale;
  const resAiSpeed = aiLerpFactor * scale;
  const resAiJumpEagerness = aiJumpEagerness * scale;
  const resAiHitRange = aiHitRange * scale;
  const resAiMaxSpeed = resPlayerMove * aiMaxSpeedMult;

  /* ── serve ── */
  if (!sh.active && !s.gameOver) {
    const server = s.serving === "player" ? p : ai;
    sh.x = server.x + (s.serving === "player" ? 20 * scale : -20 * scale);
    sh.y = server.y - 20 * scale;

    if (s.serving === "player") {
      const playerShortServiceX = nx - SHORT_SERVICE_OFFSET * scale;
      const behindLine = p.x <= playerShortServiceX;
      if (keys.has(" ") && behindLine) {
        sh.active = true;
        sh.vx = 6 * scale;
        sh.vy = -7 * scale;
        sh.lastHitBy = "player";
        p.isHitting = true;
        p.hitCooldown = 20;
      }
    } else {
      const aiShortServiceX = nx + SHORT_SERVICE_OFFSET * scale;
      if (ai.x < aiShortServiceX - 5 * scale) {
        ai.x += Math.min(resAiServeSpeed, aiShortServiceX - ai.x);
      }
      s.serveTimer--;
      if (s.serveTimer <= 0 && ai.x >= aiShortServiceX - 5 * scale) {
        sh.active = true;
        // Better serve for Hard/Super Hard
        if (aiLookAhead >= 12) {
          const flick = Math.random() > 0.4; // 60% flick
          if (flick) {
            sh.vx = -(10 + Math.random() * 3) * scale;
            sh.vy = -(8 + Math.random() * 3) * scale;
          } else {
            // short serve
            sh.vx = -4.5 * scale;
            sh.vy = -6.5 * scale;
          }
        } else {
          sh.vx = -6 * scale;
          sh.vy = -7 * scale;
        }
        sh.lastHitBy = "ai";
      }
    }
  }

  /* ── player movement ── */
  if (keys.has("arrowleft")) p.x -= resPlayerMove;
  if (keys.has("arrowright")) p.x += resPlayerMove;
  if (keys.has("arrowup") && p.onGround && sh.active) {
    p.vy = resJumpVel;
    p.onGround = false;
  }

  const playerRightLimit =
    !sh.active && s.serving === "player"
      ? nx - (SHORT_SERVICE_OFFSET + PLAYER_W / 2) * scale
      : nx - (NET_W / 2 + PLAYER_W / 2) * scale;
  p.x = clamp(p.x, (PLAYER_W / 2) * scale, playerRightLimit);

  // gravity
  p.vy += resGravity;
  p.y += p.vy;
  if (p.y >= gy - PLAYER_H) {
    p.y = gy - PLAYER_H;
    p.vy = 0;
    p.onGround = true;
  }

  // hit
  if (p.hitCooldown > 0) p.hitCooldown--;
  if (sh.active && keys.has(" ") && p.hitCooldown === 0) {
    p.isHitting = true;
    p.hitCooldown = 20;
    if (
      sh.lastHitBy !== "player" &&
      dist({ x: p.x, y: p.y }, { x: sh.x, y: sh.y }) < HIT_RANGE * scale
    ) {
      sh.vx = resHitPowerX + Math.random() * 2 * scale;
      sh.vy = resHitPowerY - Math.random() * 2 * scale;
      sh.lastHitBy = "player";
    }
  } else if (sh.active) {
    p.isHitting = false;
  }

  /* ── AI ── */
  if (sh.active) {
    let predX = sh.x;
    let predY = sh.y;
    let predVx = sh.vx;
    let predVy = sh.vy;
    for (let t = 0; t < aiLookAhead; t++) {
      predVy += resGravity * 0.55;
      predVx *= 0.998;
      predX += predVx;
      predY += predVy;
      if (predY >= gy - SHUTTLE_R) {
        predY = gy - SHUTTLE_R;
        break;
      }
    }

    const centre =
      (nx +
        (NET_W / 2 + PLAYER_W / 2) * scale +
        s.canvasW -
        (PLAYER_W / 2) * scale) /
      2;
    let targetX: number;
    if (sh.x > nx) {
      targetX = clamp(
        predX + (Math.random() - 0.5) * aiPosError * scale,
        nx + (NET_W / 2 + PLAYER_W / 2) * scale,
        s.canvasW - (PLAYER_W / 2) * scale,
      );
    } else {
      targetX = centre;
    }

    const moveDiff = (targetX - ai.x) * resAiSpeed;
    ai.x += clamp(moveDiff, -resAiMaxSpeed, resAiMaxSpeed);

    const shuttleApproaching = sh.x > nx && sh.vx < 0;
    const shuttleHighEnough = sh.y < gy - PLAYER_H - resAiJumpEagerness;
    const aiNearShuttleX = Math.abs(ai.x - sh.x) < 80 * scale;
    if (
      shuttleApproaching &&
      shuttleHighEnough &&
      aiNearShuttleX &&
      ai.onGround
    ) {
      ai.vy = resJumpVel;
      ai.onGround = false;
    }

    // ── smart leave decision ──
    let willLandOut = false;
    if (sh.vx > 0 && sh.lastHitBy === "player") {
      let tempX = sh.x;
      let tempY = sh.y;
      let tempVx = sh.vx;
      let tempVy = sh.vy;
      for (let i = 0; i < 120; i++) {
        tempVy += resGravity * 0.55;
        tempVx *= 0.998;
        tempX += tempVx;
        tempY += tempVy;
        if (tempY >= gy - SHUTTLE_R) break;
      }
      if (tempX > s.canvasW - 100 * scale) {
        willLandOut = true;
      }
    }

    ai.hitCooldown = Math.max(0, ai.hitCooldown - 1);
    const dxHit = Math.abs(ai.x - sh.x);
    const dyHit = Math.abs(ai.y - sh.y);
    const inHitZone = dxHit < resAiHitRange && dyHit < resAiHitRange;

    if (
      ai.hitCooldown === 0 &&
      sh.lastHitBy !== "ai" &&
      inHitZone &&
      !willLandOut
    ) {
      ai.isHitting = true;
      ai.hitCooldown = 22;
      const errorX = (Math.random() - 0.5) * aiPosError * 0.15 * scale;
      const errorY = (Math.random() - 0.5) * aiPosError * 0.1 * scale;
      sh.vx = -(resHitPowerX * aiHitMult) + errorX;
      const heightRatio = clamp((gy - sh.y) / (gy - (gy - 200 * scale)), 0, 1);
      sh.vy = resHitPowerY * aiHitMult * (0.7 + heightRatio * 0.5) + errorY;
      sh.lastHitBy = "ai";
    } else {
      ai.isHitting = false;
    }
  }

  ai.x = clamp(
    ai.x,
    nx + (NET_W / 2 + PLAYER_W / 2) * scale,
    s.canvasW - (PLAYER_W / 2) * scale,
  );
  ai.vy += resGravity;
  ai.y += ai.vy;
  if (ai.y >= gy - PLAYER_H) {
    ai.y = gy - PLAYER_H;
    ai.vy = 0;
    ai.onGround = true;
  }

  /* ── shuttle physics ── */
  if (sh.active) {
    sh.vy += resGravity * 0.55;
    sh.vx *= 0.998;
    sh.x += sh.vx;
    sh.y += sh.vy;

    sh.trail.push({ x: sh.x, y: sh.y });
    if (sh.trail.length > 12) sh.trail.shift();

    const netTop = gy - 120 * scale;
    if (
      sh.y > netTop &&
      sh.y < gy &&
      Math.abs(sh.x - nx) < (NET_W / 2 + SHUTTLE_R) * scale
    ) {
      sh.vx *= -0.4;
      sh.x += sh.vx > 0 ? NET_W * scale : -NET_W * scale;
    }

    if (sh.y >= gy - SHUTTLE_R) {
      const leftBound = 100 * scale;
      const rightBound = s.canvasW - 100 * scale;
      let pointFor = "";

      if (sh.x < leftBound || sh.x > rightBound) {
        pointFor = sh.lastHitBy === "player" ? "ai" : "player";
      } else {
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

    if (sh.x < 0 || sh.x > s.canvasW) {
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
  const scale = clamp(s.canvasW / 1200, 0.5, 1.25);

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
  ctx.lineWidth = 2 * scale;
  ctx.setLineDash([8 * scale, 8 * scale]);
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
  const stripeW = 40 * scale;
  const stripeGap = 80 * scale;
  for (let i = 0; i < W; i += stripeGap) {
    ctx.fillRect(i, gy, stripeW, GROUND_H);
  }
  // boundary lines
  const boundPad = 100 * scale;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(boundPad, gy, 4 * scale, GROUND_H); // left bound
  ctx.fillRect(W - boundPad - 4 * scale, gy, 4 * scale, GROUND_H); // right bound

  // short service lines (white, one on each side of the net)
  const sslLeft = nx - SHORT_SERVICE_OFFSET * scale;
  const sslRight = nx + SHORT_SERVICE_OFFSET * scale;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(sslLeft - 2 * scale, gy, 4 * scale, GROUND_H); // player side
  ctx.fillRect(sslRight - 2 * scale, gy, 4 * scale, GROUND_H); // AI side

  /* net */
  const netHeight = 120 * scale;
  const netTop = gy - netHeight;
  const netW = NET_W * scale;
  const netGrad = ctx.createLinearGradient(nx, netTop, nx, gy);
  netGrad.addColorStop(0, "#e2e8f0");
  netGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = netGrad;
  ctx.fillRect(nx - netW / 2, netTop, netW, gy - netTop);
  // net mesh lines
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1 * scale;
  for (let y = netTop; y < gy; y += 12 * scale) {
    ctx.beginPath();
    ctx.moveTo(nx - netW / 2, y);
    ctx.lineTo(nx + netW / 2, y);
    ctx.stroke();
  }
  // post top
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(nx - netW, netTop - 6 * scale, netW * 2, 6 * scale);

  /* shuttle trail */
  if (sh.active && sh.trail.length > 1) {
    for (let i = 1; i < sh.trail.length; i++) {
      const alpha = i / sh.trail.length;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * scale;
      ctx.moveTo(sh.trail[i - 1].x, sh.trail[i - 1].y);
      ctx.lineTo(sh.trail[i].x, sh.trail[i].y);
      ctx.stroke();
    }
  }

  /* shuttlecock */
  drawShuttle(ctx, sh, scale);

  /* players */
  drawPlayer(ctx, p, gy, true, scale);
  drawPlayer(ctx, ai, gy, false, scale);

  /* HUD */
  drawHUD(ctx, s, W, scale);
}

function drawShuttle(
  ctx: CanvasRenderingContext2D,
  sh: Shuttle,
  scale: number,
) {
  ctx.save();
  ctx.translate(sh.x, sh.y);
  const angle = Math.atan2(sh.vy, sh.vx);
  ctx.rotate(angle);

  const corkR = SHUTTLE_R * scale;
  const featherCount = 16;
  const featherLen = 22 * scale;
  const skirtSpread = 12 * scale; // half-width of the feather fan at the tip

  /* ── feathers (individual quills fanning behind the cork) ── */
  for (let i = 0; i < featherCount; i++) {
    const t = (i / (featherCount - 1)) * 2 - 1; // -1 … +1
    const tipX = -featherLen;
    const tipY = t * skirtSpread;
    const baseY = t * (corkR * 0.6);

    // feather fill
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(-corkR * 0.3, baseY - 0.8 * scale);
    ctx.quadraticCurveTo(tipX * 0.5, tipY * 0.6, tipX, tipY);
    ctx.lineTo(tipX, tipY);
    ctx.quadraticCurveTo(
      tipX * 0.5,
      tipY * 0.6,
      -corkR * 0.3,
      baseY + 0.8 * scale,
    );
    ctx.closePath();
    ctx.fill();

    // feather spine
    ctx.strokeStyle = "rgba(180, 180, 190, 0.5)";
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-corkR * 0.3, baseY);
    ctx.quadraticCurveTo(tipX * 0.5, tipY * 0.6, tipX, tipY);
    ctx.stroke();
  }

  /* ── skirt rim (the ring where feathers meet the cork) ── */
  ctx.strokeStyle = "#c0c0c0";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.ellipse(-corkR * 0.3, 0, 2 * scale, corkR * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* ── skirt tip ring ── */
  ctx.strokeStyle = "rgba(200, 200, 210, 0.4)";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.ellipse(-featherLen, 0, 2 * scale, skirtSpread, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* ── cork base ── */
  // main cork
  const corkGrad = ctx.createRadialGradient(
    1 * scale,
    -1 * scale,
    0,
    0,
    0,
    corkR,
  );
  corkGrad.addColorStop(0, "#ffffff");
  corkGrad.addColorStop(0.4, "#e2e8f0");
  corkGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = corkGrad;
  ctx.beginPath();
  ctx.arc(0, 0, corkR, 0, Math.PI * 2);
  ctx.fill();

  // cork rim
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.arc(0, 0, corkR, 0, Math.PI * 2);
  ctx.stroke();

  // cork highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.arc(1.5 * scale, -2 * scale, corkR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  /* ── motion glow ── */
  const speed = Math.hypot(sh.vx, sh.vy);
  if (speed > 3 * scale) {
    ctx.globalAlpha = Math.min(0.35, speed * (0.025 / scale));
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 16 * scale;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, corkR + 2 * scale, 0, Math.PI * 2);
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
  scale: number,
) {
  const x = p.x;
  const y = p.y;
  const pW = PLAYER_W * scale;
  const pH = PLAYER_H * scale;

  // shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, gy, 20 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // body
  ctx.fillStyle = p.color;
  const bodyX = x - pW / 2;
  const bodyY = y + 20 * scale;
  const bodyW = pW;
  const bodyH = pH - 20 * scale;
  roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 8 * scale);

  // head
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(x, y + 14 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  ctx.fillStyle = "#1e293b";
  const eyeOffX = (isPlayer ? 4 : -4) * scale;
  ctx.beginPath();
  ctx.arc(x + eyeOffX - 3 * scale, y + 12 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.arc(x + eyeOffX + 5 * scale, y + 12 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // racket (longer handle + bigger head)
  const racketDir = isPlayer ? 1 : -1;
  const racketX = x + racketDir * 36 * scale;
  const racketY = p.isHitting ? y + 4 * scale : y + 26 * scale;
  ctx.strokeStyle = p.racketColor;
  ctx.lineWidth = 3.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x + racketDir * 16 * scale, y + 30 * scale);
  ctx.lineTo(racketX, racketY);
  ctx.stroke();
  // racket head
  ctx.fillStyle = p.racketColor;
  ctx.beginPath();
  ctx.ellipse(
    racketX + racketDir * 10 * scale,
    racketY - 5 * scale,
    13 * scale,
    18 * scale,
    racketDir * 0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // racket strings
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 0.5 * scale;
  for (let i = -10 * scale; i <= 10 * scale; i += 4 * scale) {
    ctx.beginPath();
    ctx.moveTo(racketX + racketDir * 10 * scale, racketY - 5 * scale + i);
    ctx.lineTo(
      racketX + racketDir * 10 * scale + racketDir * 11 * scale,
      racketY - 5 * scale + i,
    );
    ctx.stroke();
  }

  // label
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `bold ${Math.round(11 * scale)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(isPlayer ? "YOU" : "AI", x, y - 4 * scale);
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

function drawHUD(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  W: number,
  scale: number,
) {
  /* score panel */
  const panelW = 260 * scale;
  const panelH = 50 * scale;
  const panelX = (W - panelW) / 2;
  const panelY = 16 * scale;

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 16 * scale);
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  ctx.font = `bold ${Math.round(22 * scale)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // player score
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText(String(s.playerScore), panelX + 70 * scale, panelY + panelH / 2);

  // divider
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("—", panelX + panelW / 2, panelY + panelH / 2);

  // ai score
  ctx.fillStyle = "#f9a8d4";
  ctx.fillText(
    String(s.aiScore),
    panelX + panelW - 70 * scale,
    panelY + panelH / 2,
  );

  ctx.restore();

  /* controls hint */
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = `${Math.round(12 * scale)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    "Arrows: Move  ·  Up: Jump  ·  Space: Hit",
    W / 2,
    panelY + panelH + 20 * scale,
  );
  ctx.restore();

  /* serve prompt */
  if (!s.shuttle.active && s.serving === "player" && !s.gameOver) {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.fillStyle = `rgba(250, 204, 21, ${0.5 + pulse * 0.5})`;
    ctx.font = `bold ${Math.round(18 * scale)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE to serve", W / 2, panelY + panelH + 48 * scale);
    ctx.restore();
  }
}

type Difficulty = "easy" | "medium" | "hard" | "super_hard";

/** Per-difficulty AI tuning */
const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    /** position error in px — how far off the AI aims (0 = perfect) */
    posError: number;
    /** lerp factor for movement (higher = snappier) */
    lerpFactor: number;
    /** hit power multiplier */
    hitMult: number;
    /** how eagerly the AI jumps (lower = more selective) */
    jumpEagerness: number;
    /** hit detection radius — smaller means AI must be closer to ball */
    hitRange: number;
    /** frames of predict-ahead for shuttle interception */
    lookAhead: number;
    /** max speed multiplier (relative to MOVE_SPEED) */
    maxSpeedMult: number;
  }
> = {
  easy: {
    posError: 55,
    lerpFactor: 0.06,
    hitMult: 0.75,
    jumpEagerness: 60,
    hitRange: 90,
    lookAhead: 0,
    maxSpeedMult: 0.6,
  },
  medium: {
    posError: 70,
    lerpFactor: 0.055,
    hitMult: 0.85,
    jumpEagerness: 75,
    hitRange: 95,
    lookAhead: 0,
    maxSpeedMult: 0.75,
  },
  hard: {
    posError: 15,
    lerpFactor: 0.4,
    hitMult: 1.3,
    jumpEagerness: 35,
    hitRange: 70,
    lookAhead: 20,
    maxSpeedMult: 2,
  },
  super_hard: {
    posError: 2,
    lerpFactor: 0.8,
    hitMult: 1.2,
    jumpEagerness: 14,
    hitRange: 48,
    lookAhead: 26,
    maxSpeedMult: 5,
  },
};

export default function GamePage() {
  const params = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const difficultyRef = useRef<Difficulty>("medium");
  const [started, setStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [overlay, setOverlay] = useState<{
    show: boolean;
    winner: string;
    pScore: number;
    aScore: number;
  }>({ show: false, winner: "", pScore: 0, aScore: 0 });

  /* ── detection ── */
  useEffect(() => {
    const checkMobile = () => {
      // Check if the primary pointer is 'coarse' (touch) and there is no 'fine' pointer (mouse/trackpad)
      // This is a reliable way to detect devices that are strictly touch-based (phones/tablets without accessories)
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      const hasPrecisionPointer = window.matchMedia("(pointer: fine)").matches;

      // If they have a mouse or trackpad, we assume they have a keyboard (laptop/desktop/iPad with keyboard)
      setIsMobile(isTouchDevice && !hasPrecisionPointer);
    };
    checkMobile();
    // Also listen for changes (e.g. plugging in a mouse)
    const fineQuery = window.matchMedia("(pointer: fine)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    fineQuery.addEventListener("change", checkMobile);
    coarseQuery.addEventListener("change", checkMobile);

    return () => {
      fineQuery.removeEventListener("change", checkMobile);
      coarseQuery.removeEventListener("change", checkMobile);
    };
  }, []);

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
  const startGame = useCallback((diff: Difficulty) => {
    const c = canvasRef.current;
    if (!c) return;
    difficultyRef.current = diff;
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

      const cfg = DIFFICULTY_CONFIG[difficultyRef.current];
      update(
        s,
        keysRef.current,
        cfg.lerpFactor,
        cfg.hitMult,
        cfg.posError,
        cfg.jumpEagerness,
        cfg.hitRange,
        cfg.lookAhead,
        cfg.maxSpeedMult,
      );
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* start / game-over overlay */}
      {(!started || overlay.show) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgb(10,10,10,0.5)] backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-[rgb(10,10,10,0.8)] px-12 py-10 shadow-2xl border border-slate-700/50 max-w-lg w-full">
            <BrandLogo hideText className="scale-125 mb-4" />

            {isMobile ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Device Not Supported
                </h1>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-lg text-slate-300 leading-relaxed font-medium">
                    Sorry, this game currently works on <br />
                    <span className="text-emerald-400 font-black tracking-wide uppercase">
                      with keyboards
                    </span>
                    <br /> only.
                  </p>
                </div>
                <Link
                  href="/game"
                  className="w-full mt-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all"
                >
                  Return to Lobby
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-white text-center">
                  {overlay.show ? overlay.winner : "All England Smash"}
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
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-sm font-medium text-slate-300 leading-relaxed">
                        <span className="text-emerald-400 font-bold">
                          Arrows
                        </span>{" "}
                        to move ·{" "}
                        <span className="text-emerald-400 font-bold">Up</span>{" "}
                        to jump ·{" "}
                        <span className="text-emerald-400 font-bold">
                          Space
                        </span>{" "}
                        to hit ·{" "}
                        <span className="text-emerald-400 font-bold">ESC</span>{" "}
                        to stop
                        <br />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-3 block font-black">
                          First to{" "}
                          <span className="text-white">{WIN_SCORE}</span> wins!
                        </span>
                      </p>
                    </div>

                    {/* Difficulty selector */}
                    <div className="w-full flex flex-col items-center gap-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        Select Difficulty
                      </p>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {(
                          [
                            {
                              key: "easy" as Difficulty,
                              label: "Easy",
                              from: "from-green-500",
                              to: "to-emerald-400",
                              ringColor: "ring-green-400",
                              glowColor: "shadow-green-500/50",
                            },
                            {
                              key: "medium" as Difficulty,
                              label: "Medium",
                              from: "from-amber-400",
                              to: "to-orange-400",
                              ringColor: "ring-amber-400",
                              glowColor: "shadow-amber-400/50",
                            },
                            {
                              key: "hard" as Difficulty,
                              label: "Hard",
                              from: "from-rose-500",
                              to: "to-pink-500",
                              ringColor: "ring-rose-400",
                              glowColor: "shadow-rose-500/50",
                            },
                            {
                              key: "super_hard" as Difficulty,
                              label: "Super Hard",
                              from: "from-violet-600",
                              to: "to-purple-500",
                              ringColor: "ring-violet-400",
                              glowColor: "shadow-violet-500/50",
                            },
                          ] as const
                        ).map(
                          ({ key, label, from, to, ringColor, glowColor }) => {
                            const selected = difficulty === key;
                            return (
                              <button
                                key={key}
                                id={`difficulty-${key}`}
                                onClick={() => setDifficulty(key)}
                                className={[
                                  "relative py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-1.5",
                                  `bg-gradient-to-r ${from} ${to}`,
                                  selected
                                    ? `ring-2 ${ringColor} scale-105 shadow-lg ${glowColor}`
                                    : "opacity-50 hover:opacity-75",
                                ].join(" ")}
                              >
                                {/* checkmark icon */}
                                <span
                                  className={[
                                    "transition-all duration-200 overflow-hidden",
                                    selected
                                      ? "w-4 opacity-100"
                                      : "w-0 opacity-0",
                                  ].join(" ")}
                                >
                                  <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="w-4 h-4 shrink-0"
                                  >
                                    <path
                                      d="M3 8l3.5 3.5L13 4"
                                      stroke="white"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                {label}
                              </button>
                            );
                          },
                        )}
                      </div>

                      {/* Start Match button */}
                      <button
                        id="start-game-btn"
                        onClick={() => startGame(difficulty)}
                        className="w-full mt-1 px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Start Match
                      </button>
                    </div>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
