import React from "react";
import ReactECharts from "echarts-for-react";

function ScoreRadarChart({ scores }) {
  // scoresが配列でない場合の対策
  if (!Array.isArray(scores) || scores.length === 0) {
    return <p>スコアが登録されていません。</p>;
  }

  // 科目名とスコアを抽出
  const subjects = scores.map((s) => s.subject);
  const values = scores.map((s) => s.score);

  const option = {
    title: {
      text: "共通テストスコアレーダーチャート",
    },
    tooltip: {},
    radar: {
      indicator: subjects.map((subject) => ({
        name: subject,
        max: 100,
      })),
    },
    series: [
      {
        name: "スコア",
        type: "radar",
        data: [
          {
            value: values,
            name: "スコア",
          },
        ],
      },
    ],
  };

  return (
    <div style={{ width: "500px", margin: "0 auto" }}>
      <ReactECharts option={option} />
    </div>
  );
}

export default ScoreRadarChart;
