// src/pages/ScoreInputPage.jsx
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import ScoreInputForm from "../components/ScoreInputForm"; // 既存を流用
import RadarChartECharts from "../components/RadarChartECharts";

export default function ScoreInputPage() {
  // 例：[{ subject: "数学", value: 80, max: 100 }, ...]
  const [scores, setScores] = useState([]);

  return (
    <>
      <NavBar />
      <div style={{ padding: 16, display: "grid", gap: 24 }}>
        <h2>得点入力</h2>

        {/* 既存フォームから現在の入力内容を受け取る */}
        <ScoreInputForm
          onScoresChange={(arr) => setScores(arr)}
          onSubmitted={(saved) => {
            // 登録成功後の処理（トースト表示や履歴更新など）
            console.log("saved!", saved);
          }}
        />

        <div>
          <h3>レーダーチャート（ECharts）</h3>
          <RadarChartECharts scores={scores} />
        </div>
      </div>
    </>
  );
}
