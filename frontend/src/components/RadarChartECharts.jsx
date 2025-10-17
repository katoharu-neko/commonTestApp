// src/components/RadarChartECharts.jsx
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

/**
 * props.scores 例:
 * [
 *   { subject: "国語", value: 72, max: 100 },
 *   { subject: "数学", value: 85, max: 100 },
 *   { subject: "英語", value: 90, max: 100 },
 *   ...
 * ]
 */
export default function RadarChartECharts({ scores = [] }) {
  const indicators = useMemo(() => {
    if (!scores?.length) return [];
    return scores.map((s) => ({
      name: s.subject,
      max: s.max ?? 100,
    }));
  }, [scores]);

  const dataValues = useMemo(() => {
    if (!scores?.length) return [];
    return scores.map((s) => Number(s.value ?? 0));
  }, [scores]);

  const option = {
    title: { text: "科目別レーダーチャート" },
    tooltip: { trigger: "item" },
    radar: {
      indicator: indicators,
      radius: "60%",
      splitArea: { show: true },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: dataValues,
            name: "現在の入力",
            areaStyle: { opacity: 0.2 },
            lineStyle: { width: 2 },
            symbolSize: 6,
          },
        ],
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: 420 }}>
      <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}
