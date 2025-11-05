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

const formatTotalValue = (value) => {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 10) / 10;
  const formatOptions = Number.isInteger(rounded)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  return new Intl.NumberFormat('ja-JP', formatOptions).format(rounded);
};

const buildRadarDataset = function (
  scores,
  year,
  attemptValue,
  subjectLookup,
  subjectFullScoreMap,
  scoreSubjectNameMap
) {
  if (!Array.isArray(scores) || !scores.length || !year) {
    return { indicator: [], data: [], totalScore: 0, totalFullScore: 0 };
  }

  const attemptNumberRaw = Number(attemptValue);
  const attemptNumber = Number.isFinite(attemptNumberRaw) && attemptNumberRaw > 0
    ? Math.trunc(attemptNumberRaw)
    : 1;

  const targetYear = String(year);

  const entriesForTarget = scores.filter(function (scoreItem) {
    if (!scoreItem) return false;
    if (String(scoreItem.year) !== targetYear) return false;
    const attemptRaw = Number(scoreItem.attemptNumber == null ? 1 : scoreItem.attemptNumber);
    const attemptNormalized = Number.isNaN(attemptRaw) ? 1 : Math.trunc(attemptRaw);
    return attemptNormalized === attemptNumber;
  });

  if (!entriesForTarget.length) {
    return { indicator: [], data: [], totalScore: 0, totalFullScore: 0 };
  }

  const fallbackNameMap = scoreSubjectNameMap instanceof Map
    ? new Map(scoreSubjectNameMap)
    : new Map();

  const subjectKeys = new Set();
  entriesForTarget.forEach(function (item) {
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

  if (!subjectKeys.size) {
    return { indicator: [], data: [], totalScore: 0, totalFullScore: 0 };
  }

  const sortedSubjectKeys = sortSubjectNamesByCategory(Array.from(subjectKeys), subjectLookup);

  const resolveSubject = function (key) {
    if (key === null || key === undefined) return undefined;
    const strKey = String(key);
    if (subjectLookup && subjectLookup.get) {
      const direct = subjectLookup.get(strKey);
      if (direct) return direct;
      if (typeof key === 'string') {
        return subjectLookup.get(key);
      }
    }
    return undefined;
  };

  const subjectsForChart = sortedSubjectKeys.map(function (key) {
    const strKey = String(key);
    const subject = resolveSubject(key);
    const displayCandidate = getSubjectDisplayName(key, subjectLookup);
    const subjectName = subject && subject.name ? subject.name : undefined;
    const fallbackName = displayCandidate
      ? null
      : (subjectName || fallbackNameMap.get(strKey) || (typeof key === 'string' ? key : null));
    const displayName = displayCandidate || fallbackName || (typeof key === 'number' ? '科目ID:' + key : strKey);
    const fullScoreFromMap = subjectFullScoreMap && subjectFullScoreMap.get ? subjectFullScoreMap.get(strKey) : undefined;
    const subjectFullScore = subject && subject.fullScore !== undefined ? subject.fullScore : undefined;
    const normalizedFullScore = fullScoreFromMap || subjectFullScore || 100;
    const safeFullScore = normalizedFullScore > 0 ? normalizedFullScore : 100;
    return { key: key, strKey: strKey, displayName: displayName, fullScore: safeFullScore };
  });

  const indicator = subjectsForChart.map(function (item) {
    return { name: item.displayName, max: 100 };
  });

  var totalScoreSum = 0;
  var totalFullScoreSum = 0;

  const percentValues = subjectsForChart.map(function (item) {
    const items = entriesForTarget.filter(function (entry) {
      if (!entry) return false;
      if (entry.subjectId !== undefined && entry.subjectId !== null) {
        if (String(entry.subjectId) === item.strKey) return true;
      }
      const fallback = entry.subjectName !== undefined && entry.subjectName !== null
        ? entry.subjectName
        : entry.subject;
      return fallback === item.key;
    });
    if (!items.length) return 0;

    const last = items[items.length - 1];
    const rawScore = Number(last && last.score !== undefined ? last.score : 0);
    const scoreValue = Number.isFinite(rawScore) ? rawScore : 0;
    const full = item.fullScore > 0 ? item.fullScore : 100;

    totalScoreSum += scoreValue;
    totalFullScoreSum += full;

    const pct = full > 0 ? (scoreValue / full) * 100 : 0;
    return Math.round(pct * 10) / 10;
  });

  const normalizedScore = Math.round(totalScoreSum * 10) / 10;
  const normalizedFullScore = Math.round(totalFullScoreSum * 10) / 10;

  return {
    indicator: indicator,
    data: percentValues,
    totalScore: normalizedScore,
    totalFullScore: normalizedFullScore,
  };
};

const createRadarChartOption = function (indicator, data) {
  const stroke = '#3BAFDA';
  const fill = 'rgba(59,175,218,0.18)';

  return {
    tooltip: {},
    radar: {
      indicator: indicator,
      startAngle: 90,
      clockwise: true,
      axisName: { color: '#111827' },
      axisLine: { lineStyle: { color: '#bfdbfe' } },
      splitLine: { lineStyle: { color: 'rgba(59,175,218,0.35)' } },
      splitArea: { areaStyle: { color: ['rgba(59,175,218,0.05)', 'rgba(59,175,218,0.12)'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data,
            name: '得点率(%)',
            lineStyle: { width: 2, color: stroke },
            itemStyle: { color: stroke, borderColor: stroke },
            areaStyle: { color: fill },
            emphasis: {
              lineStyle: { color: stroke },
              itemStyle: { color: stroke },
              areaStyle: { color: 'rgba(59,175,218,0.28)' },
            },
          },
        ],
        symbol: 'circle',
        symbolSize: 5,
      },
    ],
  };
};

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
  const [viewYear, setViewYear] = useState('');
  const [viewAttempt, setViewAttempt] = useState('1');

  const [loadingInit, setLoadingInit] = useState(true);
  const [initError, setInitError] = useState('');
  const [inputOpen, setInputOpen] = useState(false);

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

  useEffect(
    function () {
      if (!attemptOptionsByYear || attemptOptionsByYear.size === 0) {
        return;
      }
      const yearKey = String(viewYear);
      if (!attemptOptionsByYear.has(yearKey)) {
        const sortedYears = Array.from(attemptOptionsByYear.keys()).sort(function (a, b) {
          return Number(a) - Number(b);
        });
        const latestKey = sortedYears[sortedYears.length - 1];
        if (latestKey) {
          const attempts = attemptOptionsByYear.get(latestKey) || [];
          setViewYear(latestKey);
          setViewAttempt(String((attempts && attempts[0]) || 1));
        }
        return;
      }
      const options = attemptOptionsByYear.get(yearKey);
      if (!options || !options.length) {
        if (viewAttempt !== '1') {
          setViewAttempt('1');
        }
        return;
      }
      if (!options.includes(Number(viewAttempt))) {
        setViewAttempt(String(options[0]));
      }
    },
    [attemptOptionsByYear, viewYear, viewAttempt]
  );

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
  const radarDataset = useMemo(
    function () {
      return buildRadarDataset(
        scores,
        viewYear,
        viewAttempt,
        subjectLookup,
        subjectFullScoreMap,
        scoreSubjectNameMap
      );
    },
    [scores, viewYear, viewAttempt, subjectLookup, subjectFullScoreMap, scoreSubjectNameMap]
  );

  const currentChartOption = useMemo(
    function () {
      return createRadarChartOption(radarDataset.indicator, radarDataset.data);
    },
    [radarDataset.indicator, radarDataset.data]
  );

  const chartStyle = { height: 'clamp(260px, 55vw, 420px)', width: '100%' };
  const historyChartStyle = { height: 'clamp(240px, 60vw, 360px)', width: '100%' };

  const currentAttemptNumber = Number(viewAttempt) || 1;
  const attemptLabel = formatAttemptLabel(currentAttemptNumber);

  const historyCards = useMemo(
    function () {
      if (!scores.length) return [];
      const combinationMap = new Map();
      scores.forEach(function (item) {
        if (!item) return;
        const yearValue = item.year;
        if (yearValue === undefined || yearValue === null) return;
        const attemptRaw = Number(item.attemptNumber == null ? 1 : item.attemptNumber);
        const normalizedAttempt = Number.isFinite(attemptRaw) && attemptRaw > 0
          ? Math.trunc(attemptRaw)
          : 1;
        const yearKey = String(yearValue);
        const comboKey = yearKey + '::' + String(normalizedAttempt);
        if (!combinationMap.has(comboKey)) {
          combinationMap.set(comboKey, { year: yearKey, attemptNumber: normalizedAttempt });
        }
      });
      if (!combinationMap.size) return [];
      const sorted = Array.from(combinationMap.values()).sort(function (a, b) {
        const yearDiff = Number(b.year) - Number(a.year);
        if (!Number.isNaN(yearDiff) && yearDiff !== 0) {
          return yearDiff;
        }
        return b.attemptNumber - a.attemptNumber;
      });
      return sorted
        .map(function (combo) {
          const dataset = buildRadarDataset(
            scores,
            combo.year,
            combo.attemptNumber,
            subjectLookup,
            subjectFullScoreMap,
            scoreSubjectNameMap
          );
          return {
            key: combo.year + '::' + combo.attemptNumber,
            year: combo.year,
            attemptNumber: combo.attemptNumber,
            dataset: dataset,
          };
        })
        .filter(function (item) {
          return item.dataset && item.dataset.indicator && item.dataset.indicator.length;
        });
    },
    [scores, subjectLookup, subjectFullScoreMap, scoreSubjectNameMap]
  );

  const handleCardSelect = function (yearValue, attemptNumber) {
    setViewYear(String(yearValue));
    setViewAttempt(String(attemptNumber));
  };

  const closeInput = function () {
    setInputOpen(false);
  };

  const hasCurrentData = radarDataset.indicator.length > 0;

  // ---- UI ----
  return (
    <div className="scores-page">
      {loadingInit && <p className="scores-page__alert">読み込み中...</p>}
      {initError && <p className="scores-page__alert form-error">{initError}</p>}

      <section className="scores-card scores-card--current card">
        <header className="scores-card__header">
          <div className="scores-card__titles">
            <p className="scores-card__period">
              {viewYear ? `${viewYear}年度 ${attemptLabel}` : '年度データなし'}
            </p>
            <p className="scores-card__total">
              <span className="scores-card__total-label">Total</span>
              <span className="scores-card__total-value">
                {formatTotalValue(radarDataset.totalScore)}点 / {formatTotalValue(radarDataset.totalFullScore)}点
              </span>
            </p>
          </div>
        </header>

        {hasCurrentData ? (
          <div className="scores-card__content">
            <div className="scores-card__chart">
              <ReactECharts option={currentChartOption} style={chartStyle} notMerge />
            </div>
            <div className="scores-card__comment">
              <span className="scores-card__comment-label">全体講評</span>
              <textarea
                className="scores-card__comment-area"
                placeholder="ここに全体講評のアドバイスが表示されます。"
                readOnly
              />
            </div>
          </div>
        ) : (
          <p className="status-message">表示できるデータがありません。</p>
        )}
      </section>

      <section className="scores-history">
        <h3 className="section-title">過去の演習結果</h3>
        {historyCards.length ? (
          <div className="scores-history__list">
            {historyCards.map(function (card) {
              const isActive = String(card.year) === String(viewYear) && String(card.attemptNumber) === String(viewAttempt);
              const option = createRadarChartOption(card.dataset.indicator, card.dataset.data);
              return (
                <article
                  key={card.key}
                  className={'scores-card scores-card--history card' + (isActive ? ' scores-card--active' : '')}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={function () { handleCardSelect(card.year, card.attemptNumber); }}
                  onKeyDown={function (ev) {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault();
                      handleCardSelect(card.year, card.attemptNumber);
                    }
                  }}
                >
                  <header className="scores-card__header">
                    <div className="scores-card__titles">
                      <p className="scores-card__period">{card.year}年度 {formatAttemptLabel(card.attemptNumber)}</p>
                      <p className="scores-card__total">
                        <span className="scores-card__total-label">Total</span>
                        <span className="scores-card__total-value">
                          {formatTotalValue(card.dataset.totalScore)}点 / {formatTotalValue(card.dataset.totalFullScore)}点
                        </span>
                      </p>
                    </div>
                  </header>
                  <div className="scores-card__content">
                    <div className="scores-card__chart">
                      <ReactECharts option={option} style={historyChartStyle} notMerge />
                    </div>
                    <div className="scores-card__comment">
                      <span className="scores-card__comment-label">全体講評</span>
                      <textarea
                        className="scores-card__comment-area"
                        placeholder="ここに全体講評のアドバイスが表示されます。"
                        readOnly
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="status-message">過去の演習データがまだありません。</p>
        )}
      </section>

      <div className="score-input-floating">
        <button
          type="button"
          className="score-input-floating__button"
          onClick={function () { setInputOpen(true); }}
        >
          スコア入力
        </button>
      </div>

      {inputOpen && (
        <div
          className="score-input-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="スコア入力"
          onClick={closeInput}
        >
          <div
            className="score-input-sheet"
            onClick={function (ev) { ev.stopPropagation(); }}
          >
            <div className="score-input-sheet__header">
              <h3 className="score-input-sheet__title">スコア入力</h3>
              <button
                type="button"
                className="score-input-sheet__close"
                onClick={closeInput}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="scores-form-grid scores-form-grid--sheet">
              <label className="form-field">
                <span>年度</span>
                <input
                  type="number"
                  value={year}
                  onChange={function (e) { setYear(e.target.value); }}
                  placeholder={new Date().getFullYear()}
                />
              </label>

              <label className="form-field">
                <span>演習回数</span>
                <select
                  value={attempt}
                  onChange={function (e) { setAttempt(e.target.value); }}
                >
                  {DEFAULT_ATTEMPT_OPTIONS.map(function (value) {
                    return (
                      <option key={value} value={String(value)}>{formatAttemptLabel(value)}</option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>カテゴリ</span>
                <select
                  value={category}
                  onChange={function (e) { setCategory(e.target.value); setSubjectId(''); }}
                >
                  <option value="">選択してください</option>
                  {categories.map(function (c) {
                    return (
                      <option key={c} value={c}>{c}</option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>科目</span>
                <select
                  value={subjectId}
                  onChange={function (e) { setSubjectId(e.target.value); }}
                  disabled={!category}
                >
                  <option value="">選択してください</option>
                  {filteredSubjects.map(function (s) {
                    return (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}（満点:{s.fullScore ?? 100}）
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>得点</span>
                <input
                  type="number"
                  value={score}
                  onChange={function (e) { setScore(e.target.value); }}
                  min={0}
                  max={selectedFullScore}
                  placeholder={`0〜${selectedFullScore}`}
                  disabled={!subjectId}
                />
              </label>

              <div className="scores-form-actions">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoresRadarByYear;
