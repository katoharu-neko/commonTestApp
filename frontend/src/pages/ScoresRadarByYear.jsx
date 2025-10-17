// src/pages/ScoresRadarByYear.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../api/apiClient';

const ScoresRadarByYear = () => {
  const [scores, setScores] = useState([]);
  const [year, setYear] = useState('');
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get('/api/scores/me'); // ←バックエンドに実装済みの「自分のスコア一覧」
      const list = res.data || [];
      setScores(list);
      const ys = Array.from(new Set(list.map(s => s.year))).sort();
      setYears(ys);
      if (ys.length) setYear(ys[ys.length - 1]);
    };
    fetch();
  }, []);

  const { indicator, data } = useMemo(() => {
    if (!scores.length || !year) return { indicator: [], data: [] };

    // 同一年のレコードだけ抽出
    const filtered = scores.filter(s => String(s.year) === String(year));

    // 科目ごとに最大満点（fullScore）が分かるなら Subject テーブルを使うのが理想ですが、
    // ここでは 100 点満点として描画します。必要なら API で満点を取得して差し替えてください。
    const subjects = Array.from(new Set(filtered.map(s => s.subject)));
    const indicator = subjects.map(sub => ({ name: sub, max: 100 }));

    // 科目ごとに「最後のスコア」を採用（平均にしたいなら reduce で平均化してください）
    const lastBySubject = subjects.map(sub => {
      const items = filtered.filter(f => f.subject === sub);
      return items[items.length - 1]?.score ?? 0;
    });

    return { indicator, data: lastBySubject };
  }, [scores, year]);

  const option = {
    title: { text: `年度別レーダーチャート (${year || '-'})` },
    tooltip: {},
    radar: { indicator },
    series: [{
      type: 'radar',
      data: [{ value: data, name: '得点' }],
      areaStyle: {}
    }]
  };

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>レーダーチャート（年度）</h2>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: 6 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {indicator.length ? (
        <ReactECharts option={option} style={{ height: 480 }} notMerge />
      ) : (
        <p>表示できるデータがありません。</p>
      )}
    </div>
  );
};

export default ScoresRadarByYear;
