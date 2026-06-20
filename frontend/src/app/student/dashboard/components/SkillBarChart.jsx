import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

const SHORT_LABELS = {
  "Web Development":        "Web Dev",
  "Security":               "Security",
  "Information Technology": "IT Basics",
  "DevOps":                 "DevOps",
  "Data":                   "Data",
  "Network":                "Network",
  "Mobile Development":     "Mobile",
  "Artificial Intelligence":"AI / ML",
};

const readThemeTokens = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    primary:        v("--bs-primary",          "#0d6efd"),
    bodyColor:      v("--bs-body-color",        "#212529"),
    secondaryColor: v("--bs-secondary-color",   "#6c757d"),
    borderColor:    v("--bs-border-color",      "rgba(0,0,0,0.15)"),
    bodyBg:         v("--bs-body-bg",           "#ffffff"),
  };
};

const SkillBarChart = ({ radar }) => {
  const [tokens, setTokens] = useState(() =>
    typeof window === "undefined" ? null : readThemeTokens()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setTokens(readThemeTokens());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme", "class"],
    });
    return () => obs.disconnect();
  }, []);

  const t = tokens || {
    primary:        "#0d6efd",
    bodyColor:      "#212529",
    secondaryColor: "#6c757d",
    borderColor:    "rgba(0,0,0,0.15)",
    bodyBg:         "#fff",
  };

  const { labels, originalLabels, myValues, avgValues, activeCount } = useMemo(() => {
    const rawLabels = radar?.labels || [];
    const values   = radar?.values || [];
    const sys      = radar?.systemAvgValues || [];

    const rows = rawLabels
      .map((label, i) => ({
        original: label,
        display:  SHORT_LABELS[label] || label,
        my:  clamp(values[i]),
        avg: clamp(sys[i]),
      }))
      .sort((a, b) => b.my - a.my);

    return {
      labels:         rows.map(r => r.display),
      originalLabels: rows.map(r => r.original),
      myValues:       rows.map(r => r.my),
      avgValues:      rows.map(r => r.avg),
      activeCount:    rows.filter(r => r.my > 0).length,
    };
  }, [radar]);

  const primaryFill = t.primary.includes("rgb")
    ? t.primary.replace("rgb(", "rgba(").replace(")", ", 0.78)")
    : "rgba(13,110,253,0.78)";

  const gridColor = t.borderColor.includes("rgb")
    ? t.borderColor.replace("rgb(", "rgba(").replace(")", ", 0.28)")
    : "rgba(0,0,0,0.08)";

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label:            "My Skills",
        data:             myValues,
        backgroundColor:  primaryFill,
        borderRadius:     3,
        borderSkipped:    false,
        maxBarThickness:  13,
      },
      {
        label:           "System Avg",
        data:            avgValues,
        backgroundColor: "rgba(255,0,0,0.22)",
        borderColor:     "rgba(255,0,0,0.55)",
        borderWidth:     1,
        borderRadius:    3,
        borderSkipped:   false,
        maxBarThickness: 13,
      },
    ],
  }), [labels, myValues, avgValues, primaryFill]);

  const options = useMemo(() => ({
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 6 } },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle:    "circle",
          boxWidth:      8,
          boxHeight:     8,
          color:         t.bodyColor,
          font:          { size: 11, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(33,37,41,0.92)",
        titleColor:      "#fff",
        bodyColor:       "#fff",
        padding:         8,
        callbacks: {
          label: (ctx) => {
            const val = Math.round(ctx.parsed.x);
            if (ctx.dataset.label === "My Skills") {
              const origLabel = originalLabels[ctx.dataIndex];
              const ld = radar.raw?.lectureData?.[origLabel];
              if (ld && ld.total > 0) {
                return `My Skills: ${val}% · ${ld.completed} / ${ld.total} lectures`;
              }
            }
            return `${ctx.dataset.label}: ${val}%`;
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: {
          color:         t.secondaryColor,
          font:          { size: 10 },
          callback:      (v) => `${v}%`,
          maxTicksLimit: 6,
        },
        grid: { color: gridColor },
      },
      y: {
        ticks: {
          color: t.bodyColor,
          font:  { size: 11, weight: "600" },
        },
        grid: { display: false },
      },
    },
  }), [t.bodyColor, t.secondaryColor, gridColor, originalLabels, radar.raw?.lectureData]);

  const needed = Math.max(0, 3 - activeCount);
  const subtitle = activeCount === 0
    ? "Start your first course to track skill progress"
    : `${activeCount} of ${labels.length} areas active — study ${needed} more categor${needed === 1 ? "y" : "ies"} to unlock the full radar`;

  return (
    <div className="p-4 border rounded bg-transparent">
      <div className="mb-3">
        <h5 className="mb-0 fw-bold text-body">Skill Radar</h5>
        <div className="small text-body mt-1" style={{ opacity: 0.5 }}>
          {subtitle}
        </div>
      </div>

      <div style={{ height: labels.length * 38 + 56 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SkillBarChart;
