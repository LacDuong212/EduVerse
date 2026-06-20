import { useState } from "react";

const ROTATIONS = [-1.8, 1.2, -0.9, 2.0, -1.5, 1.7, -0.6, 1.4, -2.1, 0.8];

const CATEGORY_TOKENS = {
  streak: {
    color: "#f0b429",
    bg:    "rgba(240,180,41,0.12)",
    glow:  "rgba(240,180,41,0.28)",
  },
  completion: {
    color: "#0dcaf0",
    bg:    "rgba(13,202,240,0.1)",
    glow:  "rgba(13,202,240,0.22)",
  },
  performance: {
    color: "#6f42c1",
    bg:    "rgba(111,66,193,0.1)",
    glow:  "rgba(111,66,193,0.22)",
  },
};

const RARITY_LABELS = {
  common:    { label: "Common",    cls: "text-body" },
  rare:      { label: "Rare",      cls: "text-primary" },
  epic:      { label: "Epic",      cls: "text-warning" },
  legendary: { label: "Legendary", cls: "text-danger" },
};

const CATEGORY_LABELS = {
  streak:      "Streak",
  completion:  "Completion",
  performance: "Performance",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCondition(condition) {
  if (!condition) return "";
  const { type, threshold } = condition;
  switch (type) {
    case "streak_current":     return `${threshold}-day streak`;
    case "streak_longest":     return `Best streak ${threshold} days`;
    case "lectures_total":     return `Complete ${threshold} lectures`;
    case "courses_total":      return `Complete ${threshold} course${threshold > 1 ? "s" : ""}`;
    case "quiz_perfect_count": return `${threshold} perfect quiz score${threshold > 1 ? "s" : ""}`;
    case "ai_score":           return `AI score ≥ ${threshold}`;
    case "fast_finish":        return `Finish a course in ${threshold} days`;
    default:                   return "";
  }
}

// ── Hover detail tooltip ─────────────────────────────────────────────────────
function BadgeTooltip({ badge, tokens, rarity, visible }) {
  return (
    <div
      role="tooltip"
      style={{
        position:      "absolute",
        bottom:        "calc(100% + 12px)",
        left:          "50%",
        transform:     "translateX(-50%)",
        width:         200,
        background:    "var(--bs-body-bg, #fff)",
        border:        `1.5px solid ${tokens.color}`,
        borderRadius:  10,
        boxShadow:     "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
        padding:       "12px 14px 10px",
        zIndex:        200,
        pointerEvents: "none",
        opacity:       visible ? 1 : 0,
        transition:    "opacity 0.18s ease",
      }}
    >
      {/* Arrow caret */}
      <div
        aria-hidden="true"
        style={{
          position:        "absolute",
          bottom:          -7,
          left:            "50%",
          transform:       "translateX(-50%) rotate(45deg)",
          width:           12,
          height:          12,
          background:      "var(--bs-body-bg, #fff)",
          borderRight:     `1.5px solid ${tokens.color}`,
          borderBottom:    `1.5px solid ${tokens.color}`,
        }}
      />

      {/* Icon + name + rarity */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <span style={{ fontSize: 28, lineHeight: 1 }}>{badge.icon}</span>
        <div>
          <div className="fw-bold text-body" style={{ fontSize: 13, lineHeight: 1.2 }}>
            {badge.name}
          </div>
          <div style={{ fontSize: 10, color: tokens.color, fontStyle: "italic" }}>
            {rarity.label}
          </div>
        </div>
      </div>

      {/* Description */}
      {badge.description && (
        <div
          className="text-body"
          style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.7, marginBottom: 8 }}
        >
          {badge.description}
        </div>
      )}

      {/* Category pill + earned date */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          borderTop:      "1px solid var(--bs-border-color)",
          paddingTop:     7,
        }}
      >
        <span
          style={{
            fontSize:      10,
            padding:       "1px 7px",
            borderRadius:  20,
            background:    tokens.bg,
            color:         tokens.color,
            fontWeight:    600,
            letterSpacing: "0.04em",
          }}
        >
          {CATEGORY_LABELS[badge.category] ?? badge.category}
        </span>
        {badge.earnedAt && (
          <span className="text-body" style={{ fontSize: 10, opacity: 0.45 }}>
            {formatDate(badge.earnedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Earned variant ───────────────────────────────────────────────────────────
export function EarnedBadgeCard({ badge, index }) {
  const [hovered, setHovered] = useState(false);
  const rot    = ROTATIONS[index % ROTATIONS.length];
  const tokens = CATEGORY_TOKENS[badge.category] ?? CATEGORY_TOKENS.streak;
  const rarity = RARITY_LABELS[badge.rarity]    ?? RARITY_LABELS.common;

  return (
    <div
      className="d-flex flex-column align-items-center gap-2 p-2"
      style={{
        position:   "relative",
        transform:  hovered ? "rotate(0deg) scale(1.06)" : `rotate(${rot}deg)`,
        transition: "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
        cursor:     "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BadgeTooltip badge={badge} tokens={tokens} rarity={rarity} visible={hovered} />

      {/* Badge disc */}
      <div
        style={{
          width:          80,
          height:         80,
          borderRadius:   "50%",
          background:     tokens.bg,
          border:         `2px solid ${tokens.color}`,
          boxShadow:      `0 0 18px ${tokens.glow}, 0 0 0 5px rgba(0,0,0,0.06)`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       34,
          position:       "relative",
        }}
      >
        {badge.icon}
        {/* perforated outer ring */}
        <div
          aria-hidden="true"
          style={{
            position:     "absolute",
            inset:        -8,
            borderRadius: "50%",
            border:       `1.5px dashed ${tokens.color}`,
            opacity:      0.2,
          }}
        />
      </div>

      <div
        className="fw-semibold text-center text-body"
        style={{ fontSize: 12, lineHeight: 1.3, maxWidth: 100 }}
      >
        {badge.name}
      </div>

      <div className="d-flex flex-column align-items-center gap-1">
        <span className={rarity.cls} style={{ fontSize: 10, opacity: 0.7, fontStyle: "italic" }}>
          {rarity.label}
        </span>
        {badge.earnedAt && (
          <span className="text-body" style={{ fontSize: 10, opacity: 0.45 }}>
            {formatDate(badge.earnedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

function formatProgressLabel(condition, progress) {
  if (!progress) return formatCondition(condition);
  const { type } = condition;
  const { current, max } = progress;
  switch (type) {
    case "streak_current":
    case "streak_longest":     return `${current} / ${max} days`;
    case "lectures_total":     return `${current} / ${max} lectures`;
    case "courses_total":      return `${current} / ${max} course${max > 1 ? "s" : ""}`;
    case "quiz_perfect_count": return `${current} / ${max} perfect`;
    default:                   return formatCondition(condition);
  }
}

// ── Locked variant ───────────────────────────────────────────────────────────
export function LockedBadgeCard({ badge }) {
  const progress   = badge.progress ?? null;
  const hasRing    = progress !== null && progress.max > 0;
  const pct        = hasRing ? Math.round((progress.current / progress.max) * 100) : 0;
  const RING       = 4; // ring thickness in px
  const DISC       = 68;
  const OUTER      = DISC + RING * 2;

  return (
    <div
      className="d-flex flex-column align-items-center gap-2 p-2"
      title={formatCondition(badge.condition)}
    >
      {/* Ring + disc */}
      <div style={{ position: "relative", width: OUTER, height: OUTER, flexShrink: 0 }}>
        {/* Conic-gradient ring layer */}
        <div
          aria-hidden="true"
          style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "50%",
            background:   hasRing
              ? `conic-gradient(rgba(108,117,125,0.55) ${pct}%, var(--bs-border-color) ${pct}%)`
              : `var(--bs-border-color)`,
          }}
        />
        {/* Body-bg cutout — creates the "doughnut hole" */}
        <div
          style={{
            position:       "absolute",
            inset:          RING,
            borderRadius:   "50%",
            background:     "var(--bs-body-bg)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          {/* Badge disc */}
          <div
            style={{
              width:          "100%",
              height:         "100%",
              borderRadius:   "50%",
              background:     "var(--bs-secondary-bg, rgba(0,0,0,0.06))",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       26,
              filter:         "grayscale(1) brightness(0.65)",
            }}
          >
            {badge.icon}
          </div>
        </div>
      </div>

      <div
        className="text-center text-body"
        style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, maxWidth: 90, opacity: 0.55 }}
      >
        {badge.name}
      </div>

      <div
        className="text-center text-body"
        style={{ fontSize: 10, opacity: hasRing ? 0.5 : 0.35, lineHeight: 1.3, maxWidth: 90 }}
      >
        {formatProgressLabel(badge.condition, progress)}
      </div>
    </div>
  );
}
