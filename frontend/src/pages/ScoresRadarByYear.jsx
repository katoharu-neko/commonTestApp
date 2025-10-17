// frontend/src/pages/ScoresRadarByYear.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { getMyScores } from '../api/scoreApi';
import RadarChartECharts from '../components/Graph/RadarChartECharts';

const ScoresRadarByYear = () => {
  const [allScores, setAllScores] = useState([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyScores();
        setAllScores(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr('スコア取得に失敗しました。ログイン状態/サーバーを確認してください。');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ある年のスコア（配列）
  const years = useMemo(() => {
    const set = new Set();
    for (const s of allScores) if (s.year) set.add(s.year);
    return Array.from(set).sort(); // 昇順
  }, [allScores]);

  useEffect(() => {
    if (!year && years.length) {
      setYear(String(years[years.length - 1])); // デフォは最新年
    }
  }, [years, year]);

  const thisYearScores = useMemo(() => {
    if (!year) return [];
    return allScores.filter((s) => String(s.year) === String(year));
  }, [allScores, year]);

  return (
    <div style={{ padding: 24 }}>
      <h2>年度別レーダーチャート</h2>

      {loading && <p>読み込み中...</p>}
      {!!err && <p style={{ color: 'red' }}>{err}</p>}

      {years.length > 0 && (
        <div style={{ margin: '12px 0 20px' }}>
          <label htmlFor="yearSel" style={{ marginRight: 8 }}>年度選択：</label>
          <select
            id="yearSel"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ padding: '6px 10px' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {!loading && years.length === 0 && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          まだスコアがありません。スコアを登録してください。
        </div>
      )}

      {thisYearScores.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <RadarChartECharts
            scores={thisYearScores}
            title={`${year} 年度`}
          />
        </div>
      )}

      {thisYearScores.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>データ一覧（{year}）</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>科目</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right', padding: 8 }}>点数</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>登録日時</th>
              </tr>
            </thead>
            <tbody>
              {thisYearScores.map((s) => (
                <tr key={s.id || `${s.subject}-${s.createdAt}`}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{s.subject}</td>
                  <td style={{ borderBottom: '1px solid #eee', textAlign: 'right', padding: 8 }}>{s.score}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ScoresRadarByYear;
