import type { ReactNode } from "react";

export interface Flags {
  portrait: boolean;
  chest: boolean;
  drawer: boolean;
  fire: boolean;
  key: boolean;
  door: boolean;
}

export interface Hover {
  id: string;
  label: string;
  cx: number;
  cy: number;
}

interface Props {
  mouse: { x: number; y: number };
  radius: number;
  flick: number;
  flags: Flags;
  hover: Hover | null;
  setHover: (h: Hover | null) => void;
  setMouse: (m: { x: number; y: number }) => void;
  onPick: (id: string) => void;
  armed: boolean;
}

function Bat({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="bob" style={{ animationDelay: `${delay}s` }}>
        <g className="wing" style={{ animationDelay: `${delay}s` }}>
          <path d="M-3 -2 Q-14 -13 -27 -5 Q-21 -3 -19 3 Q-14 -2 -10 3 Q-7 0 -3 4Z" fill="#150c1f" stroke="#3c2a52" strokeWidth="0.8" />
        </g>
        <g className="wing right" style={{ animationDelay: `${delay}s` }}>
          <path d="M3 -2 Q14 -13 27 -5 Q21 -3 19 3 Q14 -2 10 3 Q7 0 3 4Z" fill="#150c1f" stroke="#3c2a52" strokeWidth="0.8" />
        </g>
        <ellipse cx="0" cy="1" rx="4" ry="6.5" fill="#1b1128" stroke="#3c2a52" strokeWidth="0.8" />
        <path d="M-3 -4 L-4 -9 L-1 -5Z M3 -4 L4 -9 L1 -5Z" fill="#1b1128" />
        <circle cx="-1.5" cy="-1" r="0.9" fill="#ff4a4a" />
        <circle cx="1.5" cy="-1" r="0.9" fill="#ff4a4a" />
      </g>
    </g>
  );
}

function Spider({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const ys = [-7, -2, 3, 8];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {ys.map((yy) => (
        <g key={yy} fill="none" stroke="#0c0710" strokeWidth="1.3" strokeLinecap="round">
          <path d={`M-3 0 L-9 ${yy - 5} L-14 ${yy + 3}`} />
          <path d={`M3 0 L9 ${yy - 5} L14 ${yy + 3}`} />
        </g>
      ))}
      <ellipse cx="0" cy="3" rx="5.5" ry="6.5" fill="#150c1c" stroke="#3a2a48" strokeWidth="0.6" />
      <circle cx="0" cy="-4" r="3.6" fill="#1b1126" />
      <circle cx="-1.3" cy="-5" r="0.8" fill="#ff5a3a" />
      <circle cx="1.3" cy="-5" r="0.8" fill="#ff5a3a" />
      <path d="M0 0 L0 6 M-2 2 L2 2 M-2 5 L2 5" stroke="#8b2a2a" strokeWidth="0.8" />
    </g>
  );
}

function MiniPumpkin({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="25" ry="20" fill="#c2570c" stroke="#5c2203" strokeWidth="1.5" />
      <ellipse cx="-11" cy="0" rx="11" ry="19" fill="#d96a14" opacity="0.7" />
      <ellipse cx="11" cy="0" rx="11" ry="19" fill="#d96a14" opacity="0.7" />
      <path d="M-3 -19 Q-1 -29 6 -28 L7 -23 Q2 -23 3 -19Z" fill="#3f5a22" />
      <path d="M-15 -6 L-6 -6 L-10 -14Z M15 -6 L6 -6 L10 -14Z" fill={lit ? "#ffe27a" : "#1a0a02"} />
      <path d="M-14 5 L-9 10 L-5 6 L0 11 L5 6 L9 10 L14 5 L12 13 L-12 13Z" fill={lit ? "#ffd04a" : "#1a0a02"} />
    </g>
  );
}

export default function Scene({
  mouse,
  radius,
  flick,
  flags,
  hover,
  setHover,
  setMouse,
  onPick,
  armed,
}: Props) {
  const hot = (id: string, label: string, cx: number, cy: number, children: ReactNode) => (
    <g
      className="hot"
      onClick={(e) => {
        e.stopPropagation();
        onPick(id);
      }}
      onPointerEnter={() => setHover({ id, label, cx, cy })}
      onPointerLeave={() => setHover(null)}
    >
      {children}
    </g>
  );

  const r = radius * flick;
  const dx = hover ? hover.cx - mouse.x : 0;
  const dy = hover ? hover.cy - mouse.y : 0;
  const hoverVisible = hover ? Math.hypot(dx, dy) < r * 0.85 || flags.fire : false;

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 800,
      y: ((e.clientY - rect.top) / rect.height) * 500,
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border-2 border-[#3d2a14] shadow-[0_0_60px_rgba(255,120,0,0.12)]">
      <svg
        viewBox="0 0 800 500"
        className="block w-full touch-none select-none"
        style={{ cursor: armed ? "crosshair" : "default" }}
        onPointerMove={handleMove}
        onPointerDown={handleMove}
      >
        <defs>
          <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f1c3f" />
            <stop offset="1" stopColor="#1d1128" />
          </linearGradient>
          <pattern id="paper" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 5 L28 14 L22 23 L16 14Z" fill="#46295e" opacity="0.55" />
            <circle cx="0" cy="30" r="2" fill="#46295e" opacity="0.5" />
            <circle cx="44" cy="30" r="2" fill="#46295e" opacity="0.5" />
          </pattern>
          <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f2619" />
            <stop offset="1" stopColor="#1b0e09" />
          </linearGradient>
          <linearGradient id="woodG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a3820" />
            <stop offset="0.5" stopColor="#6b4527" />
            <stop offset="1" stopColor="#4a2d19" />
          </linearGradient>
          <radialGradient id="lightG">
            <stop offset="0" stopColor="#000" stopOpacity="1" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0.9" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="warmG">
            <stop offset="0" stopColor="#ffb347" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireG">
            <stop offset="0" stopColor="#ffcf70" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff6a00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bfe0ff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff3c0" stopOpacity="0.95" />
          </linearGradient>
          <mask id="darkMask" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="500">
            <rect width="800" height="500" fill="#fff" />
            {r > 1 && <circle cx={mouse.x} cy={mouse.y} r={r} fill="url(#lightG)" />}
            {flags.fire && <circle cx="570" cy="310" r={300 * flick} fill="url(#lightG)" />}
          </mask>
        </defs>

        {/* ======== DÉCOR ======== */}
        <rect width="800" height="390" fill="url(#wallG)" />
        <rect width="800" height="390" fill="url(#paper)" />
        {/* lambris */}
        <rect y="330" width="800" height="60" fill="#2a1a15" />
        <rect y="326" width="800" height="6" fill="#4a3022" />
        {[...Array(16)].map((_, i) => (
          <line key={i} x1={i * 52 + 10} y1="332" x2={i * 52 + 10} y2="390" stroke="#1c110e" strokeWidth="2" />
        ))}
        {/* sol */}
        <rect y="388" width="800" height="112" fill="url(#floorG)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2="800" y1={398 + i * 24 + i * i * 2} y2={398 + i * 24 + i * i * 2} stroke="#120805" strokeWidth="2" />
        ))}
        {[...Array(14)].map((_, i) => (
          <line key={i} x1={i * 62 + 20} x2={i * 62 + (i - 7) * 14 + 20} y1="390" y2="500" stroke="#120805" strokeWidth="1.2" opacity="0.7" />
        ))}
        {/* tapis */}
        <ellipse cx="400" cy="450" rx="190" ry="30" fill="#4f1626" stroke="#8a6a2a" strokeWidth="3" />
        <ellipse cx="400" cy="450" rx="150" ry="22" fill="none" stroke="#8a6a2a" strokeWidth="1.5" strokeDasharray="6 5" />
        {/* poussière sous le tapis (zone cliquable) */}
        {hot(
          "rug",
          "Tapis",
          400,
          450,
          <g>
            <ellipse cx="400" cy="450" rx="190" ry="30" fill="transparent" />
          </g>
        )}

        {/* ---- Fenêtre ---- */}
        {hot(
          "window",
          "Fenêtre",
          175,
          140,
          <g>
            <rect x="118" y="58" width="114" height="166" rx="4" fill="#3a2a20" />
            <rect x="126" y="66" width="98" height="150" fill="#0d1a35" />
            <circle cx="190" cy="108" r="30" fill="#aab8ff" opacity="0.12" />
            <circle cx="190" cy="108" r="17" fill="#f4efc8" />
            <circle cx="184" cy="104" r="3.5" fill="#d8d1a0" />
            <circle cx="196" cy="114" r="2.5" fill="#d8d1a0" />
            <path d="M126 200 Q150 170 160 150 Q164 168 180 160 Q172 182 224 196 L224 216 L126 216Z" fill="#06090f" />
            <path d="M126 168 L150 150 M150 150 L142 130 M150 150 L172 140" stroke="#06090f" strokeWidth="4" fill="none" />
            <rect x="172" y="66" width="5" height="150" fill="#3a2a20" />
            <rect x="126" y="132" width="98" height="5" fill="#3a2a20" />
            <rect x="108" y="224" width="134" height="9" rx="2" fill="#4a352a" />
            {/* rideaux */}
            <path d="M104 50 Q132 60 128 120 Q124 190 114 240 L100 240 Z" fill="#5a1530" />
            <path d="M246 50 Q218 60 222 120 Q226 190 236 240 L250 240 Z" fill="#5a1530" />
            <path d="M112 60 Q118 140 108 238 M240 60 Q234 140 244 238" stroke="#3a0b1f" strokeWidth="3" fill="none" />
          </g>
        )}

        {/* ---- Horloge ---- */}
        {hot(
          "clock",
          "Horloge comtoise",
          60,
          260,
          <g>
            <rect x="22" y="135" width="76" height="278" rx="6" fill="url(#woodG)" stroke="#2a170b" strokeWidth="2" />
            <path d="M18 138 Q60 100 102 138Z" fill="#5a3820" stroke="#2a170b" strokeWidth="2" />
            <circle cx="60" cy="178" r="26" fill="#e8dcc0" stroke="#b08a3a" strokeWidth="3" />
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line key={i} x1={60 + Math.sin(a) * 21} y1={178 - Math.cos(a) * 21} x2={60 + Math.sin(a) * 24} y2={178 - Math.cos(a) * 24} stroke="#3a2410" strokeWidth="1.6" />
              );
            })}
            <line x1="60" y1="178" x2="59" y2="157" stroke="#1a0f08" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="60" y1="178" x2="52" y2="164" stroke="#1a0f08" strokeWidth="3" strokeLinecap="round" />
            <rect x="36" y="222" width="48" height="150" rx="4" fill="#150b06" />
            <g className="swing">
              <line x1="60" y1="225" x2="60" y2="340" stroke="#b08a3a" strokeWidth="2" />
              <circle cx="60" cy="344" r="14" fill="#b08a3a" stroke="#6a4c14" strokeWidth="2" />
            </g>
            <rect x="18" y="404" width="84" height="14" rx="3" fill="#4a2d19" />
          </g>
        )}

        {/* ---- Toile d'araignée (coin) ---- */}
        {hot(
          "web",
          "Toile d'araignée",
          30,
          30,
          <g stroke="#cfc6dd" strokeOpacity="0.55" fill="none" strokeWidth="1">
            <path d="M0 0 L100 0 M0 0 L0 100 M0 0 L80 70 M0 0 L40 92 M0 0 L92 36" />
            <path d="M20 0 Q18 18 0 20 M45 0 Q40 40 0 45 M70 0 Q60 60 0 70 M92 0 Q80 80 0 92" />
            <path d="M30 20 Q40 30 42 38 M60 26 Q70 40 66 56" />
            <rect x="0" y="0" width="100" height="100" fill="transparent" stroke="none" />
          </g>
        )}
        <path d="M800 0 L720 0 M800 0 L800 70 M800 0 L735 40 M800 0 L770 62" stroke="#cfc6dd" strokeOpacity="0.4" fill="none" />
        <path d="M780 0 Q782 14 800 16 M752 0 Q756 30 800 34" stroke="#cfc6dd" strokeOpacity="0.4" fill="none" />

        {/* ---- Portrait ---- */}
        {hot(
          "portrait",
          "Portrait",
          365,
          120,
          <g transform={flags.portrait ? "rotate(-7 365 55)" : "rotate(-1.5 365 120)"}>
            <rect x="304" y="46" width="122" height="150" rx="4" fill="#b8862b" stroke="#6a4a10" strokeWidth="3" />
            <rect x="313" y="55" width="104" height="132" fill="#241a12" />
            <path d="M313 187 L322 150 Q365 130 408 150 L417 187Z" fill="#0e0a10" />
            <path d="M352 150 L365 172 L378 150Z" fill="#d8d2c4" />
            <ellipse cx="365" cy="110" rx="24" ry="32" fill="#cdbfa2" />
            <path d="M341 100 Q345 70 365 68 Q385 70 389 100 Q380 84 365 84 Q350 84 341 100Z" fill="#2b1d12" />
            <ellipse cx="355" cy="108" rx="4" ry="2.5" fill="#1a0e08" />
            <ellipse cx="375" cy="108" rx="4" ry="2.5" fill="#1a0e08" />
            <circle cx="355" cy="108" r="1.6" fill="#ff3a2a" className="eye-glow" />
            <circle cx="375" cy="108" r="1.6" fill="#ff3a2a" className="eye-glow" />
            <path d="M358 128 Q365 132 372 128" stroke="#5a2a22" strokeWidth="1.6" fill="none" />
            <path d="M365 112 L362 122 L367 122" stroke="#9a8a6a" strokeWidth="1" fill="none" />
            {!flags.portrait && (
              <g transform="rotate(8 410 192)">
                <rect x="396" y="176" width="28" height="22" fill="#ecdcb0" stroke="#a88a4a" strokeWidth="0.8" />
                <path d="M400 183 H420 M400 188 H416" stroke="#8a6a3a" strokeWidth="1" />
              </g>
            )}
          </g>
        )}

        {/* ---- Commode ---- */}
        {hot(
          "commode",
          "Commode",
          355,
          350,
          <g>
            <rect x="258" y="292" width="196" height="116" rx="3" fill="url(#woodG)" stroke="#2a170b" strokeWidth="2" />
            <rect x="250" y="284" width="212" height="12" rx="3" fill="#7a5030" stroke="#2a170b" strokeWidth="2" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect
                  x="268"
                  y={303 + i * 34 + (i === 0 && flags.drawer ? 7 : 0)}
                  width="176"
                  height="29"
                  rx="2"
                  fill="#5d3b21"
                  stroke="#2a170b"
                  strokeWidth="1.5"
                />
                <circle cx="356" cy={317 + i * 34 + (i === 0 && flags.drawer ? 7 : 0)} r="4" fill="#c9a03a" stroke="#6a4c14" />
              </g>
            ))}
            {flags.drawer && <rect x="272" y="303" width="168" height="7" fill="#0b0504" />}
            <rect x="262" y="408" width="14" height="10" fill="#2a170b" />
            <rect x="436" y="408" width="14" height="10" fill="#2a170b" />
            {/* chandelier éteint + grimoire */}
            <rect x="272" y="270" width="36" height="14" fill="#3b2a52" stroke="#1a0f28" strokeWidth="1.5" />
            <rect x="274" y="266" width="32" height="5" fill="#5a4380" />
            <g>
              <rect x="400" y="274" width="14" height="10" fill="#8a8a8a" />
              <rect x="404" y="244" width="6" height="30" fill="#ddd2a8" />
              <line x1="407" y1="244" x2="407" y2="240" stroke="#222" strokeWidth="1" />
              <ellipse cx="407" cy="276" rx="12" ry="3" fill="#6a6a6a" />
            </g>
          </g>
        )}

        {/* ---- Coffre ---- */}
        {hot(
          "chest",
          "Coffre cadenassé",
          190,
          440,
          <g>
            <rect x="126" y="424" width="128" height="54" rx="4" fill="#5b371c" stroke="#24120a" strokeWidth="2" />
            <rect x="136" y="424" width="9" height="54" fill="#2a2a32" />
            <rect x="235" y="424" width="9" height="54" fill="#2a2a32" />
            {!flags.chest ? (
              <>
                <path d="M126 424 Q190 384 254 424Z" fill="#6c4222" stroke="#24120a" strokeWidth="2" />
                <path d="M136 418 Q140 402 150 396 M244 418 Q240 402 230 396" stroke="#2a2a32" strokeWidth="8" fill="none" />
                <rect x="172" y="414" width="36" height="26" rx="4" fill="#c9a03a" stroke="#6a4c14" strokeWidth="2" />
                <text x="190" y="433" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2608">
                  ? ? ?
                </text>
              </>
            ) : (
              <>
                <path d="M126 424 L112 392 Q190 366 268 392 L254 424Z" fill="#6c4222" stroke="#24120a" strokeWidth="2" />
                <ellipse cx="190" cy="430" rx="52" ry="8" fill="#1a0c06" />
                <ellipse cx="190" cy="428" rx="30" ry="4" fill="#ffcc66" opacity="0.35" />
              </>
            )}
          </g>
        )}

        {/* ---- Cheminée ---- */}
        {hot(
          "fireplace",
          "Cheminée",
          570,
          300,
          <g>
            <rect x="480" y="190" width="180" height="214" fill="#4b4558" stroke="#241f2c" strokeWidth="2" />
            {[...Array(7)].map((_, i) => (
              <line key={i} x1="480" x2="660" y1={210 + i * 30} y2={210 + i * 30} stroke="#2f2a38" strokeWidth="2" />
            ))}
            <path d="M510 404 L510 260 Q570 200 630 260 L630 404Z" fill="#0a0507" />
            <rect x="466" y="170" width="208" height="24" rx="3" fill="#6b4527" stroke="#2a170b" strokeWidth="2" />
            {/* grille & bûches */}
            <rect x="514" y="392" width="112" height="12" fill="#17101a" />
            <rect x="524" y="372" width="86" height="14" rx="7" fill="#3a2414" stroke="#1c110a" strokeWidth="2" transform="rotate(-6 566 380)" />
            <rect x="534" y="360" width="80" height="14" rx="7" fill="#46301c" stroke="#1c110a" strokeWidth="2" transform="rotate(7 574 367)" />
            {/* boîte de fer scellée */}
            {!flags.key ? (
              <g>
                <rect x="560" y="374" width="36" height="22" rx="2" fill="#3b3b46" stroke="#14141a" strokeWidth="1.5" />
                <rect x="560" y="374" width="36" height="6" fill="#4a4a58" />
                {flags.fire ? (
                  <>
                    <ellipse cx="578" cy="386" rx="9" ry="5" fill="#b91c2a" />
                    <path d="M572 388 q-1 8 2 10 q3 -4 -2 -10z" fill="#d02a3a" />
                  </>
                ) : (
                  <circle cx="578" cy="385" r="6.5" fill="#8a1220" stroke="#4a0610" strokeWidth="1.5" />
                )}
              </g>
            ) : (
              <g>
                <path d="M560 374 L554 360 L596 360 L596 374Z" fill="#4a4a58" stroke="#14141a" strokeWidth="1.5" />
                <rect x="560" y="376" width="36" height="20" rx="2" fill="#2a2a34" stroke="#14141a" strokeWidth="1.5" />
              </g>
            )}
            {flags.fire && (
              <g>
                <ellipse cx="570" cy="392" rx="46" ry="10" fill="#ff7a1a" opacity="0.6" />
                <path className="flame" d="M530 392 Q520 350 545 320 Q545 350 558 352 Q550 320 575 290 Q585 330 590 340 Q602 320 600 300 Q625 340 612 392Z" fill="#ff7a1a" />
                <path className="flame f2" d="M542 392 Q536 360 556 338 Q558 360 568 360 Q566 340 580 322 Q588 350 596 356 Q608 346 604 392Z" fill="#ffb03a" />
                <path className="flame f3" d="M556 392 Q552 372 566 358 Q574 372 580 372 Q590 366 586 392Z" fill="#ffe27a" />
              </g>
            )}
          </g>
        )}

        {/* ---- Citrouilles sur la cheminée ---- */}
        {hot(
          "pumpkins",
          "Citrouilles",
          570,
          150,
          <g>
            <rect x="500" y="124" width="140" height="48" fill="transparent" />
            <MiniPumpkin x={525} y={150} lit={flags.fire} />
            <MiniPumpkin x={615} y={150} lit={flags.fire} />
          </g>
        )}

        {/* ---- Porte ---- */}
        {hot(
          "door",
          "Porte de sortie",
          738,
          270,
          <g>
            <path d="M688 410 L688 190 Q738 110 788 190 L788 410Z" fill="#2a170b" stroke="#120804" strokeWidth="3" />
            {flags.door ? (
              <>
                <path d="M698 410 L698 194 Q738 128 778 194 L778 410Z" fill="url(#beam)" />
                <path d="M688 410 L688 190 Q690 150 706 140 L740 150 L740 410Z" fill="#3a2210" stroke="#120804" strokeWidth="2" />
              </>
            ) : (
              <>
                <path d="M698 410 L698 194 Q738 128 778 194 L778 410Z" fill="url(#woodG)" />
                {[722, 738, 754].map((x) => (
                  <line key={x} x1={x} y1="140" x2={x} y2="410" stroke="#24120a" strokeWidth="2" />
                ))}
                <rect x="698" y="220" width="80" height="10" fill="#2a2a32" />
                <rect x="698" y="340" width="80" height="10" fill="#2a2a32" />
                <rect x="707" y="262" width="34" height="46" rx="6" fill="#3a3a46" stroke="#14141a" strokeWidth="2" />
                <circle cx="724" cy="280" r="6" fill="#0a0a0e" />
                <rect x="722" y="280" width="4" height="16" fill="#0a0a0e" />
                <circle cx="764" cy="296" r="5" fill="#b08a3a" />
              </>
            )}
          </g>
        )}

        {/* ---- Chauves-souris (4) ---- */}
        {[
          { x: 95, y: 36, s: 1, d: 0 },
          { x: 262, y: 26, s: 0.85, d: 0.3 },
          { x: 505, y: 48, s: 1.1, d: 0.6 },
          { x: 735, y: 70, s: 0.9, d: 0.9 },
        ].map((b, i) => (
          <g key={i}>
            {hot(
              "bats",
              "Chauve-souris",
              b.x,
              b.y,
              <g>
                <rect x={b.x - 30} y={b.y - 18} width="60" height="36" fill="transparent" />
                <Bat x={b.x} y={b.y} s={b.s} delay={b.d} />
              </g>
            )}
          </g>
        ))}

        {/* ---- Araignées (3) ---- */}
        {hot("spider", "Araignée", 32, 38, <g><rect x="10" y="18" width="44" height="40" fill="transparent" /><Spider x={32} y={38} s={0.9} /></g>)}
        {hot(
          "spider",
          "Araignée",
          452,
          110,
          <g>
            <line x1="452" y1="0" x2="452" y2="96" stroke="#cfc6dd" strokeOpacity="0.5" />
            <g className="dangle">
              <line x1="452" y1="96" x2="452" y2="110" stroke="#cfc6dd" strokeOpacity="0.5" />
              <rect x="436" y="100" width="32" height="34" fill="transparent" />
              <Spider x={452} y={116} s={0.85} />
            </g>
          </g>
        )}
        {hot("spider", "Araignée", 640, 436, <g><rect x="620" y="418" width="40" height="38" fill="transparent" /><Spider x={640} y={436} s={0.9} /></g>)}

        {/* ======== OBSCURITÉ ======== */}
        <rect
          width="800"
          height="500"
          fill="#04010a"
          fillOpacity={flags.fire ? 0.8 : 0.94}
          mask="url(#darkMask)"
          pointerEvents="none"
        />
        {r > 1 && (
          <circle cx={mouse.x} cy={mouse.y} r={r * 0.85} fill="url(#warmG)" pointerEvents="none" style={{ mixBlendMode: "screen" }} />
        )}
        {flags.fire && <circle cx="570" cy="330" r={280 * flick} fill="url(#fireG)" pointerEvents="none" style={{ mixBlendMode: "screen" }} />}
      </svg>

      {hover && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-700/50 bg-black/70 px-4 py-1 text-sm tracking-wide text-amber-200 backdrop-blur">
          {hoverVisible ? hover.label : "… quelque chose dans l'ombre …"}
        </div>
      )}
    </div>
  );
}
