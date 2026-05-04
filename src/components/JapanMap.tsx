"use client";

import { useEffect, useState } from "react";

interface Props {
  colorMap: Record<string, string>;
  targetId?: string | null;
  onPrefClick?: (id: string) => void;
  preShownIds?: Set<string>;
}

// Approximate label centroid positions in SVG coordinate space (viewBox 0 0 438 516)
const LABEL_POS: Record<string, { x: number; y: number }> = {
  hokkaido: { x: 296, y: 82 },
  tokyo:    { x: 355, y: 273 },
  aichi:    { x: 276, y: 308 },
  osaka:    { x: 246, y: 320 },
  fukuoka:  { x: 150, y: 392 },
  okinawa:  { x: 64,  y: 493 },
};

export default function JapanMap({ colorMap, targetId, onPrefClick, preShownIds }: Props) {
  const [locations, setLocations] = useState<{ id: string; name: string; path: string }[]>([]);

  useEffect(() => {
    import("@svg-maps/japan").then((mod) => {
      const japan = mod.default ?? mod;
      setLocations(japan.locations ?? []);
    });
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 438 516" className="w-full h-full">
        <defs>
          <clipPath id="mapBounds">
            <rect width="438" height="516" />
          </clipPath>
          {/* 海グラデーション */}
          <radialGradient id="seaGrad" cx="38%" cy="32%" r="72%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#1e9fd4" />
            <stop offset="45%" stopColor="#0c71a8" />
            <stop offset="100%" stopColor="#063d6b" />
          </radialGradient>

          {/* 波パターン2重 */}
          <pattern id="waveA" x="0" y="0" width="56" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 14 Q14 4 28 14 Q42 24 56 14" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1.5" />
          </pattern>
          <pattern id="waveB" x="28" y="12" width="56" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 14 Q14 4 28 14 Q42 24 56 14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>

          {/* 陸地 - イラスト調グリーン */}
          <linearGradient id="greenGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#9cda80" />
            <stop offset="100%" stopColor="#5ab044" />
          </linearGradient>

          {/* 完了県 - 深い緑 */}
          <linearGradient id="doneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#43a840" />
            <stop offset="100%" stopColor="#276924" />
          </linearGradient>

          {/* パス県 - オレンジ */}
          <linearGradient id="passGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffa726" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>

          {/* 既出県（ランドマーク）- 淡い水色 */}
          <linearGradient id="preGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b3e5fc" />
            <stop offset="100%" stopColor="#4fc3f7" />
          </linearGradient>

          {/* ターゲット光グロー */}
          <filter id="targetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="1 1 0 0 0.15  1 0.85 0 0 0.05  0 0 0 0 0  0 0 0 1.8 0" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 陸地ドロップシャドウ */}
          <filter id="landShadow" x="-8%" y="-8%" width="116%" height="116%">
            <feDropShadow dx="0.8" dy="1.2" stdDeviation="0.9" floodColor="#1a4a0a" floodOpacity="0.30" />
          </filter>

          {/* ラベル用シャドウ */}
          <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.28)" />
          </filter>
        </defs>

        {/* 海背景 */}
        <rect width="438" height="516" fill="url(#seaGrad)" rx="12" />
        <rect width="438" height="516" fill="url(#waveA)" rx="12" />
        <rect width="438" height="516" fill="url(#waveB)" rx="12" />

        {/* 海の光沢 */}
        <ellipse cx="75" cy="68" rx="100" ry="50" fill="rgba(255,255,255,0.06)" />
        <ellipse cx="375" cy="440" rx="85" ry="42" fill="rgba(255,255,255,0.04)" />

        {/* イラスト風波線 */}
        {([
          [15, 458, 42, 450, 72, 458],
          [22, 471, 50, 463, 76, 471],
          [350, 82, 378, 74, 408, 82],
          [356, 96, 382, 89, 406, 96],
          [28, 186, 50, 179, 72, 186],
          [378, 306, 400, 299, 420, 306],
          [60, 341, 82, 335, 100, 341],
          [395, 175, 415, 169, 430, 175],
        ] as number[][]).map(([x1, y1, cx, cy, x2, y2], i) => (
          <path
            key={`wave-${i}`}
            d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`}
            fill="none"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ))}

        {/* 海の泡 */}
        {([
          [55, 390, 2.8], [40, 420, 2], [75, 410, 2.4], [30, 450, 1.8],
          [90, 370, 1.8], [360, 122, 2.2], [385, 102, 1.8], [370, 148, 1.6],
          [42, 196, 1.8], [392, 314, 2], [65, 346, 1.5], [402, 242, 1.8],
          [18, 340, 1.6], [424, 420, 2], [420, 145, 1.6],
        ] as number[][]).map(([cx, cy, r], i) => (
          <circle key={`foam-${i}`} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.28)" />
        ))}

        {/* 陸地グループ：回転・拡大（海の外にはみ出さないようclip） */}
        <g transform="rotate(10, 219, 280) scale(1.15) translate(-14, -18)" clipPath="url(#mapBounds)">

        {/* 都道府県パス */}
        {locations.map((loc) => {
          const isTarget = loc.id === targetId;
          const isPreShown = preShownIds?.has(loc.id) && !colorMap[loc.id];
          const override = colorMap[loc.id];

          let fill: string;
          if (override === "#4ade80") fill = "url(#doneGrad)";
          else if (override === "#fb923c") fill = "url(#passGrad)";
          else if (override === "#fde047" || isTarget) fill = "#ffd600";
          else if (override) fill = override;
          else if (isPreShown) fill = "url(#preGrad)";
          else fill = "url(#greenGrad)";

          return (
            <path
              key={loc.id}
              id={loc.id}
              d={loc.path}
              fill={fill}
              stroke={isTarget ? "#c8a800" : "rgba(255,255,255,0.82)"}
              strokeWidth={isTarget ? 1.8 : 0.8}
              strokeLinejoin="round"
              filter={isTarget ? "url(#targetGlow)" : "url(#landShadow)"}
              style={{
                cursor: onPrefClick ? "pointer" : "default",
                transition: "fill 0.35s",
                animation: isTarget ? "pulse-target 0.9s ease-in-out infinite alternate" : "none",
              }}
              onClick={() => onPrefClick?.(loc.id)}
            >
              <title>{loc.name}</title>
            </path>
          );
        })}

        {/* ランドマーク県ラベル */}
        {preShownIds &&
          locations
            .filter((loc) => preShownIds.has(loc.id) && !colorMap[loc.id])
            .map((loc) => {
              const pos = LABEL_POS[loc.id];
              if (!pos) return null;
              const fw = loc.name.length * 8 + 6;
              const fh = 14;
              return (
                <g key={`lbl-${loc.id}`} filter="url(#labelShadow)">
                  <rect
                    x={pos.x - fw / 2}
                    y={pos.y - fh / 2}
                    width={fw}
                    height={fh}
                    rx={3}
                    fill="rgba(255,255,255,0.93)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#0d47a1"
                    fontFamily="sans-serif"
                    style={{ userSelect: "none" }}
                  >
                    {loc.name}
                  </text>
                </g>
              );
            })}

        </g>{/* 陸地グループ終わり */}

        <style>{`
          @keyframes pulse-target {
            from { opacity: 1; }
            to   { opacity: 0.62; }
          }
        `}</style>
      </svg>
    </div>
  );
}
