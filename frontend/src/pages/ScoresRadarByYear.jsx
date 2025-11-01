// src/pages/ScoresRadarByYear.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../api/apiClient';
import {
  createSubjectLookup,
  getSubjectDisplayName,
  sortSubjectNamesByCategory,
} from '../utils/subjectOrder';

// 入力フォーム + 年度別レーダーチャート（得点率%表示）
// subjectsテーブルと連携し、カテゴリ→科目の絞り込みが可能
const ScoresRadarByYear = () => {
  // ---- 画面状態 ----
  const [scores, setScores] = useState([]);           // /api/scores/me から取得する自分のスコア
  const [subjects, setSubjects] = useState([]);       // /api/subjects から取得（fullScore含む）
  const [categories, setCategories] = useState([]);   // /api/subjects/categories

  // 入力フォームの状態
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 表示用 年度セレクト
  const [years, setYears] = useState([]);
  const [viewYear, setViewYear] = useState('');

  const [loadingInit, setLoadingInit] = useState(true);
  const [initError, setInitError] = useState('');

  // ---- 初期ロード ----
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setInitError('');
        setLoadingInit(true);

        // 1) 自分のスコア
        const resScores = await api.get('/api/scores/me');
        const list = Array.isArray(resScores.data) ? resScores.data : [];
        setScores(list);

        // 年度候補
        const ys = Array.from(new Set(list.map(s => s.year))).sort();
        setYears(ys);
        if (ys.length) {
          const latest = ys[ys.length - 1];
          setViewYear(String(latest));
          if (!year) setYear(String(latest));
        } else {
          const now = new Date().getFullYear();
          setViewYear(String(now));
          if (!year) setYear(String(now));
        }

        // 2) 科目とカテゴリ
        const [resSubjects, resCats] = await Promise.all([
          api.get('/api/subjects'),            // [{id,category,name,isActive,fullScore}, ...]
          api.get('/api/subjects/categories')  // ["英語","数学",...]
        ]);
        setSubjects(Array.isArray(resSubjects.data) ? resSubjects.data : []);
        setCategories(Array.isArray(resCats.data) ? resCats.data : []);
      } catch (e) {
        console.error(e);
        setInitError('初期データの取得に失敗しました。認証・サーバーログを確認してください。');
      } finally {
        setLoadingInit(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subjectLookup = useMemo(
    function () {
      return createSubjectLookup(subjects);
    },
    [subjects]
  );

  // 選択カテゴリに応じた科目一覧
  const filteredSubjects = useMemo(() => {
    if (!category) return [];
    return subjects.filter(s => s.category === category && s.isActive !== false);
  }, [category, subjects]);

  // 選択中の科目の満点
  const selectedFullScore = useMemo(() => {
    const s = filteredSubjects.find(f => f.name === subjectName);
    return s?.fullScore || 100;
  }, [filteredSubjects, subjectName]);

  // ---- 入力送信 ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // バリデーション
    if (!year || !category || !subjectName || !score) {
      setFormError('年度・カテゴリ・科目・得点は必須です。');
      return;
    }
    const numericScore = Number(score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > selectedFullScore) {
      setFormError(`得点は0〜${selectedFullScore}の範囲で入力してください。`);
      return;
    }

    try {
      setSubmitting(true);
      // サーバーに登録
      await api.post('/api/scores', {
        subject: subjectName,
        score: numericScore,
        year: Number(year)
      });

      // 最新の自分のスコアを再取得（即時反映）
      const res = await api.get('/api/scores/me');
      const list = Array.isArray(res.data) ? res.data : [];
      setScores(list);

      // 年度候補を更新
      const ys = Array.from(new Set(list.map(s => s.year))).sort();
      setYears(ys);
      // ビューの年度が未設定なら最新に
      if (!viewYear && ys.length) setViewYear(String(ys[ys.length - 1]));

      // フォームは得点だけリセット（連続入力が楽なように）
      setScore('');
    } catch (err) {
      console.error(err);
      setFormError('登録に失敗しました。ネットワーク・認証・サーバーログを確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- チャート用データ（年度別、％で表示） ----
  const { indicator, data } = useMemo(() => {
    if (!scores.length || !viewYear) return { indicator: [], data: [] };

    // 表示年度のスコア
    const inYear = scores.filter(s => String(s.year) === String(viewYear));
    if (!inYear.length) return { indicator: [], data: [] };

    // その年度に出現した科目一覧（重複排除）
    const subjectNames = Array.from(new Set(inYear.map(s => s.subject)));
    const sortedSubjects = sortSubjectNamesByCategory(subjectNames, subjectLookup);

    // 各科目の満点を subjects テーブルから拾う（なければ100）
    const fullScoreMap = new Map();
    subjects.forEach(s => {
      fullScoreMap.set(s.name, s.fullScore || 100);
    });

    // radar の軸（maxは100固定＝得点率%）
    const indicator = sortedSubjects.map(function (name) {
      return { name: getSubjectDisplayName(name, subjectLookup), max: 100 };
    });

    // 各科目の「最後のスコア」を％換算（平均にしたい場合はここを平均化に変える）
    const percentValues = sortedSubjects.map(function (name) {
      const items = inYear.filter(i => i.subject === name);
      const last = items[items.length - 1]; // 最後の点を採用
      const full = fullScoreMap.get(name) || 100;
      const pct = full > 0 ? (Number(last?.score || 0) / full) * 100 : 0;
      return Math.round(pct * 10) / 10; // 小数1位で丸め
    });

    return { indicator, data: percentValues };
  }, [scores, viewYear, subjects, subjectLookup]);

  const stroke = '#3BAFDA';
  const fill   = 'rgba(59,175,218,0.18)';

  const chartOption = {
    title: { text: `年度別 ${viewYear || '-'}` },
    tooltip: {},
    radar: {
      indicator,
      axisName: { color: '#111' }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data,
            name: '得点率(%)',
            // 線・マーカー色
            lineStyle: { width: 2, color: stroke },
            itemStyle: { color: stroke, borderColor: stroke },
            // 面の色（半透明）
            areaStyle: { color: fill },
            // マウスオーバー時の色（任意）
            emphasis: {
              lineStyle: { color: stroke },
              itemStyle: { color: stroke },
              areaStyle: { color: 'rgba(59,175,218,0.28)' }
            }
          }
        ],
        // シンボル（頂点）のスタイル（任意）
        symbol: 'circle',
        symbolSize: 5
      }
    ]
  };

  const chartStyle = { height: 'clamp(320px, 60vh, 520px)', width: '100%' };

  // ---- UI ----
  return (
    <div className="scores-page">
      {loadingInit && <p className="scores-page__alert">読み込み中...</p>}
      {initError && <p className="scores-page__alert form-error">{initError}</p>}

      <section className="card scores-page__chart">
        <div className="scores-chart-wrapper">
          {indicator.length ? (
            <ReactECharts option={chartOption} style={chartStyle} notMerge />
          ) : (
            <p className="status-message">表示できるデータがありません。</p>
          )}
        </div>
        
        <div className="scores-year-selector">
          <select value={viewYear} onChange={e => setViewYear(e.target.value)}>
            {years.length ? (
              years.map(function (y) {
                return (
                  <option key={y} value={y}>{y}</option>
                );
              })
            ) : (
              <option value={viewYear}>{viewYear}</option>
            )}
          </select>
        </div>
        
      </section>

      <section className="card scores-page__form">
        <h3 className="section-title">スコア入力</h3>
        <form onSubmit={handleSubmit} className="scores-form-grid">
          <label className="form-field">
            <span>年度</span>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder={new Date().getFullYear()}
            />
          </label>

          <label className="form-field">
            <span>カテゴリ</span>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setSubjectName(''); }}
            >
              <option value="">選択してください</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>科目</span>
            <select
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
              disabled={!category}
            >
              <option value="">選択してください</option>
              {filteredSubjects.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}（満点:{s.fullScore ?? 100}）
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>得点</span>
            <input
              type="number"
              value={score}
              onChange={e => setScore(e.target.value)}
              min={0}
              max={selectedFullScore}
              placeholder={`0〜${selectedFullScore}`}
              disabled={!subjectName}
            />
          </label>

          <div className="scores-form-actions" style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              disabled={submitting}
              className="button-primary"
            >
              {submitting ? '送信中…' : '登録する'}
            </button>
            {formError && <span className="form-error">{formError}</span>}
          </div>
        </form>
      </section>
    </div>
  );
};

export default ScoresRadarByYear;
