// src/pages/ScoresRadarByYear.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../api/apiClient';
import {
  createSubjectLookup,
  getSubjectDisplayName,
  sortSubjectNamesByCategory,
} from '../utils/subjectOrder';

const DEFAULT_ATTEMPT_OPTIONS = [1, 2, 3];

const buildAttemptOptionsByYear = (scoresList) => {
  const yearToAttempts = new Map();

  scoresList.forEach((item) => {
    if (!item) return;
    const { year } = item;
    if (year === undefined || year === null) return;

    const attemptRaw = Number(item.attemptNumber ?? 1);
    const attempt = Number.isFinite(attemptRaw) && attemptRaw > 0
      ? Math.trunc(attemptRaw)
      : 1;

    const yearKey = String(year);
    if (!yearToAttempts.has(yearKey)) {
      yearToAttempts.set(yearKey, new Set());
    }
    yearToAttempts.get(yearKey).add(attempt);
  });

  const normalized = new Map();
  yearToAttempts.forEach((attemptSet, yearKey) => {
    const sorted = Array.from(attemptSet).sort((a, b) => a - b);
    normalized.set(yearKey, sorted);
  });

  return normalized;
};

const formatAttemptLabel = (attemptNumber) => `演習${attemptNumber}回目`;

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
  const [subjectId, setSubjectId] = useState('');
  const [score, setScore] = useState('');
  const [attempt, setAttempt] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 表示用 年度セレクト
  const [years, setYears] = useState([]);
  const [viewYear, setViewYear] = useState('');
  const [viewAttempt, setViewAttempt] = useState('1');

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

        const attemptMap = buildAttemptOptionsByYear(list);

        // 年度候補
        const ys = Array.from(new Set(list.map(s => s.year))).sort();
        setYears(ys);
        if (ys.length) {
          const latest = ys[ys.length - 1];
          const latestKey = String(latest);
          setViewYear(latestKey);
          if (!year) setYear(latestKey);

          const attemptsForLatest = attemptMap.get(latestKey);
          setViewAttempt(String((attemptsForLatest && attemptsForLatest[0]) || 1));
        } else {
          const now = new Date().getFullYear();
          const nowKey = String(now);
          setViewYear(nowKey);
          setViewAttempt('1');
          if (!year) setYear(nowKey);
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

  const subjectFullScoreMap = useMemo(() => {
    const map = new Map();
    subjects.forEach(subject => {
      if (subject && subject.id !== undefined && subject.id !== null) {
        map.set(String(subject.id), subject.fullScore ?? 100);
      }
    });
    return map;
  }, [subjects]);

  const scoreSubjectNameMap = useMemo(() => {
    const map = new Map();
    scores.forEach(item => {
      if (item && item.subjectId !== undefined && item.subjectId !== null && item.subjectName) {
        map.set(String(item.subjectId), item.subjectName);
      }
    });
    return map;
  }, [scores]);

  const attemptOptionsByYear = useMemo(() => buildAttemptOptionsByYear(scores), [scores]);

  const attemptOptionsForViewYear = useMemo(() => {
    if (!viewYear) return [];
    const options = attemptOptionsByYear.get(String(viewYear));
    return Array.isArray(options) ? options : [];
  }, [attemptOptionsByYear, viewYear]);

  useEffect(() => {
    if (!viewYear) return;
    const options = attemptOptionsByYear.get(String(viewYear));
    if (!options || !options.length) {
      if (viewAttempt !== '1') {
        setViewAttempt('1');
      }
      return;
    }
    if (!options.includes(Number(viewAttempt))) {
      setViewAttempt(String(options[0]));
    }
  }, [attemptOptionsByYear, viewAttempt, viewYear]);

  // 選択カテゴリに応じた科目一覧
  const filteredSubjects = useMemo(() => {
    if (!category) return [];
    return subjects.filter(s => s.category === category && s.isActive !== false);
  }, [category, subjects]);

  // 選択中の科目の満点
  const selectedFullScore = useMemo(() => {
    const s = filteredSubjects.find(f => String(f.id) === String(subjectId));
    return s?.fullScore || 100;
  }, [filteredSubjects, subjectId]);

  // ---- 入力送信 ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // バリデーション
    if (!year || !category || !subjectId || !score) {
      setFormError('年度・カテゴリ・科目・得点は必須です。');
      return;
    }
    const numericScore = Number(score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > selectedFullScore) {
      setFormError(`得点は0〜${selectedFullScore}の範囲で入力してください。`);
      return;
    }
    const numericAttempt = Number(attempt);
    if (!Number.isInteger(numericAttempt) || numericAttempt < 1) {
      setFormError('演習回数は1以上の整数で選択してください。');
      return;
    }

    try {
      setSubmitting(true);
      const submittedYear = Number(year);
      const submittedAttempt = numericAttempt;
      // サーバーに登録
      await api.post('/api/scores', {
        subjectId: Number(subjectId),
        score: numericScore,
        year: submittedYear,
        attemptNumber: submittedAttempt,
      });

      // 最新の自分のスコアを再取得（即時反映）
      const res = await api.get('/api/scores/me');
      const list = Array.isArray(res.data) ? res.data : [];
      setScores(list);

      // 年度候補を更新
      const ys = Array.from(new Set(list.map(s => s.year))).sort();
      setYears(ys);
      const attemptMap = buildAttemptOptionsByYear(list);

      const submittedYearKey = String(submittedYear);
      if (ys.includes(submittedYear)) {
        setViewYear(submittedYearKey);
        const submittedAttemptOptions = attemptMap.get(submittedYearKey) || [];
        if (submittedAttemptOptions.includes(submittedAttempt)) {
          setViewAttempt(String(submittedAttempt));
        } else if (submittedAttemptOptions.length) {
          setViewAttempt(String(submittedAttemptOptions[0]));
        } else {
          setViewAttempt('1');
        }
      } else if (ys.length) {
        const latest = ys[ys.length - 1];
        const latestKey = String(latest);
        setViewYear(latestKey);
        const attemptsForLatest = attemptMap.get(latestKey);
        setViewAttempt(String((attemptsForLatest && attemptsForLatest[0]) || 1));
      } else {
        setViewAttempt('1');
      }

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

    const attemptNumberForChart = Number(viewAttempt) || 1;

    // 表示年度 + 演習回のスコア
    const inYear = scores.filter(s => {
      if (!s) return false;
      if (String(s.year) !== String(viewYear)) return false;
      const attemptValue = Number(s.attemptNumber ?? 1);
      return (Number.isNaN(attemptValue) ? 1 : attemptValue) === attemptNumberForChart;
    });
    if (!inYear.length) return { indicator: [], data: [] };

    const fallbackNameMap = new Map(scoreSubjectNameMap);

    // その年度に出現した科目一覧（重複排除）
    const subjectKeys = new Set();
    inYear.forEach(item => {
      if (!item) return;
      if (item.subjectId !== undefined && item.subjectId !== null) {
        subjectKeys.add(item.subjectId);
        if (item.subjectName) {
          fallbackNameMap.set(String(item.subjectId), item.subjectName);
        }
      } else if (item.subjectName) {
        subjectKeys.add(item.subjectName);
      } else if (item.subject) {
        subjectKeys.add(item.subject);
      }
    });

    if (!subjectKeys.size) return { indicator: [], data: [] };

    const sortedSubjectKeys = sortSubjectNamesByCategory(Array.from(subjectKeys), subjectLookup);

    const resolveSubject = (key) => {
      if (key === null || key === undefined) return undefined;
      const strKey = String(key);
      return subjectLookup.get(strKey) || (typeof key === 'string' ? subjectLookup.get(key) : undefined);
    };

    const subjectsForChart = sortedSubjectKeys.map(key => {
      const strKey = String(key);
      const subject = resolveSubject(key);
      const displayCandidate = getSubjectDisplayName(key, subjectLookup);
      const fallbackName = displayCandidate
        ? null
        : (subject?.name ?? fallbackNameMap.get(strKey) ?? (typeof key === 'string' ? key : null));
      const displayName = displayCandidate || fallbackName || (typeof key === 'number' ? `科目ID:${key}` : strKey);
      const fullScore = subjectFullScoreMap.get(strKey) ?? subject?.fullScore ?? 100;
      return { key, strKey, displayName, fullScore };
    });

    const indicator = subjectsForChart.map(item => ({ name: item.displayName, max: 100 }));

    const percentValues = subjectsForChart.map(item => {
      const items = inYear.filter(entry => {
        if (!entry) return false;
        if (entry.subjectId !== undefined && entry.subjectId !== null) {
          if (String(entry.subjectId) === item.strKey) return true;
        }
        const fallback = entry.subjectName ?? entry.subject;
        return fallback === item.key;
      });
      if (!items.length) return 0;

      const last = items[items.length - 1];
      const full = item.fullScore > 0 ? item.fullScore : 100;
      const pct = full > 0 ? (Number(last?.score || 0) / full) * 100 : 0;
      return Math.round(pct * 10) / 10;
    });

    return { indicator, data: percentValues };
  }, [scores, viewYear, viewAttempt, subjects, subjectLookup, scoreSubjectNameMap, subjectFullScoreMap]);

  const stroke = '#3BAFDA';
  const fill   = 'rgba(59,175,218,0.18)';

  const attemptLabel = formatAttemptLabel(Number(viewAttempt) || 1);

  const chartOption = {
    title: { text: `年度別 ${viewYear || '-'}年 ${attemptLabel}` },
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
          <select value={viewAttempt} onChange={e => setViewAttempt(e.target.value)}>
            {attemptOptionsForViewYear.length ? (
              attemptOptionsForViewYear.map((attemptValue) => (
                <option key={attemptValue} value={attemptValue}>
                  {formatAttemptLabel(attemptValue)}
                </option>
              ))
            ) : (
              <option value="1">{formatAttemptLabel(1)}</option>
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
            <span>演習回数</span>
            <select
              value={attempt}
              onChange={e => setAttempt(e.target.value)}
            >
              {DEFAULT_ATTEMPT_OPTIONS.map(value => (
                <option key={value} value={String(value)}>{formatAttemptLabel(value)}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>カテゴリ</span>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setSubjectId(''); }}
            >
              <option value="">選択してください</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>科目</span>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              disabled={!category}
            >
              <option value="">選択してください</option>
              {filteredSubjects.map(s => (
                <option key={s.id} value={String(s.id)}>
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
              disabled={!subjectId}
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
