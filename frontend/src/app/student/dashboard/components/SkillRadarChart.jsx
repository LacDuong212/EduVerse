import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));
const CATEGORY_TO_SKILL = {
  "Web Development": "Frontend/Backend Web",
  Security: "Cyber Security",
  "Information Technology": "IT Fundamentals",
  DevOps: "CI/CD & Deployment",
  Data: "Data Analysis",
  Network: "Networking",
  "Game Development": "Game Programming",
  "Mobile Development": "Mobile Apps",
  "Cloud Development": "Cloud Computing",
  "Artificial Intelligence": "Machine Learning",
};

/**
 * Read Bootstrap CSS variables so it matches light/dark automatically
 * Assumes your app toggles theme via Bootstrap (data-bs-theme="dark") or similar.
 */
const readThemeTokens = () => {
  const el = document.documentElement;
  const cs = getComputedStyle(el);

  const v = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback);

  const primary = v("--bs-primary", "#0d6efd");
  const bodyColor = v("--bs-body-color", "#212529");
  const secondaryColor = v("--bs-secondary-color", "#6c757d");
  const borderColor = v("--bs-border-color", "rgba(0,0,0,0.15)");
  const bodyBg = v("--bs-body-bg", "#ffffff");

  // Make subtle grid using borderColor (works for both themes)
  const grid = borderColor.includes("rgb")
    ? borderColor.replace("rgb(", "rgba(").replace(")", ", 0.35)")
    : "rgba(0,0,0,0.12)";

  const angle = borderColor.includes("rgb")
    ? borderColor.replace("rgb(", "rgba(").replace(")", ", 0.22)")
    : "rgba(0,0,0,0.10)";

  return { primary, bodyColor, secondaryColor, borderColor, bodyBg, grid, angle };
};

const SkillRadarChart = ({ radar, title = "Skill Radar (by Category)", height = 520 }) => {
  const [tokens, setTokens] = useState(() => (typeof window === "undefined" ? null : readThemeTokens()));

  // Re-read tokens when theme changes (data-bs-theme toggled) or window resized
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setTokens(readThemeTokens());
    update();

    // Watch for theme attribute changes
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme", "class"] });

    window.addEventListener("resize", update);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!radar || !radar.labels?.length) {
    return (
      <div className="p-4 border rounded bg-transparent text-muted">
"No skill data available yet. Complete more courses to see your progress!"      
</div>
    );
  }

 const labels = radar.labels; // data labels
const displayLabels = labels.map((c) => CATEGORY_TO_SKILL[c] || c);
  const values = (radar.values || []).map(clamp);
  const systemAvgValues = (radar.systemAvgValues || []).map(clamp);

  const t = tokens || {
    primary: "#0d6efd",
    bodyColor: "#212529",
    secondaryColor: "#6c757d",
    grid: "rgba(0,0,0,0.12)",
    angle: "rgba(0,0,0,0.10)",
    bodyBg: "#fff",
  };

  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  const data = useMemo(
    () => ({
        labels: displayLabels,
      datasets: [
  // ✅ System Average (vẽ trước -> nằm dưới)
  {
    label: "System Average",
    data: systemAvgValues,

backgroundColor: "rgba(255, 0, 0, 0.66)", // xanh nhạt   
     borderWidth: 0,
    borderColor: "transparent",
    pointRadius: 0,
    pointHoverRadius: 0,
    tension: 0.25,
    order: 1,
  },

  // ✅ My Skills (vẽ sau -> đè lên trên)
  {
    label: "My Skills",
    data: values,

    borderWidth: 5,
    borderColor: t.primary,
    backgroundColor: t.primary.includes("rgb")
      ? t.primary.replace("rgb(", "rgba(").replace(")", ", 0.22)")
      : "rgba(13,110,253,0.22)",

    pointBackgroundColor: t.bodyBg,
    pointBorderColor: t.primary,
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,

    tension: 0.25,
    order: 2,
  },
      ],
    }),
    [labels, values, systemAvgValues, t.primary, t.bodyBg]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },

      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            boxHeight: 10,
            color: t.bodyColor,
            font: { size: 12, weight: "600" },
          },
        },
        tooltip: {
          backgroundColor: "rgba(33,37,41,0.92)",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          callbacks: {
            title: (items) => items?.[0]?.label || "",
            label: (ctx) => {
              const val = Math.round(ctx.parsed.r);
              return `${ctx.dataset.label}: ${val}%`;
            },
            afterBody: (items) => {
              // items chứa cả 2 dataset (system + user)
              const label = items?.[0]?.label;
              const userIdx = items.findIndex((i) => i.dataset.label === "My Skills");
              const sysIdx = items.findIndex((i) => i.dataset.label === "System Average");

              const userVal =
                userIdx >= 0 ? Math.round(items[userIdx].parsed.r) : null;
              const sysVal =
                sysIdx >= 0 ? Math.round(items[sysIdx].parsed.r) : null;

              if (userVal == null || sysVal == null) return "";

              const diff = userVal - sysVal;
              const sign = diff > 0 ? "+" : diff < 0 ? "" : "±";
              return `So với hệ thống: ${sign}${diff}%`;
            },
          },
        },


      },

      scales: {
        r: {
          min: 0,
          max: 100,
          backgroundColor: "transparent",

          grid: {
            circular: true,
            color: t.grid,
            lineWidth: 1,
          },
          angleLines: {
            color: t.angle,
            lineWidth: 1,
          },

          ticks: {
            stepSize: 20,
            color: t.secondaryColor,
            font: { size: 11, weight: "600" },
            backdropColor: "transparent",
            backdropPadding: 0,
            showLabelBackdrop: false,
          },

          pointLabels: {
            color: t.bodyColor,
            font: { size: 13, weight: "700" },
            padding: 6,
          },
        },
      },

      elements: {
        line: { borderJoinStyle: "round" },
      },
    }),
    [t.bodyColor, t.secondaryColor, t.grid, t.angle]
  );

  return (
    <div className="p-4 border rounded bg-transparent">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div>
          <h5 className="mb-0 fw-bold text-body">{title}</h5>
          {/* <div className="text-muted small">Thang điểm 0–100%</div> */}
        </div>

        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
          Avg: {avg}%
        </span>
      </div>

      <div style={{ height }}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default SkillRadarChart;
