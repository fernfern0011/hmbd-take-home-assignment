'use client';

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const fetchSpiderData = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/spider?${query}`);
  return res.json();
};

function groupBySubject(data) {
  const subjects = {};
  data.forEach((row) => {
    if (!subjects[row.subject_id]) subjects[row.subject_id] = [];
    subjects[row.subject_id].push(row);
  });
  return subjects;
}

function getLineColor(arm, dose) {
  const colors = {
    "A_1800": "magenta",
    "A_3000": "blue",
    "B_1800": "green",
    "B_3000": "orange",
  };
  return colors[`${arm}_${dose}`] || "gray";
}

export default function SpiderPlot({ arms, doses, tumor_types }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSpiderData({ arms, doses, tumor_types }).then(setData);
  }, [arms, doses, tumor_types]);

  // Group by subject_id
  const subjects = groupBySubject(data);
  const shown = new Set();

  const traces = Object.entries(subjects).map(([subject_id, series]) => {
    series.sort((a, b) => Number(a.days) - Number(b.days));
    const baseline = { ...series[0], change: 0, days: 0 };
    const plotSeries = [baseline, ...series.map((d) => ({
      ...d,
      days: Number(d.days) / 7, // weeks on treatment
      change: Number(d.change),
    }))];

    // Group legend by arm+dose
    const legendName = `ARM ${series[0].arm} ${series[0].dose} mg`;
    const legendGroup = `${series[0].arm}_${series[0].dose}`;

    // store only unique legend groups to show in plot
    const isFirstInGroup = !shown.has(legendGroup);
    if (isFirstInGroup) shown.add(legendGroup);

    return {
      x: plotSeries.map((d) => d.days),
      y: plotSeries.map((d) => d.change),
      mode: "lines+markers",
      name: legendName,
      legendgroup: legendGroup,
      line: { color: getLineColor(series[0].arm, series[0].dose) },
      showlegend: isFirstInGroup,
      hoverinfo: "text",
      text: plotSeries.map((d) =>
        `Subject: ${subject_id}<br>Arm: ${d.arm}<br>Dose: ${d.dose}<br>Tumor: ${d.tumor_type}<br>Weeks: ${d.days}<br>Change: ${d.change}%`
      ),
    };
  });

  return (
    <Suspense fallback={<div>Loading plot...</div>}>
      <Plot
        data={traces}
        layout={{
          title: "Spider Plot",
          xaxis: {
            title: {
              text: "Weeks on Treatment",
              font: { size: 16, family: "Arial", color: "#333" }
            },
            zeroline: false,
            tickmode: "linear",
            dtick: 6,
            range: [0, Math.max(...data.map(d => Number(d.days) / 7), 42)],
          },
          yaxis: {
            title: {
              text: "% Change from Baseline (Sum of Diameters)",
              font: { size: 16, family: "Arial", color: "#333" }
            },
            zeroline: false,
            range: [-100, 100],
          },
          legend: { orientation: "v" },
          margin: { t: 40 },
          shapes: [
            {
              type: "line",
              xref: "paper",
              x0: 0, x1: 1,
              y0: 20, y1: 20,
              line: { color: "black", width: 2, dash: "dash" }
            },
            {
              type: "line",
              xref: "paper",
              x0: 0, x1: 1,
              y0: -30, y1: -30,
              line: { color: "black", width: 2, dash: "dash" }
            },
            {
              type: "line",
              xref: "paper",
              x0: 0, x1: 1,
              y0: 0, y1: 0,
              line: { color: "gray", width: 2 }
            },
            {
              type: "line",
              yref: "paper",
              y0: 0, y1: 1,
              x0: 6, x1: 6,
              line: { color: "gray", width: 2, dash: "dot" }
            }
          ],
          annotations: [
            {
              x: 6,
              y: 90,
              xref: "x",
              yref: "y",
              text: "SoC mPFS",
              showarrow: false,
              font: { color: "gray", size: 12 }
            }
          ]
        }}
        style={{ width: "100%", height: "500px", }}
        config={{ responsive: true }}
      />
    </Suspense>
  );
}