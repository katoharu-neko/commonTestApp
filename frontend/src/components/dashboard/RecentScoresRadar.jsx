// src/components/dashboard/RecentScoresRadar.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../api/apiClient';
import {
  createSubjectLookup,
  getSubjectDisplayName,
  sortSubjectNamesByCategory,
} from '../../utils/subjectOrder';

const MAX_PERCENT = 100;

const formatAttemptLabel = (attemptNumber) => `演習${attemptNumber}回目`;

const RecentScoresRadar = () => {
  const [scores, setScores] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [scoresRes, subjectsRes] = await Promise.all([
          api.get('/api/scores/me'),
          api.get('/api/subjects'),
        ]);

        if (!mounted) return;

        const scoresData = Array.isArray(scoresRes.data) ? scoresRes.data : [];
        const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];

        setScores(scoresData);
        setSubjects(subjectsData);

      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('テスト結果を読み込めませんでした。時間をおいて再度お試しください。');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const fullScoreMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((subject) => {
      if (!subject) return;
      if (subject.id !== undefined && subject.id !== null) {
        map.set(String(subject.id), subject.fullScore ?? MAX_PERCENT);
      }
      if (subject.name && !map.has(subject.name)) {
        map.set(subject.name, subject.fullScore ?? MAX_PERCENT);
      }
    });
    return map;
  }, [subjects]);

  const scoreSubjectNameMap = useMemo(() => {
    const map = new Map();
    scores.forEach((item) => {
      if (item && item.subjectId !== undefined && item.subjectId !== null && item.subjectName) {
        map.set(String(item.subjectId), item.subjectName);
      }
    });
    return map;
  }, [scores]);

  const subjectLookup = useMemo(() => {
    return createSubjectLookup(subjects);
  }, [subjects]);

  const groupedByYearAttempt = useMemo(() => {
    const map = new Map();
    scores.forEach((item) => {
      const year = Number(item?.year);
      if (!year || Number.isNaN(year)) return;
      const attemptRaw = Number(item?.attemptNumber ?? 1);
      const attempt = Number.isFinite(attemptRaw) && attemptRaw > 0 ? Math.trunc(attemptRaw) : 1;
      const key = `${year}::${attempt}`;
      if (!map.has(key)) {
        map.set(key, { year, attempt, rows: [] });
      }
      map.get(key).rows.push(item);
    });

    return map;
  }, [scores]);

  const sortedCombos = useMemo(() => {
    return Array.from(groupedByYearAttempt.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.attempt - b.attempt;
    });
  }, [groupedByYearAttempt]);

  const comboOptions = useMemo(() => {
    if (!sortedCombos.length) return [];

    const primary = sortedCombos.slice(0, 3).map((combo) => ({
      key: `${combo.year}-${combo.attempt}`,
      label: `${combo.year}年 ${formatAttemptLabel(combo.attempt)}`,
      rows: combo.rows.slice(),
    }));

    const others = sortedCombos.slice(3);
    if (others.length) {
      primary.push({
        key: 'others',
        label: 'それ以前',
        rows: others.flatMap((entry) => entry.rows),
      });
    }

    return primary;
  }, [sortedCombos]);

  const cardConfigs = useMemo(() => {
    if (!comboOptions.length) return [];

    return comboOptions
      .map((option) => {
        const dataRows = (option.rows ?? [])
          .slice()
          .sort((a, b) => {
            if (a.year !== b.year) return Number(a.year) - Number(b.year);
            const keyA = a.subjectId ?? a.subjectName ?? a.subject;
            const keyB = b.subjectId ?? b.subjectName ?? b.subject;
            const labelA = getSubjectDisplayName(keyA, subjectLookup) || a.subjectName || a.subject || '';
            const labelB = getSubjectDisplayName(keyB, subjectLookup) || b.subjectName || b.subject || '';
            return labelA.localeCompare(labelB, 'ja');
          });

        if (!dataRows.length) return null;

        const subjectsSet = new Set();
        dataRows.forEach((row) => {
          if (!row) return;
          if (row.subjectId !== undefined && row.subjectId !== null) {
            subjectsSet.add(row.subjectId);
          } else if (row.subjectName) {
            subjectsSet.add(row.subjectName);
          } else if (row.subject) {
            subjectsSet.add(row.subject);
          }
        });

        const subjectList = sortSubjectNamesByCategory(Array.from(subjectsSet), subjectLookup);

        if (!subjectList.length) return null;

        const values = subjectList.map((subjectKey) => {
          const rows = dataRows.filter((row) => {
            if (!row) return false;
            if (row.subjectId !== undefined && row.subjectId !== null) {
              if (String(row.subjectId) === String(subjectKey)) return true;
            }
            const fallback = row.subjectName ?? row.subject;
            return fallback === subjectKey;
          });
          if (!rows.length) return 0;

          const keyString = String(subjectKey);
          let fullScore = fullScoreMap.get(keyString);
          if (fullScore === undefined) {
            const subject = subjectLookup.get(keyString) || (typeof subjectKey === 'string' ? subjectLookup.get(subjectKey) : undefined);
            fullScore = subject?.fullScore ?? MAX_PERCENT;
          }

          const avg =
            rows.reduce((sum, row) => sum + Number(row.score || 0), 0) / rows.length;
          const percent = fullScore > 0 ? (avg / fullScore) * 100 : 0;
          const capped = Math.min(Math.max(percent, 0), MAX_PERCENT);
          return Math.round(capped * 10) / 10;
        });

        const indicator = subjectList.map((key) => ({
          name:
            getSubjectDisplayName(key, subjectLookup)
            || scoreSubjectNameMap.get(String(key))
            || (typeof key === 'string' ? key : `科目ID:${key}`),
          max: MAX_PERCENT,
        }));

        const chartOption = {
          tooltip: {},
          radar: {
            indicator,
            name: {
              color: '#0f172a',
              fontSize: 13,
            },
            splitLine: {
              lineStyle: { color: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'] },
            },
            splitArea: {
              areaStyle: { color: ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.02)'] },
            },
            axisLine: {
              lineStyle: { color: 'rgba(59,130,246,0.45)' },
            },
          },
          series: [
            {
              type: 'radar',
              data: [
                {
                  value: values,
                  name:
                    option.key === 'others' ? '平均（それ以前）' : `${option.label} 平均`,
                  areaStyle: { color: 'rgba(59,130,246,0.25)' },
                  lineStyle: { color: '#2563eb', width: 2 },
                  itemStyle: { color: '#2563eb' },
                },
              ],
              symbol: 'circle',
              symbolSize: 5,
            },
          ],
        };

        return {
          key: option.key,
          label: option.label,
          chartOption,
        };
      })
      .filter(Boolean);
  }, [comboOptions, fullScoreMap, subjectLookup, scoreSubjectNameMap]);

  if (loading) {
    return [
      <div key="loading" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">読み込み中です...</h2>
        </div>
      </div>,
    ];
  }

  if (error) {
    return [
      <div key="error" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">エラーが発生しました</h2>
        </div>
        <p className="dashboard-card__message dashboard-card__message--error">{error}</p>
      </div>,
    ];
  }

  if (!cardConfigs.length) {
    return [
      <div key="empty" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">表示できるデータがありません</h2>
        </div>
        <p className="dashboard-card__message">表示できるテスト結果がまだありません。</p>
      </div>,
    ];
  }

  return cardConfigs.map((config) => {
    return (
      <div key={config.key} className="card dashboard-card recent-scores-card recent-scores-card--chart">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">{config.label}</h2>
        </div>
        <ReactECharts option={config.chartOption} style={{ width: '100%', height: 320 }} />
      </div>
    );
  });
};

export default RecentScoresRadar;