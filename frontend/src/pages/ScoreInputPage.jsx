// frontend/src/pages/ScoreInputPage.jsx
import React from 'react';


//import ScoreInputForm from '../components/ScoreInputForm';
//import RadarChartECharts from '../components/Graph/RadarChartECharts';

export default function ScoreInputPage() {
  return (
    <div>
      <h2>得点入力</h2>

      {/* 既存の入力フォームがある場合 */}
      {false ? (
        <div style={{ marginBottom: 24 }}>
          {/* <ScoreInputForm /> */}
        </div>
      ) : (
        <div style={{ marginBottom: 24, padding: 12, border: '1px dashed #ccc' }}>
          （ここに得点入力フォームを配置します：`components/ScoreInputForm.jsx`）
        </div>
      )}

      {/* 既存の ECharts レーダーがある場合 */}
      {false ? (
        <div>
          {/* <RadarChartECharts scores={...} subjects={...} /> */}
        </div>
      ) : (
        <div style={{ padding: 12, border: '1px dashed #ccc' }}>
          （ここに ECharts レーダーチャートを配置します：`components/Graph/RadarChartECharts.jsx`）
        </div>
      )}
    </div>
  );
}
